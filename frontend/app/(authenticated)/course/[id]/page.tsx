// "use client"

// import { useState, useEffect } from "react"
// import { useParams, useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Progress } from "@/components/ui/progress"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { toast } from "@/hooks/use-toast"
// import { ArrowLeft, Play, FileText, ExternalLink, Clock, Users, Star, BookOpen, CheckCircle, Lock } from "lucide-react"
// import { useAccount } from "wagmi"
// import useCeloreanContract from "@/hooks/useCeloreanContract"
// import { CourseContentUpload } from "@/components/course-content-upload"
// import { formatEther } from "viem"
// import { useUserData } from "@/hooks/useUserData"
// import Link from "next/link"

// interface ContentItem {
//     id: string
//     type: 'video' | 'document' | 'link' | 'text'
//     title: string
//     description?: string
//     url?: string
//     content?: string
//     thumbnail?: string
//     ipfsUrl?: string
//     courseId?: number
// }

// interface CourseDetails {
//     id: number
//     title: string
//     description: string
//     instructor: string
//     duration: string
//     students: number
//     rating: number
//     level: string
//     price: string
//     tokenReward: string
//     image: string
//     tags: string[]
// }

// export default function CourseDetailPage() {
//     const params = useParams()
//     const router = useRouter()
//     const courseId = parseInt(params.id as string)
//     const { address, isConnected } = useAccount()
//     const { getCourse, registerForCourse, getCourseContentUris, isPending } = useCeloreanContract()
//     const { isStudent } = useUserData()

//     const [course, setCourse] = useState<CourseDetails | null>(null)
//     const [courseContent, setCourseContent] = useState<ContentItem[]>([])
//     const [isEnrolled, setIsEnrolled] = useState(false)
//     const [isInstructor, setIsInstructor] = useState(false)
//     const [loading, setLoading] = useState(true)
//     const [activeTab, setActiveTab] = useState("overview")

//     // Get course data
//     const { data: courseData, isLoading: courseLoading } = getCourse(courseId)

//     useEffect(() => {
//         const fetchCourseDetails = async () => {
//             if (courseData && !courseLoading) {
//                 try {
//                     // Parse course data from blockchain
//                     const [id, title, description, instructor, price, tokenReward, metadataUri] = courseData as any[]

//                     // Fetch metadata from IPFS
//                     const metadataResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${metadataUri}`)
//                     const metadata = await metadataResponse.json()

//                     const courseDetails: CourseDetails = {
//                         id: Number(id),
//                         title,
//                         description,
//                         instructor,
//                         duration: metadata.duration || "Self-paced",
//                         students: metadata.students || 0,
//                         rating: metadata.rating || 0,
//                         level: metadata.level || "Beginner",
//                         price: price.toString(),
//                         tokenReward: tokenReward.toString(),
//                         image: metadata.thumbnail ? `https://gateway.pinata.cloud/ipfs/${metadata.thumbnail}` : "/api/placeholder/400/200",
//                         tags: metadata.tags || []
//                     }

//                     setCourse(courseDetails)

//                     // Check if user is instructor
//                     setIsInstructor(address?.toLowerCase() === instructor.toLowerCase())

//                     // Load course content
//                     await loadCourseContent(courseId)

//                 } catch (error) {
//                     console.error('Error fetching course details:', error)
//                     toast({
//                         title: "Error",
//                         description: "Failed to load course details",
//                         variant: "destructive"
//                     })
//                 } finally {
//                     setLoading(false)
//                 }
//             }
//         }

//         fetchCourseDetails()
//     }, [courseData, courseLoading, address, courseId])

//     // ✅ Get course content URIs from smart contract
//     const { data: contentUris, isLoading: contentLoading } = (getCourseContentUris(
//         courseId
//     ) as unknown) as { data?: string[]; isLoading: boolean };

//     const loadCourseContent = async (courseId: number) => {
//         try {
//             // ✅ First try to get content URIs from smart contract
//             const uris = Array.isArray(contentUris) ? contentUris : [];
//             if (uris.length > 0) {
//                 const allContent: ContentItem[] = [];

