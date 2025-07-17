"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import useCeloreanContract from "@/hooks/useCeloreanContract"
import { CourseThumbnailUpload } from "@/components/course-thumbnail-upload"
import { Users, GraduationCap, BookPlus, Shield } from "lucide-react"
// Add this import for setCourseMetadata

export default function AdminPage() {
    const { address, isConnected } = useAccount()
    const {
        owner,
        lecturerList,
        employLecturer,
        admitStudent,
        createCourse,
        isLecturer,
        isPending,
        isConfirming,
        isConfirmed,
        error,
        courseCount // Add courseCount from the hook
    } = useCeloreanContract()

    // ✅ Call hook at top level with fallback for undefined address
    const lecturerCheck = isLecturer(address || "0x0000000000000000000000000000000000000000")

    const [isAdmin, setIsAdmin] = useState(false)
    const [isUserLecturer, setIsUserLecturer] = useState(false)
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
    const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)

    // Form states
    const [lecturerForm, setLecturerForm] = useState({ address: "", value: "" })
    const [studentForm, setStudentForm] = useState({ address: "", value: "" })
    const [courseForm, setCourseForm] = useState({
        title: "",
        duration: "",
        description: "",
        price: "",
        tags: "",
        level: "Beginner"
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

    if (!isConnected) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Please connect your wallet to access admin features</p>
                </div>
            </div>
        )
    }

    if (!isAdmin && !isUserLecturer) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
                    <p className="text-muted-foreground">You don't have permission to access this page. Only admins and lecturers can access this area.</p>
                </div>
            </div>
        )
    }

    const handleEmployLecturer = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await employLecturer(lecturerForm.address, parseInt(lecturerForm.value))
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
            await admitStudent(studentForm.address, parseInt(studentForm.value))
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

    // In the handleCreateCourse function, after successful course creation:
    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            let thumbnailCid: string | null = null
            let metadataCid: string | null = null

            // Upload thumbnail to IPFS if provided
            if (thumbnailFile && courseForm.title) {
                thumbnailCid = await uploadThumbnailToIPFS(thumbnailFile, courseForm.title)
                if (!thumbnailCid) {
                    throw new Error('Failed to upload thumbnail')
                }
            }

            // Upload course metadata to IPFS
            metadataCid = await uploadCourseMetadata(courseForm, thumbnailCid)
            if (!metadataCid) {
                throw new Error('Failed to upload course metadata')
            }

            const tags = courseForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)

            // Create course on blockchain with metadataUri
            const metadataUri = `https://gateway.pinata.cloud/ipfs/${metadataCid}`
            await createCourse(
                courseForm.title,
                parseInt(courseForm.duration),
                courseForm.description,
                parseInt(courseForm.price),
                tags,
                courseForm.level,
                metadataUri // Pass the metadata URI to the smart contract
            )

            toast({
                title: "Course creation initiated",
                description: "Please confirm the transaction in your wallet.",
            })

            // Reset form
            setCourseForm({
                title: "",
                duration: "",
                description: "",
                price: "",
                tags: "",
                level: "Beginner"
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        {isAdmin ? "Platform Administration" : "Lecturer Panel"}
                    </p>
                </div>
                <div className="flex gap-2">
                    {isAdmin && <Badge variant="destructive">Admin</Badge>}
                    {isUserLecturer && <Badge variant="secondary">Lecturer</Badge>}
                </div>
            </div>

            <Tabs defaultValue={isAdmin ? "lecturers" : "courses"} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    {isAdmin && (
                        <>
                            <TabsTrigger value="lecturers">Manage Lecturers</TabsTrigger>
                            <TabsTrigger value="students">Manage Students</TabsTrigger>
                        </>
                    )}
                    <TabsTrigger value="courses">Create Course</TabsTrigger>
                </TabsList>

                {isAdmin && (
                    <TabsContent value="lecturers" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Employ New Lecturer
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleEmployLecturer} className="space-y-4">
                                    <div>
                                        <Label htmlFor="lecturer-address">Lecturer Address</Label>
                                        <Input
                                            id="lecturer-address"
                                            placeholder="0x..."
                                            value={lecturerForm.address}
                                            onChange={(e) => setLecturerForm(prev => ({ ...prev, address: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="lecturer-value">Initial Value</Label>
                                        <Input
                                            id="lecturer-value"
                                            type="number"
                                            placeholder="100"
                                            value={lecturerForm.value}
                                            onChange={(e) => setLecturerForm(prev => ({ ...prev, value: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" disabled={isPending || isConfirming}>
                                        {isPending || isConfirming ? "Processing..." : "Employ Lecturer"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Current Lecturers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {Array.isArray(lecturerList) && lecturerList.length > 0 ? (
                                        lecturerList.map((lecturer: string, index: number) => (
                                            <div key={index} className="flex items-center justify-between p-3 border rounded">
                                                <span className="font-mono text-sm">{lecturer}</span>
                                                <Badge variant="outline">Lecturer</Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground">No lecturers found</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {isAdmin && (
                    <TabsContent value="students" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Admit New Student
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAdmitStudent} className="space-y-4">
                                    <div>
                                        <Label htmlFor="student-address">Student Address</Label>
                                        <Input
                                            id="student-address"
                                            placeholder="0x..."
                                            value={studentForm.address}
                                            onChange={(e) => setStudentForm(prev => ({ ...prev, address: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="student-value">Initial Value</Label>
                                        <Input
                                            id="student-value"
                                            type="number"
                                            placeholder="50"
                                            value={studentForm.value}
                                            onChange={(e) => setStudentForm(prev => ({ ...prev, value: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" disabled={isPending || isConfirming}>
                                        {isPending || isConfirming ? "Processing..." : "Admit Student"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                <TabsContent value="courses" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookPlus className="h-5 w-5" />
                                Create New Course
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateCourse} className="space-y-6">
                                {/* Course Thumbnail Upload */}
                                <div>
                                    <Label className="text-base font-medium mb-3 block">Course Thumbnail</Label>
                                    <CourseThumbnailUpload
                                        onThumbnailUploaded={handleThumbnailUploaded}
                                        courseTitle={courseForm.title}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="course-title">Course Title</Label>
                                        <Input
                                            id="course-title"
                                            placeholder="Introduction to Blockchain"
                                            value={courseForm.title}
                                            onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
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

                                <div>
                                    <Label htmlFor="course-description">Description</Label>
                                    <Textarea
                                        id="course-description"
                                        placeholder="Course description..."
                                        value={courseForm.description}
                                        onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="course-price">Price (wei)</Label>
                                        <Input
                                            id="course-price"
                                            type="number"
                                            placeholder="0"
                                            value={courseForm.price}
                                            onChange={(e) => setCourseForm(prev => ({ ...prev, price: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div>
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
                                </div>

                                <div>
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
                                    {isPending || isConfirming || isUploadingThumbnail ? "Processing..." : "Create Course"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}