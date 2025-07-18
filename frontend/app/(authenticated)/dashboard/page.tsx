
"use client"

import { Coins, Users, BookOpen, TrendingUp, Activity, Zap, Wallet } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { useUserData } from "@/hooks/useUserData"
import { useCourses } from "@/hooks/useCourses"
import { useRouter } from "next/navigation"
import useCeloreanContract from "@/hooks/useCeloreanContract"
import { toast } from "sonner"

export default function Dashboard() {
  const router = useRouter()
  const {
    isConnected,
    isStudent,
    isLecturer,
    userStats,
    loading,
    address
  } = useUserData()
  const { courses } = useCourses()
  const { registerForCourse, isPending, getCourse } = useCeloreanContract()

  // Get activity icons
  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case "BookOpen":
        return <BookOpen className="h-5 w-5 text-primary" />
      case "Coins":
        return <Coins className="h-5 w-5 text-primary" />
      case "TrendingUp":
        return <TrendingUp className="h-5 w-5 text-primary" />
      default:
        return <Activity className="h-5 w-5 text-primary" />
    }
  }

  // Filter recommended courses (exclude enrolled ones)
  const recommendedCourses = courses.filter(course =>
    !userStats.enrolledCoursesCount || Math.random() > 0.5 // Demo filter
  ).slice(0, 3)

  // Handle course enrollment
  const handleCourseEnroll = async (courseId: number, courseTitle: string) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!isStudent) {
      toast.error("You need to be registered as a student to enroll in courses")
      return
    }

    if (!address) {
      toast.error("Wallet address not available")
      return
    }

    try {
      // Get course data to fetch the price
      const courseData = getCourse(courseId)
      const priceInWei = (courseData?.data as any)?.price?.toString() || '0'

      await registerForCourse(courseId, address, priceInWei)
      toast.success(`Successfully enrolled in ${courseTitle}!`)
      // Optionally refresh the page or update state
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error("Enrollment error:", error)
      toast.error("Failed to enroll in course. Please try again.")
    }
  }

  // Handle course card click
  const handleCourseClick = (courseId: number) => {
    router.push(`/learning?courseId=${courseId}`)
  }

  // Handle View All buttons
  const handleViewAllActivity = () => {
    router.push("/activity")
  }

  const handleViewAllCourses = () => {
    router.push("/learning")
  }

  if (!isConnected) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground">Please connect your wallet to view your learning dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {isStudent ? "Welcome back to your learning journey" :
              isLecturer ? "Welcome back, Instructor" :
                "Welcome to Celorean"}
          </p>
          {address && (
            <p className="text-xs text-muted-foreground mt-1">
              Connected: {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Learning Progress"
          value={loading ? "Loading..." : `${userStats.progressPercentage}%`}
          description={loading ? "Fetching data..." : `${userStats.enrolledCoursesCount} courses enrolled`}
          icon={<BookOpen className="h-5 w-5" />}
          trend={userStats.progressPercentage > 50 ? "up" : "neutral"}
          trendValue={userStats.enrolledCoursesCount > 0 ? `${userStats.completedCoursesCount} completed` : "Start learning!"}
        />
        <StatCard
          title="Tokens Earned"
          value={loading ? "Loading..." : `${userStats.tokensEarned} CEL`}
          description="Lifetime earnings"
          icon={<Coins className="h-5 w-5" />}
          trend={userStats.tokensEarned > 0 ? "up" : "neutral"}
          trendValue={userStats.tokensEarned > 0 ? "Keep learning to earn more!" : "Complete courses to earn tokens"}
        />
        <StatCard
          title="Account Status"
          value={isStudent ? "Student" : isLecturer ? "Instructor" : "Guest"}
          description={isStudent ? "Verified learner" : isLecturer ? "Verified instructor" : "Connect to get started"}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Activity Section */}
      <div className="glass rounded-lg border border-primary/10 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          <button
            onClick={handleViewAllActivity}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading your activity...
            </div>
          ) : userStats.recentActivities.length > 0 ? (
            userStats.recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  {getActivityIcon(activity.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                </div>
                <div className="text-xs text-muted-foreground">{activity.time}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-xs">Start learning to see your progress here!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recommended Courses</h2>
          <button
            onClick={handleViewAllCourses}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCourses.length > 0 ? (
            recommendedCourses.map((course, index) => (
              <div
                key={course.id || index}
                className="glass rounded-lg border border-primary/10 p-6 hover:border-primary/30 transition-colors cursor-pointer group"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    {course.level} • {course.duration}h
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCourseEnroll(course.id, course.title)
                    }}
                    disabled={isPending}
                    className="text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? "Enrolling..." : "Start Course"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            // Fallback static courses if no courses available
            [
              {
                id: 1,
                title: "Advanced Blockchain Concepts",
                description: "Learn about consensus mechanisms, smart contracts, and more",
                level: "Advanced",
                duration: "8",
                icon: <Activity className="h-5 w-5 text-primary" />,
              },
              {
                id: 2,
                title: "Web3 Development Fundamentals",
                description: "Build decentralized applications with modern frameworks",
                level: "Intermediate",
                duration: "12",
                icon: <Zap className="h-5 w-5 text-primary" />,
              },
              {
                id: 3,
                title: "Cryptography Basics",
                description: "Understand the mathematics behind blockchain security",
                level: "Beginner",
                duration: "6",
                icon: <Users className="h-5 w-5 text-primary" />,
              },
            ].map((course, index) => (
              <div
                key={index}
                className="glass rounded-lg border border-primary/10 p-6 hover:border-primary/30 transition-colors cursor-pointer group"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  {course.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    {course.level} • {course.duration}h
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCourseEnroll(course.id, course.title)
                    }}
                    disabled={isPending}
                    className="text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? "Enrolling..." : "Start Course"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
