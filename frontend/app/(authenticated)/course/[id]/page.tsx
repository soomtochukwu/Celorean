"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { ArrowLeft, Play, FileText, ExternalLink, Clock, Users, Star, BookOpen, CheckCircle, Lock, AlertCircle } from "lucide-react"
import { useAccount } from "wagmi"
import useCeloreanContract from "@/hooks/useCeloreanContract"
import { CourseContentUpload } from "@/components/course-content-upload"
import { formatEther } from "viem"
import { useUserData } from "@/hooks/useUserData"
import Link from "next/link"
import { Quiz } from "@/components/Quiz"
import { AttendanceControl } from "@/components/attendance-control"
import { cn } from "@/lib/utils"

interface ContentItem {
  id: string
  type: 'video' | 'document' | 'link' | 'text'
  title: string
  description?: string
  url?: string
  content?: string
  thumbnail?: string
  ipfsUrl?: string
  courseId?: number
}

interface CourseDetails {
  id: number
  title: string
  description: string
  instructor: string
  duration: string
  students: number
  rating: number
  level: string
  price: string
  tokenReward: string
  image: string
  tags: string[]
  capacity: number // NEW
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = parseInt(params.id as string)
  const { address, isConnected } = useAccount()
  const { getCourse, registerForCourse, getCourseContentUris, isPending } = useCeloreanContract()
  const { isStudent } = useUserData()

