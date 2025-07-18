import { useState, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import useCeloreanContract from "./useCeloreanContract";
import { useCourses } from "./useCourses";

export interface UserActivity {
  id: string;
  type: "enrollment" | "attendance" | "tokens" | "progress" | "achievement";
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    courseId?: number;
    sessionId?: number;
    tokensEarned?: number;
    progressPercentage?: number;
    achievementType?: string;
  };
}

export function useUserActivities() {
  const { address, isConnected } = useAccount();
  const { getStudentCourses, isStudent } = useCeloreanContract();
  const { courses } = useCourses();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const studentCourses = getStudentCourses(
    address || "0x0000000000000000000000000000000000000000"
  );
  const studentStatus = isStudent(
    address || "0x0000000000000000000000000000000000000000"
  );

  // Generate activities based on user data
  const generatedActivities = useMemo(() => {
    if (
      !isConnected ||
      !studentCourses.data ||
      !Array.isArray(studentCourses.data)
    ) {
      return [];
    }

    const activities: UserActivity[] = [];
    const enrolledCourseIds = studentCourses.data as number[];

    // Generate enrollment activities
    enrolledCourseIds.forEach((courseId, index) => {
      const course = courses.find((c) => c.id === courseId);
      const enrollmentDate = new Date();
      enrollmentDate.setDate(
        enrollmentDate.getDate() - (enrolledCourseIds.length - index) * 2
      );

      activities.push({
        id: `enrollment-${courseId}`,
        type: "enrollment",
        title: "Course Enrollment",
        description: `Enrolled in ${course?.title || `Course ${courseId}`}`,
        timestamp: enrollmentDate.toISOString(),
        metadata: {
          courseId: courseId,
        },
      });

      // Generate progress activities for each course
      const progressDate = new Date(enrollmentDate);
      progressDate.setDate(progressDate.getDate() + 1);

      activities.push({
        id: `progress-${courseId}-start`,
        type: "progress",
        title: "Learning Progress",
        description: `Started learning ${
          course?.title || `Course ${courseId}`
        }`,
        timestamp: progressDate.toISOString(),
        metadata: {
          courseId: courseId,
          progressPercentage: 10,
        },
      });

      // Generate attendance activities (simulated)
      for (let session = 1; session <= Math.min(3, index + 1); session++) {
        const attendanceDate = new Date(progressDate);
        attendanceDate.setDate(attendanceDate.getDate() + session);

        activities.push({
          id: `attendance-${courseId}-${session}`,
          type: "attendance",
          title: "Class Attendance",
          description: `Attended session ${session} of ${
            course?.title || `Course ${courseId}`
          }`,
          timestamp: attendanceDate.toISOString(),
          metadata: {
            courseId: courseId,
            sessionId: session,
          },
        });
      }

      // Generate token earning activities
      if (index < enrolledCourseIds.length * 0.7) {
        // 70% of courses have token earnings
        const tokenDate = new Date(progressDate);
        tokenDate.setDate(tokenDate.getDate() + 3);

        const tokensEarned = 50 + index * 25;
        activities.push({
          id: `tokens-${courseId}`,
          type: "tokens",
          title: "Tokens Earned",
          description: `Earned ${tokensEarned} CEL tokens from ${
            course?.title || `Course ${courseId}`
          }`,
          timestamp: tokenDate.toISOString(),
          metadata: {
            courseId: courseId,
            tokensEarned: tokensEarned,
          },
        });
      }

      // Generate achievement activities for completed courses
      if (index < enrolledCourseIds.length * 0.6) {
        // 60% completion rate
        const achievementDate = new Date(progressDate);
        achievementDate.setDate(achievementDate.getDate() + 7);

        activities.push({
          id: `achievement-${courseId}`,
          type: "achievement",
          title: "Course Completed",
          description: `Successfully completed ${
            course?.title || `Course ${courseId}`
          }`,
          timestamp: achievementDate.toISOString(),
          metadata: {
            courseId: courseId,
            achievementType: "course_completion",
          },
        });
      }
    });

    // Add some general learning milestones
    if (enrolledCourseIds.length >= 3) {
      const milestoneDate = new Date();
      milestoneDate.setDate(milestoneDate.getDate() - 5);

      activities.push({
        id: "milestone-active-learner",
        type: "achievement",
        title: "Active Learner",
        description: "Enrolled in 3+ courses - You're on fire! 🔥",
        timestamp: milestoneDate.toISOString(),
        metadata: {
          achievementType: "active_learner",
        },
      });
    }

    if (enrolledCourseIds.length >= 5) {
      const milestoneDate = new Date();
      milestoneDate.setDate(milestoneDate.getDate() - 10);

      activities.push({
        id: "milestone-dedicated-student",
        type: "achievement",
        title: "Dedicated Student",
        description: "Enrolled in 5+ courses - Knowledge seeker! 📚",
        timestamp: milestoneDate.toISOString(),
        metadata: {
          achievementType: "dedicated_student",
        },
      });
    }

    // Sort activities by timestamp (newest first)
    return activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [studentCourses.data, courses, isConnected]);

  useEffect(() => {
    if (isConnected && studentStatus.data) {
      setLoading(true);
      // Simulate API call delay
      const timer = setTimeout(() => {
        setActivities(generatedActivities);
        setLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setActivities([]);
      setLoading(false);
    }
  }, [isConnected, studentStatus.data, generatedActivities]);

  return {
    activities,
    loading: loading || studentCourses.isLoading || studentStatus.isLoading,
    error: studentCourses.error || studentStatus.error,
  };
}
