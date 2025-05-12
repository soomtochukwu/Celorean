import { Clock, Users, Star, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

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
}: CourseCardProps) {
  const isEnrolled = progress !== undefined

  return (
    <Card
      className={cn("glass border-primary/10 overflow-hidden hover:border-primary/30 transition-colors", className)}
    >
      <div className="relative h-48 overflow-hidden">
        <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
          {level}
        </div>
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
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 py-3 border-t border-primary/10 flex justify-between items-center">
        <div className="text-sm">
          {isEnrolled ? (
            <span className="font-medium">Instructor: {instructor}</span>
          ) : (
            <span className="font-bold">{price ? price : "Free"}</span>
          )}
        </div>
        <Button size="sm" variant={isEnrolled ? "outline" : "default"}>
          {isEnrolled ? (
            <>
              <BookOpen className="h-4 w-4 mr-1" /> Continue
            </>
          ) : (
            "Enroll Now"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
