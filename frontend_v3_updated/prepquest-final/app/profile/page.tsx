"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Trophy, 
  Flame, 
  Target, 
  Code, 
  BookOpen,
  Calendar,
  MapPin,
  Mail,
  Github,
  Linkedin,
  Globe,
  Edit,
  Settings,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  Star,
  Zap
} from "lucide-react"

// Activity heatmap data
const activityData = Array.from({ length: 365 }, (_, i) => ({
  date: new Date(Date.now() - (364 - i) * 24 * 60 * 60 * 1000),
  count: Math.random() > 0.3 ? Math.floor(Math.random() * 10) : 0,
}))

// Recent activity
const recentActivity = [
  { type: "challenge", title: "Two Sum", difficulty: "Easy", xp: 50, time: "2 hours ago" },
  { type: "interview", title: "System Design Mock", difficulty: "Hard", xp: 200, time: "1 day ago" },
  { type: "challenge", title: "LRU Cache", difficulty: "Medium", xp: 100, time: "1 day ago" },
  { type: "badge", title: "Unlocked: Array Master", xp: 150, time: "2 days ago" },
  { type: "challenge", title: "Binary Tree Level Order", difficulty: "Medium", xp: 100, time: "3 days ago" },
]

// Skills data
const skills = [
  { name: "Arrays & Strings", level: 85, problems: 45 },
  { name: "Linked Lists", level: 72, problems: 28 },
  { name: "Trees & Graphs", level: 65, problems: 32 },
  { name: "Dynamic Programming", level: 48, problems: 15 },
  { name: "System Design", level: 55, problems: 12 },
  { name: "SQL & Databases", level: 70, problems: 20 },
]

// Badges data
const badges = [
  { id: "1", name: "First Blood", icon: "🎯", description: "Solve your first problem", earned: true, date: "Jan 15, 2024" },
  { id: "2", name: "Week Warrior", icon: "🔥", description: "7-day streak", earned: true, date: "Jan 22, 2024" },
  { id: "3", name: "Array Master", icon: "📊", description: "Solve 50 array problems", earned: true, date: "Mar 10, 2024" },
  { id: "4", name: "Speed Demon", icon: "⚡", description: "Solve a hard problem in under 15 min", earned: true, date: "Feb 28, 2024" },
  { id: "5", name: "Interview Ready", icon: "👔", description: "Complete 10 mock interviews", earned: false, progress: 60 },
  { id: "6", name: "Centurion", icon: "💯", description: "Solve 100 problems", earned: false, progress: 89 },
  { id: "7", name: "DP Master", icon: "🧠", description: "Solve 50 DP problems", earned: false, progress: 30 },
  { id: "8", name: "Month Streak", icon: "📅", description: "30-day streak", earned: false, progress: 23 },
]

