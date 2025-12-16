"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Calendar,
  MapPin,
  Users,
  Search,
  Filter,
  Loader2,
  Clock,
  DollarSign,
  Video,
  CheckCircle2
} from 'lucide-react'
import { useEvents, getEventTypeLabel, getEventTypeIcon, getEventFormatIcon, formatEventDate, isUpcoming, isPast } from '@/hooks/useEvents'
import { toast } from 'sonner'
import { formatEther } from 'viem'
import { useAccount } from 'wagmi'

export default function EventDiscoveryPage() {
  const { address } = useAccount()
  const { events, eventsLoading, registerForEvent, isPending, refetchEvents } = useEvents()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedFormat, setSelectedFormat] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('upcoming')

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = !searchTerm ||
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = selectedType === 'all' || event.eventType === parseInt(selectedType)
      const matchesFormat = selectedFormat === 'all' || event.eventFormat === parseInt(selectedFormat)

      let matchesStatus = true
      if (selectedStatus === 'upcoming') {
        matchesStatus = isUpcoming(event.startTime) && event.status === 0
      } else if (selectedStatus === 'past') {
        matchesStatus = isPast(event.endTime) || event.status === 2
      } else if (selectedStatus === 'active') {
        matchesStatus = event.status === 0
      }

      return matchesSearch && matchesType && matchesFormat && matchesStatus
    })
  }, [events, searchTerm, selectedType, selectedFormat, selectedStatus])

  const handleRegister = async (eventId: number, price: bigint) => {
    try {
      await registerForEvent(eventId, price)
      toast.success('Successfully registered for event!')
      refetchEvents()
    } catch (error: any) {
      toast.error(error.message || 'Failed to register for event')
    }
  }

  if (eventsLoading) {
    return (
      <div className="min-h-screen p-6 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-gray-400">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Discover Events</h1>
        <p className="text-gray-400">Find and register for bootcamps, workshops, seminars, and hackathons</p>
      </div>

      {/* Filters */}
      <Card className="glass-card border-white/10 mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="0">🎓 Bootcamp</SelectItem>
                <SelectItem value="1">💼 Seminar</SelectItem>
                <SelectItem value="2">🛠️ Workshop</SelectItem>
                <SelectItem value="3">💻 Hackathon</SelectItem>
              </SelectContent>
            </Select>

            {/* Format Filter */}
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="0">🌐 Virtual</SelectItem>
                <SelectItem value="1">📍 In Person</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card className="glass-card border-white/10">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Events Found</h3>
            <p className="text-gray-400">
              {searchTerm || selectedType !== 'all' || selectedFormat !== 'all'
                ? 'Try adjusting your filters'
                : 'Check back later for upcoming events'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={handleRegister}
              isPending={isPending}
              userAddress={address}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface EventCardProps {
  event: any
  onRegister: (eventId: number, price: bigint) => void
  isPending: boolean
  userAddress?: string
}

function EventCard({ event, onRegister, isPending, userAddress }: EventCardProps) {
  const { data: isRegistered } = useEvents().isRegistered(event.id)
  const isFull = event.maxCapacity > 0 && event.registeredCount >= event.maxCapacity
  const eventPassed = isPast(event.endTime)

  return (
    <Card className="glass-card border-white/10 group hover:border-primary/30 transition-all">
      {/* Image */}
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        {event.image ? (
          <img
            src={`https://gateway.pinata.cloud/ipfs/${event.image}`}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            <Calendar className="w-16 h-16 text-white/30" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge variant="secondary" className="backdrop-blur-sm bg-black/50">
            {getEventTypeIcon(event.eventType)} {getEventTypeLabel(event.eventType)}
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="backdrop-blur-sm bg-black/50">
            {getEventFormatIcon(event.eventFormat)} {event.eventFormat === 0 ? 'Virtual' : 'In Person'}
          </Badge>
        </div>

        {/* Status Indicators */}
        {Boolean(isRegistered) && (
          <div className="absolute bottom-2 right-2">
            <Badge className="bg-green-500/80 backdrop-blur-sm">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Registered
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <h3 className="text-lg font-bold text-white line-clamp-2">{event.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-2">{event.description}</p>
        {event.courseId && event.courseId > 0 && event.courseTitle && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              📚 Course: {event.courseTitle}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Clock className="w-4 h-4 text-primary" />
          <span>{formatEventDate(event.startTime)}</span>
        </div>

        {/* Location/Link */}
        <div className="flex items-center gap-2 text-sm text-gray-300">
          {event.eventFormat === 1 ? (
            <>
              <MapPin className="w-4 h-4 text-primary" />
              <span className="truncate">{event.locationData}</span>
            </>
          ) : (
            <>
              <Video className="w-4 h-4 text-primary" />
              <span>{isRegistered ? 'Link in details' : 'Register to see link'}</span>
            </>
          )}
        </div>

        {/* Capacity */}
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Users className="w-4 h-4 text-primary" />
          <span>
            {Number(event.registeredCount)} registered
            {event.maxCapacity > 0 && ` / ${Number(event.maxCapacity)} max`}
          </span>
        </div>

        {/* Price */}
        {event.price > 0 && (
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <DollarSign className="w-4 h-4" />
            <span>{formatEther(event.price)} CELO</span>
          </div>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag: string, i: number) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3">
        {userAddress === event.organizer ? (
          <Button variant="outline" className="w-full" disabled>
            You're the Organizer
          </Button>
        ) : isRegistered ? (
          <Button variant="secondary" className="w-full" disabled>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Already Registered
          </Button>
        ) : isFull ? (
          <Button variant="outline" className="w-full" disabled>
            Event Full
          </Button>
        ) : eventPassed ? (
          <Button variant="outline" className="w-full" disabled>
            Event Ended
          </Button>
        ) : event.status !== 0 ? (
          <Button variant="outline" className="w-full" disabled>
            Event {event.status === 1 ? 'Cancelled' : 'Completed'}
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => onRegister(event.id, event.price)}
            disabled={isPending || !userAddress}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                Register {event.price > 0 && `(${formatEther(event.price)} CELO)`}
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}