//                 for (let i = 0; i < uris.length; i++) {
//                     try {
//                         const contentResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${uris[i]}`);
//                         const contentData = await contentResponse.json();

//                         // Handle both single content item and array
//                         if (Array.isArray((contentData as any).content)) {
//                             allContent.push(...(contentData as any).content);
//                         } else if ((contentData as any).content) {
//                             allContent.push((contentData as any).content);
//                         } else {
//                             allContent.push(contentData as any);
//                         }
//                     } catch (error) {
//                         console.warn(`Failed to load content from URI ${uris[i]}:`, error);
//                     }
//                 }

//                 if (allContent.length > 0) {
//                     setCourseContent(allContent);
//                     return;
//                 }
//             }

//             // Fallback to API search by courseId
//             const response = await fetch(`/api/getCourseContent?courseId=${courseId}`);

//             if (response.ok) {
//                 const data = await response.json();
//                 if (data.success && data.content.length > 0) {
//                     setCourseContent(data.content);
//                     return;
//                 }
//             }

//             // Final fallback to localStorage
//             const storedContent = localStorage.getItem(`course_${courseId}_content`);
//             if (storedContent) {
//                 const parsedContent = JSON.parse(storedContent);
//                 setCourseContent(parsedContent);

//                 // Migrate to smart contract if instructor
//                 if (parsedContent.length > 0 && isInstructor) {
//                     await migrateContentToIPFS(courseId, parsedContent);
//                 }
//             }
//         } catch (error) {
//             console.error('Error loading course content:', error);

//             // Final fallback to localStorage
//             const storedContent = localStorage.getItem(`course_${courseId}_content`);
//             if (storedContent) {
//                 setCourseContent(JSON.parse(storedContent));
//             }
//         }
//     };

//     // ✅ Update useEffect to depend on contentUris
//     useEffect(() => {
//         if (courseId && !contentLoading) {
//             loadCourseContent(courseId);
//         }
//     }, [courseId, contentUris, contentLoading, isInstructor]);

//     // Helper function to migrate localStorage data to IPFS
//     const migrateContentToIPFS = async (courseId: number, content: ContentItem[]) => {
//         try {
//             const response = await fetch('/api/pinCourseContent', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     courseId,
//                     content,
//                 }),
//             });

//             if (response.ok) {
//                 // Clear localStorage after successful migration
//                 localStorage.removeItem(`course_${courseId}_content`);
//                 console.log('Content successfully migrated to IPFS');
//             }
//         } catch (error) {
//             console.error('Error migrating content to IPFS:', error);
//         }
//     };

//     const handleContentUploaded = async (content: ContentItem[]) => {
//         // Associate content with course
//         const contentWithCourseId = content.map(item => ({ ...item, courseId }));
//         setCourseContent(contentWithCourseId);

//         // Save to IPFS instead of localStorage
//         try {
//             const response = await fetch('/api/pinCourseContent', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     courseId,
//                     content: contentWithCourseId,
//                 }),
//             });

//             if (response.ok) {
//                 toast({
//                     title: "Success",
//                     description: "Course content uploaded to IPFS successfully.",
//                 });
//             } else {
//                 throw new Error('Failed to upload to IPFS');
//             }
//         } catch (error) {
//             console.error('Error uploading to IPFS:', error);
//             // Fallback to localStorage
//             localStorage.setItem(`course_${courseId}_content`, JSON.stringify(contentWithCourseId));
//             toast({
//                 title: "Warning",
//                 description: "Content saved locally. IPFS upload failed.",
//                 variant: "destructive",
//             });
//         }
//     };

//     const handleEnrollment = async () => {
//         // Restrict enrollment to registered students, keep content preview open to guests, and add clear visual indicator with a banner and CTA to register when viewing as guest.
//         if (!isStudent) {
//             toast({ title: "Registration required", description: "Please register to enroll in courses." })
//             return
//         }
//         if (!isConnected || !course || !address) return

