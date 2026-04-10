"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, 
  CheckCircle2, 
  Lock, 
  Play, 
  Clock, 
  Trophy,
  Star,
  ChevronRight,
  Zap,
  Target,
  TrendingUp,
  Code,
  Brain,
  Database,
  Globe,
  Server
} from "lucide-react"

interface LearningModule {
  id: string
  title: string
  duration: string
  completed: boolean
  locked: boolean
  xp: number
}

interface LearningPath {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  progress: number
  totalModules: number
  completedModules: number
  estimatedTime: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  xpReward: number
  modules: LearningModule[]
  tags: string[]
  enrolled: boolean
}

const learningPaths: LearningPath[] = [
  {
    id: "dsa-fundamentals",
    title: "DSA Fundamentals",
    description: "Master the core data structures and algorithms required for technical interviews",
    icon: Code,
    color: "text-primary",
    bgColor: "bg-primary/10",
    progress: 65,
    totalModules: 12,
    completedModules: 8,
    estimatedTime: "40 hours",
    difficulty: "Beginner",
    xpReward: 2500,
    enrolled: true,
    tags: ["Arrays", "Linked Lists", "Stacks", "Queues", "Trees"],
    modules: [
      { id: "1", title: "Introduction to Big O", duration: "45 min", completed: true, locked: false, xp: 100 },
      { id: "2", title: "Arrays & Strings", duration: "2 hours", completed: true, locked: false, xp: 200 },
      { id: "3", title: "Linked Lists", duration: "1.5 hours", completed: true, locked: false, xp: 200 },
      { id: "4", title: "Stacks & Queues", duration: "1 hour", completed: true, locked: false, xp: 150 },
      { id: "5", title: "Hash Tables", duration: "2 hours", completed: true, locked: false, xp: 250 },
      { id: "6", title: "Binary Trees", duration: "2.5 hours", completed: true, locked: false, xp: 300 },
      { id: "7", title: "Binary Search Trees", duration: "2 hours", completed: true, locked: false, xp: 250 },
      { id: "8", title: "Heaps & Priority Queues", duration: "1.5 hours", completed: true, locked: false, xp: 200 },
      { id: "9", title: "Graphs - BFS & DFS", duration: "3 hours", completed: false, locked: false, xp: 350 },
      { id: "10", title: "Sorting Algorithms", duration: "2 hours", completed: false, locked: false, xp: 250 },
      { id: "11", title: "Searching Algorithms", duration: "1.5 hours", completed: false, locked: true, xp: 200 },
      { id: "12", title: "Final Assessment", duration: "1 hour", completed: false, locked: true, xp: 500 },
    ]
  },
  {
    id: "dynamic-programming",
    title: "Dynamic Programming Mastery",
    description: "Learn to solve complex optimization problems using DP techniques",
    icon: Brain,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    progress: 30,
    totalModules: 10,
    completedModules: 3,
    estimatedTime: "35 hours",
    difficulty: "Intermediate",
    xpReward: 3500,
    enrolled: true,
    tags: ["Memoization", "Tabulation", "Optimization", "Patterns"],
    modules: [
      { id: "1", title: "Introduction to DP", duration: "1 hour", completed: true, locked: false, xp: 150 },
      { id: "2", title: "Memoization Techniques", duration: "2 hours", completed: true, locked: false, xp: 250 },
      { id: "3", title: "Tabulation Approach", duration: "2 hours", completed: true, locked: false, xp: 250 },
      { id: "4", title: "1D DP Problems", duration: "3 hours", completed: false, locked: false, xp: 400 },
      { id: "5", title: "2D DP Problems", duration: "4 hours", completed: false, locked: false, xp: 500 },
      { id: "6", title: "String DP", duration: "3 hours", completed: false, locked: true, xp: 400 },
      { id: "7", title: "Tree DP", duration: "3 hours", completed: false, locked: true, xp: 450 },
      { id: "8", title: "Bitmask DP", duration: "2.5 hours", completed: false, locked: true, xp: 400 },
      { id: "9", title: "DP Optimization", duration: "3 hours", completed: false, locked: true, xp: 500 },
      { id: "10", title: "Final Challenge", duration: "2 hours", completed: false, locked: true, xp: 700 },
    ]
  },
  {
    id: "system-design",
    title: "System Design Fundamentals",
    description: "Learn to design scalable systems for real-world applications",
    icon: Server,
    color: "text-neon-green",
    bgColor: "bg-neon-green/10",
    progress: 0,
    totalModules: 8,
    completedModules: 0,
    estimatedTime: "30 hours",
    difficulty: "Advanced",
    xpReward: 4000,
    enrolled: false,
    tags: ["Scalability", "Databases", "Caching", "Load Balancing"],
    modules: [
      { id: "1", title: "System Design Basics", duration: "2 hours", completed: false, locked: false, xp: 300 },
      { id: "2", title: "Scalability Principles", duration: "3 hours", completed: false, locked: true, xp: 400 },
      { id: "3", title: "Database Design", duration: "4 hours", completed: false, locked: true, xp: 500 },
      { id: "4", title: "Caching Strategies", duration: "2.5 hours", completed: false, locked: true, xp: 400 },
      { id: "5", title: "Load Balancing", duration: "2 hours", completed: false, locked: true, xp: 350 },
      { id: "6", title: "Microservices", duration: "4 hours", completed: false, locked: true, xp: 600 },
      { id: "7", title: "Case Studies", duration: "5 hours", completed: false, locked: true, xp: 700 },
      { id: "8", title: "Mock Design Interview", duration: "2 hours", completed: false, locked: true, xp: 800 },
    ]
  },
  {
    id: "sql-databases",
    title: "SQL & Database Mastery",
    description: "Master SQL queries and database concepts for technical interviews",
    icon: Database,
    color: "text-neon-gold",
    bgColor: "bg-neon-gold/10",
    progress: 45,
    totalModules: 8,
    completedModules: 4,
    estimatedTime: "25 hours",
    difficulty: "Intermediate",
    xpReward: 2800,
    enrolled: true,
    tags: ["SQL", "Joins", "Indexes", "Optimization"],
    modules: [
      { id: "1", title: "SQL Basics", duration: "1.5 hours", completed: true, locked: false, xp: 150 },
      { id: "2", title: "SELECT & Filtering", duration: "2 hours", completed: true, locked: false, xp: 200 },
      { id: "3", title: "JOINs Mastery", duration: "3 hours", completed: true, locked: false, xp: 350 },
      { id: "4", title: "Aggregations & Grouping", duration: "2 hours", completed: true, locked: false, xp: 250 },
      { id: "5", title: "Subqueries & CTEs", duration: "3 hours", completed: false, locked: false, xp: 400 },
      { id: "6", title: "Window Functions", duration: "2.5 hours", completed: false, locked: false, xp: 350 },
      { id: "7", title: "Query Optimization", duration: "3 hours", completed: false, locked: true, xp: 450 },
      { id: "8", title: "Database Design", duration: "4 hours", completed: false, locked: true, xp: 600 },
    ]
  },
  {
    id: "web-fundamentals",
    title: "Web Development Basics",
    description: "Learn core web concepts essential for full-stack interviews",
    icon: Globe,
    color: "text-neon-pink",
    bgColor: "bg-neon-pink/10",
    progress: 0,
    totalModules: 10,
    completedModules: 0,
    estimatedTime: "45 hours",
    difficulty: "Beginner",
    xpReward: 3000,
    enrolled: false,
    tags: ["HTML", "CSS", "JavaScript", "React", "APIs"],
    modules: [
      { id: "1", title: "HTML Fundamentals", duration: "2 hours", completed: false, locked: false, xp: 150 },
      { id: "2", title: "CSS Styling", duration: "3 hours", completed: false, locked: true, xp: 200 },
      { id: "3", title: "JavaScript Basics", duration: "4 hours", completed: false, locked: true, xp: 300 },
      { id: "4", title: "DOM Manipulation", duration: "2 hours", completed: false, locked: true, xp: 250 },
      { id: "5", title: "Async JavaScript", duration: "3 hours", completed: false, locked: true, xp: 350 },
      { id: "6", title: "React Fundamentals", duration: "5 hours", completed: false, locked: true, xp: 450 },
      { id: "7", title: "State Management", duration: "3 hours", completed: false, locked: true, xp: 350 },
      { id: "8", title: "REST APIs", duration: "3 hours", completed: false, locked: true, xp: 350 },
      { id: "9", title: "Authentication", duration: "2.5 hours", completed: false, locked: true, xp: 300 },
      { id: "10", title: "Deployment", duration: "2 hours", completed: false, locked: true, xp: 250 },
    ]
  },
]

