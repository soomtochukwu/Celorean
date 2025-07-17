import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import CeloreanABI from "../contracts/Celorean.json";
import contractAddresses from "@/contracts/addresses";

// Contract address - you'll need to update this with your deployed contract address
const CELOREAN_CONTRACT_ADDRESS = contractAddresses.proxyAddress; // Replace with your actual contract address

export function useCeloreanContract() {
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
  const registerForCourse = async (courseId: number) => {
    try {
      await writeContract({
        address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
        abi: CeloreanABI.abi,
        functionName: "registerForCourse",
        args: [courseId],
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
      throw new Error('Contract not available');
    }
    
    return writeContract({
      address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
      abi: CeloreanABI.abi,
      functionName: 'createCourse',
      args: [title, duration, description, price, tags, level, metadataUri],
    });
  };

  return {
    // Read functions
    courseCount,
    getCourse,
    getStudentCourses,
    isStudent,
    isLecturer,
    owner,
    lecturerList,

    // Write functions
    registerForCourse,
    employLecturer,
    admitStudent,
    createCourse,

    // Transaction states
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
}

export default useCeloreanContract;
