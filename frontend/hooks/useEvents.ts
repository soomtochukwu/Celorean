"use client"

import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import CeloreanABI from '@/contracts/Celorean.json'
import { useNetworkAddresses } from '@/contexts/NetworkContext'

export interface Event {
  id: number
  organizer: string
  metadataURI: string
  startTime: bigint
  endTime: bigint
  maxCapacity: bigint
  registeredCount: bigint
  price: bigint
  eventType: number
  eventFormat: number
  locationData: string
  status: number
  courseId: number  // 0 means no associated course
  title?: string
  description?: string
  image?: string
  requirements?: string
  tags?: string[]
  courseTitle?: string  // Fetched course title for display
}

export function useEvents() {
  const { address } = useAccount()
  const { writeContractAsync, isPending, isError, error } = useWriteContract()
  const networkAddresses = useNetworkAddresses()
  const CONTRACT_ADDRESS = networkAddresses?.proxyAddress as `0x${string}`

  const createEvent = async (
    metadataURI: string,
    startTime: number,
    endTime: number,
    maxCapacity: number,
    price: bigint,
    eventType: number,
    eventFormat: number,
    locationData: string,
    courseId: number = 0
  ) => {
    const params = {
      metadataURI,
      startTime: BigInt(startTime),
      endTime: BigInt(endTime),
      maxCapacity: BigInt(maxCapacity),
      price,
      eventType,
      eventFormat,
      locationData,
      courseId: BigInt(courseId)
    }
    
    return writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: CeloreanABI.abi,
      functionName: 'createEvent',
      args: [params]
    })
  }

  const registerForEvent = async (eventId: number, price: bigint = BigInt(0)) => {
    return writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: CeloreanABI.abi,
      functionName: 'registerForEvent',
      args: [BigInt(eventId)],
      value: price
    })
  }

  const cancelEvent = async (eventId: number) => {
    return writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: CeloreanABI.abi,
      functionName: 'cancelEvent',
      args: [BigInt(eventId)]
    })
  }

  const completeEvent = async (eventId: number) => {
    return writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: CeloreanABI.abi,
      functionName: 'completeEvent',
      args: [BigInt(eventId)]
    })
  }

  const updateEvent = async (
    eventId: number,
    metadataURI: string,
    startTime: number,
    endTime: number
  ) => {
    return writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: CeloreanABI.abi,
      functionName: 'updateEvent',
      args: [BigInt(eventId), metadataURI, BigInt(startTime), BigInt(endTime)]
    })
  }

  const { data: totalEvents } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CeloreanABI.abi,
    functionName: 'getTotalEvents'
  })

  const isRegistered = (eventId: number) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CeloreanABI.abi,
      functionName: 'isRegistered',
      args: [BigInt(eventId), address || '0x0000000000000000000000000000000000000000']
    })
  }

  const { data: events = [], refetch: refetchEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', totalEvents],
    queryFn: async () => {
      if (!totalEvents || Number(totalEvents) === 0) return []

      const eventPromises = []
      for (let i = 0; i < Number(totalEvents); i++) {
        eventPromises.push(
          fetch(`${window.location.origin}/api/blockchain/read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              address: CONTRACT_ADDRESS,
              abi: CeloreanABI.abi,
              functionName: 'getEvent',
              args: [i]
            })
          }).then(res => res.json()).catch(() => null)
        )
      }

      const eventResults = await Promise.all(eventPromises)

      const eventsWithMetadata = await Promise.all(
        eventResults.map(async (event, index) => {
          if (!event) return null

          try {
            const metadataResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${event.metadataURI}`)
            const metadata = await metadataResponse.json()

            return {
              id: index,
              organizer: event.organizer,
              metadataURI: event.metadataURI,
              startTime: BigInt(event.startTime),
              endTime: BigInt(event.endTime),
              maxCapacity: BigInt(event.maxCapacity),
              registeredCount: BigInt(event.registeredCount),
              price: BigInt(event.price),
              eventType: Number(event.eventType),
              eventFormat: Number(event.eventFormat),
              locationData: event.locationData,
              status: Number(event.status),
              courseId: Number(event.courseId || 0),
              title: metadata.title || `Event ${index + 1}`,
              description: metadata.description || '',
              image: metadata.image || '',
              requirements: metadata.requirements || '',
              tags: metadata.tags || []
            } as Event
          } catch (error) {
            console.error(`Failed to fetch metadata for event ${index}:`, error)
            return {
              id: index,
              organizer: event.organizer,
              metadataURI: event.metadataURI,
              startTime: BigInt(event.startTime),
              endTime: BigInt(event.endTime),
              maxCapacity: BigInt(event.maxCapacity),
              registeredCount: BigInt(event.registeredCount),
              price: BigInt(event.price),
              eventType: Number(event.eventType),
              eventFormat: Number(event.eventFormat),
              locationData: event.locationData,
              status: Number(event.status),
              courseId: Number(event.courseId || 0),
              title: `Event ${index + 1}`,
              description: '',
              image: '',
              tags: []
            } as Event
          }
        })
      )

      return eventsWithMetadata.filter(e => e !== null)
    },
    enabled: !!totalEvents && Number(totalEvents) > 0
  })

 const { data: myEvents = [], refetch: refetchMyEvents, isLoading: myEventsLoading } = useQuery({
    queryKey: ['myEvents', address],
    queryFn: async () => {
      if (!address) return []

      // Direct contract read for organizer events
      const eventIdsResult = await fetch(`${window.location.origin}/api/blockchain/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: CONTRACT_ADDRESS,
          abi: CeloreanABI.abi,
          functionName: 'getOrganizerEvents',
          args: [address]
        })
      }).then(res => res.json()).catch(() => [])

      const eventIds = eventIdsResult as number[]

      if (!eventIds || eventIds.length === 0) return []

      // Fetch details for each event using contract reads
      const eventPromises = eventIds.map(async (id: number) => {
        const eventData = await fetch(`${window.location.origin}/api/blockchain/read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: CONTRACT_ADDRESS,
            abi: CeloreanABI.abi,
            functionName: 'getEvent',
            args: [id]
          })
        }).then(res => res.json()).catch(() => null)

        return eventData
      })

      const eventResults = await Promise.all(eventPromises)

      const eventsWithMetadata = await Promise.all(
        eventResults.map(async (event, index) => {
          if (!event) return null
          
          try {
            const metadataResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${event.metadataURI}`)
            const metadata = await metadataResponse.json()

            return {
              id: eventIds[index],
              organizer: event.organizer,
              metadataURI: event.metadataURI,
              startTime: BigInt(event.startTime),
              endTime: BigInt(event.endTime),
              maxCapacity: BigInt(event.maxCapacity),
              registeredCount: BigInt(event.registeredCount),
              price: BigInt(event.price),
              eventType: Number(event.eventType),
              eventFormat: Number(event.eventFormat),
              status: Number(event.status),
              courseId: Number(event.courseId || 0),
              locationData: event.locationData,
              title: metadata.title || `Event ${eventIds[index]}`,
              description: metadata.description || '',
              image: metadata.image || '',
              requirements: metadata.requirements || '',
              tags: metadata.tags || []
            } as Event
          } catch (error) {
            return {
              id: eventIds[index],
              organizer: event.organizer,
              metadataURI: event.metadataURI,
              startTime: BigInt(event.startTime),
              endTime: BigInt(event.endTime),
              maxCapacity: BigInt(event.maxCapacity),
              registeredCount: BigInt(event.registeredCount),
              price: BigInt(event.price),
              eventType: Number(event.eventType),
              eventFormat: Number(event.eventFormat),
              status: Number(event.status),
              courseId: Number(event.courseId || 0),
              locationData: event.locationData,
              title: `Event ${eventIds[index]}`,
              description: '',
              image: '',
              tags: []
            } as Event
          }
        })
      )

      return eventsWithMetadata.filter(e => e !== null)
    },
    enabled: !!address
  })

  return {
    createEvent,
    registerForEvent,
    cancelEvent,
    completeEvent,
    updateEvent,
    isRegistered,
    events,
    myEvents,
    totalEvents: Number(totalEvents || 0),
    eventsLoading,
    myEventsLoading,
    isPending,
    isError,
    error,
    refetchEvents,
    refetchMyEvents
  }
}

export function getEventTypeLabel(type: number): string {
  const labels = ['Bootcamp', 'Seminar', 'Workshop', 'Hackathon']
  return labels[type] || 'Unknown'
}

export function getEventTypeIcon(type: number): string {
  const icons = ['🎓', '💼', '🛠️', '💻']
  return icons[type] || '📅'
}

export function getEventFormatLabel(format: number): string {
  return format === 0 ? 'Virtual' : 'In Person'
}

export function getEventFormatIcon(format: number): string {
  return format === 0 ? '🌐' : '📍'
}

export function getEventStatusLabel(status: number): string {
  const labels = ['Active', 'Cancelled', 'Completed']
  return labels[status] || 'Unknown'
}

export function formatEventDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function isUpcoming(startTime: bigint): boolean {
  return Number(startTime) > Math.floor(Date.now() / 1000)
}

export function isPast(endTime: bigint): boolean {
  return Number(endTime) < Math.floor(Date.now() / 1000)
}
