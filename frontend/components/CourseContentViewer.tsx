"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    PlayCircle, FileText, ExternalLink, CheckCircle2, Lock,
    ChevronRight, ChevronLeft, Download, Loader2, Maximize, Minimize, Laptop, ShieldAlert
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
    thumbnail?: string
    externalUrl?: string
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
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Reset state when content changes
    useEffect(() => {
        setIsFullscreen(false)
    }, [currentIndex])

    const toggleFullscreen = () => {
        const element = document.getElementById('content-viewer-container')
        if (!element) return

        if (!document.fullscreenElement) {
            element.requestFullscreen().catch(err => {
                console.warn(`Error attempting to enable fullscreen: ${err.message}`)
            })
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

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

                            // Handle nested content array structure
                            if (metadata.content && Array.isArray(metadata.content)) {
                                metadata.content.forEach((item: any, idx: number) => {
                                    // Determine URI/URL based on type
                                    let itemUri = cid // Default fallback
                                    let externalUrl = undefined

                                    if (item.type === 'link' && item.url) {
                                        itemUri = item.url
                                        externalUrl = item.url
                                    } else if (item.type === 'document' && item.fileHash) {
                                        itemUri = item.fileHash
                                    } else if (item.type === 'video' && item.videoHash) { // Assuming videoHash for consistency
                                        itemUri = item.videoHash
                                    }

                                    items.push({
                                        id: item.id || `${cid}-${idx}`,
                                        type: item.type || 'document',
                                        title: item.title || metadata.title || `Content ${items.length + 1}`,
                                        description: item.description || metadata.description,
                                        uri: itemUri,
                                        externalUrl: externalUrl,
                                        content: item.content, // For text type
                                        completed: false,
                                        thumbnail: item.thumbnail
                                    })
                                })
                            }
                            // Handle flat metadata structure (fallback/legacy)
                            else {
                                let itemUri = cid
                                let externalUrl = undefined

                                if (metadata.type === 'link' && metadata.url) {
                                    itemUri = metadata.url
                                    externalUrl = metadata.url
                                } else if (metadata.fileHash) {
                                    itemUri = metadata.fileHash
                                }

                                items.push({
                                    id: cid,
                                    type: metadata.type || 'document',
                                    title: metadata.title || `Content ${items.length + 1}`,
                                    description: metadata.description,
                                    uri: itemUri,
                                    externalUrl: externalUrl,
                                    completed: false,
                                    thumbnail: metadata.thumbnail
                                })
                            }
                        } else {
                            // Direct file - infer type from content-type
                            let type: ContentItem['type'] = 'document'
                            if (contentType?.includes('video')) type = 'video'
                            else if (contentType?.includes('application/pdf')) type = 'document'

                            items.push({
                                id: cid,
                                type,
                                title: `Content ${items.length + 1}`,
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
                        title: `Content ${items.length + 1}`,
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
                    // Validate index
                    if (savedIndex >= 0 && savedIndex < items.length) {
                        setCurrentIndex(savedIndex)
                    }

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
    // Determine the actual URL to display
    const contentUrl = currentContent?.externalUrl
        ? currentContent.externalUrl
        : `https://gateway.pinata.cloud/ipfs/${currentContent?.uri}`



    // ... (keep existing useEffects)

    return (
        <div className="min-h-screen lg:h-[calc(100vh-200px)] flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Left Sidebar: Course Materials + Progress */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4 min-h-0">
                {/* Content List - Compact on mobile */}
                <Card className="glass-card border-white/10 flex-1 flex flex-col min-h-0 max-h-[40vh] lg:max-h-none">
                    <CardHeader className="flex-shrink-0 py-3 lg:py-4">
                        <CardTitle className="text-base lg:text-lg text-white">Course Materials</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <div className="space-y-1 h-full overflow-y-auto">
                            {contentItems.map((item, index) => (
                                <button
                                    key={item.id}
                                    onClick={() => navigateToContent(index)}
                                    className={`w-full text-left p-3 lg:p-4 hover:bg-white/5 active:bg-white/10 transition-colors border-l-4 ${index === currentIndex
                                        ? 'border-primary bg-primary/10'
                                        : 'border-transparent'
                                        }`}
                                >
                                    <div className="flex items-start gap-2 lg:gap-3">
                                        <div className="flex-shrink-0 mt-0.5 lg:mt-1">
                                            {item.completed ? (
                                                <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-green-400" />
                                            ) : item.type === 'video' ? (
                                                <PlayCircle className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                                            ) : item.type === 'link' ? (
                                                <ExternalLink className="w-4 h-4 lg:w-5 lg:h-5 text-secondary" />
                                            ) : (
                                                <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs lg:text-sm font-medium truncate ${index === currentIndex ? 'text-primary' : 'text-white'
                                                }`}>
                                                {item.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-[10px] lg:text-xs capitalize">
                                                    {item.type}
                                                </Badge>
                                                {item.duration && (
                                                    <span className="text-[10px] lg:text-xs text-gray-400">{item.duration}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Progress Bar - Compact on mobile */}
                <Card className="glass-card border-white/10 flex-shrink-0">
                    <CardContent className="p-3 lg:p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs lg:text-sm font-medium text-gray-300">Course Progress</span>
                            <span className="text-xs lg:text-sm font-bold text-primary">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5 lg:h-2" />
                        <p className="text-[10px] lg:text-xs text-gray-400 mt-1.5 lg:mt-2">
                            {contentItems.filter(i => i.completed).length} of {contentItems.length} completed
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Content Viewer Only */}
            <div className="w-full lg:w-2/3 min-h-0 flex-1">{/* Content Viewer */}
                <Card className="glass-card border-white/10" id="content-viewer-container">
                    <CardHeader className="border-b border-white/10 p-3 lg:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary" className="capitalize text-xs">
                                        {currentContent.type}
                                    </Badge>
                                    {currentContent.completed && (
                                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                            Completed
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-white text-base lg:text-xl truncate">{currentContent.title}</CardTitle>
                                {currentContent.description && (
                                    <p className="text-xs lg:text-sm text-gray-400 mt-2 line-clamp-2">{currentContent.description}</p>
                                )}
                            </div>
                            <Button variant="ghost" size="icon" onClick={toggleFullscreen} title="Toggle Fullscreen" className="flex-shrink-0 ml-2">
                                {isFullscreen ? <Minimize className="w-4 h-4 lg:w-5 lg:h-5" /> : <Maximize className="w-4 h-4 lg:w-5 lg:h-5" />}
                            </Button>
                        </div>


                    </CardHeader>

                    <CardContent className="p-0">
                        {/* Content Display Area */}
                        <div className={`relative ${isFullscreen ? 'h-screen bg-black flex items-center justify-center' : 'min-h-[300px] lg:min-h-[400px]'}`}>

                            {currentContent.type === 'video' && (
                                <div className="w-full h-full bg-black aspect-video">
                                    <video
                                        key={currentContent.uri}
                                        controls
                                        className="w-full h-full"
                                        onEnded={() => markAsCompleted(currentIndex)}
                                    >
                                        <source src={contentUrl} type="video/mp4" />
                                        <source src={contentUrl} type="video/webm" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            )}

                            {(currentContent.type === 'document' || currentContent.type === 'link') && (
                                <Tabs defaultValue="embedded" className="w-full" key={currentIndex}>
                                    <div className="flex items-center justify-between mb-3 px-3 lg:px-4 pt-3 lg:pt-4">
                                        <TabsList>
                                            <TabsTrigger value="embedded" className="flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm">
                                                <Laptop className="w-3 h-3 lg:w-4 lg:h-4" />
                                                Embedded View
                                            </TabsTrigger>
                                            <TabsTrigger value="external" className="flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm">
                                                <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4" />
                                                External Source
                                            </TabsTrigger>
                                        </TabsList>
                                    </div>

                                    <TabsContent value="embedded" className="mt-0 px-3 lg:px-4 pb-3 lg:pb-4">
                                        <div className="space-y-3">
                                            {/* Helpful notice */}
                                            <div className="flex items-start gap-2 p-2 lg:p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                                <ShieldAlert className="w-3 h-3 lg:w-4 lg:h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-[10px] lg:text-xs text-blue-300">
                                                    {currentContent.type === 'document'
                                                        ? 'Document is displayed using an enhanced viewer for maximum compatibility with all formats.'
                                                        : 'Some websites block embedding for security reasons. If content doesn\'t appear below, switch to the "External Source" tab.'
                                                    }
                                                </p>
                                            </div>

                                            {/* Responsive iframe */}
                                            <div className="w-full bg-white/5 rounded-lg overflow-hidden border border-white/10">
                                                <iframe
                                                    src={currentContent.type === 'document'
                                                        ? `https://docs.google.com/viewer?url=${encodeURIComponent(contentUrl)}&embedded=true`
                                                        : contentUrl
                                                    }
                                                    className="w-full border-0"
                                                    style={{ height: 'calc(100vh - 500px)', minHeight: '400px' }}
                                                    title={currentContent.title}
                                                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="external" className="mt-0">
                                        <div className="flex flex-col items-center justify-center h-[600px] p-8 text-center bg-white/5 rounded-lg border border-white/10">
                                            <ExternalLink className="w-16 h-16 text-gray-400 mb-4" />
                                            <h3 className="text-xl font-bold text-white mb-2">External Content</h3>
                                            <p className="text-gray-400 mb-6 max-w-md">
                                                This content is hosted externally. Choose how you'd like to view it:
                                            </p>
                                            <div className="flex flex-col gap-3 w-full max-w-sm">
                                                <Button
                                                    onClick={() => {
                                                        const width = 1200;
                                                        const height = 800;
                                                        const left = (window.screen.width - width) / 2;
                                                        const top = (window.screen.height - height) / 2;
                                                        window.open(
                                                            contentUrl,
                                                            currentContent.title,
                                                            `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=yes,resizable=yes,scrollbars=yes`
                                                        );
                                                    }}
                                                    size="lg"
                                                    className="w-full"
                                                >
                                                    <Laptop className="w-5 h-5 mr-2" />
                                                    Open in Popup Window
                                                </Button>

                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="lg"
                                                    className="w-full"
                                                >
                                                    <a href={contentUrl} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="w-5 h-5 mr-2" />
                                                        Open in New Tab
                                                    </a>
                                                </Button>

                                                {currentContent.type === 'document' && (
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="lg"
                                                        className="w-full"
                                                    >
                                                        <a href={contentUrl} download>
                                                            <Download className="w-5 h-5 mr-2" />
                                                            Download File
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="mt-6 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 max-w-md">
                                                <p className="text-xs text-gray-400">
                                                    <strong className="text-gray-300">Tip:</strong> The popup window keeps you within the app
                                                    while giving you full access to interact with the content.
                                                </p>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            )}

                            {currentContent.type === 'text' && (
                                <div className="p-8 prose prose-invert prose-lg max-w-none">
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: currentContent.description || currentContent.content || 'No content available'
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between p-6 border-t border-white/10 bg-black/20">
                            <Button
                                variant="outline"
                                onClick={() => navigateToContent(currentIndex - 1)}
                                disabled={currentIndex === 0}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Previous
                            </Button>

                            {!currentContent.completed && (
                                <Button onClick={() => markAsCompleted(currentIndex)} className="bg-green-600 hover:bg-green-700">
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
    )
}
