"use client"

import { Coins, Users, BookOpen, TrendingUp, Activity, Zap, Wallet, Clock, Calendar, ExternalLink } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { useUserData } from "@/hooks/useUserData"
import { useRouter } from "next/navigation"
import useCeloreanContract from "@/hooks/useCeloreanContract"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { CourseCard } from "@/components/course-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Dashboard() {
  const router = useRouter()
  const {
    isConnected,
    isStudent,
    isLecturer,
    userStats,
    loading: userDataLoading,
    address
  } = useUserData()

  const {
    fetchStudentCourses,
    fetchCourse,
    isPending
  } = useCeloreanContract()

  const [registeredCourses, setRegisteredCourses] = useState<any[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)

  // Fetch registered courses
  useEffect(() => {
    const fetchRegisteredCourses = async () => {
      if (!address || !isStudent) return

      setLoadingCourses(true)
      try {
        // Get course IDs
        const courseIdsData = await fetchStudentCourses(address)
        const courseIds = (courseIdsData as any[]) || []

        // Fetch details for each course
        const coursesPromises = courseIds.map(async (id: any) => {
          const courseId = Number(id)
          const courseData = await fetchCourse(courseId)
          const data = courseData as any

          if (!data) return null

          // Parse course data
          // Parse course data
          const title = data.title
          const description = data.description
          const durationVal = Number(data.duration || 0)
          // Price is no longer in the contract struct, default to "Free" or "0"
          const price = "0"
          const level = data.level
          const rating = Number(data.rating || 0)
          const enrolledCount = Number(data.enrolledCount || 0)
          const capacity = Number(data.capacity || 0)
          const instructor = data.instructor
          const metadataUri = data.metadataUri

          // Fetch metadata
          let metadata = { thumbnail: "", tokenReward: "0", tags: [] }
          if (metadataUri) {
            try {
              const metadataResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${metadataUri}`)
              metadata = await metadataResponse.json()
            } catch (e) {
              console.warn("Failed to fetch metadata", e)
            }
          }

          return {
            id: courseId,
            title,
            description,
            instructor,
            duration: durationVal > 0 ? `${durationVal} hours` : "Self-paced",
            students: enrolledCount,
            rating: rating,
            level: level,
            price: price,
            tokenReward: metadata.tokenReward || "100",
            image: metadata.thumbnail ? `https://gateway.pinata.cloud/ipfs/${metadata.thumbnail}` : "/api/placeholder/400/200",
            tags: data.tags || metadata.tags || [],
            capacity: capacity,
            isEnrolled: true,
            isAdmitted: true
          }
        })

        const courses = (await Promise.all(coursesPromises)).filter(Boolean)
        setRegisteredCourses(courses)
      } catch (error) {
        console.error("Error fetching registered courses:", error)
      } finally {
        setLoadingCourses(false)
      }
    }

    if (isConnected && isStudent) {
      fetchRegisteredCourses()
    }
  }, [address, isStudent, isConnected])

  const handleViewAllCourses = () => {
    router.push("/learning")
  }

  if (!isConnected) {
    return (
      <div className="p-6 md:p-8 min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto p-8 glass-card rounded-2xl border-white/10">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse-glow">
            <Wallet className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-3 text-white">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8">Please connect your wallet to access your personalized dashboard and track your learning progress.</p>
          <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold py-6">
            Connect Wallet
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">Dashboard</h1>
          <p className="text-gray-400 text-lg">
            {isStudent ? "Welcome back to your learning journey" :
              isLecturer ? "Welcome back, Instructor" :
                "Welcome to Celorean"}
          </p>
        </div>
        {address && (
          <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm text-gray-400 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Learning Progress"
          value={`${userStats.progressPercentage}%`}
          description={`${userStats.enrolledCoursesCount} ${userStats.enrolledCoursesCount === 1 ? 'course' : 'courses'} enrolled`}
          icon={<BookOpen className="h-5 w-5" />}
          trend={userStats.progressPercentage > 50 ? "up" : "neutral"}
          trendValue={userStats.enrolledCoursesCount > 0 ? `${userStats.completedCoursesCount} completed` : "Start learning!"}
          loading={userDataLoading}
        />
        <StatCard
          title="Tokens Earned"
          value={`${userStats.tokensEarned} CEL`}
          description="Lifetime earnings"
          icon={<Coins className="h-5 w-5" />}
          trend={userStats.tokensEarned > 0 ? "up" : "neutral"}
          trendValue={userStats.tokensEarned > 0 ? "Keep learning!" : "Complete courses to earn"}
          loading={userDataLoading}
        />
        <StatCard
          title="Account Status"
          value={isStudent ? "Student" : isLecturer ? "Instructor" : "Guest"}
          description={isStudent ? "Verified learner" : isLecturer ? "Verified instructor" : "Connect to get started"}
          icon={<Users className="h-5 w-5" />}
          loading={userDataLoading}
        />
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1">
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Enrolled Courses</h2>
            <Button variant="ghost" onClick={handleViewAllCourses} className="text-primary hover:text-primary/80 hover:bg-primary/10">
              Browse All Courses
            </Button>
          </div>

          {loadingCourses ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[400px] rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : registeredCourses.length > 0 ? (
            <div className="space-y-2">
              {registeredCourses.map((course) => (
                <div
                  key={course.id}
                  className="group flex items-center justify-between p-4 glass-panel rounded-lg hover:bg-white/5 transition-all border border-white/5 cursor-pointer"
                  onClick={() => router.push(`/course/${course.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="font-mono text-sm group-hover:text-primary transition-colors uppercase tracking-wide">
                      {course.title}
                    </span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-gray-500 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass-panel rounded-xl border-dashed border-white/20">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
              <p className="text-gray-400 mb-6">Start your learning journey by enrolling in a course.</p>
              <Button onClick={handleViewAllCourses} className="bg-primary hover:bg-primary/90">
                Browse Courses
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <div className="glass-panel rounded-xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
            <div className="space-y-6">
              {userStats.recentActivities.length > 0 ? (
                userStats.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors border border-primary/20">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">{activity.title}</p>
                      <p className="text-xs text-gray-400">{activity.description}</p>
                    </div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <div className="glass-panel rounded-xl border border-white/10 p-6 text-center py-16">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-bold text-white mb-2">Upcoming Sessions</h3>
            <p className="text-gray-400">Your class schedule will appear here once you enroll in live sessions.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
