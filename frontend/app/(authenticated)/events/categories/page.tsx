"use client"

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GraduationCap, Briefcase, Wrench, Code } from 'lucide-react'

const categories = [
  {
    type: 0,
    label: 'Bootcamps',
    icon: GraduationCap,
    description: 'Intensive, immersive learning programs for mastering new skills',
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30',
    emoji: '🎓'
  },
  {
    type: 1,
    label: 'Seminars',
    icon: Briefcase,
    description: 'Professional talks and presentations from industry experts',
    color: 'from-purple-500/20 to-violet-500/20',
    borderColor: 'border-purple-500/30',
    emoji: '💼'
  },
  {
    type: 2,
    label: 'Workshops',
    icon: Wrench,
    description: 'Hands-on, practical sessions focused on specific skills and tools',
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/30',
    emoji: '🛠️'
  },
  {
    type: 3,
    label: 'Hackathons',
    icon: Code,
    description: 'Competitive coding events and collaborative building challenges',
    color: 'from-orange-500/20 to-red-500/20',
    borderColor: 'border-orange-500/30',
    emoji: '💻'
  }
]

export default function EventCategoriesPage() {
  const router = useRouter()

  const handleCategoryClick = (type: number) => {
    // Navigate to discover page with type filter
    router.push(`/events/discover?type=${type}`)
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Event Categories</h1>
        <p className="text-gray-400">Browse events by type</p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Card
              key={category.type}
              className={`glass-card ${category.borderColor} hover:border-primary/50 transition-all cursor-pointer group`}
              onClick={() => handleCategoryClick(category.type)}
            >
              <CardHeader>
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{category.emoji}</span>
                  <span>{category.label}</span>
                </CardTitle>
                <CardDescription className="text-base">
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Browse {category.label}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* All Events Button */}
      <div className="mt-8 text-center">
        <Button
          size="lg"
          onClick={() => router.push('/events/discover')}
          className="gap-2"
        >
          View All Events
        </Button>
      </div>
    </div>
  )
}