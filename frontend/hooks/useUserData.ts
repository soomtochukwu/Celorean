import { useAccount } from "wagmi";
import useCeloreanContract from "./useCeloreanContract";
import { useCourses } from "./useCourses";
import { useMemo, useState, useEffect } from "react";
import { useUserActivities } from "./useUserActivities";

export function useUserData() {
  const { address, isConnected } = useAccount();
  const { activities: recentActivities, loading: activitiesLoading } = useUserActivities();
  const { 
    getStudentCourses, 
    isStudent, 
    isLecturer, 
    fetchCourseContentCount, 
    fetchCompletedContentCount 
  } = useCeloreanContract();
  const { courses } = useCourses();
  
  const [stats, setStats] = useState({
    enrolledCoursesCount: 0,
    completedCoursesCount: 0,
    progressPercentage: 0,
    tokensEarned: 0,
    recentActivities: [] as any[],
    loading: true
  });

  const studentCourses = getStudentCourses(
    address || "0x0000000000000000000000000000000000000000"
  );
  const studentStatus = isStudent(
    address || "0x0000000000000000000000000000000000000000"
  );
  const lecturerStatus = isLecturer(
    address || "0x0000000000000000000000000000000000000000"
  );

  useEffect(() => {
    const fetchStats = async () => {
      if (!isConnected || !studentCourses.data || !Array.isArray(studentCourses.data) || !address) {
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      const enrolledCourseIds = studentCourses.data as number[];
      let totalProgress = 0;
      let completedCourses = 0;
      let totalTokens = 0;

      for (const courseId of enrolledCourseIds) {
        // Get content counts
        const totalContentBigInt = await fetchCourseContentCount(courseId);
        const completedContentBigInt = await fetchCompletedContentCount(courseId, address);
        
        const totalContent = Number(totalContentBigInt || 0);
        const completedContent = Number(completedContentBigInt || 0);

        if (totalContent > 0) {
          const courseProgress = (completedContent / totalContent) * 100;
          totalProgress += courseProgress;
          
          if (courseProgress >= 100) {
            completedCourses++;
          }
          
          // Estimate tokens: 10 tokens per completed lesson
          totalTokens += completedContent * 10;
        }
      }

      const avgProgress = enrolledCourseIds.length > 0 
        ? Math.round(totalProgress / enrolledCourseIds.length) 
        : 0;

      setStats({
        enrolledCoursesCount: enrolledCourseIds.length,
        completedCoursesCount: completedCourses,
        progressPercentage: avgProgress,
        tokensEarned: totalTokens,
        recentActivities: recentActivities.slice(0, 5).map(a => ({
          icon: a.type === 'enrollment' ? 'BookOpen' : a.type === 'tokens' ? 'Coins' : 'Activity',
          title: a.title,
          description: a.description,
          time: new Date(a.timestamp).toLocaleDateString()
        })),
        loading: false
      });
    };

    fetchStats();
  }, [studentCourses.data, isConnected, address, recentActivities]);

  return {
    address,
    isConnected,
    isStudent: studentStatus.data || false,
    isLecturer: lecturerStatus.data || false,
    enrolledCourses: studentCourses.data || [],
    userStats: {
      enrolledCoursesCount: stats.enrolledCoursesCount,
      completedCoursesCount: stats.completedCoursesCount,
      progressPercentage: stats.progressPercentage,
      tokensEarned: stats.tokensEarned,
      recentActivities: stats.recentActivities,
    },
    loading: stats.loading || studentCourses.isLoading || studentStatus.isLoading,
    error: studentCourses.error || studentStatus.error,
  };
}