//         try {
//             await registerForCourse(courseId, address, course.price)
//             setIsEnrolled(true)
//             toast({
//                 title: "Success",
//                 description: "Successfully enrolled in the course!"
//             })
//         } catch (error) {
//             toast({
//                 title: "Error",
//                 description: "Failed to enroll in course",
//                 variant: "destructive"
//             })
//         }
//     }

//     const renderContentItem = (item: ContentItem) => {
//         const getIcon = () => {
//             switch (item.type) {
//                 case 'video': return <Play className="h-5 w-5 text-primary" />
//                 case 'document': return <FileText className="h-5 w-5 text-blue-500" />
//                 case 'link': return <ExternalLink className="h-5 w-5 text-green-500" />
//                 case 'text': return <BookOpen className="h-5 w-5 text-orange-500" />
//             }
//         }

//         const handleContentClick = () => {
//             if (item.type === 'link' && item.url) {
//                 window.open(item.url, '_blank')
//             } else if (item.ipfsUrl) {
//                 window.open(item.ipfsUrl, '_blank')
//             }
//         }

//         return (
//             <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleContentClick}>
//                 <CardContent className="p-4">
//                     <div className="flex items-start gap-4">
//                         {item.thumbnail && (
//                             <img
//                                 src={item.thumbnail}
//                                 alt={item.title}
//                                 className="w-20 h-20 object-cover rounded-lg"
//                             />
//                         )}
//                         <div className="flex-1">
//                             <div className="flex items-center gap-2 mb-2">
//                                 {getIcon()}
//                                 <h3 className="font-semibold text-foreground">{item.title}</h3>
//                                 <Badge variant="outline">{item.type}</Badge>
//                             </div>
//                             {item.description && (
//                                 <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
//                             )}
//                             {item.type === 'text' && item.content && (
//                                 <p className="text-sm text-foreground line-clamp-2">{item.content}</p>
//                             )}
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>
//         )
//     }

//     if (loading) {
//         return (
//             <div className="container mx-auto px-4 py-8">
//                 <div className="animate-pulse space-y-4">
//                     <div className="h-8 bg-muted rounded w-1/4"></div>
//                     <div className="h-64 bg-muted rounded"></div>
//                     <div className="h-32 bg-muted rounded"></div>
//                 </div>
//             </div>
//         )
//     }

//     if (!course) {
//         return (
//             <div className="container mx-auto px-4 py-8 text-center">
//                 <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
//                 <Button onClick={() => router.back()}>
//                     <ArrowLeft className="h-4 w-4 mr-2" />
//                     Go Back
//                 </Button>
//             </div>
//         )
//     }

//     return (
//         <div className="container mx-auto px-4 py-8">
//             {/* Registration status banner */}
//             <div className={`mb-6 rounded-lg border p-4 flex items-start gap-3 ${isStudent ? "border-green-500/30 bg-green-500/10 text-green-800" : "border-amber-500/30 bg-amber-500/10 text-amber-900"}`}>
//                 {isStudent ? (
//                     <CheckCircle className="h-5 w-5 mt-0.5" />
//                 ) : (
//                     <Lock className="h-5 w-5 mt-0.5" />
//                 )}
//                 <div className="flex-1">
//                     <div className="font-semibold text-sm mb-1">
//                         {isStudent ? "Registered student" : "Guest access: preview only"}
//                     </div>
//                     <p className="text-sm opacity-90">
//                         {isStudent
//                             ? "You have full access to enroll and interact with course content."
//                             : "You can preview all materials for this course. Registration is required to enroll."}
//                     </p>
//                 </div>
//                 {!isStudent && (
//                     <Button asChild size="sm">
//                         <Link href="/register">Register to Enroll</Link>
//                     </Button>
//                 )}
//             </div>

//             {/* Header */}
//             <div className="flex items-center gap-4 mb-6">
//                 <Button variant="ghost" onClick={() => router.back()}>
//                     <ArrowLeft className="h-4 w-4 mr-2" />
//                     Back
//                 </Button>
//                 <h1 className="text-3xl font-bold">{course.title}</h1>
//             </div>

