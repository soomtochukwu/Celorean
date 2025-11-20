import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAccount } from "wagmi"
import useCeloreanContract from "@/hooks/useCeloreanContract"
import { toast } from "@/hooks/use-toast"
import { Loader2, Calendar, CheckCircle, QrCode } from "lucide-react"

interface AttendanceControlProps {
    courseId: number
    isLecturer: boolean
    isStudent: boolean
}

export function AttendanceControl({ courseId, isLecturer, isStudent }: AttendanceControlProps) {
    const { address } = useAccount()
    const {
        createClassSession,
        markAttendance,
        getSessionIdsForLecturer,
        isPending,
        isConfirming,
        isConfirmed,
        error
    } = useCeloreanContract()

    const [sessionId, setSessionId] = useState("")
    const [activeTab, setActiveTab] = useState<"create" | "mark">("mark")
    const [lastCreatedSessionId, setLastCreatedSessionId] = useState<string | null>(null)

    // If user is lecturer, default to create tab
    useEffect(() => {
        if (isLecturer) setActiveTab("create")
    }, [isLecturer])

    const handleCreateSession = async () => {
        try {
            await createClassSession(courseId)
            toast({
                title: "Creating Session",
                description: "Please confirm the transaction to create a new class session.",
            })
        } catch (err: any) {
            console.error("Error creating session:", err)
            toast({
                title: "Error",
                description: "Failed to create session. Please try again.",
                variant: "destructive",
            })
        }
    }

    const handleMarkAttendance = async () => {
        if (!sessionId) {
            toast({
                title: "Session ID Required",
                description: "Please enter a valid session ID.",
                variant: "destructive",
            })
            return
        }

        try {
            await markAttendance(parseInt(sessionId))
            toast({
                title: "Marking Attendance",
                description: "Please confirm the transaction to mark your attendance.",
            })
        } catch (err: any) {
            console.error("Error marking attendance:", err)
            if (err.message?.includes("Attendance already marked")) {
                toast({
                    title: "Already Marked",
                    description: "You have already marked attendance for this session.",
                    variant: "destructive",
                })
            } else {
                toast({
                    title: "Error",
                    description: "Failed to mark attendance. Please try again.",
                    variant: "destructive",
                })
            }
        }
    }

    useEffect(() => {
        if (isConfirmed) {
            toast({
                title: "Success!",
                description: activeTab === "create"
                    ? "Class session created successfully."
                    : "Attendance marked successfully.",
            })

            // If we just created a session, we might want to fetch the ID
            // For now, we can just clear the loading state
        }
    }, [isConfirmed, activeTab])

    if (!isLecturer && !isStudent) return null

    return (
        <Card className="glass-card border-white/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Calendar className="h-5 w-5 text-primary" />
                    Attendance
                </CardTitle>
                <CardDescription className="text-gray-400">
                    {isLecturer
                        ? "Manage class sessions and track attendance."
                        : "Mark your attendance for active class sessions."}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLecturer && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                            <h4 className="text-sm font-medium text-gray-200 mb-2">Create New Session</h4>
                            <p className="text-xs text-gray-400 mb-4">
                                Generate a new session ID for students to mark their attendance.
                            </p>
                            <Button
                                onClick={handleCreateSession}
                                disabled={isPending || isConfirming}
                                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
                            >
                                {isPending || isConfirming ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <QrCode className="mr-2 h-4 w-4" />
                                        Create Class Session
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {isStudent && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="sessionId" className="text-gray-200">Session ID</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="sessionId"
                                    placeholder="Enter Session ID"
                                    value={sessionId}
                                    onChange={(e) => setSessionId(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary"
                                />
                                <Button
                                    onClick={handleMarkAttendance}
                                    disabled={isPending || isConfirming || !sessionId}
                                    className="bg-secondary hover:bg-secondary/80 text-black font-medium"
                                >
                                    {isPending || isConfirming ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Mark"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
