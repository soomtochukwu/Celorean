"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useCeloreanContract from "@/hooks/useCeloreanContract";
import { ArrowLeft, Award, BookOpen, Calendar, CheckCircle, ExternalLink, Users, MessageSquare } from "lucide-react";
import Link from "next/link";

interface CourseData {
    id: number;
    title: string;
    level: string;
    enrolled: number;
}

export default function StudentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const studentAddress = params.address as string;

    const [courses, setCourses] = useState<CourseData[]>([]);
    const [credentials, setCredentials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const {
        fetchCoursesRegisteredByStudent,
        getCredentialsByStudent,
        fetchCourse,
    } = useCeloreanContract();

    const { data: credentialsData } = getCredentialsByStudent(studentAddress);

    useEffect(() => {
        async function loadStudentData() {
            if (!studentAddress) return;

            // Validate Ethereum address format
            if (!/^0x[a-fA-F0-9]{40}$/.test(studentAddress)) {
                setError("Invalid wallet address format");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Fetch enrolled courses
                const courseIds = await fetchCoursesRegisteredByStudent(studentAddress);

                if (courseIds && Array.isArray(courseIds)) {
                    const courseDataPromises = courseIds.map(async (id: any) => {
                        try {
                            const courseData = await fetchCourse(Number(id));
                            if (courseData) {
                                return {
                                    id: Number(id),
                                    title: (courseData as any).title || `Course ${id}`,
                                    level: (courseData as any).level || "Unknown",
                                    enrolled: Number((courseData as any).enrolledCount || 0),
                                };
                            }
                            return null;
                        } catch (err) {
                            console.error(`Failed to fetch course ${id}:`, err);
                            return null;
                        }
                    });

                    const coursesData = await Promise.all(courseDataPromises);
                    setCourses(coursesData.filter(Boolean) as CourseData[]);
                }

            } catch (err) {
                console.error("Error loading student data:", err);
                setError("Failed to load student data. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        loadStudentData();
    }, [studentAddress, fetchCoursesRegisteredByStudent, fetchCourse]);

    useEffect(() => {
        if (credentialsData) {
            setCredentials(credentialsData as any[]);
        }
    }, [credentialsData]);

    if (loading) {
        return (
            <div className="p-6 md:p-8 space-y-6">
                <Skeleton className="h-12 w-48 bg-terminal-border" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 bg-terminal-border" />
                    ))}
                </div>
                <Skeleton className="h-64 bg-terminal-border" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 md:p-8">
                <Card className="terminal-box border-terminal-orange">
                    <CardContent className="p-12 text-center">
                        <h3 className="text-xl font-mono font-bold uppercase mb-4 text-terminal-orange">
                            ERROR
                        </h3>
                        <p className="text-muted-foreground font-mono mb-6">{error}</p>
                        <Button
                            onClick={() => router.push("/community")}
                            className="font-mono uppercase"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            BACK TO COMMUNITY
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/community")}
                        className="mb-4 font-mono uppercase text-sm -ml-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        BACK TO COMMUNITY
                    </Button>
                    <h1 className="text-3xl font-mono font-bold uppercase tracking-tight">
                        STUDENT PROFILE
                    </h1>
                    <p className="text-muted-foreground font-mono text-sm mt-2">
                        {studentAddress}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Badge variant="active" className="font-mono uppercase">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        VERIFIED
                    </Badge>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="flex items-center gap-1 font-mono uppercase text-xs opacity-60 cursor-not-allowed"
                    >
                        <MessageSquare className="h-3 w-3" />
                        MESSAGE
                        <span className="ml-1 text-[10px] px-1 border border-terminal-orange text-terminal-orange">SOON</span>
                    </Button>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="terminal-box">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <BookOpen className="h-8 w-8 text-terminal-green" />
                            <div className="text-right">
                                <div className="text-3xl font-mono font-bold text-terminal-green">
                                    {courses.length}
                                </div>
                                <div className="text-xs font-mono uppercase text-muted-foreground tracking-wider">
                                    COURSES
                                </div>
                            </div>
                        </div>
                        <div className="text-xs font-mono text-muted-foreground uppercase">
                            ENROLLED
                        </div>
                    </CardContent>
                </Card>

                <Card className="terminal-box">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Award className="h-8 w-8 text-terminal-orange" />
                            <div className="text-right">
                                <div className="text-3xl font-mono font-bold text-terminal-orange">
                                    {credentials.length}
                                </div>
                                <div className="text-xs font-mono uppercase text-muted-foreground tracking-wider">
                                    CREDENTIALS
                                </div>
                            </div>
                        </div>
                        <div className="text-xs font-mono text-muted-foreground uppercase">
                            EARNED
                        </div>
                    </CardContent>
                </Card>

                <Card className="terminal-box">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Calendar className="h-8 w-8 text-terminal-green" />
                            <div className="text-right">
                                <div className="text-3xl font-mono font-bold">
                                    {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </div>
                                <div className="text-xs font-mono uppercase text-muted-foreground tracking-wider">
                                    JOINED
                                </div>
                            </div>
                        </div>
                        <div className="text-xs font-mono text-muted-foreground uppercase">
                            MEMBER SINCE
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Enrolled Courses */}
            <Card className="terminal-box">
                <CardHeader className="border-b border-terminal-border">
                    <CardTitle className="font-mono uppercase tracking-wider flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-terminal-green" />
                        ENROLLED COURSES
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {courses.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground font-mono uppercase text-sm">
                                NO COURSES ENROLLED YET
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {courses.map((course) => (
                                <Link
                                    key={course.id}
                                    href={`/course/${course.id}`}
                                    className="group"
                                >
                                    <Card className="terminal-box hover:border-terminal-green transition-colors">
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h3 className="font-mono font-bold uppercase text-sm mb-1 group-hover:text-terminal-green transition-colors">
                                                        {course.title}
                                                    </h3>
                                                    <Badge variant="outline" className="text-xs font-mono">
                                                        {course.level}
                                                    </Badge>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-terminal-green transition-colors" />
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                                                <Users className="h-3 w-3" />
                                                <span>{course.enrolled} STUDENTS</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Credentials */}
            <Card className="terminal-box">
                <CardHeader className="border-b border-terminal-border">
                    <CardTitle className="font-mono uppercase tracking-wider flex items-center gap-2">
                        <Award className="h-5 w-5 text-terminal-orange" />
                        CREDENTIALS & CERTIFICATES
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {credentials.length === 0 ? (
                        <div className="text-center py-12">
                            <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground font-mono uppercase text-sm">
                                NO CREDENTIALS ISSUED YET
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {credentials.map((credential: any, index: number) => (
                                <Card key={index} className="terminal-box hover:border-terminal-orange transition-colors">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Award className="h-5 w-5 text-terminal-orange" />
                                                <div>
                                                    <h4 className="font-mono font-bold uppercase text-sm">
                                                        CREDENTIAL #{credential.id || index + 1}
                                                    </h4>
                                                    <p className="text-xs font-mono text-muted-foreground">
                                                        Course ID: {credential.courseId || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="active" className="font-mono text-xs">
                                                VERIFIED
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
