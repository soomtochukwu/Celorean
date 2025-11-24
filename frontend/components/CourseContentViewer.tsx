"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    PlayCircle, FileText, ExternalLink, CheckCircle2, Lock,
    ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Download, Loader2, Maximize, Minimize, Laptop, ShieldAlert
} from "lucide-react"
import { toast } from "sonner"

import { useAccount } from "wagmi"
import { useCeloreanContract } from "@/hooks/useCeloreanContract"
import { ReactTinyLink } from 'react-tiny-link'

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
    const { address } = useAccount()
    const { markContentComplete, getCompletedContents } = useCeloreanContract()
    const [contentItems, setContentItems] = useState<ContentItem[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [progress, setProgress] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [contentLoading, setContentLoading] = useState(false)
    const [showDescription, setShowDescription] = useState(false)
    const [activeTab, setActiveTab] = useState<'embedded' | 'external'>('embedded')
    const [iframeError, setIframeError] = useState(false)

    // Reset state when content changes
    useEffect(() => {
        setIsFullscreen(false)
        setContentLoading(true)
        setActiveTab('embedded')
        setIframeError(false)

        // Text content loads instantly
        if (contentItems[currentIndex]?.type === 'text') {
            setContentLoading(false)
        }
    }, [currentIndex, contentItems])

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

    // Fetch completion status from smart contract
    const { data: completedStatus, refetch: refetchProgress } = getCompletedContents(
        courseId,
        address || "0x0000000000000000000000000000000000000000",
        contentUris.length
    )

    // Sync completion status with content items
    useEffect(() => {
        if (completedStatus && Array.isArray(completedStatus)) {
            setContentItems(prev => prev.map((item, idx) => ({
                ...item,
                completed: completedStatus[idx]
            })))

            // Calculate progress
            const completedCount = completedStatus.filter(Boolean).length
            const total = contentUris.length
            setProgress(total > 0 ? (completedCount / total) * 100 : 0)
        }
    }, [completedStatus, contentUris.length])

    // Helper to load progress (Legacy/Fallback)
    const loadProgress = (items: ContentItem[]) => {
        // If we have smart contract data, use it instead
        if (completedStatus && Array.isArray(completedStatus)) {
            // Already handled by useEffect above
            return
        }

        const savedProgress = localStorage.getItem(`course_${courseId}_progress`)
        if (savedProgress) {
            try {
                const { currentIndex: savedIndex } = JSON.parse(savedProgress)
                // Validate index
                if (savedIndex >= 0 && savedIndex < items.length) {
                    setCurrentIndex(savedIndex)
                }
            } catch (e) {
                console.warn('Failed to load progress:', e)
            }
        }
    }

    // Parse IPFS URIs and fetch metadata
    useEffect(() => {
        const fetchContentMetadata = async () => {
            if (!contentUris || contentUris.length === 0) {
                setLoading(false)
                return
            }

            // Check cache first
            const cacheKey = `course_content_v1_${courseId}`
            try {
                const cachedDataString = localStorage.getItem(cacheKey)
                if (cachedDataString) {
                    const cachedData = JSON.parse(cachedDataString)
                    // Verify if the cached data corresponds to the current content URIs
                    if (JSON.stringify(cachedData.sourceUris) === JSON.stringify(contentUris)) {
                        setContentItems(cachedData.items)
                        loadProgress(cachedData.items)
                        setLoading(false)
                        return
                    }
                }
            } catch (e) {
                console.warn("Error reading from cache:", e)
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

            // Save to cache
            try {
                localStorage.setItem(cacheKey, JSON.stringify({
                    sourceUris: contentUris,
                    items: items,
                    timestamp: Date.now()
                }))
            } catch (e) {
                console.warn("Failed to save to cache:", e)
            }

            loadProgress(items)
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
    const markAsCompleted = async (index: number) => {
        try {
            await markContentComplete(courseId, index)
            toast.success("Content marked as complete!")

            // Optimistic update
            setContentItems(prev => {
                const newItems = [...prev]
                if (newItems[index]) {
                    newItems[index] = { ...newItems[index], completed: true }
                }
                return newItems
            })

            // Refetch to confirm
            setTimeout(() => refetchProgress(), 2000)
        } catch (error) {
            console.error("Failed to mark content as complete:", error)
            // toast.error("Failed to mark content as complete")
        }
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
        <div className="h-auto lg:h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Left Sidebar: Course Materials + Progress */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4 min-h-0 max-h-[calc(100vh-140px)] order-2 lg:order-1">
                {/* Content List - Compact on mobile */}
                <Card className="glass-card border-white/10 flex-1 flex flex-col min-h-0 overflow-hidden">
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
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={`text-xs lg:text-sm font-medium truncate ${index === currentIndex ? 'text-primary' : 'text-white'
                                                    }`}>
                                                    {item.title}
                                                </p>
                                                {index === currentIndex && contentLoading && (
                                                    <Loader2 className="w-3 h-3 text-primary animate-spin flex-shrink-0" />
                                                )}
                                            </div>
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

                {/* Footer Actions */}
                <Card className="glass-card border-white/10 mt-4 flex-shrink-0">
                    <CardContent className="p-3 lg:p-4 flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={() => navigateToContent(currentIndex - 1)}
                            disabled={currentIndex === 0}
                            size="sm"
                            className="text-xs lg:text-sm"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Previous
                        </Button>

                        {!currentContent.completed && (
                            <Button onClick={() => markAsCompleted(currentIndex)} className="bg-green-600 hover:bg-green-700 text-xs lg:text-sm" size="sm">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Mark as Complete
                            </Button>
                        )}

                        <Button
                            onClick={() => navigateToContent(currentIndex + 1)}
                            disabled={currentIndex === contentItems.length - 1}
                            size="sm"
                            className="text-xs lg:text-sm"
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>

            </div>

            {/* Right Column: Content Viewer Only */}
            <div className="w-full lg:w-2/3 h-full flex flex-col order-1 lg:order-2">
                {/* Wrapper for Tabs if content is document/link, otherwise just div */}
                {currentContent.type === 'video' ? (
                    <Card className="glass-card border-white/10 flex-1 flex flex-col min-h-0" id="content-viewer-container">
                        <CardHeader className="border-b border-white/10 p-2 lg:p-3 min-h-[60px] flex justify-center flex-col">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="capitalize text-xs">
                                        {currentContent.type}
                                    </Badge>
                                    {currentContent.completed && (
                                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                            Completed
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowDescription(!showDescription)}
                                        className="h-8 text-xs gap-2"
                                    >
                                        Course Info
                                        {showDescription ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={toggleFullscreen} title="Toggle Fullscreen" className="h-8 w-8">
                                        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            {/* Collapsible Description */}
                            {showDescription && (
                                <div className="mt-3 pt-3 border-t border-white/10 animate-in slide-in-from-top-2">
                                    <h3 className="text-lg font-semibold text-white mb-1">{currentContent.title}</h3>
                                    {currentContent.description && (
                                        <p className="text-sm text-gray-400">{currentContent.description}</p>
                                    )}
                                </div>
                            )}
                        </CardHeader>

                        <CardContent className="p-0 flex-1 flex flex-col min-h-0 relative">
                            <div className={`relative flex-1 flex flex-col min-h-0 ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
                                <div className="w-full h-full bg-black relative">
                                    {contentLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-8 h-8 lg:w-12 lg:h-12 text-primary animate-spin" />
                                                <p className="text-xs lg:text-sm text-gray-300">Loading video...</p>
                                            </div>
                                        </div>
                                    )}
                                    <video
                                        key={currentContent.uri}
                                        controls
                                        className="w-full h-full"
                                        onLoadedData={() => setContentLoading(false)}
                                        onEnded={() => markAsCompleted(currentIndex)}
                                    >
                                        <source src={contentUrl} type="video/mp4" />
                                        <source src={contentUrl} type="video/webm" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="flex-1 flex flex-col min-h-0">
                        <Card className="glass-card border-white/10 flex-1 flex flex-col min-h-0" id="content-viewer-container">
                            <CardHeader className="border-b border-white/10 p-2 lg:p-3 min-h-[60px] flex justify-center flex-col">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="bg-white/5 border border-white/10 h-8 rounded-md flex items-center p-1">
                                        <button
                                            onClick={() => setActiveTab('embedded')}
                                            className={`text-xs h-6 px-3 rounded-sm flex items-center transition-all ${activeTab === 'embedded' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            <Laptop className="w-3 h-3 mr-2" />
                                            Embedded
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('external')}
                                            className={`text-xs h-6 px-3 rounded-sm flex items-center transition-all ${activeTab === 'external' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            <ExternalLink className="w-3 h-3 mr-2" />
                                            External
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowDescription(!showDescription)}
                                            className="h-8 text-xs gap-2"
                                        >
                                            Course Info
                                            {showDescription ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={toggleFullscreen} title="Toggle Fullscreen" className="h-8 w-8">
                                            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Collapsible Description */}
                                {showDescription && (
                                    <div className="mt-3 pt-3 border-t border-white/10 animate-in slide-in-from-top-2">
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
                                        <h3 className="text-lg font-semibold text-white mb-1">{currentContent.title}</h3>
                                        {currentContent.description && (
                                            <p className="text-sm text-gray-400">{currentContent.description}</p>
                                        )}
                                    </div>
                                )}
                            </CardHeader>

                            <CardContent className="p-0 flex-1 flex flex-col min-h-0 relative">
                                <div className={`relative flex-1 flex flex-col min-h-0 ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>

                                    {/* Embedded View - Hidden via CSS when inactive to preserve state */}
                                    <div className={`flex-1 flex flex-col min-h-0 p-3 lg:p-4 space-y-3 ${activeTab !== 'embedded' ? 'hidden' : ''}`}>
                                        {/* Helpful notice */}
                                        {
                                            currentContent.type === 'document' ? null : <div className="flex items-start gap-2 p-2 lg:p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex-shrink-0">


                                                <ShieldAlert className="w-3 h-3 lg:w-4 lg:h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-[10px] lg:text-xs text-blue-300">
                                                    Some websites block embedding. If content fails, try "External".
                                                </p>
                                            </div>

                                        }

                                        {/* Responsive iframe */}
                                        <div className="w-full bg-white/5 rounded-lg overflow-hidden border border-white/10 relative flex-1 min-h-[600px] lg:min-h-0">
                                            {contentLoading && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 z-10 rounded-lg">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Loader2 className="w-8 h-8 lg:w-12 lg:h-12 text-primary animate-spin" />
                                                        <p className="text-xs lg:text-sm text-gray-300">
                                                            {currentContent.type === 'document' ? 'Loading document...' : 'Loading content...'}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <iframe
                                                src={currentContent.type === 'document'
                                                    ? `https://docs.google.com/viewer?url=${encodeURIComponent(contentUrl)}&embedded=true`
                                                    : contentUrl
                                                }
                                                className="absolute inset-0 w-full h-full border-0"
                                                title={currentContent.title}
                                                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                                onLoad={() => setContentLoading(false)}
                                                onError={() => {
                                                    setContentLoading(false)
                                                    setIframeError(true)
                                                }}
                                            />

                                            {/* CSP Error Overlay */}
                                            {iframeError && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95 z-20 p-6">
                                                    <div className="max-w-md text-center space-y-4">
                                                        <ShieldAlert className="w-12 h-12 text-yellow-500 mx-auto" />
                                                        <h3 className="text-lg font-semibold text-white">Content Cannot Be Embedded</h3>
                                                        <p className="text-sm text-gray-400">
                                                            This website blocks iframe embedding for security reasons.
                                                        </p>
                                                        <Button
                                                            onClick={() => setActiveTab('external')}
                                                            className="bg-primary hover:bg-primary/90"
                                                        >
                                                            <ExternalLink className="w-4 h-4 mr-2" />
                                                            View Preview Instead
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* External View with Link Preview */}
                                    <div className={`flex-1 flex flex-col min-h-0 p-6 ${activeTab !== 'external' ? 'hidden' : ''}`}>
                                        <div className="flex-1 flex flex-col items-center justify-center space-y-6 max-w-3xl mx-auto w-full">
                                            {/* Link Preview Card */}
                                            <div className="w-full glass-card border-white/10 rounded-xl overflow-hidden">
                                                <ReactTinyLink
                                                    cardSize="large"
                                                    showGraphic={true}
                                                    maxLine={3}
                                                    minLine={2}
                                                    url={contentUrl}
                                                    proxyUrl="https://corsproxy.io/?"
                                                />
                                            </div>

                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                <ExternalLink className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <div className="max-w-md space-y-2">
                                                <h3 className="text-xl font-semibold text-white">External Content</h3>
                                                <p className="text-gray-400">
                                                    This content is hosted on an external website. You can open it in a popup window for the best experience, or in a new tab.
                                                </p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                                <Button
                                                    onClick={() => window.open(contentUrl, 'targetWindow', `toolbar=no,location=yes,status=no,menubar=no,scrollbars=yes,resizable=yes,width=1200,height=800,left=${(window.screen.width - 1200) / 2},top=${(window.screen.height - 800) / 2}`)}
                                                    className="gap-2"
                                                >
                                                    <Laptop className="w-4 h-4" />
                                                    Open in Popup Window
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => window.open(contentUrl, '_blank')}
                                                    className="gap-2"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Open in New Tab
                                                </Button>
                                            </div>
                                            {currentContent.type === 'document' && (
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => window.open(contentUrl, '_blank')}
                                                    className="gap-2 mt-4"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download Document
                                                </Button>
                                            )}

                                            <div className="mt-6 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 max-w-md mx-auto">
                                                <p className="text-xs text-gray-400">
                                                    <strong className="text-gray-300">Tip:</strong> The popup window keeps you within the app
                                                    while giving you full access to interact with the content.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Text Content - Scrollable within viewport */}
                {currentContent.type === 'text' && (
                    <Card className="glass-card border-white/10 flex-1 flex flex-col min-h-0 overflow-hidden">
                        <CardContent className="p-6 lg:p-8 overflow-y-auto">
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

            </div>
        </div>
    )
}
