import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useReadContract } from 'wagmi'
import CeloreanABI from '../contracts/Celorean.json'
import { useNetworkAddresses } from '@/contexts/NetworkContext'
import { formatEther } from 'viem'

export interface Course {
  id: number
  title: string
  description: string
  image: string
  instructor: string
  duration: string
  students: number
  rating: number
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  tags: string[]
  price?: string
  priceWei?: string // NEW: raw price in wei for contract calls
  tokenReward?: string
  isEnrolled?: boolean
  thumbnail?: string // Add thumbnail field
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const { address } = useAccount()
  const currentAddresses = useNetworkAddresses()
  const CELOREAN_CONTRACT_ADDRESS = currentAddresses.proxyAddress
  
  // Get course count at the top level
  const { data: courseCount, isLoading: courseCountLoading } = useReadContract({
    address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
    abi: CeloreanABI.abi,
    functionName: 'courseCount',
  })
  
  // Get student courses at the top level
  const { data: studentCourses } = useReadContract({
    address: CELOREAN_CONTRACT_ADDRESS as `0x${string}`,
    abi: CeloreanABI.abi,
    functionName: 'getStudentCourses',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  useEffect(() => {
    const fetchCourses = async () => {
      // Wait for courseCount to load
      if (courseCountLoading) {
        return
      }
      
      // If courseCount is 0 or undefined, set empty courses and stop loading
      if (!courseCount || Number(courseCount) === 0) {
        setCourses([])
        setLoading(false)
        return
      }
      
      setLoading(true)
      const coursesData: Course[] = []
      
      // Convert student courses to array of numbers
      const enrolledCourses: number[] = (studentCourses as number[]) || []
      
      // Fetch all courses using the API route
      for (let i = 1; i <= Number(courseCount); i++) {
        try {
          const response = await fetch('/api/getCourse', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              courseId: i,
              network: currentAddresses.network,
              viewer: address || null,
            }),
          })
          
          if (response.ok) {
            const courseData = await response.json()
            
            const priceWei = courseData.price?.toString?.() ?? '0'
            const priceEth = priceWei === '0' ? '0' : formatEther(BigInt(priceWei))
            // Transform blockchain data to our Course interface
            const course: Course = {
              id: Number(courseData.id),
              title: courseData.title,
              description: courseData.description,
              image: courseData.metadataUri ? await fetchThumbnailFromMetadata(courseData.metadataUri) : '/placeholder.jpg',
              thumbnail: courseData.metadataUri ? await fetchThumbnailFromMetadata(courseData.metadataUri) : undefined,
              instructor: courseData.instructor,
              duration: `${courseData.duration} weeks`,
              students: Number(courseData.enrolledCount),
              rating: Number(courseData.rating) / 10,
              level: courseData.level as 'Beginner' | 'Intermediate' | 'Advanced',
              tags: courseData.tags || [],
              price: priceWei === '0' ? 'Free' : `${priceEth} ETH`,
              priceWei,
              tokenReward: '10',
              isEnrolled: enrolledCourses.includes(i),
            }
            coursesData.push(course)
          }
        } catch (error) {
          console.error(`Error fetching course ${i}:`, error)
        }
      }
      
      setCourses(coursesData)
      setLoading(false)
    }

    fetchCourses()
  }, [courseCount, courseCountLoading, studentCourses, currentAddresses.network, address])

  return { courses, loading }
}

// Helper function to fetch thumbnail from IPFS metadata
const fetchThumbnailFromMetadata = async (metadataUri: string): Promise<string> => {
  try {
    const response = await fetch(metadataUri)
    if (response.ok) {
      const metadata = await response.json()
      return metadata.thumbnail || '/placeholder.jpg'
    }
  } catch (error) {
    console.error('Error fetching course metadata:', error)
  }
  return '/placeholder.jpg'
}