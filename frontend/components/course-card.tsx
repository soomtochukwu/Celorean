import { Clock, Users, Star, BookOpen, Lock, CheckCircle, Tag, Activity, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatEther } from "viem"
import { useAccount } from "wagmi"
import useCeloreanContract from "@/hooks/useCeloreanContract"
import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface CourseCardProps {
  id: number
  title: string
  description: string
  image: string
  instructor: string
  duration: string
  students: number
  rating: number
  level: "Beginner" | "Intermediate" | "Advanced"
  progress?: number
  tags: string[]
  price?: string
  tokenReward?: string
  className?: string
  isEnrolled?: boolean
  onEnrollmentSuccess?: () => void
  thumbnail?: string
  isAdmitted?: boolean
  capacity?: number
  courseType?: number // 0=Bootcamp, 1=Workshop, 2=Seminar
  courseStatus?: number // 0=Ongoing, 1=Ended
}

export function CourseCard({
  id,
  title,
  description,
  image,
  instructor,
  duration,
  students,
  rating,
  level,
  progress,
  tags,
  price,
  tokenReward,
  className,
  isEnrolled: initialIsEnrolled,
  onEnrollmentSuccess,
  thumbnail,
  isAdmitted = false,
  capacity = 100,
  courseType = 0, // Default to Bootcamp
  courseStatus = 0, // Default to Ongoing
}: CourseCardProps) {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const {
    registerForCourse,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    getCourse,
    isStudentEnrolled,
    fetchCourseContentCount,
    fetchCompletedContentCount
  } = useCeloreanContract()
  const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled || progress !== undefined)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [coursePrice, setCoursePrice] = useState('0')
  const [calculatedProgress, setCalculatedProgress] = useState(progress || 0)

  const isFull = students >= capacity;
  const isActive = !isFull;

  // Helper function to get course type info
  const getCourseTypeInfo = (type: number) => {
    switch (type) {
      case 1:
        return { label: "Workshop", icon: "🛠️", color: "text-blue-400" }
      case 2:
        return { label: "Seminar", icon: "💼", color: "text-purple-400" }
      default:
        return { label: "Bootcamp", icon: "🎓", color: "text-terminal-green" }
    }
  }

  const courseTypeInfo = getCourseTypeInfo(courseType);

  // Check enrollment status from blockchain
  const enrollmentQuery = isStudentEnrolled(id, address || "0x0")
  const enrollmentStatus = enrollmentQuery?.data

  useEffect(() => {
    if (address && typeof enrollmentStatus === 'boolean') {
      setIsEnrolled(enrollmentStatus)
    }
  }, [enrollmentStatus, address])

  // Fetch progress if enrolled
  useEffect(() => {
    const fetchProgress = async () => {
      if (isEnrolled && address) {
        try {
          const totalContentBigInt = await fetchCourseContentCount(id)
          const completedContentBigInt = await fetchCompletedContentCount(id, address)

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
  }, [isEnrolled, address, id])

  const { data: courseData } = getCourse(id)

  useEffect(() => {
    if (courseData && (courseData as any).price) {
      setCoursePrice((courseData as any).price.toString())
    }
  }, [courseData])

  const handleCardClick = () => {
    router.push(`/course/${id}`)
  }

  const handleEnrollmentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleEnrollment()
  }

  const handleEnrollment = async () => {
    if (!isAdmitted) {
      toast({
        title: "Registration required",
        description: "Create an account to enroll in courses.",
      })
      return
    }

    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to enroll in courses.",
        variant: "destructive",
      })
      return
    }

    if (!address) {
      toast({
        title: "Address not available",
        description: "Please ensure your wallet is properly connected.",
        variant: "destructive",
      })
      return
    }

    if (isEnrolled || enrollmentStatus) {
      toast({
        title: "Already enrolled",
        description: "You are already enrolled in this course.",
        variant: "destructive",
      })
      return
    }

    if (isFull) {
      toast({
        title: "Course Full",
        description: "This course has reached its maximum capacity.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsEnrolling(true)
      await registerForCourse(id, address)

      toast({
        title: "Enrollment initiated",
        description: "Please confirm the transaction in your wallet.",
      })
    } catch (err: any) {
      console.error('Enrollment error:', err)

      if (err.message?.includes("already enrolled")) {
        toast({
          title: "Already enrolled",
          description: "You are already enrolled in this course.",
          variant: "destructive",
        })
        setIsEnrolled(true)
      } else {
        toast({
          title: "Enrollment failed",
          description: "There was an error enrolling in the course. Please try again.",
          variant: "destructive",
        })
      }
      setIsEnrolling(false)
    }
  }

  useEffect(() => {
    if (isConfirmed && isEnrolling) {
      setIsEnrolled(true)
      setIsEnrolling(false)
      toast({
        title: "Successfully enrolled!",
        description: `You are now enrolled in ${title}.`,
      })
      onEnrollmentSuccess?.()
    }
  }, [isConfirmed, isEnrolling, title, onEnrollmentSuccess])

  useEffect(() => {
    if (error && isEnrolling) {
      setIsEnrolling(false)
      toast({
        title: "Enrollment failed",
        description: error.message || "There was an error enrolling in the course.",
        variant: "destructive",
      })
    }
  }, [error, isEnrolling])

  const buttonLoading = isPending || isConfirming || isEnrolling

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-200 border-terminal-border hover:border-terminal-green bg-terminal-black overflow-hidden",
        className
      )}
      onClick={handleCardClick}
    >
      {/* Status Bar */}
      <div className="relative w-full aspect-video bg-terminal-black border-b border-terminal-border overflow-hidden">
        {/* Image */}
        <img
          src={image || "/placeholder.jpg"}
          alt={title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.jpg";
          }}
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-terminal-black via-transparent to-transparent opacity-60" />

        {/* Status Badge (Overlaid) - Course Status: Ongoing/Ended */}
        <div className="absolute top-2 left-2 flex items-center gap-2 px-2 py-1 bg-terminal-black/80 backdrop-blur-sm border border-terminal-border rounded-sm">
          {courseStatus === 1 ? (
            <>
              <Pause className="h-3 w-3 text-gray-400" />
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-gray-400">ENDED</span>
            </>
          ) : (
            <>
              <Activity className="h-3 w-3 text-terminal-green" />
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-terminal-green">ONGOING</span>
            </>
          )}
        </div>

        {/* Course Type Badge (Overlaid) - Top Right */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-terminal-black/80 backdrop-blur-sm border border-terminal-border rounded-sm">
          <span className={cn("text-[10px] font-mono font-bold tracking-wider uppercase", courseTypeInfo.color)}>
            {courseTypeInfo.icon} {courseTypeInfo.label}
          </span>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-lg font-mono font-bold uppercase text-white group-hover:text-terminal-green transition-colors tracking-wide">
          {title}
        </h3>

        {/* Tags - Show more tags (5-6) */}
        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 6).map((tag, index) => (
            <span
              key={index}
              className="tag-pill border-terminal-border bg-terminal-border/20 text-muted-foreground hover:border-terminal-green hover:text-terminal-green transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Progress for enrolled students */}
        {isEnrolled && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-mono font-bold uppercase tracking-wider">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-terminal-green">{calculatedProgress}%</span>
            </div>
            <Progress value={calculatedProgress} className="h-2 bg-terminal-border" />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 border-t border-terminal-border bg-terminal-border/10">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {isAdmitted && (
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <CheckCircle className="h-3 w-3 text-terminal-green" />
                <span className="text-terminal-green font-bold uppercase tracking-wider">REGISTERED</span>
              </div>
            )}
            {tokenReward && (
              <span className="text-xs font-mono font-bold text-yellow-500 uppercase tracking-wider">
                +{tokenReward} CEL
              </span>
            )}
          </div>

          {!isEnrolled ? (
            isAdmitted ? (
              <Button
                size="sm"
                onClick={handleEnrollmentClick}
                disabled={buttonLoading || isFull}
                variant={isFull ? "destructive" : "default"}
                className="text-xs"
              >
                {buttonLoading ? "PROCESSING..." : isFull ? "FULL" : "ENROLL"}
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link href="/register" onClick={(e) => e.stopPropagation()}>
                  REGISTER
                </Link>
              </Button>
            )
          ) : (
            <Button
              size="sm"
              variant="default"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/course/${id}`);
              }}
              className="text-xs"
            >
              <BookOpen className="w-3 h-3 mr-1.5" />
              {calculatedProgress === 100 ? "REVISE" : "CONTINUE"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