//             {/* Course Hero Section */}
//             <Card className="mb-8">
//                 <CardContent className="p-0">
//                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                         <div className="lg:col-span-2 relative">
//                             <img
//                                 src={course.image}
//                                 alt={course.title}
//                                 className="w-full h-64 object-cover rounded-l-lg"
//                             />
//                             {!isStudent && (
//                                 <div className="absolute top-3 right-3 bg-background/85 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
//                                     <Lock className="h-3 w-3 text-amber-600" />
//                                     <span>Guest preview</span>
//                                 </div>
//                             )}
//                         </div>
//                         <div className="p-6 space-y-4">
//                             <div className="flex items-center gap-2">
//                                 <Star className="h-5 w-5 text-yellow-500" />
//                                 <span className="font-semibold">{course.rating}</span>
//                                 <span className="text-muted-foreground">({course.students} students)</span>
//                             </div>

//                             <div className="space-y-2">
//                                 <div className="flex items-center gap-2">
//                                     <Clock className="h-4 w-4 text-muted-foreground" />
//                                     <span className="text-sm">{course.duration}</span>
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                     <Users className="h-4 w-4 text-muted-foreground" />
//                                     <span className="text-sm">Instructor: {course.instructor}</span>
//                                 </div>
//                             </div>

//                             <div className="flex flex-wrap gap-2">
//                                 {course.tags.map((tag, index) => (
//                                     <Badge key={index} variant="secondary">{tag}</Badge>
//                                 ))}
//                             </div>

//                             {!isInstructor && !isEnrolled && (
//                                 isStudent ? (
//                                     <Button
//                                         onClick={handleEnrollment}
//                                         disabled={isPending}
//                                         className="w-full"
//                                     >
//                                         {isPending ? "Enrolling..." : (course.price === '0' ? 'Enroll - Free' : `Enroll - ${formatEther(BigInt(course.price))} ETH`)}
//                                     </Button>
//                                 ) : (
//                                     <Button asChild className="w-full" variant="secondary">
//                                         <Link href="/register">Register to Enroll</Link>
//                                     </Button>
//                                 )
//                             )}

//                             {isEnrolled && (
//                                 <Badge className="w-full justify-center py-2" variant="default">
//                                     ✓ Enrolled
//                                 </Badge>
//                             )}
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>

//             {/* Tabs */}
//             <Tabs value={activeTab} onValueChange={setActiveTab}>
//                 <TabsList className="grid w-full grid-cols-3">
//                     <TabsTrigger value="overview">Overview</TabsTrigger>
//                     <TabsTrigger value="content">Course Content</TabsTrigger>
//                     {isInstructor && <TabsTrigger value="manage">Manage Content</TabsTrigger>}
//                 </TabsList>

//                 <TabsContent value="overview" className="space-y-6">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Course Description</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             <p className="text-foreground leading-relaxed">{course.description}</p>
//                         </CardContent>
//                     </Card>
//                 </TabsContent>

//                 <TabsContent value="content" className="space-y-6">
//                     <Card>
//                         <CardHeader>
//                             <CardTitle>Course Materials</CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                             {courseContent.length > 0 ? (
//                                 <div className="space-y-4">
//                                     {courseContent.map(renderContentItem)}
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-8">
//                                     <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                                     <p className="text-muted-foreground">No course content available yet.</p>
//                                     {isInstructor && (
//                                         <p className="text-sm text-muted-foreground mt-2">
//                                             Switch to the "Manage Content" tab to add materials.
//                                         </p>
//                                     )}
//                                 </div>
//                             )}
//                         </CardContent>
//                     </Card>
//                 </TabsContent>

//                 {isInstructor && (
//                     <TabsContent value="manage" className="space-y-6">
//                         <CourseContentUpload
//                             courseId={courseId}
//                             onContentUploaded={handleContentUploaded}
//                             existingContent={courseContent}
//                         />
//                     </TabsContent>
//                 )}
//             </Tabs>
//         </div>
//     )
// }

import React from "react";

const page = () => {
  return <div>...coming soon</div>;
};

export default page;