  const [course, setCourse] = useState<CourseDetails | null>(null)
  const [courseContent, setCourseContent] = useState<ContentItem[]>([])
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isInstructor, setIsInstructor] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Get course data
  const { data: courseData, isLoading: courseLoading } = getCourse(courseId)

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (courseData && !courseLoading) {
        try {
          // Parse course data from blockchain
          // Updated to match new struct: [id, title, description, duration, price, tags, level, rating, enrolledCount, capacity, instructor, metadataUri, contentUris]
          // Wait, getCourse returns the struct. Let's check what getCourse returns in hook.
          // Assuming it returns array or object matching struct.
          // Based on previous code: [id, title, description, instructor, price, tokenReward, metadataUri] was WRONG/Outdated.
          // The struct in solidity is:
          // struct Course { id, title, description, duration, price, tags, level, rating, enrolledCount, capacity, instructor, metadataUri, contentUris }
          // So we need to map correctly.

          const data = courseData as any;
          // If it's an array (ethers v5/v6 usually returns array-like object)

          // Let's try to map safely assuming standard return
          // We might need to fetch metadata for image/tags if they are not in struct (tags are in struct now)

          const id = Number(data.id || data[0]);
          const title = data.title || data[1];
          const description = data.description || data[2];
          const durationVal = Number(data.duration || data[3]);
          const price = (data.price || data[4]).toString();
          // tags is 5
          const level = data.level || data[6];
          const rating = Number(data.rating || data[7]);
          const enrolledCount = Number(data.enrolledCount || data[8]);
          const capacity = Number(data.capacity || data[9]);
          const instructor = data.instructor || data[10];
          const metadataUri = data.metadataUri || data[11];

          // Fetch metadata from IPFS for image and extra details
          let metadata = { thumbnail: "", tokenReward: "0" };
          if (metadataUri) {
            try {
              const metadataResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${metadataUri}`)
              metadata = await metadataResponse.json()
            } catch (e) {
              console.warn("Failed to fetch metadata", e)
            }
          }

          const courseDetails: CourseDetails = {
            id,
            title,
            description,
            instructor,
            duration: durationVal > 0 ? `${durationVal} hours` : "Self-paced", // Assuming duration is hours or we format it
            students: enrolledCount,
            rating: rating,
            level: level,
            price: price,
            tokenReward: metadata.tokenReward || "100",
            image: metadata.thumbnail ? `https://gateway.pinata.cloud/ipfs/${metadata.thumbnail}` : "/api/placeholder/400/200",
            tags: data.tags || [],
            capacity: capacity
          }

          setCourse(courseDetails)

          // Check if user is instructor
          setIsInstructor(address?.toLowerCase() === instructor.toLowerCase())

          // Load course content
          await loadCourseContent(courseId)

        } catch (error) {
          console.error('Error fetching course details:', error)
          toast.error("Failed to load course details")
        } finally {
          setLoading(false)
        }
      }
    }

    fetchCourseDetails()
  }, [courseData, courseLoading, address, courseId])

  // ✅ Get course content URIs from smart contract
  const { data: contentUris, isLoading: contentLoading } = (getCourseContentUris(
    courseId
  ) as unknown) as { data?: string[]; isLoading: boolean };

  const loadCourseContent = async (courseId: number) => {
    try {
      // ✅ First try to get content URIs from smart contract
      const uris = Array.isArray(contentUris) ? contentUris : [];
      if (uris.length > 0) {
        const allContent: ContentItem[] = [];

        for (let i = 0; i < uris.length; i++) {
          try {
            const contentResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${uris[i]}`);
            const contentData = await contentResponse.json();

            // Handle both single content item and array
            if (Array.isArray((contentData as any).content)) {
              allContent.push(...(contentData as any).content);
            } else if ((contentData as any).content) {
              allContent.push((contentData as any).content);
            } else {
              allContent.push(contentData as any);
            }
          } catch (error) {
            console.warn(`Failed to load content from URI ${uris[i]}:`, error);
          }
        }

        if (allContent.length > 0) {
          setCourseContent(allContent);
          return;
        }
      }

      // Fallback to API search by courseId
      const response = await fetch(`/api/getCourseContent?courseId=${courseId}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.content.length > 0) {
          setCourseContent(data.content);
          return;
        }
      }

      // Final fallback to localStorage
      const storedContent = localStorage.getItem(`course_${courseId}_content`);
      if (storedContent) {
        const parsedContent = JSON.parse(storedContent);
        setCourseContent(parsedContent);

        // Migrate to smart contract if instructor
        if (parsedContent.length > 0 && isInstructor) {
          await migrateContentToIPFS(courseId, parsedContent);
        }
      }
    } catch (error) {
      console.error('Error loading course content:', error);

      // Final fallback to localStorage
      const storedContent = localStorage.getItem(`course_${courseId}_content`);
      if (storedContent) {
        setCourseContent(JSON.parse(storedContent));
      }
    }
  };

  // ✅ Update useEffect to depend on contentUris
  useEffect(() => {
    if (courseId && !contentLoading) {
      loadCourseContent(courseId);
    }
  }, [courseId, contentUris, contentLoading, isInstructor]);

  // Helper function to migrate localStorage data to IPFS
  const migrateContentToIPFS = async (courseId: number, content: ContentItem[]) => {
    try {
      const response = await fetch('/api/pinCourseContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          content,
        }),
      });

      if (response.ok) {
        // Clear localStorage after successful migration
        localStorage.removeItem(`course_${courseId}_content`);
        console.log('Content successfully migrated to IPFS');
      }
    } catch (error) {
      console.error('Error migrating content to IPFS:', error);
    }
  };

  const handleContentUploaded = async (content: ContentItem[]) => {
    // Associate content with course
    const contentWithCourseId = content.map(item => ({ ...item, courseId }));
    setCourseContent(contentWithCourseId);

    // Save to IPFS instead of localStorage
    try {
      const response = await fetch('/api/pinCourseContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          content: contentWithCourseId,
        }),
      });

      if (response.ok) {
        toast.success("Course content uploaded to IPFS successfully.");
      } else {
        throw new Error('Failed to upload to IPFS');
      }
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      // Fallback to localStorage
      localStorage.setItem(`course_${courseId}_content`, JSON.stringify(contentWithCourseId));
      toast.error("Content saved locally. IPFS upload failed.");
    }
  };

  const handleEnrollment = async () => {
    if (!isStudent) {
      toast.error("Please register to enroll in courses.")
      return
    }
    if (!isConnected || !course || !address) return

    if (course.students >= course.capacity) {
      toast.error("Course is full")
      return
    }

    try {
      await registerForCourse(courseId, address, course.price)
      setIsEnrolled(true)
      toast.success("Successfully enrolled in the course!")
    } catch (error) {
      toast.error("Failed to enroll in course")
    }
  }

  const renderContentItem = (item: ContentItem) => {
    const getIcon = () => {
      switch (item.type) {
        case 'video': return <Play className="h-5 w-5 text-primary" />
        case 'document': return <FileText className="h-5 w-5 text-blue-500" />
        case 'link': return <ExternalLink className="h-5 w-5 text-green-500" />
        case 'text': return <BookOpen className="h-5 w-5 text-orange-500" />
      }
    }

    const handleContentClick = () => {
      if (item.type === 'link' && item.url) {
        window.open(item.url, '_blank')
      } else if (item.ipfsUrl) {
        window.open(item.ipfsUrl, '_blank')
      }
    }

    return (
      <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow bg-white/5 border-white/10" onClick={handleContentClick}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {item.thumbnail && (
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getIcon()}
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <Badge variant="outline" className="border-white/20 text-gray-300">{item.type}</Badge>
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
              )}
              {item.type === 'text' && item.content && (
                <p className="text-sm text-foreground line-clamp-2">{item.content}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  const isFull = course.students >= course.capacity;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Registration status banner */}
      <div className={cn(
        "mb-6 rounded-lg border p-4 flex items-start gap-3 backdrop-blur-sm",
        isStudent
          ? "border-green-500/30 bg-green-500/10 text-green-400"
          : "border-amber-500/30 bg-amber-500/10 text-amber-400"
      )}>
        {isStudent ? (
          <CheckCircle className="h-5 w-5 mt-0.5" />
        ) : (
          <Lock className="h-5 w-5 mt-0.5" />
        )}
        <div className="flex-1">
          <div className="font-semibold text-sm mb-1">
            {isStudent ? "Registered student" : "Guest access: preview only"}
          </div>
          <p className="text-sm opacity-90">
            {isStudent
              ? "You have full access to enroll and interact with course content."
              : "You can preview all materials for this course. Registration is required to enroll."}
          </p>
        </div>
        {!isStudent && (
          <Button asChild size="sm" variant="outline" className="border-amber-500/30 hover:bg-amber-500/20">
            <Link href="/register">Register to Enroll</Link>
          </Button>
        )}
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="hover:bg-white/5">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{course.title}</h1>
      </div>

      {/* Course Hero Section */}
      <Card className="mb-8 glass-panel border-white/10 overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 relative h-64 lg:h-auto">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
              {!isStudent && (
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium flex items-center gap-1 text-amber-400 border border-amber-500/30">
                  <Lock className="h-3 w-3" />
                  <span>Guest preview</span>
                </div>
              )}
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-yellow-500/10 px-2 py-1 rounded-full border border-yellow-500/20">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="font-semibold text-yellow-500">{course.rating}</span>
                </div>
                <span className={cn("text-sm", isFull ? "text-red-400 font-bold" : "text-muted-foreground")}>
                  ({course.students}/{course.capacity} enrolled)
                </span>
                {isFull && <Badge variant="destructive" className="animate-pulse">FULL</Badge>}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm">{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="h-4 w-4 text-secondary" />
                  <span className="text-sm">Instructor: {course.instructor.substring(0, 6)}...{course.instructor.substring(38)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-white/5 hover:bg-white/10 text-gray-300 border-white/10">{tag}</Badge>
                ))}
              </div>

              {!isInstructor && !isEnrolled && (
                isStudent ? (
                  <Button
                    onClick={handleEnrollment}
                    disabled={isPending || isFull}
                    className={cn(
                      "w-full font-bold text-lg h-12 shadow-lg shadow-primary/20",
                      isFull
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    )}
                  >
                    {isPending ? "Enrolling..." : isFull ? "Course Full" : (course.price === '0' ? 'Enroll - Free' : `Enroll - ${formatEther(BigInt(course.price))} ETH`)}
                  </Button>
                ) : (
                  <Button asChild className="w-full h-12" variant="secondary">
                    <Link href="/register">Register to Enroll</Link>
                  </Button>
                )
              )}

              {isEnrolled && (
                <Badge className="w-full justify-center py-3 bg-green-500/20 text-green-400 border-green-500/30 text-base" variant="default">
                  <CheckCircle className="mr-2 h-5 w-5" /> Enrolled
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px] bg-white/5 border border-white/10">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          {(isInstructor || isEnrolled) && <TabsTrigger value="attendance">Attendance</TabsTrigger>}
          {isInstructor && <TabsTrigger value="manage">Manage</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">{course.description}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6 mt-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Course Materials</CardTitle>
            </CardHeader>
            <CardContent>
              {courseContent.length > 0 ? (
                <div className="space-y-4">
                  {courseContent.map(renderContentItem)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">No course content available yet.</p>
                  {isInstructor && (
                    <p className="text-sm text-primary mt-2">
                      Switch to the "Manage" tab to add materials.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz" className="space-y-6 mt-6">
          <Quiz
            title={`Quiz: ${course.title} Basics`}
            questions={[
              {
                id: 1,
                text: "What is the main concept of this course?",
                options: ["Blockchain", "Cooking", "Gardening", "Flying"],
                correctAnswer: 0
              },
              {
                id: 2,
                text: "Who is the instructor?",
                options: ["Satoshi", "Vitalik", course.instructor.substring(0, 10) + "...", "Nobody"],
                correctAnswer: 2
              },
              {
                id: 3,
                text: "Is this course decentralized?",
                options: ["Yes", "No", "Maybe", "Ask Google"],
                correctAnswer: 0
              }
            ]}
          />
        </TabsContent>

        {(isInstructor || isEnrolled) && (
          <TabsContent value="attendance" className="space-y-6 mt-6">
            <AttendanceControl
              courseId={courseId}
              isLecturer={isInstructor}
              isStudent={isEnrolled}
            />
          </TabsContent>
        )}

        {isInstructor && (
          <TabsContent value="manage" className="space-y-6 mt-6">
            <CourseContentUpload
              courseId={courseId}
              onContentUploaded={handleContentUploaded}
              existingContent={courseContent}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
