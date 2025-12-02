"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  ArrowLeft,
  Clock,
  Users,
  Star,
  BookOpen,
  GraduationCap,
  Target,
  Award,
  PlayCircle,
  Settings,
  CheckCircle,
  XCircle
} from "lucide-react"
import { useAccount } from "wagmi"
import useCeloreanContract from "@/hooks/useCeloreanContract"
import { useUserData } from "@/hooks/useUserData"
import { CourseContentViewer } from "@/components/CourseContentViewer"
import Link from "next/link"
import { cn } from "@/lib/utils"

import { Progress } from "@/components/ui/progress"

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = parseInt(params.id as string)
  const { address, isConnected } = useAccount()
  const {
    fetchCourse,
    registerForCourse,
    isPending,
    isStudentEnrolled,
    getCourseContentUris,
    fetchCourseContentCount,
    fetchCompletedContentCount,
    updateCourseType,
    updateCourseStatus,
    markCourseAsEnded,
    isConfirming
  } = useCeloreanContract()
  const { isStudent, isLecturer } = useUserData()

  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [calculatedProgress, setCalculatedProgress] = useState(0)

  // Fetch content URIs from blockchain
  const contentUrisQuery = getCourseContentUris(courseId)
  const contentUris = (contentUrisQuery?.data as string[]) || []

  // Check if current user is the instructor
  const isInstructor = course?.instructor?.toLowerCase() === address?.toLowerCase()

  // Check enrollment status - MUST call hook unconditionally
  const enrollmentQuery = isStudentEnrolled(courseId, address || "0x0")
  const enrollmentStatus = enrollmentQuery?.data

  useEffect(() => {
    // Only use enrollment data if user is connected and a student
    if (address && isStudent && typeof enrollmentStatus === 'boolean') {
      setIsEnrolled(enrollmentStatus)
    }
  }, [enrollmentStatus, address, isStudent])

  // Fetch progress if enrolled
  useEffect(() => {
    const fetchProgress = async () => {
      if (isEnrolled && address && courseId) {
        try {
          const totalContentBigInt = await fetchCourseContentCount(courseId)
          const completedContentBigInt = await fetchCompletedContentCount(courseId, address)

          const totalContent = Number(totalContentBigInt || 0)
          const completedContent = Number(completedContentBigInt || 0)

          if (totalContent > 0) {
            const percent = Math.round((completedContent / totalContent) * 100)
            setCalculatedProgress(percent)
          }
        } catch (err) {
          console.error("Failed to fetch progress", err)
        }
      }
    }

    fetchProgress()
  }, [isEnrolled, address, courseId])

  // Fetch course data
  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId || isNaN(courseId)) {
        toast.error("Invalid course ID")
        router.push("/learning")
        return
      }

      setLoading(true)
      try {
        const courseData = await fetchCourse(courseId)

        if (!courseData) {
          toast.error("Course not found")
          router.push("/learning")
          return
        }

        const data = courseData as any

        // Parse blockchain data
        const id = Number(data.id || data[0])
        const title = data.title || data[1] || "Untitled Course"
        const description = data.description || data[2] || "No description available"
        const durationVal = Number(data.duration || data[3] || 0)
        const level = data.level || data[6] || "Beginner"
        const rating = Number(data.rating || data[7] || 0) / 10 // Convert from 50 scale to 5 scale
        const enrolledCount = Number(data.enrolledCount || data[8] || 0)
        const capacity = Number(data.capacity || data[9] || 100)
        const instructor = data.instructor || data[10] || ""
        const metadataUri = data.metadataUri || data[11] || ""
        const tags = Array.isArray(data.tags) ? data.tags : (data[5] || [])
        const courseType = Number(data.courseType || data[12] || 0) // Extract courseType
        const courseStatus = Number(data.status || data[13] || 0) // Extract courseStatus

        // Try to fetch metadata for thumbnail
        let thumbnail = "/placeholder.jpg"
        if (metadataUri) {
          try {
            const metaUrl = metadataUri.startsWith("http")
              ? metadataUri
              : `https://gateway.pinata.cloud/ipfs/${metadataUri}`
            const metaResponse = await fetch(metaUrl)
            if (metaResponse.ok) {
              const contentType = metaResponse.headers.get("content-type")

              // If it's JSON, parse as metadata
              if (contentType?.includes("application/json")) {
                const metadata = await metaResponse.json()
                if (metadata.thumbnail) {
                  thumbnail = metadata.thumbnail.startsWith("http")
                    ? metadata.thumbnail
                    : `https://gateway.pinata.cloud/ipfs/${metadata.thumbnail}`
                }
              }
              // If it's an image, use the URL directly as thumbnail
              else if (contentType?.includes("image/")) {
                thumbnail = metaUrl
              }
            }
          } catch (e) {
            // Silently handle metadata fetch errors - not critical
          }
        }

        setCourse({
          id,
          title,
          description,
          duration: durationVal > 0 ? `${durationVal} weeks` : "Self-paced",
          level,
          rating,
          students: enrolledCount,
          capacity,
          instructor,
          thumbnail,
          tags,
          isFull: enrolledCount >= capacity,
          courseType, // Add courseType to state
          courseStatus, // Add courseStatus to state
        })

      } catch (error) {
        console.error("Error loading course:", error)
        toast.error("Failed to load course details")
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]) // Only re-run when courseId changes

  const handleEnroll = async () => {
    if (!isStudent) {
      toast.error("Only registered students can enroll")
      return
    }

    if (!isConnected || !address) {
      toast.error("Please connect your wallet")
      return
    }

    if (isEnrolled) {
      toast.error("You are already enrolled in this course")
      return
    }

    if (course?.isFull) {
      toast.error("This course is full")
      return
    }

    try {
      setEnrolling(true)
      await registerForCourse(courseId, address)
      toast.success("Enrollment initiated! Please confirm the transaction.")

      // Wait a bit and refresh enrollment status
      setTimeout(() => {
        setIsEnrolled(true)
        setEnrolling(false)
      }, 2000)
    } catch (error: any) {
      console.error("Enrollment error:", error)
      toast.error(error.message || "Failed to enroll in course")
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading course details...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Course Not Found</h2>
          <p className="text-gray-400 mb-6">The course you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/learning")}>
            Browse Courses
          </Button>
        </div>
      </div>
    )
  }

  return <div className="min-h-screen p-6 md:p-8 -mt-2">
    {/* Header */}

    {/* Tabs Navigation */}
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
      <TabsList className="glass-card border-white/10">
        <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20">
          <BookOpen className="w-4 h-4 mr-2" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="content" className="data-[state=active]:bg-primary/20">
          <PlayCircle className="w-4 h-4 mr-2" />
          Course Content
        </TabsTrigger>
        {(isInstructor || isLecturer) && (
          <TabsTrigger value="manage" className="data-[state=active]:bg-primary/20">
            <Settings className="w-4 h-4 mr-2" />
            Manage
          </TabsTrigger>
        )}
      </TabsList>

      {/* Overview Tab Content */}
      <TabsContent value="overview" className="mt-0">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Image */}
            <div className="relative h-[400px] rounded-2xl overflow-hidden glass-card">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.jpg"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                    {course.level}
                  </Badge>
                  {/* Course Type Badge */}
                  {course.courseType !== undefined && (
                    <Badge
                      variant="secondary"
                      className={
                        course.courseType === 1
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : course.courseType === 2
                            ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                            : "bg-green-500/20 text-green-400 border-green-500/30"
                      }
                    >
                      {course.courseType === 1 ? "🛠️ Workshop" : course.courseType === 2 ? "💼 Seminar" : "🎓 Bootcamp"}
                    </Badge>
                  )}
                  {/* Course Status Badge */}
                  {course.courseStatus !== undefined && (
                    <Badge
                      variant="secondary"
                      className={
                        course.courseStatus === 1
                          ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          : "bg-green-500/20 text-green-400 border-green-500/30"
                      }
                    >
                      {course.courseStatus === 1 ? "Ended" : "Ongoing"}
                    </Badge>
                  )}
                  {course.isFull && (
                    <Badge variant="destructive" className="animate-pulse">
                      Full
                    </Badge>
                  )}
                  {isEnrolled && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Enrolled
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {course.title}
                </h1>
                <div className="flex items-center gap-6 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{course.students}/{course.capacity} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                  About This Course
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  {course.description}
                </p>

                {/* Tags */}
                {course.tags && course.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3">What you'll learn</h3>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="border-primary/20 text-primary bg-primary/10"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Instructor */}
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-primary" />
                  Instructor
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {course.instructor.slice(0, 6)}...{course.instructor.slice(-4)}
                    </p>
                    <p className="text-sm text-gray-400">Course Instructor</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <Card className="glass-card border-white/10 sticky top-6">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-white mb-2">
                    Free
                  </div>
                  <p className="text-gray-400">Full course access</p>
                </div>

                {!isStudent ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-400 text-center">
                      Register as a student to enroll
                    </p>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => router.push("/register")}
                    >
                      Register Now
                    </Button>
                  </div>
                ) : isEnrolled ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
                      <BookOpen className="w-5 h-5" />
                      <span className="font-medium">You're enrolled!</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-400">Your Progress</span>
                        <span className="text-primary">{calculatedProgress}%</span>
                      </div>
                      <Progress value={calculatedProgress} className="h-2 bg-white/10" />
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      onClick={() => { setActiveTab("content") }}
                    >
                      {calculatedProgress === 100 ? "Revise" : "Continue Learning"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    className={cn(
                      "w-full",
                      course.isFull
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    )}
                    onClick={handleEnroll}
                    disabled={enrolling || isPending || course.isFull}
                  >
                    {enrolling || isPending ? "Processing..." : course.isFull ? "Course Full" : "Enroll Now"}
                  </Button>
                )}

                {/* Course Features */}
                <div className="mt-8 space-y-4 pt-6 border-t border-white/10">
                  <h3 className="font-semibold text-white mb-4">This course includes:</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-gray-300">
                      <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Comprehensive course materials</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Target className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Hands-on exercises</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Award className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Completion certificate (NFT)</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Users className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Community access</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      {/* Course Content Tab */}
      <TabsContent value="content" className="mt-0">
        <CourseContentViewer
          courseId={courseId}
          contentUris={contentUris}
          isEnrolled={isEnrolled}
          isInstructor={isInstructor || false}
        />
      </TabsContent>

      {/* Manage Tab - Only for Instructor/Lecturer */}
      {(isInstructor || isLecturer) && (
        <TabsContent value="manage" className="mt-0">
          <Card className="glass-card border-white/10">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary" />
                Course Management
              </h2>

              <div className="space-y-8">
                {/* Current Status Display */}
                <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Current Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Course Type</p>
                      <Badge
                        variant="secondary"
                        className={
                          course.courseType === 1
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : course.courseType === 2
                              ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                              : "bg-green-500/20 text-green-400 border-green-500/30"
                        }
                      >
                        {course.courseType === 1 ? "🛠️ Workshop" : course.courseType === 2 ? "💼 Seminar" : "🎓 Bootcamp"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Course Status</p>
                      <Badge
                        variant="secondary"
                        className={
                          course.courseStatus === 1
                            ? "bg-gray-500/20 text-gray-400 border-gray-500/30"
                            : "bg-green-500/20 text-green-400 border-green-500/30"
                        }
                      >
                        {course.courseStatus === 1 ? "Ended" : "Ongoing"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Update Course Type */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    Update Course Type
                  </h3>
                  <p className="text-sm text-gray-400">
                    Change the course type classification
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      type="button"
                      variant={course.courseType === 0 ? "default" : "outline"}
                      className="w-full"
                      onClick={async () => {
                        try {
                          await updateCourseType(courseId, 0)
                          toast.success("Course type updated to Bootcamp")
                        } catch (error: any) {
                          toast.error(error.message || "Failed to update course type")
                        }
                      }}
                      disabled={isPending || isConfirming || course.courseType === 0}
                    >
                      🎓 Bootcamp
                    </Button>
                    <Button
                      type="button"
                      variant={course.courseType === 1 ? "default" : "outline"}
                      className="w-full"
                      onClick={async () => {
                        try {
                          await updateCourseType(courseId, 1)
                          toast.success("Course type updated to Workshop")
                        } catch (error: any) {
                          toast.error(error.message || "Failed to update course type")
                        }
                      }}
                      disabled={isPending || isConfirming || course.courseType === 1}
                    >
                      🛠️ Workshop
                    </Button>
                    <Button
                      type="button"
                      variant={course.courseType === 2 ? "default" : "outline"}
                      className="w-full"
                      onClick={async () => {
                        try {
                          await updateCourseType(courseId, 2)
                          toast.success("Course type updated to Seminar")
                        } catch (error: any) {
                          toast.error(error.message || "Failed to update course type")
                        }
                      }}
                      disabled={isPending || isConfirming || course.courseType === 2}
                    >
                      💼 Seminar
                    </Button>
                  </div>
                </div>

                {/* Update Course Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    Update Course Status
                  </h3>
                  <p className="text-sm text-gray-400">
                    Mark the course as ongoing or ended
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant={course.courseStatus === 0 ? "default" : "outline"}
                      className="w-full"
                      onClick={async () => {
                        try {
                          await updateCourseStatus(courseId, 0)
                          toast.success("Course marked as Ongoing")
                        } catch (error: any) {
                          toast.error(error.message || "Failed to update course status")
                        }
                      }}
                      disabled={isPending || isConfirming || course.courseStatus === 0}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Ongoing
                    </Button>
                    <Button
                      type="button"
                      variant={course.courseStatus === 1 ? "default" : "outline"}
                      className="w-full"
                      onClick={async () => {
                        try {
                          await markCourseAsEnded(courseId)
                          toast.success("Course marked as Ended")
                        } catch (error: any) {
                          toast.error(error.message || "Failed to mark course as ended")
                        }
                      }}
                      disabled={isPending || isConfirming || course.courseStatus === 1}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Mark as Ended
                    </Button>
                  </div>
                </div>

                {/* Info Box */}
                <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-primary">Note:</span> All changes will be recorded on the blockchain
                    and reflected immediately after transaction confirmation. The page will refresh automatically.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      )}

    </Tabs>
  </div>

}