function PathCard({ path, onSelect }: { path: LearningPath; onSelect: () => void }) {
  return (
    <Card 
      className={`bg-card/30 border-border/50 hover:border-primary/30 transition-all cursor-pointer group ${
        path.enrolled ? "ring-1 ring-primary/20" : ""
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${path.bgColor}`}>
            <path.icon className={`w-6 h-6 ${path.color}`} />
          </div>
          <Badge 
            variant="outline" 
            className={`${
              path.difficulty === "Beginner" ? "text-green-500 border-green-500/30" :
              path.difficulty === "Intermediate" ? "text-yellow-500 border-yellow-500/30" :
              "text-red-500 border-red-500/30"
            }`}
          >
            {path.difficulty}
          </Badge>
        </div>
        
        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{path.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{path.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {path.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-muted/50">
              {tag}
            </Badge>
          ))}
          {path.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs bg-muted/50">
              +{path.tags.length - 3}
            </Badge>
          )}
        </div>
        
        <div className="space-y-3">
          {path.enrolled && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{path.completedModules}/{path.totalModules} modules</span>
              </div>
              <Progress value={path.progress} className="h-2" />
            </>
          )}
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {path.estimatedTime}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-primary" />
              {path.xpReward} XP
            </span>
          </div>
        </div>
        
        <Button 
          className={`w-full mt-4 ${
            path.enrolled ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90"
          }`}
        >
          {path.enrolled ? (
            <>
              <Play className="w-4 h-4 mr-2" />
              Continue Learning
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4 mr-2" />
              Start Path
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

function PathDetail({ path, onBack }: { path: LearningPath; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ChevronRight className="w-4 h-4 rotate-180" />
        Back to Paths
      </Button>
      
      {/* Header */}
      <Card className="bg-card/30 border-border/50 overflow-hidden">
        <div className={`h-2 ${path.bgColor.replace("/10", "")}`} />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-xl ${path.bgColor}`}>
                <path.icon className={`w-8 h-8 ${path.color}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{path.title}</h1>
                <p className="text-muted-foreground">{path.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{path.progress}%</div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                {path.enrolled ? "Continue" : "Enroll Now"}
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span>{path.totalModules} modules</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{path.estimatedTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-primary" />
              <span>{path.xpReward} XP reward</span>
            </div>
            <Badge 
              variant="outline" 
              className={`${
                path.difficulty === "Beginner" ? "text-green-500 border-green-500/30" :
                path.difficulty === "Intermediate" ? "text-yellow-500 border-yellow-500/30" :
                "text-red-500 border-red-500/30"
              }`}
            >
              {path.difficulty}
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      {/* Modules */}
      <Card className="bg-card/30 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Course Modules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {path.modules.map((module, index) => (
            <div
              key={module.id}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                module.completed 
                  ? "bg-primary/10 border border-primary/30" 
                  : module.locked
                    ? "bg-muted/20 border border-border opacity-60"
                    : "bg-card/50 border border-border hover:border-primary/30 cursor-pointer"
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                module.completed 
                  ? "bg-primary text-primary-foreground" 
                  : module.locked
                    ? "bg-muted text-muted-foreground"
                    : "bg-muted text-foreground"
              }`}>
                {module.completed ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : module.locked ? (
                  <Lock className="w-5 h-5" />
                ) : (
                  <span className="font-bold">{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1">
                <div className="font-medium">{module.title}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {module.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-primary" />
                    {module.xp} XP
                  </span>
                </div>
              </div>
              
              {!module.locked && !module.completed && (
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </Button>
              )}
              
              {module.completed && (
                <Badge className="bg-primary/20 text-primary">Completed</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function LearningPathsPage() {
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null)
  
  const enrolledPaths = learningPaths.filter(p => p.enrolled)
  const availablePaths = learningPaths.filter(p => !p.enrolled)
  
  if (selectedPath) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <PathDetail path={selectedPath} onBack={() => setSelectedPath(null)} />
        </div>
      </DashboardLayout>
    )
  }
  
  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-balance">
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Learning Paths
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Structured courses to master placement preparation topics
          </p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/30 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{enrolledPaths.length}</div>
                <div className="text-xs text-muted-foreground">Enrolled Paths</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/30 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <CheckCircle2 className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <div className="text-2xl font-bold">15</div>
                <div className="text-xs text-muted-foreground">Completed Modules</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/30 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neon-gold/10">
                <Clock className="w-5 h-5 text-neon-gold" />
              </div>
              <div>
                <div className="text-2xl font-bold">24h</div>
                <div className="text-xs text-muted-foreground">Time Invested</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/30 border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neon-green/10">
                <Trophy className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <div className="text-2xl font-bold">3,450</div>
                <div className="text-xs text-muted-foreground">XP Earned</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Currently Learning */}
        {enrolledPaths.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Continue Learning
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledPaths.map((path) => (
                <PathCard 
                  key={path.id} 
                  path={path} 
                  onSelect={() => setSelectedPath(path)} 
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Available Paths */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-secondary" />
            Explore More Paths
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availablePaths.map((path) => (
              <PathCard 
                key={path.id} 
                path={path} 
                onSelect={() => setSelectedPath(path)} 
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
