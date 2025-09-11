import { Clock, Users, Star, BookOpen, Lock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAccount } from "wagmi"
import useCeloreanContract from "@/hooks/useCeloreanContract"
import { useState, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

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
  thumbnail?: string // Add thumbnail support
  isAdmitted?: boolean // NEW: admission status from parent
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
}: CourseCardProps) {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { registerForCourse, isPending, isConfirming, isConfirmed, error, getCourse, isStudentEnrolled } = useCeloreanContract()
  const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled || progress !== undefined)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [coursePrice, setCoursePrice] = useState('0')

  // Check enrollment status from blockchain - only if address is available
  const enrollmentQuery = address ? isStudentEnrolled(id, address) : null
  const enrollmentStatus = enrollmentQuery?.data

  // Update enrollment status when blockchain data changes
  useEffect(() => {
    if (typeof enrollmentStatus === 'boolean') {
      setIsEnrolled(enrollmentStatus)
    }
  }, [enrollmentStatus])

  // Fetch course details to get the actual price in wei
  const { data: courseData } = getCourse(id)

  useEffect(() => {
    if (courseData && (courseData as any).price) {
      setCoursePrice((courseData as any).price.toString())
    }
  }, [courseData])

  const handleCardClick = () => {
    // Block navigation for non-admitted users who are not enrolled
    if (!isAdmitted && !(isEnrolled || enrollmentStatus)) {
      toast({
        title: "Admission required",
        description: "Apply for admission to view this course.",
      })
      return
    }
    router.push(`/course/${id}`)
  }

  const handleEnrollmentClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when clicking enroll button
    handleEnrollment()
  }

  const handleEnrollment = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to enroll in courses.",
        variant: "destructive",
      })
      return
    }

    if (!isAdmitted) {
      toast({
        title: "Admission required",
        description: "Apply for admission to enroll in courses.",
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

    // Check if already enrolled before attempting enrollment
    if (isEnrolled || enrollmentStatus) {
      toast({
        title: "Already enrolled",
        description: "You are already enrolled in this course.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsEnrolling(true)
      await registerForCourse(id, address, coursePrice)

      toast({
        title: "Enrollment initiated",
        description: "Please confirm the transaction in your wallet.",
      })
    } catch (err: any) {
      console.error('Enrollment error:', err)

      // Handle specific error for duplicate enrollment
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

  // Handle successful enrollment
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

  // Handle enrollment error
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
        "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-border bg-card",
        className
      )}
      onClick={handleCardClick}
    >
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <img
          src={thumbnail || image || "/placeholder.jpg"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const currentSrc = target.src;

            // Try different IPFS gateways if the current one fails
            if (currentSrc.includes('ipfs.io/ipfs/')) {
              const cid = currentSrc.split('/ipfs/')[1];
              target.src = `https://gateway.pinata.cloud/ipfs/${cid}`;
            } else if (currentSrc.includes('gateway.pinata.cloud/ipfs/')) {
              const cid = currentSrc.split('/ipfs/')[1];
              target.src = `https://cloudflare-ipfs.com/ipfs/${cid}`;
            } else if (thumbnail && currentSrc !== thumbnail) {
              target.src = thumbnail;
            } else if (image && currentSrc !== image) {
              target.src = image;
            } else {
              target.src = "/placeholder.jpg";
            }
          }}
        />
        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
          {isAdmitted ? (
            <>
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Admitted</span>
            </>
          ) : (
            <>
              <Lock className="h-3 w-3 text-red-600" />
              <span>Not admitted</span>
            </>
          )}
        </div>
        {!isAdmitted && (
          <div
            className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center gap-2 text-sm"
            onClick={(e) => e.stopPropagation()} // prevent triggering card navigation when clicking overlay
          >
            <Lock className="h-4 w-4" />
            <span>Apply for admission to unlock</span>
          </div>
        )}
        {tokenReward && (
          <div className="absolute bottom-2 left-2 bg-primary/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-primary-foreground flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
              <path
                fillRule="evenodd"
                d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z"
                clipRule="evenodd"
              />
              <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
            </svg>
            {tokenReward} CEL
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-bold mb-2 line-clamp-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
        <div className="flex items-center text-xs text-muted-foreground mb-3">
          <div className="flex items-center mr-3">
            <Clock className="h-3 w-3 mr-1" />
            {duration}
          </div>
          <div className="flex items-center mr-3">
            <Users className="h-3 w-3 mr-1" />
            {students.toLocaleString()}
          </div>
          <div className="flex items-center">
            <Star className="h-3 w-3 mr-1 text-yellow-500" />
            {rating.toFixed(1)}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">+{tags.length - 3}</span>
          )}
        </div>
        {isEnrolled && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{progress || 0}%</span>
            </div>
            <Progress value={progress || 0} className="h-1.5" />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {level}
            </Badge>
            {tokenReward && (
              <Badge variant="secondary" className="text-xs">
                🪙 {tokenReward}
              </Badge>
            )}
          </div>

          {!isEnrolled ? (
            isAdmitted ? (
              <Button
                size="sm"
                onClick={handleEnrollmentClick}
                disabled={buttonLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {buttonLoading ? "Processing..." : "Enroll Now"}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => { e.stopPropagation(); toast({ title: "Apply for admission", description: "Contact an administrator or submit an application to be admitted." }) }}
              >
                Apply for Admission
              </Button>
            )
          ) : (
            <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
              ✓ Enrolled
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
