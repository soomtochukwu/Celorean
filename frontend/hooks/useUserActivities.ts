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
  const { getStudentCourses, isStudent, fetchCompletedTimestamps, fetchCourseContentCount } = useCeloreanContract();
  const { courses } = useCourses();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const studentCourses = getStudentCourses(
    address || "0x0000000000000000000000000000000000000000"
  );
  const studentStatus = isStudent(
    address || "0x0000000000000000000000000000000000000000"
  );

  useEffect(() => {
    const fetchActivities = async () => {
      if (
        !isConnected ||
        !studentCourses.data ||
        !Array.isArray(studentCourses.data) ||
        !address
      ) {
        setActivities([]);
        return;
      }

      setLoading(true);
      const newActivities: UserActivity[] = [];
      const enrolledCourseIds = studentCourses.data as number[];

      try {
        for (const courseId of enrolledCourseIds) {
          const course = courses.find((c) => c.id === courseId);
          
          // 1. Enrollment Activity - REMOVED
          // We cannot fetch the actual enrollment timestamp without an indexer.
          // Using new Date() causes old enrollments to appear as "just now", breaking the timeline sorting.
          // For now, we only show activities with verifiable timestamps (like progress).

          // 2. Progress Activities (Real Data)
          // Get total content count for the course
          const contentCountBigInt = await fetchCourseContentCount(courseId);
          const contentCount = Number(contentCountBigInt || 0);
          
          if (contentCount > 0) {
            const timestamps = await fetchCompletedTimestamps(courseId, address, contentCount);
            
            if (timestamps && Array.isArray(timestamps)) {
              timestamps.forEach((timestamp: bigint, index: number) => {
                if (timestamp > BigInt(0)) {
                  newActivities.push({
                    id: `progress-${courseId}-${index}`,
                    type: "progress",
                    title: "Lesson Completed",
                    description: `Completed lesson ${index + 1} in ${course?.title || `Course ${courseId}`}`,
                    timestamp: new Date(Number(timestamp) * 1000).toISOString(),
                    metadata: {
                      courseId: courseId,
                      progressPercentage: Math.round(((index + 1) / contentCount) * 100)
                    },
                  });
                }
              });
            }
          }
        }

        // Sort by timestamp descending
        newActivities.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setActivities(newActivities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [studentCourses.data, courses, isConnected, address]);

  return {
    activities,
    loading: loading || studentCourses.isLoading || studentStatus.isLoading,
    error: studentCourses.error || studentStatus.error,
  };
}