function ActivityHeatmap() {
  const weeks: (typeof activityData)[] = []
  let week: typeof activityData = []
  
  activityData.forEach((day, i) => {
    week.push(day)
    if (week.length === 7 || i === activityData.length - 1) {
      weeks.push(week)
      week = []
    }
  })
  
  const getIntensity = (count: number) => {
    if (count === 0) return "bg-muted/30"
    if (count <= 2) return "bg-primary/30"
    if (count <= 5) return "bg-primary/50"
    if (count <= 8) return "bg-primary/70"
    return "bg-primary"
  }
  
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-1 min-w-max">
        {weeks.slice(-52).map((week, weekIndex: number) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex: number) => (
              <div
                key={dayIndex}
                className={`w-3 h-3 rounded-sm ${getIntensity(day.count)} hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer`}
                title={`${day.date.toLocaleDateString()}: ${day.count} activities`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted/30" />
          <div className="w-3 h-3 rounded-sm bg-primary/30" />
          <div className="w-3 h-3 rounded-sm bg-primary/50" />
          <div className="w-3 h-3 rounded-sm bg-primary/70" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <Card className="bg-card/30 border-border/50 overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-primary via-secondary to-primary opacity-80" />
          
          <CardContent className="relative pt-0 pb-6">
            {/* Avatar */}
            <div className="absolute -top-16 left-6">
              <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-3xl font-bold">
                  JD
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Edit Button */}
            <div className="flex justify-end pt-4 gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>
            
            {/* User Info */}
            <div className="mt-8 space-y-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">John Doe</h1>
                  <Badge className="bg-secondary/20 text-secondary">Level 15</Badge>
                  <Badge className="bg-primary/20 text-primary">Pro Member</Badge>
                </div>
                <p className="text-muted-foreground">@johndoe</p>
              </div>
              
              <p className="text-foreground/80 max-w-2xl">
                Computer Science student passionate about competitive programming and system design. 
                Currently preparing for placements and aiming for FAANG companies.
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Bangalore, India
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  IIT Bangalore
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined January 2024
                </span>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <Github className="w-4 h-4" />
                  GitHub
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Globe className="w-4 h-4" />
                  Portfolio
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card/30 border-border/50">
            <CardContent className="p-4 text-center">
              <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-2">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary">15,750</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/30 border-border/50">
            <CardContent className="p-4 text-center">
              <div className="p-3 rounded-xl bg-secondary/10 w-fit mx-auto mb-2">
                <Code className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-2xl font-bold text-secondary">89</div>
              <div className="text-sm text-muted-foreground">Problems Solved</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/30 border-border/50">
            <CardContent className="p-4 text-center">
              <div className="p-3 rounded-xl bg-orange-500/10 w-fit mx-auto mb-2">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-orange-500">7</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/30 border-border/50">
            <CardContent className="p-4 text-center">
              <div className="p-3 rounded-xl bg-yellow-500/10 w-fit mx-auto mb-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-yellow-500">#42</div>
              <div className="text-sm text-muted-foreground">Global Rank</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Activity Heatmap */}
        <Card className="bg-card/30 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap />
          </CardContent>
        </Card>
        
        {/* Tabs Section */}
        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList className="bg-card/50 border border-border p-1">
            <TabsTrigger value="skills" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Skills
            </TabsTrigger>
            <TabsTrigger value="badges" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Badges
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Recent Activity
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="skills" className="space-y-4">
            <Card className="bg-card/30 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Skill Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {skills.map((skill) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-sm text-muted-foreground">{skill.problems} problems</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={skill.level} className="flex-1 h-2" />
                      <span className="text-sm font-medium text-primary w-12 text-right">{skill.level}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Problem Stats */}
            <Card className="bg-card/30 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" />
                  Problem Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="text-3xl font-bold text-green-500">45</div>
                    <div className="text-sm text-muted-foreground">Easy</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <div className="text-3xl font-bold text-yellow-500">32</div>
                    <div className="text-sm text-muted-foreground">Medium</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div className="text-3xl font-bold text-red-500">12</div>
                    <div className="text-sm text-muted-foreground">Hard</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="badges" className="space-y-4">
            <Card className="bg-card/30 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Earned Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {badges.filter(b => b.earned).map((badge) => (
                    <div 
                      key={badge.id}
                      className="p-4 rounded-xl bg-card/50 border border-primary/30 text-center hover:neon-border-cyan transition-all cursor-pointer"
                    >
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <div className="font-semibold text-sm">{badge.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{badge.date}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/30 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-muted-foreground" />
                  In Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {badges.filter(b => !b.earned).map((badge) => (
                    <div 
                      key={badge.id}
                      className="p-4 rounded-xl bg-muted/20 border border-border text-center opacity-70 hover:opacity-100 transition-all cursor-pointer"
                    >
                      <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                      <div className="font-semibold text-sm">{badge.name}</div>
                      <div className="mt-2">
                        <Progress value={badge.progress} className="h-1" />
                        <div className="text-xs text-muted-foreground mt-1">{badge.progress}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-4">
            <Card className="bg-card/30 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className={`p-3 rounded-xl ${
                      activity.type === "challenge" ? "bg-primary/10" :
                      activity.type === "interview" ? "bg-secondary/10" :
                      "bg-yellow-500/10"
                    }`}>
                      {activity.type === "challenge" && <Code className="w-5 h-5 text-primary" />}
                      {activity.type === "interview" && <User className="w-5 h-5 text-secondary" />}
                      {activity.type === "badge" && <Award className="w-5 h-5 text-yellow-500" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activity.title}</span>
                        {activity.difficulty && (
                          <Badge variant="outline" className={`text-xs ${
                            activity.difficulty === "Easy" ? "text-green-500 border-green-500/30" :
                            activity.difficulty === "Medium" ? "text-yellow-500 border-yellow-500/30" :
                            "text-red-500 border-red-500/30"
                          }`}>
                            {activity.difficulty}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{activity.time}</div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-primary font-semibold">+{activity.xp} XP</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
