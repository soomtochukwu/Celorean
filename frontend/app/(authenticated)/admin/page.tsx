"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { parseEther } from "viem"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import useCeloreanContract from "@/hooks/useCeloreanContract"
import { CourseThumbnailUpload } from "@/components/course-thumbnail-upload"
import { CourseContentUpload } from "@/components/course-content-upload"
import { Users, GraduationCap, BookPlus, Shield, BookOpen, UserPlus, Loader2, RefreshCw } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminPage() {
    const { address, isConnected } = useAccount()
    const {
        owner,
        lecturerList,
        employLecturer,
        admitStudent,
        createCourse,
        addMultipleCourseContent,
        isLecturer,
        isPending,
        isConfirming,
        courseCount,
        getListOfStudents,
        withdraw
    } = useCeloreanContract()

    // Call hook at top level with fallback for undefined address
    const lecturerCheck = isLecturer(address || "0x0000000000000000000000000000000000000000")
    const studentListQuery = getListOfStudents()

    const [isAdmin, setIsAdmin] = useState(false)
    const [isUserLecturer, setIsUserLecturer] = useState(false)
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
    const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
    const [contentItems, setContentItems] = useState<any[]>([])
    const [selectedCourseForContent, setSelectedCourseForContent] = useState<number | null>(null)

    // Form states
    const [lecturerForm, setLecturerForm] = useState({ address: "", value: "" })
    const [studentForm, setStudentForm] = useState({ address: "", value: "" })
    const [courseForm, setCourseForm] = useState({
        title: "",
        duration: "",
        description: "",
        price: "",
        tags: "",
        level: "Beginner",
        capacity: "",
        courseType: "0" // Default to Bootcamp (0)
    })

    // Check if current user is admin or lecturer
    useEffect(() => {
        if (address && owner) {
            setIsAdmin(address.toLowerCase() === String(owner).toLowerCase())
        }
    }, [address, owner])

    useEffect(() => {
        if (address && lecturerCheck.data !== undefined) {
            setIsUserLecturer(Boolean(lecturerCheck.data))
        }
    }, [address, lecturerCheck.data])

    const handleThumbnailUploaded = (file: File, previewUrl: string) => {
        setThumbnailFile(file)
        setThumbnailPreview(previewUrl)
    }

    const handleContentUploaded = (content: any[]) => {
        setContentItems(content)
    }

    const uploadThumbnailToIPFS = async (file: File, courseTitle: string): Promise<string | null> => {
        try {
            setIsUploadingThumbnail(true)
            const formData = new FormData()
            formData.append('thumbnail', file)
            formData.append('courseTitle', courseTitle)

            const response = await fetch('/api/pinCourseThumbnail', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Failed to upload thumbnail')
            }

            const data = await response.json()
            return data.cid
        } catch (error) {
            console.error('Error uploading thumbnail:', error)
            toast({
                title: "Error",
                description: "Failed to upload thumbnail to IPFS",
                variant: "destructive",
            })
            return null
        } finally {
            setIsUploadingThumbnail(false)
        }
    }

    const uploadCourseMetadata = async (courseData: any, thumbnailCid: string | null): Promise<string | null> => {
        try {
            const response = await fetch('/api/pinCourseMetadata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    courseData,
                    thumbnailCid,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to upload course metadata')
            }

            const data = await response.json()
            return data.cid
        } catch (error) {
            console.error('Error uploading course metadata:', error)
            toast({
                title: "Error",
                description: "Failed to upload course metadata to IPFS",
                variant: "destructive",
            })
            return null
        }
    }

    const handleUpdateCourseContent = async (courseId: number) => {
        try {
            const contentUris: string[] = [];

            for (const item of contentItems) {
                const response = await fetch('/api/pinCourseContent', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        courseId,
                        content: [item],
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to upload content item: ${item.title}`);
                }

                const data = await response.json();
                contentUris.push(data.cid);
            }

            await addMultipleCourseContent(courseId, contentUris);

            toast({
                title: "Content updated",
                description: `Successfully added ${contentUris.length} content items to the course.`,
            });

            setContentItems([]);
        } catch (error) {
            console.error('Error updating course content:', error);
            toast({
                title: "Error",
                description: "Failed to update course content.",
                variant: "destructive",
            });
        }
    };

    const handleEmployLecturer = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await employLecturer(lecturerForm.address)
            toast({
                title: "Lecturer employment initiated",
                description: "Please confirm the transaction in your wallet.",
            })
            setLecturerForm({ address: "", value: "" })
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to employ lecturer. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleAdmitStudent = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await admitStudent(studentForm.address)
            toast({
                title: "Student admission initiated",
                description: "Please confirm the transaction in your wallet.",
            })
            setStudentForm({ address: "", value: "" })
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to admit student. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            let thumbnailCid: string | null = null
            let metadataCid: string | null = null

            if (thumbnailFile && courseForm.title) {
                thumbnailCid = await uploadThumbnailToIPFS(thumbnailFile, courseForm.title)
                if (!thumbnailCid) {
                    throw new Error('Failed to upload thumbnail')
                }
            }

            metadataCid = await uploadCourseMetadata(courseForm, thumbnailCid)
            if (!metadataCid) {
                throw new Error('Failed to upload course metadata')
            }

            const tags = courseForm.tags.split(",").map(t => t.trim())
            const metadataUri = `https://gateway.pinata.cloud/ipfs/${metadataCid}`

            await createCourse(
                courseForm.title,
                parseInt(courseForm.duration),
                courseForm.description,
                // price removed
                tags,
                courseForm.level,
                metadataUri,
                parseInt(courseForm.capacity),
                parseInt(courseForm.courseType) // Pass course type
            )

            toast({
                title: "Course creation initiated",
                description: "Please confirm the transaction in your wallet.",
            })

            setCourseForm({
                title: "",
                duration: "",
                description: "",
                price: "",
                tags: "",
                level: "Beginner",
                capacity: "",
                courseType: "0" // Reset to Bootcamp
            })
            setThumbnailFile(null)
            setThumbnailPreview(null)
        } catch (err) {
            console.error('Course creation error:', err)
            toast({
                title: "Error",
                description: "Failed to create course. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleWithdraw = async () => {
        try {
            await withdraw()
            toast({
                title: "Withdrawal initiated",
                description: "Please confirm the transaction in your wallet.",
            })
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to withdraw funds. Please try again.",
                variant: "destructive",
            })
        }
    }

    if (!isConnected) {
        return (
            <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
                <Card className="w-full max-w-md glass border-primary/10">
                    <CardHeader className="text-center">
                        <Shield className="w-12 h-12 mx-auto text-primary mb-4" />
                        <CardTitle>Admin Dashboard</CardTitle>
                        <CardDescription>Please connect your wallet to access admin features</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    if (!isAdmin && !isUserLecturer) {
        return (
            <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
                <Card className="w-full max-w-md glass border-destructive/20">
                    <CardHeader className="text-center">
                        <Shield className="w-12 h-12 mx-auto text-destructive mb-4" />
                        <CardTitle className="text-destructive">Access Denied</CardTitle>
                        <CardDescription>You don't have permission to access this page. Only admins and lecturers can access this area.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight gradient-text">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        {isAdmin ? "Platform Administration & Management" : "Lecturer Course Management"}
                    </p>
                </div>
                <div className="flex gap-2">
                    {isAdmin && <Badge variant="destructive" className="px-3 py-1">Admin</Badge>}
                    {isUserLecturer && <Badge variant="secondary" className="px-3 py-1 bg-primary/20 text-primary hover:bg-primary/30">Lecturer</Badge>}
                </div>
            </div>

            <Tabs defaultValue={isAdmin ? "students" : "courses"} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Vertical Tab List */}
                    <div className="lg:col-span-1">
                        <TabsList className="flex flex-col h-auto w-full bg-transparent border border-terminal-border p-2 space-y-1">
                            {isAdmin && (
                                <>
                                    <TabsTrigger value="students" className="justify-start font-mono uppercase text-sm tracking-wider data-[state=active]:bg-terminal-green/10 data-[state=active]:text-terminal-green data-[state=active]:border-terminal-green">
                                        STUDENTS
                                    </TabsTrigger>
                                    <TabsTrigger value="lecturers" className="justify-start font-mono uppercase text-sm tracking-wider data-[state=active]:bg-terminal-green/10 data-[state=active]:text-terminal-green data-[state=active]:border-terminal-green">
                                        LECTURERS
                                    </TabsTrigger>
                                </>
                            )}
                            <TabsTrigger value="courses" className="justify-start font-mono uppercase text-sm tracking-wider data-[state=active]:bg-terminal-green/10 data-[state=active]:text-terminal-green data-[state=active]:border-terminal-green">
                                COURSES
                            </TabsTrigger>
                            <TabsTrigger value="content" className="justify-start font-mono uppercase text-sm tracking-wider data-[state=active]:bg-terminal-green/10 data-[state=active]:text-terminal-green data-[state=active]:border-terminal-green">
                                CONTENT
                            </TabsTrigger>
                            {isAdmin && (
                                <TabsTrigger
                                    value="finance"
                                    disabled
                                    className="justify-start font-mono uppercase text-sm tracking-wider opacity-60 cursor-not-allowed relative data-[state=active]:bg-terminal-green/10 data-[state=active]:text-terminal-green data-[state=active]:border-terminal-green"
                                >
                                    FINANCE
                                    <span className="ml-auto text-[9px] px-1.5 py-0.5 border border-terminal-orange text-terminal-orange">SOON</span>
                                </TabsTrigger>
                            )}
                        </TabsList>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">

                        {isAdmin && (
                            <TabsContent value="students" className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-3">
                                    {/* Admit Student Form */}
                                    <Card className="md:col-span-1 glass border-primary/10 h-fit">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <UserPlus className="h-5 w-5 text-primary" />
                                                Admit New Student
                                            </CardTitle>
                                            <CardDescription>
                                                Manually admit a student to allow them to enroll in courses.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <form onSubmit={handleAdmitStudent} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="student-address">Student Address</Label>
                                                    <Input
                                                        id="student-address"
                                                        placeholder="0x..."
                                                        value={studentForm.address}
                                                        onChange={(e) => setStudentForm(prev => ({ ...prev, address: e.target.value }))}
                                                        required
                                                        className="font-mono text-sm"
                                                    />
                                                </div>
                                                <Button type="submit" className="w-full" disabled={isPending || isConfirming}>
                                                    {isPending || isConfirming ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        "Admit Student"
                                                    )}
                                                </Button>
                                            </form>
                                        </CardContent>
                                    </Card>

                                    {/* Student List */}
                                    <Card className="md:col-span-2 glass border-primary/10">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                    <Users className="h-5 w-5 text-primary" />
                                                    Admitted Students
                                                </CardTitle>
                                                <CardDescription>
                                                    List of all students currently admitted to the platform.
                                                </CardDescription>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => studentListQuery.refetch()}>
                                                <RefreshCw className={`h-4 w-4 ${studentListQuery.isLoading ? 'animate-spin' : ''}`} />
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            {studentListQuery.isLoading ? (
                                                <div className="space-y-2">
                                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full bg-white/5" />)}
                                                </div>
                                            ) : Array.isArray(studentListQuery.data) && studentListQuery.data.length > 0 ? (
                                                <div className="rounded-md border border-white/10 overflow-hidden">
                                                    <Table>
                                                        <TableHeader className="bg-white/5">
                                                            <TableRow className="hover:bg-transparent border-white/10">
                                                                <TableHead className="text-gray-300">Address</TableHead>
                                                                <TableHead className="text-right text-gray-300">Status</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {(studentListQuery.data as string[]).map((studentAddr, index) => (
                                                                <TableRow key={index} className="hover:bg-white/5 border-white/10">
                                                                    <TableCell className="font-mono text-sm text-gray-300">
                                                                        {studentAddr}
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                                                                            Admitted
                                                                        </Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    No students found.
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        )}

                        {isAdmin && (
                            <TabsContent value="lecturers" className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-3">
                                    <Card className="md:col-span-1 glass border-primary/10 h-fit">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <GraduationCap className="h-5 w-5 text-primary" />
                                                Employ New Lecturer
                                            </CardTitle>
                                            <CardDescription>Add a new lecturer to the platform.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <form onSubmit={handleEmployLecturer} className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="lecturer-address">Lecturer Address</Label>
                                                    <Input
                                                        id="lecturer-address"
                                                        placeholder="0x..."
                                                        value={lecturerForm.address}
                                                        onChange={(e) => setLecturerForm(prev => ({ ...prev, address: e.target.value }))}
                                                        required
                                                        className="font-mono text-sm"
                                                    />
                                                </div>
                                                <Button type="submit" className="w-full" disabled={isPending || isConfirming}>
                                                    {isPending || isConfirming ? "Processing..." : "Employ Lecturer"}
                                                </Button>
                                            </form>
                                        </CardContent>
                                    </Card>

                                    <Card className="md:col-span-2 glass border-primary/10">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Users className="h-5 w-5 text-primary" />
                                                Current Lecturers
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="rounded-md border border-white/10 overflow-hidden">
                                                <Table>
                                                    <TableHeader className="bg-white/5">
                                                        <TableRow className="hover:bg-transparent border-white/10">
                                                            <TableHead className="text-gray-300">Address</TableHead>
                                                            <TableHead className="text-right text-gray-300">Role</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {Array.isArray(lecturerList) && lecturerList.length > 0 ? (
                                                            (lecturerList as string[]).map((lecturer, index) => (
                                                                <TableRow key={index} className="hover:bg-white/5 border-white/10">
                                                                    <TableCell className="font-mono text-sm text-gray-300">{lecturer}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Badge variant="secondary" className="bg-primary/20 text-primary">Lecturer</Badge>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        ) : (
                                                            <TableRow>
                                                                <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                                                                    No lecturers found
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        )}

                        {isAdmin && (
                            <TabsContent value="finance" className="space-y-6">
                                <Card className="glass border-primary/10">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Shield className="h-5 w-5 text-primary" />
                                            Platform Finance
                                        </CardTitle>
                                        <CardDescription>Manage platform funds and withdrawals.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                                <h3 className="text-sm font-medium text-gray-400 mb-2">Actions</h3>
                                                <Button
                                                    onClick={handleWithdraw}
                                                    disabled={isPending || isConfirming}
                                                    className="w-full md:w-auto"
                                                >
                                                    {isPending || isConfirming ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        "Withdraw All Funds"
                                                    )}
                                                </Button>
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Withdraws the entire contract balance to the owner's wallet.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}

                        <TabsContent value="courses" className="space-y-6">
                            <Card className="glass border-primary/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <BookPlus className="h-5 w-5 text-primary" />
                                        Create New Course
                                    </CardTitle>
                                    <CardDescription>Launch a new course on the platform.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateCourse} className="space-y-6">
                                        <div>
                                            <Label className="text-base font-medium mb-3 block">Course Thumbnail</Label>
                                            <CourseThumbnailUpload
                                                onThumbnailUploaded={handleThumbnailUploaded}
                                                courseTitle={courseForm.title}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="course-title">Course Title</Label>
                                                <Input
                                                    id="course-title"
                                                    placeholder="Introduction to Blockchain"
                                                    value={courseForm.title}
                                                    onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="course-duration">Duration (weeks)</Label>
                                                <Input
                                                    id="course-duration"
                                                    type="number"
                                                    placeholder="8"
                                                    value={courseForm.duration}
                                                    onChange={(e) => setCourseForm(prev => ({ ...prev, duration: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="course-description">Description</Label>
                                            <Textarea
                                                id="course-description"
                                                placeholder="Course description..."
                                                value={courseForm.description}
                                                onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                                                required
                                                className="min-h-[100px]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="course-level">Level</Label>
                                                <Select value={courseForm.level} onValueChange={(value) => setCourseForm(prev => ({ ...prev, level: value }))}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="course-type">Course Type</Label>
                                                <Select value={courseForm.courseType} onValueChange={(value) => setCourseForm(prev => ({ ...prev, courseType: value }))}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0">🎓 Bootcamp</SelectItem>
                                                        <SelectItem value="1">🛠️ Workshop</SelectItem>
                                                        <SelectItem value="2">💼 Seminar</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="course-capacity">Capacity (students)</Label>
                                                <Input
                                                    id="course-capacity"
                                                    type="number"
                                                    placeholder="50"
                                                    value={courseForm.capacity}
                                                    onChange={(e) => setCourseForm(prev => ({ ...prev, capacity: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="course-tags">Tags (comma-separated)</Label>
                                            <Input
                                                id="course-tags"
                                                placeholder="blockchain, cryptocurrency, web3"
                                                value={courseForm.tags}
                                                onChange={(e) => setCourseForm(prev => ({ ...prev, tags: e.target.value }))}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isPending || isConfirming || isUploadingThumbnail}
                                            className="w-full"
                                        >
                                            {isPending || isConfirming || isUploadingThumbnail ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                "Create Course"
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="content" className="space-y-6">
                            <Card className="glass border-primary/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <BookOpen className="h-5 w-5 text-primary" />
                                        Manage Course Content
                                    </CardTitle>
                                    <CardDescription>Upload and manage content for existing courses.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="course-select">Select Course</Label>
                                        <Select
                                            value={selectedCourseForContent?.toString() || ""}
                                            onValueChange={(value) => setSelectedCourseForContent(parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a course" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: Number(courseCount) || 0 }, (_, i) => i + 1).map((courseId) => (
                                                    <SelectItem key={courseId} value={courseId.toString()}>
                                                        Course {courseId}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {selectedCourseForContent && (
                                        <div className="space-y-6 pt-4 border-t border-white/10">
                                            <CourseContentUpload
                                                courseId={selectedCourseForContent}
                                                onContentUploaded={handleContentUploaded}
                                            />

                                            {contentItems.length > 0 && (
                                                <Button
                                                    onClick={() => handleUpdateCourseContent(selectedCourseForContent)}
                                                    disabled={isPending || isConfirming}
                                                    className="w-full"
                                                >
                                                    {isPending || isConfirming ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        "Update Course Content"
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </div>
            </Tabs>
        </div>
    )
}