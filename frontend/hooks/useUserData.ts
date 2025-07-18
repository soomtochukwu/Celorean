import { useAccount } from "wagmi";
import useCeloreanContract from "./useCeloreanContract";
import { useCourses } from "./useCourses";
import { useMemo } from "react";

export function useUserData() {
  const { address, isConnected } = useAccount();
  const { getStudentCourses, isStudent, isLecturer, getCourse } =
    useCeloreanContract();
  const { courses } = useCourses();

  // Get user-specific data from smart contract
  const studentCourses = getStudentCourses(
    address || "0x0000000000000000000000000000000000000000"
  );
  const studentStatus = isStudent(
    address || "0x0000000000000000000000000000000000000000"
  );
  const lecturerStatus = isLecturer(
    address || "0x0000000000000000000000000000000000000000"
  );

  // Calculate user statistics
  const userStats = useMemo(() => {
    if (!isConnected || !studentCourses.data) {
      return {
        enrolledCoursesCount: 0,
        completedCoursesCount: 0,
        progressPercentage: 0,
        tokensEarned: 0,
        recentActivities: [],
      };
    }

    const enrolledCount = Array.isArray(studentCourses.data)
      ? studentCourses.data.length
      : 0;
    // For demo purposes, assume some courses are completed
    const completedCount = Math.floor(enrolledCount * 0.6);
    const progressPercentage =
      enrolledCount > 0
        ? Math.round((completedCount / enrolledCount) * 100)
        : 0;

    // Calculate estimated tokens (demo calculation)
    const tokensEarned = completedCount * 250 + enrolledCount * 50;

    // Generate recent activities based on enrolled courses
    const recentActivities = [
      {
        icon: "BookOpen",
        title: "Course Progress",
        description: `Working on ${enrolledCount} courses`,
        time: "Today",
      },
      {
        icon: "Coins",
        title: "Tokens Earned",
        description: `Earned ${tokensEarned} CEL tokens`,
        time: "This week",
      },
      {
        icon: "TrendingUp",
        title: "Learning Milestone",
        description: `${progressPercentage}% overall progress`,
        time: "2 days ago",
      },
    ];

    return {
      enrolledCoursesCount: enrolledCount,
      completedCoursesCount: completedCount,
      progressPercentage,
      tokensEarned,
      recentActivities,
    };
  }, [studentCourses.data, isConnected]);

  return {
    address,
    isConnected,
    isStudent: studentStatus.data || false,
    isLecturer: lecturerStatus.data || false,
    enrolledCourses: studentCourses.data || [],
    userStats,
    loading: studentCourses.isLoading || studentStatus.isLoading,
    error: studentCourses.error || studentStatus.error,
  };
}
