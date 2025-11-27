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
        "group cursor-pointer transition-all duration-300 overflow-hidden border-border hover:border-primary/40",
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
            <Badge variant="destructive" className="font-mono uppercase">
              FULL
            </Badge>
          )}
          <div className="bg-card border border-border px-2 py-1 rounded-sm text-xs font-mono uppercase tracking-wider flex items-center gap-1 text-foreground">
            {isAdmitted ? (
              <>
                <CheckCircle className="h-3 w-3 text-primary" />
                <span>REGISTERED</span>
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 text-secondary" />
                <span>GUEST</span>
              </>
            )}
          </div>
        </div>
      </div>
      <CardContent className="p-5 relative z-20">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-mono font-bold line-clamp-1 text-foreground group-hover:text-primary transition-colors uppercase">{title}</h3>
          <div className="flex items-center text-yellow-400 text-xs font-bold bg-yellow-400/10 px-2 py-1 rounded-full">
            <Star className="h-3 w-3 mr-1 fill-yellow-400" />
            {rating.toFixed(1)}
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10">{description}</p>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 bg-card p-2 rounded-sm border border-border font-mono">
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
          <div className="flex items-center text-primary font-mono uppercase">
            <Tag className="h-3 w-3 mr-1.5" />
            FREE
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2.5 py-0.5 bg-transparent text-primary border border-primary/30 rounded-sm text-[10px] font-mono uppercase tracking-wider">
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
                  "font-mono uppercase tracking-wider transition-all duration-300",
                  isFull
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                )}
              >
                {buttonLoading ? "Processing..." : isFull ? "Course Full" : "Enroll Now"}
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline" className="font-mono uppercase">
                <Link href="/register" onClick={(e) => e.stopPropagation()}>
                  Register to Enroll
                </Link>
              </Button>
            )
          ) : (
            <Button
              size="sm"
              className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 font-mono uppercase"
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
