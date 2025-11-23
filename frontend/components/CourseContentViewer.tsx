"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    PlayCircle, FileText, ExternalLink, CheckCircle2, Lock,
    ChevronRight, ChevronLeft, Download, Loader2
} from "lucide-react"
import { toast } from "sonner"

interface ContentItem {
    id: string
    type: 'video' | 'document' | 'link' | 'text'
    title: string
    description?: string
    uri: string // IPFS CID or full URL
    duration?: string
    completed?: boolean
    content?: string // For text content
}

interface CourseContentViewerProps {
    courseId: number
    contentUris: string[] // IPFS CIDs from blockchain
    isEnrolled: boolean
    isInstructor: boolean
}

export function CourseContentViewer({
    courseId,
    contentUris,
    isEnrolled,
    isInstructor
}: CourseContentViewerProps) {
    const [contentItems, setContentItems] = useState<ContentItem[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [progress, setProgress] = useState(0)

    // Parse IPFS URIs and fetch metadata
    useEffect(() => {
        const fetchContentMetadata = async () => {
            if (!contentUris || contentUris.length === 0) {
                setLoading(false)
                return
            }

            setLoading(true)
            const items: ContentItem[] = []

            for (let i = 0; i < contentUris.length; i++) {
                const cid = contentUris[i]

                try {
                    // Fetch metadata from IPFS
                    const metadataUrl = `https://gateway.pinata.cloud/ipfs/${cid}`
                    const response = await fetch(metadataUrl)

                    if (response.ok) {
                        const contentType = response.headers.get('content-type')

                        // Try to parse as JSON metadata
                        if (contentType?.includes('application/json')) {
                            const metadata = await response.json()
                            items.push({
                                id: cid,
                                type: metadata.type || 'document',
                                title: metadata.title || `Content ${i + 1}`,
                                description: metadata.description,
                                uri: cid,
                                completed: false
                            })
                        } else {
                            // Direct file - infer type from content-type
                            let type: ContentItem['type'] = 'document'
                            if (contentType?.includes('video')) type = 'video'
                            else if (contentType?.includes('application/pdf')) type = 'document'

                            items.push({
                                id: cid,
                                type,
                                title: `Content ${i + 1}`,
                                uri: cid,
                                completed: false
                            })
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to fetch metadata for ${cid}:`, error)
                    // Add as generic content item
                    items.push({
                        id: cid,
                        type: 'document',
                        title: `Content ${i + 1}`,
                        uri: cid,
                        completed: false
                    })
                }
            }

            setContentItems(items)

            // Load progress from localStorage
            const savedProgress = localStorage.getItem(`course_${courseId}_progress`)
            if (savedProgress) {
                try {
                    const { currentIndex: savedIndex, completed } = JSON.parse(savedProgress)
                    setCurrentIndex(savedIndex || 0)

                    // Mark completed items
                    setContentItems(prev => prev.map((item, idx) => ({
                        ...item,
                        completed: completed?.includes(idx) || false
                    })))
                } catch (e) {
                    console.warn('Failed to load progress:', e)
                }
            }

            setLoading(false)
        }

        fetchContentMetadata()
    }, [contentUris, courseId])

    // Calculate overall progress
    useEffect(() => {
        if (contentItems.length === 0) return
        const completedCount = contentItems.filter(item => item.completed).length
        setProgress((completedCount / contentItems.length) * 100)
    }, [contentItems])

    // Mark current item as completed
    const markAsCompleted = (index: number) => {
        setContentItems(prev => {
            const updated = [...prev]
            updated[index] = { ...updated[index], completed: true }

            // Save to localStorage
            const completedIndices = updated
                .map((item, idx) => item.completed ? idx : -1)
                .filter(idx => idx !== -1)

            localStorage.setItem(`course_${courseId}_progress`, JSON.stringify({
                currentIndex: index,
                completed: completedIndices
            }))

            return updated
        })

        toast.success("Content marked as completed!")
    }

    const navigateToContent = (index: number) => {
        if (index >= 0 && index < contentItems.length) {
            setCurrentIndex(index)

            // Save current position
            localStorage.setItem(`course_${courseId}_progress`, JSON.stringify({
                currentIndex: index,
                completed: contentItems
                    .map((item, idx) => item.completed ? idx : -1)
                    .filter(idx => idx !== -1)
            }))
        }
    }

    // Check if user can view content
    const canViewContent = isEnrolled || isInstructor

    if (!canViewContent) {
        return (
            <Card className="glass-card border-white/10">
                <CardContent className="p-12 text-center">
                    <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Content Locked</h3>
                    <p className="text-gray-400 mb-6">
                        Enroll in this course to access exclusive learning materials
                    </p>
                </CardContent>
            </Card>
        )
    }

    if (loading) {
        return (
            <Card className="glass-card border-white/10">
                <CardContent className="p-12 text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading course content...</p>
                </CardContent>
            </Card>
        )
    }

    if (contentItems.length === 0) {
        return (
            <Card className="glass-card border-white/10">
                <CardContent className="p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">No Content Available</h3>
                    <p className="text-gray-400">
                        {isInstructor
                            ? "Upload course materials to get started"
                            : "The instructor hasn't uploaded any content yet"}
                    </p>
                </CardContent>
            </Card>
        )
    }

    const currentContent = contentItems[currentIndex]
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${currentContent.uri}`

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <Card className="glass-card border-white/10">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300">Course Progress</span>
                        <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-gray-400 mt-2">
                        {contentItems.filter(i => i.completed).length} of {contentItems.length} completed
                    </p>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Content List Sidebar */}
                <Card className="glass-card border-white/10 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg text-white">Course Materials</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="space-y-1 max-h-[600px] overflow-y-auto">
                            {contentItems.map((item, index) => (
                                <button
                                    key={item.id}
                                    onClick={() => navigateToContent(index)}
                                    className={`w-full text-left p-4 hover:bg-white/5 transition-colors border-l-4 ${index === currentIndex
                                        ? 'border-primary bg-primary/10'
                                        : 'border-transparent'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {item.completed ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                            ) : item.type === 'video' ? (
                                                <PlayCircle className="w-5 h-5 text-primary" />
                                            ) : item.type === 'link' ? (
                                                <ExternalLink className="w-5 h-5 text-secondary" />
                                            ) : (
                                                <FileText className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${index === currentIndex ? 'text-primary' : 'text-white'
                                                }`}>
                                                {item.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {item.type}
                                                </Badge>
                                                {item.duration && (
                                                    <span className="text-xs text-gray-400">{item.duration}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Content Viewer */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="glass-card border-white/10">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-white">{currentContent.title}</CardTitle>
                                    {currentContent.description && (
                                        <p className="text-sm text-gray-400 mt-1">{currentContent.description}</p>
                                    )}
                                </div>
                                <Badge variant={currentContent.completed ? "default" : "outline"} className={
                                    currentContent.completed ? "bg-green-500/20 text-green-400 border-green-500/30" : ""
                                }>
                                    {currentContent.completed ? "Completed" : "In Progress"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Content Display */}
                            {currentContent.type === 'video' && (
                                <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                                    <video
                                        key={currentContent.uri}
                                        controls
                                        className="w-full h-full"
                                        onEnded={() => markAsCompleted(currentIndex)}
                                    >
                                        <source src={ipfsUrl} type="video/mp4" />
                                        <source src={ipfsUrl} type="video/webm" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            )}

                            {currentContent.type === 'document' && (
                                <div className="space-y-4">
                                    {/* Embedded PDF/Document Viewer */}
                                    <div className="relative rounded-lg overflow-hidden bg-white min-h-[600px]">
                                        <iframe
                                            src={`${ipfsUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                                            className="w-full h-[600px] border-0"
                                            title={currentContent.title}
                                            onError={(e) => {
                                                // Fallback if iframe fails
                                                console.warn('Iframe failed to load, showing fallback')
                                            }}
                                        />
                                    </div>

                                    {/* Action Buttons for Document */}
                                    <div className="flex gap-3 justify-center pt-4 border-t border-white/10">
                                        <Button asChild variant="outline" size="sm">
                                            <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                Open in New Tab
                                            </a>
                                        </Button>
                                        <Button asChild size="sm">
                                            <a href={ipfsUrl} download>
                                                <Download className="w-4 h-4 mr-2" />
                                                Download
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {currentContent.type === 'link' && (
                                <div className="space-y-4">
                                    {/* Try to embed the link in iframe first */}
                                    <div className="relative rounded-lg overflow-hidden bg-white border border-white/10">
                                        <iframe
                                            src={ipfsUrl}
                                            className="w-full h-[600px] border-0"
                                            title={currentContent.title}
                                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                            onError={(e) => {
                                                console.warn('Iframe blocked, showing fallback')
                                            }}
                                        />
                                    </div>

                                    {/* Fallback button */}
                                    <div className="text-center pt-4 border-t border-white/10">
                                        <p className="text-sm text-gray-400 mb-3">
                                            If content doesn't load above, open in a new tab:
                                        </p>
                                        <Button asChild>
                                            <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                Open External Link
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {currentContent.type === 'text' && (
                                <Card className="glass-card border-white/10">
                                    <CardContent className="p-8">
                                        <div className="prose prose-invert prose-lg max-w-none">
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: currentContent.description || currentContent.content || 'No content available'
                                                }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                <Button
                                    variant="outline"
                                    onClick={() => navigateToContent(currentIndex - 1)}
                                    disabled={currentIndex === 0}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    Previous
                                </Button>

                                {!currentContent.completed && (
                                    <Button onClick={() => markAsCompleted(currentIndex)}>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Mark as Complete
                                    </Button>
                                )}

                                <Button
                                    onClick={() => navigateToContent(currentIndex + 1)}
                                    disabled={currentIndex === contentItems.length - 1}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
