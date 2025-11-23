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
          // Try authorized getCourse first
          let courseData: any | null = null
          let response = await fetch('/api/getCourse', {
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
            courseData = await response.json()
          } else if (response.status === 403 || response.status === 404) {
            // Fallback to public preview via logs
            const publicRes = await fetch('/api/getCoursePublic', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                courseId: i,
                network: currentAddresses.network,
              }),
            })
            if (publicRes.ok) {
              courseData = await publicRes.json()
            }
          }
          
          if (courseData) {
            // Price removed
            const priceEth = '0'
            const inferredThumb = courseData.metadataUri ? await fetchThumbnailFromMetadata(courseData.metadataUri) : '/placeholder.jpg'

            // Transform blockchain or preview data to our Course interface
            const course: Course = {
              id: Number(courseData.id ?? i),
              title: courseData.title ?? `Course ${i}`,
              description: courseData.description ?? '',
              image: inferredThumb,
              thumbnail: courseData.metadataUri ? inferredThumb : undefined,
              instructor: courseData.instructor ?? '0x0000000000000000000000000000000000000000',
              duration: `${courseData.duration ?? 0} weeks`,
              students: Number(courseData.enrolledCount ?? 0),
              rating: Number(courseData.rating ?? 0) / 10,
              level: courseData.level || 'Beginner',
              tags: courseData.tags || [],
              price: 'Free',
              tokenReward: courseData.tokenReward?.toString() || '100',
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
  if (!metadataUri) return '/placeholder.jpg'

  // If it's clearly an image file, return it directly (handles mock data)
  if (metadataUri.match(/\.(jpg|jpeg|png|gif|webp)$/i) || metadataUri.includes('placehold.co')) {
    return metadataUri
  }

  try {
    const response = await fetch(metadataUri)
    if (response.ok) {
      // Check content type to avoid parsing non-JSON as JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const metadata = await response.json()
        return metadata.thumbnail || '/placeholder.jpg'
      } else {
        // If not JSON, assume the URI itself is the image (fallback)
        return metadataUri
      }
    }
  } catch (error) {
    console.error('Error fetching course metadata:', error)
    // Fallback: if fetch fails, maybe the URI itself is the image?
    // But if it failed to fetch, it might be broken. Return placeholder for safety.
  }
  return '/placeholder.jpg'
}