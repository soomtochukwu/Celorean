"use client"

import { useState } from "react"
import { Search, Filter, ChevronDown, BookOpen, Zap, Shield, Brain, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourseCard } from "@/components/course-card"

// Mock data for courses
const courses = [
  {
    id: 1,
    title: "Blockchain Fundamentals",
    description: "Learn the core concepts of blockchain technology and its applications",
    image: "/placeholder.svg?height=200&width=400",
    instructor: "Dr. Michael Rivera",
    duration: "6 weeks",
    students: 1245,
    rating: 4.8,
    level: "Beginner",
    progress: 68,
    tags: ["Blockchain", "Cryptocurrency", "Web3"],
    tokenReward: "150",
  },
  {
    id: 2,
    title: "Smart Contract Development with Solidity",
    description: "Master the art of writing secure and efficient smart contracts",
    image: "/placeholder.svg?height=200&width=400",
    instructor: "Alex Johnson",
    duration: "8 weeks",
    students: 892,
    rating: 4.7,
    level: "Intermediate",
    tags: ["Smart Contracts", "Solidity", "Ethereum", "Development"],
    price: "$49.99",
    tokenReward: "200",
  },
  {
    id: 3,
    title: "Zero-Knowledge Proofs: Theory and Practice",
    description: "Understand the mathematics and implementation of zero-knowledge cryptography",
    image: "/placeholder.svg?height=200&width=400",
    instructor: "Dr. Sarah Chen",
    duration: "10 weeks",
    students: 567,
    rating: 4.9,
    level: "Advanced",
    progress: 25,
    tags: ["Cryptography", "Zero-Knowledge", "Privacy", "Mathematics"],
    tokenReward: "300",
  },
  {
    id: 4,
    title: "Web3 Frontend Development",
    description: "Build modern, responsive dApps with React and ethers.js",
    image: "/placeholder.svg?height=200&width=400",
    instructor: "Emma Wilson",
    duration: "6 weeks",
    students: 1023,
    rating: 4.6,
    level: "Intermediate",
    tags: ["React", "JavaScript", "dApps", "Frontend"],
    price: "$39.99",
    tokenReward: "180",
  },
  {
    id: 5,
    title: "DeFi Protocols and Applications",
    description: "Explore the world of decentralized finance and its ecosystem",
    image: "/placeholder.svg?height=200&width=400",
    instructor: "David Kim",
    duration: "7 weeks",
    students: 782,
    rating: 4.5,
    level: "Intermediate",
    progress: 42,
    tags: ["DeFi", "Finance", "Lending", "Trading"],
    tokenReward: "220",
  },
  {
    id: 6,
    title: "NFT Creation and Marketplaces",
    description: "Learn to create, mint, and trade non-fungible tokens",
    image: "/placeholder.svg?height=200&width=400",
    instructor: "Olivia Martinez",
    duration: "5 weeks",
    students: 1456,
    rating: 4.7,
    level: "Beginner",
    tags: ["NFT", "Digital Art", "Marketplaces", "Creativity"],
    price: "$29.99",
    tokenReward: "160",
  },
]

export default function Learning() {
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [sortBy, setSortBy] = useState("popular")

  // Filter and sort courses
  const filteredCourses = courses
    .filter((course) => {
      if (levelFilter !== "all" && course.level.toLowerCase() !== levelFilter.toLowerCase()) return false
      return (
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })
    .sort((a, b) => {
      if (sortBy === "popular") return b.students - a.students
      if (sortBy === "rating") return b.rating - a.rating
      if (sortBy === "newest") return b.id - a.id
      return 0
    })

  const enrolledCourses = courses.filter((course) => course.progress !== undefined)
  const availableCourses = courses.filter((course) => course.progress === undefined)

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Learning</h1>
        <p className="text-muted-foreground">Explore courses and continue your learning journey</p>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="glass border border-primary/10 mb-6">
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="enrolled">My Courses</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-10 glass border-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Level
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass border-primary/20">
              <DropdownMenuItem onClick={() => setLevelFilter("all")}>All Levels</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLevelFilter("beginner")}>Beginner</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLevelFilter("intermediate")}>Intermediate</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLevelFilter("advanced")}>Advanced</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Sort By
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass border-primary/20">
              <DropdownMenuItem onClick={() => setSortBy("popular")}>Most Popular</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("rating")}>Highest Rated</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("newest")}>Newest</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                image={course.image}
                instructor={course.instructor}
                duration={course.duration}
                students={course.students}
                rating={course.rating}
                level={course.level as "Beginner" | "Intermediate" | "Advanced"}
                progress={course.progress}
                tags={course.tags}
                price={course.price}
                tokenReward={course.tokenReward}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="enrolled">
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  image={course.image}
                  instructor={course.instructor}
                  duration={course.duration}
                  students={course.students}
                  rating={course.rating}
                  level={course.level as "Beginner" | "Intermediate" | "Advanced"}
                  progress={course.progress}
                  tags={course.tags}
                  tokenReward={course.tokenReward}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Enrolled Courses</h3>
              <p className="text-muted-foreground mb-6">You haven't enrolled in any courses yet.</p>
              <Button>Browse Courses</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommended">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.slice(0, 3).map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                image={course.image}
                instructor={course.instructor}
                duration={course.duration}
                students={course.students}
                rating={course.rating}
                level={course.level as "Beginner" | "Intermediate" | "Advanced"}
                tags={course.tags}
                price={course.price}
                tokenReward={course.tokenReward}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Learning Paths</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Blockchain Developer",
              description: "Master the skills to build decentralized applications",
              icon: <Code className="h-6 w-6" />,
              courses: 8,
              duration: "6 months",
            },
            {
              title: "DeFi Specialist",
              description: "Understand the protocols powering decentralized finance",
              icon: <Zap className="h-6 w-6" />,
              courses: 6,
              duration: "4 months",
            },
            {
              title: "Security Expert",
              description: "Learn to audit and secure blockchain applications",
              icon: <Shield className="h-6 w-6" />,
              courses: 7,
              duration: "5 months",
            },
            {
              title: "AI & Blockchain",
              description: "Explore the intersection of AI and blockchain technologies",
              icon: <Brain className="h-6 w-6" />,
              courses: 5,
              duration: "3 months",
            },
          ].map((path, index) => (
            <div
              key={index}
              className="glass border border-primary/10 rounded-lg p-6 hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                {path.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{path.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{path.description}</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{path.courses} Courses</span>
                <span className="text-muted-foreground">{path.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" className="glass border-primary/20">
          Load More Courses
        </Button>
      </div>
    </div>
  )
}
