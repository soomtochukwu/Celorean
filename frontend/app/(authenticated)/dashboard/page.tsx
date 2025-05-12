
import { Coins, Users, BookOpen, TrendingUp, Activity, Zap } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import ConnectWalletButton from "@/components/ConnectWalletButton";

export default function Dashboard() {
  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your learning journey</p>
        </div>
        <ConnectWalletButton />

      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Learning Progress"
          value="68%"
          description="4 courses in progress"
          icon={<BookOpen className="h-5 w-5" />}
          trend="up"
          trendValue="+12% from last week"
        />
        <StatCard
          title="Tokens Earned"
          value="1,250 CEL"
          description="Lifetime earnings"
          icon={<Coins className="h-5 w-5" />}
          trend="up"
          trendValue="+85 CEL this month"
        />
        <StatCard
          title="Verification Status"
          value="Verified"
          description="Identity verified on-chain"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Activity Section */}
      <div className="glass rounded-lg border border-primary/10 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          <button className="text-sm text-primary hover:text-primary/80">View All</button>
        </div>
        <div className="space-y-4">
          {[
            {
              icon: <BookOpen className="h-5 w-5 text-primary" />,
              title: "Completed Lesson",
              description: "Introduction to Zero-Knowledge Proofs",
              time: "2 hours ago",
            },
            {
              icon: <Coins className="h-5 w-5 text-primary" />,
              title: "Tokens Earned",
              description: "Received 50 CEL for quiz completion",
              time: "Yesterday",
            },
            {
              icon: <TrendingUp className="h-5 w-5 text-primary" />,
              title: "Level Up",
              description: "Advanced to Level 3 in Blockchain Fundamentals",
              time: "2 days ago",
            },
          ].map((activity, index) => (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
              </div>
              <div className="text-xs text-muted-foreground">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recommended Courses</h2>
          <button className="text-sm text-primary hover:text-primary/80">View All</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Advanced Blockchain Concepts",
              description: "Learn about consensus mechanisms, smart contracts, and more",
              progress: 0,
              icon: <Activity className="h-5 w-5 text-primary" />,
            },
            {
              title: "Web3 Development Fundamentals",
              description: "Build decentralized applications with modern frameworks",
              progress: 0,
              icon: <Zap className="h-5 w-5 text-primary" />,
            },
            {
              title: "Cryptography Basics",
              description: "Understand the mathematics behind blockchain security",
              progress: 0,
              icon: <Users className="h-5 w-5 text-primary" />,
            },
          ].map((course, index) => (
            <div
              key={index}
              className="glass rounded-lg border border-primary/10 p-6 hover:border-primary/30 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {course.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{course.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
              <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">Not started</div>
                <button className="text-xs text-primary hover:text-primary/80">Start Course</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
