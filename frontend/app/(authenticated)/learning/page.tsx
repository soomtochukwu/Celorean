"use client"

import { useState, useMemo } from "react"
import { Search, Filter, SortAsc } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CourseCard } from "@/components/course-card"
import { useCourses } from "@/hooks/useCourses"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import useCeloreanContract from "@/hooks/useCeloreanContract"

export default function LearningPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("title")
  const { courses, loading } = useCourses()
  const { isConnected, address } = useAccount()
  const { getStudentCourses } = useCeloreanContract()

  // Get enrolled courses for the current user
  const { data: enrolledCourseIds } = getStudentCourses(address as string)

  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesLevel = selectedLevel === "all" || course.level === selectedLevel
      return matchesSearch && matchesLevel
    })

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "rating":
          return b.rating - a.rating
        case "students":
          return b.students - a.students
        case "level":
          const levelOrder = { "Beginner": 1, "Intermediate": 2, "Advanced": 3 }
          return levelOrder[a.level] - levelOrder[b.level]
        default:
          return 0
      }
    })

    return filtered
  }, [courses, searchTerm, selectedLevel, sortBy])

  const handleEnrollmentSuccess = () => {
    // Refresh the page or refetch data
    window.location.reload()
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Learning Dashboard</h1>
          <p className="text-muted-foreground mb-6">Connect your wallet to access courses on the blockchain</p>
          <ConnectButton />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <div className="glass p-6 rounded-lg border border-primary/10">
            <h2 className="text-xl font-bold mb-4">Filters</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Level</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center">
                        <Filter className="h-4 w-4 mr-2" />
                        {selectedLevel === "all" ? "All Levels" : selectedLevel}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onClick={() => setSelectedLevel("all")}>All Levels</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedLevel("Beginner")}>Beginner</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedLevel("Intermediate")}>Intermediate</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedLevel("Advanced")}>Advanced</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center">
                        <SortAsc className="h-4 w-4 mr-2" />
                        {sortBy === "title" ? "Title" :
                          sortBy === "rating" ? "Rating" :
                            sortBy === "students" ? "Students" : "Level"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onClick={() => setSortBy("title")}>Title</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("rating")}>Rating</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("students")}>Students</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy("level")}>Level</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Available Courses</h1>
            <p className="text-muted-foreground">
              {loading ? "Loading..." : `${filteredAndSortedCourses.length} courses found`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedCourses.map((course) => {
                // Check if user is enrolled in this course
                const isEnrolled = Array.isArray(enrolledCourseIds) && enrolledCourseIds.includes(course.id) || false

                return (
                  <CourseCard
                    key={course.id}
                    {...course}
                    isEnrolled={isEnrolled}
                    onEnrollmentSuccess={handleEnrollmentSuccess}
                  />
                )
              })}
            </div>
          )}

          {!loading && filteredAndSortedCourses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No courses found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
