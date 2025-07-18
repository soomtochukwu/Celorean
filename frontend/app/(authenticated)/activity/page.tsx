"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { Calendar, Clock, BookOpen, Coins, TrendingUp, Award, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUserData } from "@/hooks/useUserData"
import { useUserActivities, type UserActivity } from "@/hooks/useUserActivities"

export default function ActivityPage() {
    const { address, isConnected } = useAccount()
    const { userStats, loading: userLoading } = useUserData()
    const { activities, loading: activitiesLoading } = useUserActivities()
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState("all")
    const [timeFilter, setTimeFilter] = useState("all")

    if (!isConnected) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex h-[400px] items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
                        <p className="text-muted-foreground">Please connect your wallet to view your activity history.</p>
                    </div>
                </div>
            </div>
        )
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "enrollment":
                return <BookOpen className="h-5 w-5 text-blue-500" />
            case "attendance":
                return <Calendar className="h-5 w-5 text-green-500" />
            case "tokens":
                return <Coins className="h-5 w-5 text-yellow-500" />
            case "progress":
                return <TrendingUp className="h-5 w-5 text-purple-500" />
            case "achievement":
                return <Award className="h-5 w-5 text-orange-500" />
            default:
                return <Clock className="h-5 w-5 text-gray-500" />
        }
    }

    const getActivityColor = (type: string) => {
        switch (type) {
            case "enrollment":
                return "bg-blue-100 text-blue-800 border-blue-200"
            case "attendance":
                return "bg-green-100 text-green-800 border-green-200"
            case "tokens":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "progress":
                return "bg-purple-100 text-purple-800 border-purple-200"
            case "achievement":
                return "bg-orange-100 text-orange-800 border-orange-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const filteredActivities = activities.filter((activity: UserActivity) => {
        const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = filterType === "all" || activity.type === filterType

        let matchesTime = true
        if (timeFilter !== "all") {
            const activityDate = new Date(activity.timestamp)
            const now = new Date()
            const daysDiff = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24))

            switch (timeFilter) {
                case "today":
                    matchesTime = daysDiff === 0
                    break
                case "week":
                    matchesTime = daysDiff <= 7
                    break
                case "month":
                    matchesTime = daysDiff <= 30
                    break
            }
        }

        return matchesSearch && matchesType && matchesTime
    })

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col space-y-4">
                <div>
                    <h1 className="text-3xl font-bold">Activity History</h1>
                    <p className="text-muted-foreground">Track your learning journey and achievements</p>
                </div>

                {/* Activity Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <BookOpen className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium">Courses Enrolled</p>
                                    <p className="text-2xl font-bold">{userStats.enrolledCoursesCount}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium">Progress</p>
                                    <p className="text-2xl font-bold">{userStats.progressPercentage}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Coins className="h-5 w-5 text-yellow-500" />
                                <div>
                                    <p className="text-sm font-medium">Tokens Earned</p>
                                    <p className="text-2xl font-bold">{userStats.tokensEarned}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Award className="h-5 w-5 text-orange-500" />
                                <div>
                                    <p className="text-sm font-medium">Achievements</p>
                                    <p className="text-2xl font-bold">{Math.floor(userStats.completedCoursesCount * 1.5)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Filter className="h-5 w-5" />
                        <span>Filter Activities</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search activities..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Activity Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="enrollment">Enrollments</SelectItem>
                                <SelectItem value="attendance">Attendance</SelectItem>
                                <SelectItem value="tokens">Token Earnings</SelectItem>
                                <SelectItem value="progress">Progress</SelectItem>
                                <SelectItem value="achievement">Achievements</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={timeFilter} onValueChange={setTimeFilter}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Time Period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                    {activitiesLoading || userLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                <p>Loading your activities...</p>
                            </div>
                        </div>
                    ) : filteredActivities.length > 0 ? (
                        <div className="space-y-4">
                            {filteredActivities.map((activity: UserActivity, index: number) => (
                                <div key={activity.id || index} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex-shrink-0 mt-1">
                                        {getActivityIcon(activity.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium truncate">{activity.title}</h3>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant="outline" className={getActivityColor(activity.type)}>
                                                    {activity.type}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(activity.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>

                                        {activity.metadata && (
                                            <div className="mt-2 text-xs text-muted-foreground">
                                                {activity.metadata.courseId && (
                                                    <span>Course ID: {activity.metadata.courseId} • </span>
                                                )}
                                                {activity.metadata.tokensEarned && (
                                                    <span>Tokens: +{activity.metadata.tokensEarned} CEL • </span>
                                                )}
                                                {activity.metadata.sessionId && (
                                                    <span>Session: {activity.metadata.sessionId}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Activities Found</h3>
                            <p className="text-muted-foreground">
                                {searchTerm || filterType !== "all" || timeFilter !== "all"
                                    ? "Try adjusting your filters to see more activities."
                                    : "Start learning to see your activity history here."}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}