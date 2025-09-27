import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
// import { parseEther } from "viem";
import CeloreanABI from "../contracts/Celorean.json";
import { useNetworkAddresses, useNetworkConfig } from "@/contexts/NetworkContext";
import { toast } from "sonner";
import { handleNetworkError, createContractAddressError } from '@/utils/network-error-handler';
import { useEffect, useRef } from "react";

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
    price: number,
    tags: string[],
    level: string,
    metadataUri: string
  ) => {
    return runTransaction("Create course", {
      functionName: "createCourse",
      args: [title, duration, description, price, tags, level, metadataUri],
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
    // Credentials reads
    getCredential,
    getStudentCredentialIds,
    getCredentialsByStudent,
    // External contract address reads
    getCertificateNFTAddress,

    // Write functions
    registerForCourse,
    employLecturer,
    admitStudent,
    createCourse,
    updateCourseMetadata,
    updateCourseContent,
    addCourseContent,
    addMultipleCourseContent,
    // Credentials writes
    issueCredentialForStudent,

    // Transaction states
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
}

export default useCeloreanContract;
