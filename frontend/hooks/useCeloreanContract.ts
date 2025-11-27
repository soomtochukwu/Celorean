import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
// import { parseEther } from "viem";
import CeloreanABI from "../contracts/Celorean.json";
import { useNetworkAddresses, useNetworkConfig } from "@/contexts/NetworkContext";
import { toast } from "sonner";
import { handleNetworkError, createContractAddressError } from '@/utils/network-error-handler';
import { useEffect, useRef, useCallback } from "react";

export function useCeloreanContract() {
  // Get current network addresses dynamically
  let currentAddresses;
  try {
    currentAddresses = useNetworkAddresses();
  } catch (error) {
    // Handle case where no addresses are available for current network
    handleNetworkError(error);
    throw error;
  }

  const networkConfig = useNetworkConfig();
  const explorerBase = networkConfig?.blockExplorer || "";

  const CELOREAN_CONTRACT_ADDRESS = currentAddresses?.proxyAddress;
  
  if (!CELOREAN_CONTRACT_ADDRESS) {
    const addressError = createContractAddressError('Celorean');
    toast.error(addressError.message);
    throw addressError;
  }
  
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Track last action label to present meaningful messages
  const lastActionLabelRef = useRef<string | null>(null);

  // Derive explorer URL for a given tx hash
  const getTxUrl = (txHash?: `0x${string}` | undefined) => {
    if (!txHash || !explorerBase) return undefined;
    // Assume standard path /tx/<hash>
    const base = explorerBase.replace(/\/$/, "");
    return `${base}/tx/${txHash}`;
  };

  // Toast lifecycle for transaction hash + receipt states
  useEffect(() => {
    if (!hash) return;

    const url = getTxUrl(hash as `0x${string}`);
    const label = lastActionLabelRef.current || "Transaction";

    if (isConfirmed) {
      toast.success(`${label} confirmed`, {
        id: hash,
        action: url
          ? {
              label: "View",
              onClick: () => window.open(url, "_blank"),
            }
          : undefined,
      });
      return;
    }

    if (isConfirming) {
      toast.info(`${label} pending...`, {
        id: hash,
        action: url
          ? {
              label: "View",
              onClick: () => window.open(url, "_blank"),
            }
          : undefined,
      });
      return;
    }

    // Initial submission state
    toast.message(`${label} submitted`, {
      id: hash,
      action: url
        ? {
            label: "View",
            onClick: () => window.open(url, "_blank"),
          }
        : undefined,
    });
  }, [hash, isConfirming, isConfirmed]);

  // Centralize write submission with label
  const runTransaction = async (
    label: string,
    {
      functionName,
      args = [],
      value,
    }: { functionName: string; args?: any[]; value?: bigint }
  ) => {
    try {
      lastActionLabelRef.current = label;
      await writeContract({
        address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
        abi: CeloreanABI.abi,
        functionName,
        args: args as any,
        value,
      } as any);
    } catch (err) {
      handleNetworkError(err);
      throw err;
    }
  };

  // Read functions
  const { data: courseCount } = useReadContract({
    address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
    abi: CeloreanABI.abi,
    functionName: "courseCount",
  });

  // Get course details
  const getCourse = (courseId: number) => {
    return useReadContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getCourse",
      args: [courseId],
    });
  };

  // Get student courses
  const getStudentCourses = (studentAddress: string) => {
    return useReadContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getStudentCourses",
      args: [studentAddress],
    });
  };

  // Check if user is a student
  const isStudent = (address: string) => {
    return useReadContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "isStudent",
      args: [address],
    });
  };

  // Check if user is a lecturer
  const isLecturer = (address: string) => {
    return useReadContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "isLecturer",
      args: [address],
    });
  };

  // Check if student is enrolled in a course
  const isStudentEnrolled = (courseId: number, studentAddress: string) => {
    return useReadContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "isStudentEnrolled",
      args: [courseId, studentAddress],
    });
  };

  // Get contract owner
  const { data: owner } = useReadContract({
    address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
    abi: CeloreanABI.abi,
    functionName: "owner",
  });

  // Get lecturer list
  const { data: lecturerList } = useReadContract({
    address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
    abi: CeloreanABI.abi,
    functionName: "getLecturerList",
  });

  // Expose Certificate NFT address (from Celorean public getter)
  const getCertificateNFTAddress = () => {
    return useReadContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "certificateNFT",
    });
  };

  // Write functions
  const registerForCourse = async (
    courseId: number,
    studentAddress: string,
    priceInWei: string = "0"
  ) => {
    return runTransaction("Register for course", {
      functionName: "registerForCourse",
      args: [courseId, studentAddress],
      value: BigInt(priceInWei),
    });
  };

  // Admin function: Employ lecturer
  const employLecturer = async (lecturerAddress: string, value: number) => {
    return runTransaction("Employ lecturer", {
      functionName: "employLecturer",
      args: [lecturerAddress, value],
    });
  };

  // Admin function: Admit student
  const admitStudent = async (studentAddress: string, value: number) => {
    return runTransaction("Admit student", {
      functionName: "admitStudent",
      args: [studentAddress, value],
    });
  };

  // Lecturer function: Create course
  const createCourse = async (
    title: string,
    duration: number,
    description: string,
    tags: string[],
    level: string,
    metadataUri: string,
    capacity: number
  ) => {
    return runTransaction("Create course", {
      functionName: "createCourse",
      args: [title, BigInt(duration), description, tags, level, metadataUri, BigInt(capacity)],
    });
  };

  // Lecturer function: Update course metadata
  const updateCourseMetadata = async (
    courseId: number,
    newMetadataUri: string
  ) => {
    return runTransaction("Update course", {
      functionName: "updateCourseMetadata",
      args: [courseId, newMetadataUri],
    });
  };

  // ✅ Add new functions for content management
  const addCourseContent = async (
    courseId: number,
    newContentUri: string
  ) => {
    return runTransaction("Add course content", {
      functionName: "addCourseContent",
      args: [courseId, newContentUri],
    });
  };

  const addMultipleCourseContent = async (
    courseId: number,
    newContentUris: string[]
  ) => {
    return runTransaction("Add multiple contents", {
      functionName: "addMultipleCourseContent",
      args: [courseId, newContentUris],
    });
  };

  // ✅ Get course content URIs
  const getCourseContentUris = (courseId: number) => {
    return useReadContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getCourseContentUris",
      args: [courseId],
    });
  };

  // ✅ Get course content count
  const getCourseContentCount = (courseId: number) => {
    return useReadContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getCourseContentCount",
      args: [courseId],
    });
  };

  // ✅ Update existing updateCourseContent function using centralized runner
  const updateCourseContent = async (
    courseId: number,
    newContentUris: string[]
  ) => {
    return runTransaction("Update course content", {
      functionName: "updateCourseContent",
      args: [courseId, newContentUris],
    });
  };

  // =======================
  // Credentials Module APIs
  // =======================

  // Read: get a single credential by ID
  const getCredential = (credentialId: number) => {
    return useReadContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getCredential",
      args: [credentialId],
    });
  };

  // Read: get credential IDs owned by a student
  const getStudentCredentialIds = (studentAddress: string) => {
    return useReadContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getStudentCredentialIds",
      args: [studentAddress],
    });
  };

  // Read: get full credentials for a student
  const getCredentialsByStudent = (studentAddress: string) => {
    return useReadContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getCredentialsByStudent",
      args: [studentAddress],
    });
  };

  // Write: issue credential for a student (lecturer-only)
  const issueCredentialForStudent = async (
    studentAddress: string,
    courseId: number,
    metadataUri: string
  ) => {
    return runTransaction("Issue credential", {
      functionName: "issueCredentialForStudent",
      args: [studentAddress, courseId, metadataUri],
    });
  };

  // =======================
  // Attendance Module APIs
  // =======================

  // Lecturer function: Create class session
  const createClassSession = async (courseId: number) => {
    return runTransaction("Create class session", {
      functionName: "createClassSession",
      args: [courseId],
    });
  };

  // Student/Lecturer function: Mark attendance
  const markAttendance = async (sessionId: number) => {
    return runTransaction("Mark attendance", {
      functionName: "markAttendance",
      args: [sessionId],
    });
  };

  // Lecturer function: Get session IDs
  const getSessionIdsForLecturer = () => {
    return useReadContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getSessionIdsForLecturer",
    });
  };

  // =======================
  // Enrollment Module APIs
  // =======================

  const getCoursesRegisteredByStudent = (studentAddress: string) => {
    return useReadContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getCoursesRegisteredByStudent",
      args: [studentAddress],
    });
  };

  const getTotalRegisteredCourses = () => {
    return useReadContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getTotalRegisteredCourses",
    });
  };

  // ✅ Get list of all admitted students
  const getListOfStudents = () => {
    return useReadContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getListOfStudents",
    });
  };

  const publicClient = usePublicClient();

  // Imperative read functions (safe for useEffect)
  const fetchCourse = useCallback(async (courseId: number) => {
    if (!publicClient) return null;
    return publicClient.readContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getCourse",
      args: [courseId],
    });
  }, [publicClient, CELOREAN_CONTRACT_ADDRESS]);

  const fetchStudentCourses = useCallback(async (studentAddress: string) => {
    if (!publicClient) return null;
    return publicClient.readContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getStudentCourses",
      args: [studentAddress],
    });
  }, [publicClient, CELOREAN_CONTRACT_ADDRESS]);

  const fetchCoursesRegisteredByStudent = useCallback(async (studentAddress: string) => {
    if (!publicClient) return null;
    return publicClient.readContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getCoursesRegisteredByStudent",
      args: [studentAddress],
    });
  }, [publicClient, CELOREAN_CONTRACT_ADDRESS]);

  const fetchTotalRegisteredCourses = useCallback(async () => {
    if (!publicClient) return null;
    return publicClient.readContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getTotalRegisteredCourses",
    });
  }, [publicClient, CELOREAN_CONTRACT_ADDRESS]);

  const fetchCompletedTimestamps = useCallback(async (courseId: number, studentAddress: string, totalContentCount: number) => {
    if (!publicClient) return null;
    return publicClient.readContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getCompletedTimestamps",
      args: [courseId, studentAddress, totalContentCount],
    });
  }, [publicClient, CELOREAN_CONTRACT_ADDRESS]);

  const fetchCompletedContentCount = useCallback(async (courseId: number, studentAddress: string) => {
    if (!publicClient) return null;
    return publicClient.readContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getCompletedContentCount",
      args: [courseId, studentAddress],
    });
  }, [publicClient, CELOREAN_CONTRACT_ADDRESS]);

  const fetchCourseContentCount = useCallback(async (courseId: number) => {
    if (!publicClient) return null;
    return publicClient.readContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "getCourseContentCount",
      args: [courseId],
    });
  }, [publicClient, CELOREAN_CONTRACT_ADDRESS]);

  return {
    // Read functions
    courseCount,
    getCourse,
    getStudentCourses,
    isStudent,
    isLecturer,
    isStudentEnrolled,
    owner,
    lecturerList,
    getCourseContentUris,
    getCourseContentCount,
    getSessionIdsForLecturer,
    getCoursesRegisteredByStudent,
    getTotalRegisteredCourses,
    getListOfStudents,
    // Credentials reads
    getCredential,
    getStudentCredentialIds,
    getCredentialsByStudent,
    // External contract address reads
    getCertificateNFTAddress,

    // Imperative reads
    fetchCourse,
    fetchStudentCourses,
    fetchCoursesRegisteredByStudent,
    fetchTotalRegisteredCourses,
    fetchCompletedTimestamps,
    fetchCompletedContentCount,
    fetchCourseContentCount,

    // Write functions
    registerForCourse,
    employLecturer,
    admitStudent,
    createCourse,
    updateCourseMetadata,
    updateCourseContent,
    addCourseContent,
    addMultipleCourseContent,
    createClassSession,
    markAttendance,
    // Credentials writes
    issueCredentialForStudent,

    // =======================
    // Progress Module APIs
    // =======================

    // Write: Mark content as complete
    markContentComplete: async (courseId: number, contentIndex: number) => {
      return runTransaction("Mark content complete", {
        functionName: "markContentComplete",
        args: [courseId, contentIndex],
      });
    },

    // Read: Check if content is completed
    isContentCompleted: (courseId: number, studentAddress: string, contentIndex: number) => {
      return useReadContract({
        address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
        abi: CeloreanABI.abi,
        functionName: "isContentCompleted",
        args: [courseId, studentAddress, contentIndex],
      });
    },

    // Read: Get completed content count
    getCompletedContentCount: (courseId: number, studentAddress: string) => {
      return useReadContract({
        address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
        abi: CeloreanABI.abi,
        functionName: "getCompletedContentCount",
        args: [courseId, studentAddress],
      });
    },

    // Read: Get all completed contents for a course
    getCompletedContents: (courseId: number, studentAddress: string, totalContentCount: number) => {
      return useReadContract({
        address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
        abi: CeloreanABI.abi,
        functionName: "getCompletedContents",
        args: [courseId, studentAddress, totalContentCount],
      });
    },

    // Read: Get all completed timestamps for a course
    getCompletedTimestamps: (courseId: number, studentAddress: string, totalContentCount: number) => {
      return useReadContract({
        address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
        abi: CeloreanABI.abi,
        functionName: "getCompletedTimestamps",
        args: [courseId, studentAddress, totalContentCount],
      });
    },

    // Admin functions
    withdraw: async () => {
      return runTransaction("Withdraw funds", {
        functionName: "withdraw",
      });
    },

    // Transaction states
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
}

export default useCeloreanContract;
