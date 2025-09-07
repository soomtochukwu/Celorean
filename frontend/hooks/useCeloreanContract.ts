import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
// import { parseEther } from "viem";
import CeloreanABI from "../contracts/Celorean.json";
import { useNetworkAddresses } from "@/contexts/NetworkContext";
import { toast } from "sonner";
import { handleNetworkError, createContractAddressError } from '@/utils/network-error-handler';

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

  // Write functions
  const registerForCourse = async (
    courseId: number,
    studentAddress: string,
    priceInWei: string = "0"
  ) => {
    try {
      await writeContract({
        address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
        abi: CeloreanABI.abi,
        functionName: "registerForCourse",
        args: [courseId, studentAddress],
        value: BigInt(priceInWei), // Send the course price as payment
      });
    } catch (err) {
      console.error("Error registering for course:", err);
      throw err;
    }
  };

  // Admin function: Employ lecturer
  const employLecturer = async (lecturerAddress: string, value: number) => {
    try {
      await writeContract({
        address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
        abi: CeloreanABI.abi,
        functionName: "employLecturer",
        args: [lecturerAddress, value],
      });
    } catch (err) {
      console.error("Error employing lecturer:", err);
      throw err;
    }
  };

  // Admin function: Admit student
  const admitStudent = async (studentAddress: string, value: number) => {
    try {
      await writeContract({
        address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
        abi: CeloreanABI.abi,
        functionName: "admitStudent",
        args: [studentAddress, value],
      });
    } catch (err) {
      console.error("Error admitting student:", err);
      throw err;
    }
  };

  // Lecturer function: Create course
  const createCourse = async (
    title: string,
    duration: number,
    description: string,
    price: number,
    tags: string[],
    level: string,
    metadataUri: string
  ) => {
    if (!writeContract) {
      throw new Error("Contract not available");
    }

    return writeContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "createCourse",
      args: [title, duration, description, price, tags, level, metadataUri],
    });
  };

  // Lecturer function: Update course metadata
  const updateCourseMetadata = async (
    courseId: number,
    newMetadataUri: string
  ) => {
    if (!writeContract) {
      throw new Error("Contract not available");
    }

    return writeContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "updateCourseMetadata",
      args: [courseId, newMetadataUri],
    });
  };

  // ✅ Add new functions for content management
  const addCourseContent = async (
    courseId: number,
    newContentUri: string
  ) => {
    if (!writeContract) {
      throw new Error("Contract not available");
    }

    return writeContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "addCourseContent",
      args: [courseId, newContentUri],
    });
  };

  const addMultipleCourseContent = async (
    courseId: number,
    newContentUris: string[]
  ) => {
    if (!writeContract) {
      throw new Error("Contract not available");
    }

    return writeContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
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

  // ✅ Update the existing updateCourseContent function
  const updateCourseContent = async (
    courseId: number,
    newContentUris: string[]
  ) => {
    if (!writeContract) {
      throw new Error("Contract not available");
    }

    return writeContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: "updateCourseContent",
      args: [courseId, newContentUris],
    });
  };

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
    getCourseContentUris, // ✅ Add this
    getCourseContentCount, // ✅ Add this

    // Write functions
    registerForCourse,
    employLecturer,
    admitStudent,
    createCourse,
    updateCourseMetadata,
    updateCourseContent, // ✅ Updated to handle arrays
    addCourseContent, // ✅ Add this
    addMultipleCourseContent, // ✅ Add this

    // Transaction states
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
}

export default useCeloreanContract;
