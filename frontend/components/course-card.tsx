import { Clock, Users, Star, BookOpen, Lock, CheckCircle, Tag } from "lucide-react"
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
  capacity?: number // NEW: capacity prop
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
  capacity = 100, // Default capacity
}: CourseCardProps) {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { registerForCourse, isPending, isConfirming, isConfirmed, error, getCourse, isStudentEnrolled } = useCeloreanContract()
  const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled || progress !== undefined)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [coursePrice, setCoursePrice] = useState('0')

  const isFull = students >= capacity;

  // Check enrollment status from blockchain - MUST call hook unconditionally
  const enrollmentQuery = isStudentEnrolled(id, address || "0x0")
  const enrollmentStatus = enrollmentQuery?.data

  // Update enrollment status when blockchain data changes
  useEffect(() => {
    // Only use enrollment data if user is connected
    if (address && typeof enrollmentStatus === 'boolean') {
      setIsEnrolled(enrollmentStatus)
    }
  }, [enrollmentStatus, address])

  // Fetch course details to get the actual price in wei
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
        "group cursor-pointer transition-all duration-300 glass-card hover:shadow-2xl hover:-translate-y-1 overflow-hidden border-white/5",
        className
      )}
      onClick={handleCardClick}
    >
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <img
          src={thumbnail || image || "/placeholder.jpg"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.jpg";
          }}
        />
        <div className="absolute top-2 right-2 z-20 flex gap-2">
          {isFull && !isEnrolled && (
            <Badge variant="destructive" className="animate-pulse">
              Full
            </Badge>
          )}
          <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 text-white border border-white/10">
            {isAdmitted ? (
              <>
                <CheckCircle className="h-3 w-3 text-green-400" />
                <span>Registered</span>
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 text-amber-400" />
                <span>Guest</span>
              </>
            )}
          </div>
        </div>
      </div>
      <CardContent className="p-5 relative z-20">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold line-clamp-1 text-white group-hover:text-primary transition-colors">{title}</h3>
          <div className="flex items-center text-yellow-400 text-xs font-bold bg-yellow-400/10 px-2 py-1 rounded-full">
            <Star className="h-3 w-3 mr-1 fill-yellow-400" />
            {rating.toFixed(1)}
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10">{description}</p>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-4 bg-white/5 p-2 rounded-lg border border-white/5">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1.5 text-primary" />
            {duration}
          </div>
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1.5 text-secondary" />
            <span className={cn(isFull ? "text-red-400 font-bold" : "")}>
              {students}/{capacity}
            </span>
          </div>
          <div className="flex items-center">
            <BookOpen className="h-3 w-3 mr-1.5 text-accent" />
            {level}
          </div>
          <div className="flex items-center text-green-400 font-mono">
            <Tag className="h-3 w-3 mr-1.5" />
            Free
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-medium uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>

        {isEnrolled && (
          <div className="mb-1">
            <div className="flex justify-between text-xs mb-1.5 text-gray-300">
              <span>Progress</span>
              <span>{progress || 0}%</span>
            </div>
            <Progress value={progress || 0} className="h-1.5 bg-white/10" />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-0 relative z-20">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {tokenReward && (
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20">
                🪙 {tokenReward}
              </Badge>
            )}
          </div>

          {!isEnrolled ? (
            isAdmitted ? (
              <Button
                size="sm"
                onClick={handleEnrollmentClick}
                disabled={buttonLoading || isFull}
                className={cn(
                  "font-medium transition-all duration-300",
                  isFull
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-gradient-to-r from-primary to-accent hover:opacity-90 hover:shadow-lg hover:shadow-primary/25 text-white border-0"
                )}
              >
                {buttonLoading ? "Processing..." : isFull ? "Course Full" : "Enroll Now"}
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline" className="border-white/10 hover:bg-white/5 hover:text-white">
                <Link href="/register" onClick={(e) => e.stopPropagation()}>
                  Register to Enroll
                </Link>
              </Button>
            )
          ) : (
            <Button
              size="sm"
              className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/course/${id}`);
              }}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Continue Learning
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
