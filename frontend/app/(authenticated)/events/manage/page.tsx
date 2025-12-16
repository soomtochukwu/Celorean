"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Plus,
  Calendar,
  Users,
  DollarSign,
  Loader2,
  MapPin,
  Video,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { useEvents, getEventTypeLabel, getEventTypeIcon, getEventFormatIcon, formatEventDate } from '@/hooks/useEvents'
import { toast } from 'sonner'
import { parseEther, formatEther } from 'viem'
import { useUserData } from '@/hooks/useUserData'
import { useCeloreanContract } from '@/hooks/useCeloreanContract'

export default function EventManagementPage() {
  const { isLecturer } = useUserData()
  const { myEvents, myEventsLoading, createEvent, cancelEvent, completeEvent, isPending, refetchMyEvents } = useEvents()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  if (!isLecturer) {
    return (
      <div className="min-h-screen p-6 md:p-8 flex items-center justify-center">
        <Card className="glass-card border-white/10">
          <CardContent className="p-12 text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Access Denied</h3>
            <p className="text-gray-400">Only instructors can manage events</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Manage Events</h1>
          <p className="text-gray-400">Create and manage your events</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>Fill in the details for your event</DialogDescription>
            </DialogHeader>
            <CreateEventForm
              onSuccess={() => {
                setIsCreateDialogOpen(false)
                refetchMyEvents()
              }}
              createEvent={createEvent}
              isPending={isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Events List */}
      {myEventsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      ) : myEvents.length === 0 ? (
        <Card className="glass-card border-white/10">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Events Yet</h3>
            <p className="text-gray-400 mb-6">Create your first event to get started</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {myEvents.map((event) => (
            <EventManagementCard
              key={event.id}
              event={event}
              onCancel={async (id) => { await cancelEvent(id) }}
              onComplete={async (id) => { await completeEvent(id) }}
              onRefresh={refetchMyEvents}
              isPending={isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CreateEventFormProps {
  onSuccess: () => void
  createEvent: any
  isPending: boolean
}

function CreateEventForm({ onSuccess, createEvent, isPending }: CreateEventFormProps) {
  const { courseCount, getCourse } = useCeloreanContract()
  const { address } = useUserData()

  // Fetch all courses for the dropdown
  const courses = useMemo(() => {
    if (!courseCount || Number(courseCount) === 0) return []

    const allCourses = []
    for (let i = 1; i <= Number(courseCount); i++) {
      const { data: course } = getCourse(i)
      if (course) {
        allCourses.push({ id: i, ...course })
      }
    }
    return allCourses
  }, [courseCount, getCourse])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    requirements: '',
    tags: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    maxCapacity: '',
    price: '',
    eventType: '0',
    eventFormat: '0',
    locationData: '',
    courseId: '0'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Upload metadata to IPFS (Pinata)
      const metadata = {
        title: formData.title,
        description: formData.description,
        image: formData.image,
        requirements: formData.requirements,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      }

      const metadataResponse = await fetch('/api/pinEventMetadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metadata)
      })

      const { ipfsHash } = await metadataResponse.json()

      // Convert dates to Unix timestamps
      const startTimestamp = new Date(`${formData.startDate}T${formData.startTime}`).getTime() / 1000
      const endTimestamp = new Date(`${formData.endDate}T${formData.endTime}`).getTime() / 1000

      const price = formData.price ? parseEther(formData.price) : BigInt(0)

      await createEvent(
        ipfsHash,
        startTimestamp,
        endTimestamp,
        parseInt(formData.maxCapacity) || 0,
        price,
        parseInt(formData.eventType),
        parseInt(formData.eventFormat),
        formData.locationData,
        parseInt(formData.courseId)
      )

      toast.success('Event created successfully!')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          required
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Web3 Developer Bootcamp"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          required
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Comprehensive bootcamp covering smart contracts, dApps, and more..."
        />
      </div>

      {/* Image CID */}
      <div className="space-y-2">
        <Label htmlFor="image">Banner Image IPFS CID</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
          placeholder="QmXxx..."
        />
      </div>

      {/* Event Type & Format */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Event Type *</Label>
          <Select value={formData.eventType} onValueChange={(value) => setFormData(prev => ({ ...prev, eventType: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">🎓 Bootcamp</SelectItem>
              <SelectItem value="1">💼 Seminar</SelectItem>
              <SelectItem value="2">🛠️ Workshop</SelectItem>
              <SelectItem value="3">💻 Hackathon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Format *</Label>
          <Select value={formData.eventFormat} onValueChange={(value) => setFormData(prev => ({ ...prev, eventFormat: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">🌐 Virtual</SelectItem>
              <SelectItem value="1">📍 In Person</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course Association (optional) */}
      <div className="space-y-2">
        <Label>Associate with Course (Optional)</Label>
        <Select value={formData.courseId} onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="No course association" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">No Course Association</SelectItem>
            {courses && courses.map((course: any) => (
              <SelectItem key={course.id} value={course.id.toString()}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-400">
          Link this event to a specific course (students can see related events)
        </p>
      </div>

      {/* Location Data (conditional) */}
      <div className="space-y-2">
        <Label htmlFor="locationData">
          {formData.eventFormat === '0' ? 'Meeting Link *' : 'Venue Address *'}
        </Label>
        <Input
          id="locationData"
          required
          value={formData.locationData}
          onChange={(e) => setFormData(prev => ({ ...prev, locationData: e.target.value }))}
          placeholder={formData.eventFormat === '0' ? 'https://meet.google.com/xxx-xxxx-xxx' : '123 Tech Street, San Francisco, CA'}
        />
        <p className="text-xs text-gray-400">
          {formData.eventFormat === '0'
            ? 'This link will be visible only to registered participants'
            : 'Physical location or coordinates'}
        </p>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            required
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time *</Label>
          <Input
            id="startTime"
            type="time"
            required
            value={formData.startTime}
            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            required
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time *</Label>
          <Input
            id="endTime"
            type="time"
            required
            value={formData.endTime}
            onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
          />
        </div>
      </div>

      {/* Capacity & Price */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxCapacity">Max Capacity</Label>
          <Input
            id="maxCapacity"
            type="number"
            min="0"
            value={formData.maxCapacity}
            onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: e.target.value }))}
            placeholder="0 for unlimited"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price (CELO)</Label>
          <Input
            id="price"
            type="number"
            step="0.001"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            placeholder="0 for free"
          />
        </div>
      </div>

      {/* Requirements & Tags */}
      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements</Label>
        <Textarea
          id="requirements"
          rows={2}
          value={formData.requirements}
          onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
          placeholder="Basic knowledge of JavaScript, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          placeholder="Web3, Blockchain, Coding"
        />
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </>
        )}
      </Button>
    </form>
  )
}

interface EventManagementCardProps {
  event: any
  onCancel: (eventId: number) => Promise<void>
  onComplete: (eventId: number) => Promise<void>
  onRefresh: () => void
  isPending: boolean
}

function EventManagementCard({ event, onCancel, onComplete, onRefresh, isPending }: EventManagementCardProps) {
  const canComplete = Number(event.endTime) < Math.floor(Date.now() / 1000) && event.status === 0
  const canCancel = event.status === 0

  const handleAction = async (action: 'cancel' | 'complete') => {
    try {
      if (action === 'cancel') {
        await onCancel(event.id)
        toast.success('Event cancelled')
      } else {
        await onComplete(event.id)
        toast.success('Event marked as completed')
      }
      onRefresh()
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} event`)
    }
  }

  return (
    <Card className="glass-card border-white/10">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-xl">{event.title}</CardTitle>
              <Badge variant={event.status === 0 ? 'default' : event.status === 1 ? 'destructive' : 'secondary'}>
                {event.status === 0 ? 'Active' : event.status === 1 ? 'Cancelled' : 'Completed'}
              </Badge>
            </div>
            <CardDescription>{event.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Event Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            {getEventTypeIcon(event.eventType)}
            <span className="text-sm">{getEventTypeLabel(event.eventType)}</span>
          </div>
          <div className="flex items-center gap-2">
            {getEventFormatIcon(event.eventFormat)}
            <span className="text-sm">{event.eventFormat === 0 ? 'Virtual' : 'In Person'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm">{formatEventDate(event.startTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm">
              {Number(event.registeredCount)}
              {event.maxCapacity > 0 && ` / ${Number(event.maxCapacity)}`}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {canCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleAction('cancel')}
              disabled={isPending}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Event
            </Button>
          )}
          {canComplete && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleAction('complete')}
              disabled={isPending}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}