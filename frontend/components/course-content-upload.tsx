"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { Upload, FileText, Video, Link, Trash2, Plus, CheckCircle, AlertCircle, Clock, FolderOpen, ExternalLink } from "lucide-react"

interface ContentItem {
    id: string
    type: 'video' | 'document' | 'link' | 'text'
    title: string
    description?: string
    url?: string
    file?: File
    content?: string
    uploadStatus?: 'pending' | 'uploading' | 'completed' | 'error'
    uploadProgress?: number
    thumbnail?: string
    ipfsUrl?: string
    courseId?: number // Add courseId field
}

interface CourseContentUploadProps {
    courseId?: number
    onContentUploaded: (content: ContentItem[]) => void
    existingContent?: ContentItem[]
}

export function CourseContentUpload({
    courseId,
    onContentUploaded,
    existingContent = []
}: CourseContentUploadProps) {
    const [contentItems, setContentItems] = useState<ContentItem[]>(existingContent)
    const [isUploading, setIsUploading] = useState(false)
    const [newItem, setNewItem] = useState<Partial<ContentItem>>({
        type: 'video',
        title: '',
        description: ''
    })
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [bulkFiles, setBulkFiles] = useState<File[]>([])
    const [bulkUploadType, setBulkUploadType] = useState<'video' | 'document'>('video')

    const generateThumbnail = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onload = (e) => resolve(e.target?.result as string)
                reader.readAsDataURL(file)
            } else if (file.type.startsWith('video/')) {
                const video = document.createElement('video')
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')

                video.onloadedmetadata = () => {
                    canvas.width = 160
                    canvas.height = 90
                    video.currentTime = 1
                }

                video.onseeked = () => {
                    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
                    resolve(canvas.toDataURL())
                }

                video.src = URL.createObjectURL(file)
            } else {
                resolve('/api/placeholder/160/90')
            }
        })
    }

    const updateItemProgress = (id: string, progress: number, status: ContentItem['uploadStatus']) => {
        setContentItems(prev => prev.map(item =>
            item.id === id
                ? { ...item, uploadProgress: progress, uploadStatus: status }
                : item
        ))
    }

    const uploadSingleItem = async (item: ContentItem): Promise<string | null> => {
        if (!item.file) return null

        try {
            updateItemProgress(item.id, 0, 'uploading')

            const formData = new FormData()
            formData.append('file', item.file)
            formData.append('title', item.title)
            formData.append('description', item.description || '')
            formData.append('type', item.type)
            if (courseId) {
                formData.append('courseId', courseId.toString()) // Add courseId
            }

            const xhr = new XMLHttpRequest()

            return new Promise((resolve, reject) => {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100)
                        updateItemProgress(item.id, percentComplete, 'uploading')
                    }
                })

                xhr.addEventListener('load', async () => {
                    if (xhr.status === 200) {
                        try {
                            const data = JSON.parse(xhr.responseText)
                            const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${data.cid}`

                            updateItemProgress(item.id, 100, 'completed')

                            setContentItems(prev => prev.map(prevItem =>
                                prevItem.id === item.id
                                    ? { ...prevItem, ipfsUrl, courseId } // Add courseId to item
                                    : prevItem
                            ))

                            resolve(ipfsUrl)
                        } catch (error) {
                            updateItemProgress(item.id, 0, 'error')
                            reject(new Error('Failed to parse response'))
                        }
                    } else {
                        updateItemProgress(item.id, 0, 'error')
                        reject(new Error(`Upload failed with status ${xhr.status}`))
                    }
                })

                xhr.addEventListener('error', () => {
                    updateItemProgress(item.id, 0, 'error')
                    reject(new Error('Network error during upload'))
                })

                xhr.addEventListener('abort', () => {
                    updateItemProgress(item.id, 0, 'error')
                    reject(new Error('Upload was aborted'))
                })

                xhr.open('POST', '/api/pinCourseContent')
                xhr.send(formData)
            })
        } catch (error) {
            console.error('Error uploading content:', error)
            updateItemProgress(item.id, 0, 'error')
            return null
        }
    }

    const addContentItem = async () => {
        if (!newItem.title) {
            toast({
                title: "Error",
                description: "Please provide a title for the content",
                variant: "destructive"
            })
            return
        }

        let thumbnail = ''
        if (newItem.file) {
            thumbnail = await generateThumbnail(newItem.file)
        }

        const item: ContentItem = {
            id: Date.now().toString(),
            type: newItem.type as ContentItem['type'],
            title: newItem.title,
            description: newItem.description,
            url: newItem.url,
            file: newItem.file,
            content: newItem.content,
            uploadStatus: newItem.file ? 'pending' : 'completed',
            uploadProgress: 0,
            thumbnail
        }

        const updatedContent = [...contentItems, item]
        setContentItems(updatedContent)
        onContentUploaded(updatedContent)

        if (newItem.file) {
            await uploadSingleItem(item)
        }

        setNewItem({
            type: 'video',
            title: '',
            description: ''
        })
        setPreviewUrl(null)
    }

    const removeContentItem = (id: string) => {
        const updatedContent = contentItems.filter(item => item.id !== id)
        setContentItems(updatedContent)
        onContentUploaded(updatedContent)
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setNewItem(prev => ({ ...prev, file }))

            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                const preview = await generateThumbnail(file)
                setPreviewUrl(preview)
            }
        }
    }

    const retryUpload = async (item: ContentItem) => {
        if (item.file) {
            await uploadSingleItem(item)
        }
    }

    const handleBulkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        setBulkFiles(files)
    }

    const addBulkContentItems = async () => {
        if (bulkFiles.length === 0) {
            toast({
                title: "Error",
                description: "Please select files to upload",
                variant: "destructive"
            })
            return
        }

        const newItems: ContentItem[] = []

        for (const file of bulkFiles) {
            const thumbnail = await generateThumbnail(file)
            const item: ContentItem = {
                id: `${Date.now()}-${Math.random()}`,
                type: bulkUploadType,
                title: file.name.replace(/\.[^/.]+$/, ""),
                description: `Uploaded ${bulkUploadType}`,
                file,
                uploadStatus: 'pending',
                uploadProgress: 0,
                thumbnail
            }
            newItems.push(item)
        }

        const updatedContent = [...contentItems, ...newItems]
        setContentItems(updatedContent)
        onContentUploaded(updatedContent)

        setBulkFiles([])

        toast({
            title: "Success",
            description: `Added ${newItems.length} items for upload`,
        })
    }

    const uploadAllPending = async () => {
        setIsUploading(true)
        const pendingItems = contentItems.filter(item => item.uploadStatus === 'pending' || item.uploadStatus === 'error')

        const concurrencyLimit = 3

        for (let i = 0; i < pendingItems.length; i += concurrencyLimit) {
            const batch = pendingItems.slice(i, i + concurrencyLimit)
            const batchPromises = batch.map(async (item) => {
                if (item.file) {
                    try {
                        await uploadSingleItem(item)
                        toast({
                            title: "Success",
                            description: `${item.title} uploaded successfully`,
                        })
                    } catch (error) {
                        toast({
                            title: "Error",
                            description: `Failed to upload ${item.title}`,
                            variant: "destructive"
                        })
                    }
                }
            })

            await Promise.all(batchPromises)
        }

        setIsUploading(false)
    }

    const getStatusIcon = (status?: ContentItem['uploadStatus']) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'uploading':
                return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
            case 'error':
                return <AlertCircle className="h-4 w-4 text-red-500" />
            default:
                return <Clock className="h-4 w-4 text-gray-400" />
        }
    }

    const getTypeIcon = (type: ContentItem['type']) => {
        switch (type) {
            case 'video':
                return <Video className="h-4 w-4 text-purple-500" />
            case 'document':
                return <FileText className="h-4 w-4 text-blue-500" />
            case 'link':
                return <ExternalLink className="h-4 w-4 text-green-500" />
            case 'text':
                return <FileText className="h-4 w-4 text-orange-500" />
            default:
                return <FileText className="h-4 w-4 text-gray-500" />
        }
    }

    const pendingUploads = contentItems.filter(item => item.uploadStatus === 'pending' || item.uploadStatus === 'error').length
    const completedUploads = contentItems.filter(item => item.uploadStatus === 'completed').length

    return (
        <div className="w-full max-w-4xl mx-auto">
            <Card className="shadow-lg border-border bg-card">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <Upload className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">Course Content Management</h2>
                                <p className="text-sm text-muted-foreground mt-1">Upload and manage your course materials</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-card border-primary/30 text-primary px-3 py-1">
                            {completedUploads}/{contentItems.length} Uploaded
                        </Badge>
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-8">
                    {/* Bulk Upload Section */}
                    <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 bg-gradient-to-br from-primary/5 to-secondary/5 hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <FolderOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Bulk Upload Files</h3>
                                <p className="text-sm text-muted-foreground">Upload multiple files at once</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="bulk-type" className="text-sm font-medium text-foreground">Content Type for All Files</Label>
                                <Select
                                    value={bulkUploadType}
                                    onValueChange={(value) => setBulkUploadType(value as 'video' | 'document')}
                                >
                                    <SelectTrigger className="bg-background border-border hover:border-primary/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="video">📹 Video</SelectItem>
                                        <SelectItem value="document">📄 Document</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bulk-files" className="text-sm font-medium text-foreground">Select Multiple Files</Label>
                                <Input
                                    id="bulk-files"
                                    type="file"
                                    multiple
                                    accept={bulkUploadType === 'video' ? 'video/*' : '.pdf,.doc,.docx,.ppt,.pptx'}
                                    onChange={handleBulkFileChange}
                                    className="bg-background border-border hover:border-primary/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                                />
                            </div>
                        </div>

                        {bulkFiles.length > 0 && (
                            <div className="mt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium text-foreground">Selected Files ({bulkFiles.length})</Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setBulkFiles([])}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        Clear
                                    </Button>
                                </div>
                                <div className="max-h-40 overflow-y-auto space-y-2 bg-background rounded-lg border border-border p-3">
                                    {bulkFiles.map((file, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors">
                                            <div className="p-1.5 bg-background rounded border border-border">
                                                {bulkUploadType === 'video' ?
                                                    <Video className="h-4 w-4 text-primary" /> :
                                                    <FileText className="h-4 w-4 text-secondary" />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                                                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Button onClick={addBulkContentItems} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add {bulkFiles.length} Items to Upload Queue
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Single Item Upload Section */}
                    <div className="border border-border rounded-xl p-6 bg-card shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-secondary/20 rounded-lg">
                                <Plus className="h-5 w-5 text-secondary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Add Single Content Item</h3>
                                <p className="text-sm text-muted-foreground">Add individual content with custom details</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="content-type" className="text-sm font-medium text-foreground">Content Type</Label>
                                    <Select
                                        value={newItem.type}
                                        onValueChange={(value) => setNewItem(prev => ({ ...prev, type: value as ContentItem['type'] }))}
                                    >
                                        <SelectTrigger className="bg-background border-border hover:border-primary/50">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="video">📹 Video</SelectItem>
                                            <SelectItem value="document">📄 Document</SelectItem>
                                            <SelectItem value="link">🔗 External Link</SelectItem>
                                            <SelectItem value="text">📝 Text Content</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content-title" className="text-sm font-medium text-foreground">Title</Label>
                                    <Input
                                        id="content-title"
                                        placeholder="Content title"
                                        value={newItem.title}
                                        onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                                        className="bg-background border-border hover:border-primary/50 focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content-description" className="text-sm font-medium text-foreground">Description (Optional)</Label>
                                <Textarea
                                    id="content-description"
                                    placeholder="Brief description of the content"
                                    value={newItem.description}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                                    className="bg-background border-border hover:border-primary/50 focus:border-primary min-h-[80px]"
                                />
                            </div>

                            {(newItem.type === 'video' || newItem.type === 'document') && (
                                <div className="space-y-4">
                                    <Label htmlFor="content-file" className="text-sm font-medium text-foreground">Upload File</Label>
                                    <Input
                                        id="content-file"
                                        type="file"
                                        accept={newItem.type === 'video' ? 'video/*' : '.pdf,.doc,.docx,.ppt,.pptx'}
                                        onChange={handleFileChange}
                                        className="bg-background border-border hover:border-primary/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-secondary/20 file:text-secondary hover:file:bg-secondary/30"
                                    />

                                    {previewUrl && (
                                        <div className="mt-4">
                                            <Label className="text-sm font-medium text-foreground">Preview</Label>
                                            <div className="mt-2 border border-border rounded-lg p-3 bg-muted/50 w-fit">
                                                <img
                                                    src={previewUrl}
                                                    alt="File preview"
                                                    className="w-40 h-24 object-cover rounded border border-border"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {newItem.type === 'link' && (
                                <div className="space-y-2">
                                    <Label htmlFor="content-url" className="text-sm font-medium text-foreground">URL</Label>
                                    <Input
                                        id="content-url"
                                        type="url"
                                        placeholder="https://example.com"
                                        value={newItem.url}
                                        onChange={(e) => setNewItem(prev => ({ ...prev, url: e.target.value }))}
                                        className="bg-background border-border hover:border-primary/50 focus:border-primary"
                                    />
                                </div>
                            )}

                            {newItem.type === 'text' && (
                                <div className="space-y-2">
                                    <Label htmlFor="content-text" className="text-sm font-medium text-foreground">Text Content</Label>
                                    <Textarea
                                        id="content-text"
                                        placeholder="Enter your text content here"
                                        value={newItem.content}
                                        onChange={(e) => setNewItem(prev => ({ ...prev, content: e.target.value }))}
                                        rows={6}
                                        className="bg-background border-border hover:border-primary/50 focus:border-primary"
                                    />
                                </div>
                            )}

                            <Button onClick={addContentItem} className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-3" disabled={isUploading}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Content Item
                            </Button>
                        </div>
                    </div>

                    {/* Upload All Pending Button */}
                    {pendingUploads > 0 && (
                        <div className="flex justify-center">
                            <Button
                                onClick={uploadAllPending}
                                disabled={isUploading}
                                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all glow-border"
                                size="lg"
                            >
                                {isUploading ? (
                                    <>
                                        <Clock className="h-5 w-5 mr-3 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-5 w-5 mr-3" />
                                        Upload All Pending ({pendingUploads})
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Content Items List */}
                    {contentItems.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground">Course Content</h3>
                                    <p className="text-sm text-muted-foreground">{contentItems.length} items total</p>
                                </div>
                                {contentItems.length > 1 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setContentItems([])
                                            onContentUploaded([])
                                        }}
                                        className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Clear All
                                    </Button>
                                )}
                            </div>

                            <div className="grid gap-4">
                                {contentItems.map((item) => (
                                    <div key={item.id} className="border border-border rounded-xl p-5 bg-card shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-start gap-4">
                                            {/* Thumbnail */}
                                            {item.thumbnail && (
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={item.thumbnail}
                                                        alt={item.title}
                                                        className="w-20 h-16 object-cover rounded-lg border-2 border-border"
                                                    />
                                                </div>
                                            )}

                                            {/* Content Info */}
                                            <div className="flex-1 min-w-0 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {getTypeIcon(item.type)}
                                                        <div>
                                                            <h4 className="font-semibold text-foreground truncate">{item.title}</h4>
                                                            {item.description && (
                                                                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 ml-4">
                                                        {getStatusIcon(item.uploadStatus)}
                                                        <Badge
                                                            variant="outline"
                                                            className={`
                                ${item.type === 'video' ? 'border-primary/50 text-primary bg-primary/10' : ''}
                                ${item.type === 'document' ? 'border-secondary/50 text-secondary bg-secondary/10' : ''}
                                ${item.type === 'link' ? 'border-accent/50 text-accent bg-accent/10' : ''}
                                ${item.type === 'text' ? 'border-muted-foreground/50 text-muted-foreground bg-muted/20' : ''}
                              `}
                                                        >
                                                            {item.type}
                                                        </Badge>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeContentItem(item.id)}
                                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                {item.uploadStatus && ['pending', 'uploading'].includes(item.uploadStatus) && (
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="capitalize font-medium text-muted-foreground">{item.uploadStatus}</span>
                                                            <span className="font-medium text-foreground">{item.uploadProgress || 0}%</span>
                                                        </div>
                                                        <Progress
                                                            value={item.uploadProgress || 0}
                                                            className="h-2 bg-muted"
                                                        />
                                                    </div>
                                                )}

                                                {/* Status Messages */}
                                                {item.uploadStatus === 'completed' && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-1 rounded-lg border border-primary/20">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Upload completed
                                                        </div>
                                                        {item.ipfsUrl && (
                                                            <a
                                                                href={item.ipfsUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-secondary hover:text-secondary/80 hover:underline bg-secondary/10 px-2 py-1 rounded-lg border border-secondary/20 transition-colors"
                                                            >
                                                                View on IPFS
                                                            </a>
                                                        )}
                                                    </div>
                                                )}

                                                {item.uploadStatus === 'error' && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <div className="flex items-center gap-1 text-destructive bg-destructive/10 px-2 py-1 rounded-lg border border-destructive/20">
                                                            <AlertCircle className="h-3 w-3" />
                                                            Upload failed
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => retryUpload(item)}
                                                            className="text-secondary hover:text-secondary/80 hover:bg-secondary/10 px-2 py-1 h-auto"
                                                        >
                                                            Retry
                                                        </Button>
                                                    </div>
                                                )}

                                                {item.uploadStatus === 'pending' && (
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/20 px-2 py-1 rounded-lg border border-muted/30 w-fit">
                                                        <Clock className="h-3 w-3" />
                                                        Waiting for upload
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}