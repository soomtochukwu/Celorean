"use client"

import { Coins, Users, BookOpen, TrendingUp, Activity, Zap, Wallet, Clock, Calendar } from "lucide-react"
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
    fetchCoursesRegisteredByStudent,
    fetchTotalRegisteredCourses,
    fetchCourse,
    isPending
  } = useCeloreanContract()

  const [registeredCourses, setRegisteredCourses] = useState<any[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [totalCourses, setTotalCourses] = useState(0)

  // Fetch registered courses
  useEffect(() => {
    const fetchRegisteredCourses = async () => {
      if (!address || !isStudent) return

      setLoadingCourses(true)
      try {
        // Get total count first
        const total = await fetchTotalRegisteredCourses()
        setTotalCourses(Number(total || 0))

        // Get course IDs
        const courseIdsData = await fetchCoursesRegisteredByStudent(address)
        const courseIds = (courseIdsData as any[]) || []

        // Fetch details for each course
        const coursesPromises = courseIds.map(async (id: any) => {
          const courseId = Number(id)
          const courseData = await fetchCourse(courseId)
          const data = courseData as any

          if (!data) return null

          // Parse course data
          const title = data.title || data[1]
          const description = data.description || data[2]
          const durationVal = Number(data.duration || data[3])
          const price = (data.price || data[4]).toString()
          const level = data.level || data[6]
          const rating = Number(data.rating || data[7])
          const enrolledCount = Number(data.enrolledCount || data[8])
          const capacity = Number(data.capacity || data[9])
          const instructor = data.instructor || data[10]
          const metadataUri = data.metadataUri || data[11]

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
            <div className="space-y-4">
              {registeredCourses.map((course) => (
                <div
                  key={course.id}
                  className="group flex flex-col sm:flex-row items-center gap-4 p-4 glass-panel rounded-xl hover:bg-white/5 transition-all border border-white/5 cursor-pointer"
                  onClick={() => router.push(`/course/${course.id}`)}
                >
                  {/* Thumbnail */}
                  <div className="relative w-full sm:w-48 h-32 sm:h-28 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center sm:text-left w-full">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{course.title}</h3>
                    <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-gray-400 mb-2">
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" /> {course.instructor}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {course.duration}
                      </span>
                    </div>

                    {/* Progress Bar Placeholder - can be connected to real data later */}
                    <div className="w-full max-w-md bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${course.progress || 0}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{course.progress || 0}% Complete</p>
                  </div>

                  {/* Action */}
                  <Button
                    className="w-full sm:w-auto bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/course/${course.id}`);
                    }}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Continue Learning
                  </Button>
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
