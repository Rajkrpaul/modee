"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { useGame } from "@/lib/game-context"
import { challenges } from "@/lib/challenges-data"
import {
  User, Trophy, Flame, Target, Code, BookOpen,
  Calendar, MapPin, Mail, Github, Linkedin, Globe,
  Edit, Settings, Award, TrendingUp, Clock,
  CheckCircle2, Star, Zap, Save, X, GraduationCap,
} from "lucide-react"
import Link from "next/link"

// Skills data
const skills = [
  { name: "Arrays & Strings", level: 85, problems: 45 },
  { name: "Linked Lists", level: 72, problems: 28 },
  { name: "Trees & Graphs", level: 65, problems: 32 },
  { name: "Dynamic Programming", level: 48, problems: 15 },
  { name: "System Design", level: 55, problems: 12 },
  { name: "SQL & Databases", level: 70, problems: 20 },
]

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

// Build real activity data from user history
function buildActivityData(user: any) {
  const map = new Map<string, number>()

  // From completed challenges
  user?.completedChallenges?.forEach((c: any) => {
    const d = c.completedAt?.slice(0, 10)
    if (d) map.set(d, (map.get(d) || 0) + 2)
  })

  // From interview history
  user?.interviewHistory?.forEach((h: any) => {
    const d = h.completedAt?.slice(0, 10)
    if (d) map.set(d, (map.get(d) || 0) + 3)
  })

  return Array.from({ length: 365 }, (_, i) => {
    const date = new Date(Date.now() - (364 - i) * 24 * 60 * 60 * 1000)
    const key = date.toISOString().slice(0, 10)
    return { date, count: map.get(key) || 0 }
  })
}

function ActivityHeatmap({ user }: { user: any }) {
  const activityData = buildActivityData(user)

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

  const totalActiveDays = activityData.filter(d => d.count > 0).length

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-max">
          {weeks.slice(-52).map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`w-3 h-3 rounded-sm ${getIntensity(day.count)} hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer`}
                  title={`${day.date.toLocaleDateString()}: ${day.count} activities`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">{totalActiveDays} active days in the last year</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              {["bg-muted/30", "bg-primary/30", "bg-primary/50", "bg-primary/70", "bg-primary"].map((c, i) => (
                <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Normalize URL — add https:// if missing
function normalizeUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

function formatGithubUrl(val: string) {
  if (!val) return ''
  // If it's just a username like "johndoe" or "github.com/johndoe"
  const clean = val.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/^@/, '').trim()
  return `https://github.com/${clean}`
}

function formatLinkedinUrl(val: string) {
  if (!val) return ''
  const clean = val.replace(/^https?:\/\/(www\.)?linkedin\.com\/(in\/)?/, '').replace(/^@/, '').trim()
  return `https://linkedin.com/in/${clean}`
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { completedChallengeIds } = useGame()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [editGithub, setEditGithub] = useState('')
  const [editLinkedin, setEditLinkedin] = useState('')
  const [editPortfolio, setEditPortfolio] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editCollege, setEditCollege] = useState('')

  useEffect(() => {
    if (user) {
      setEditGithub(user.github || '')
      setEditLinkedin(user.linkedin || '')
      setEditPortfolio(user.portfolio || '')
      setEditBio(user.bio || '')
      setEditLocation(user.location || '')
      setEditCollege(user.college || '')
    }
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateUser({
      github: editGithub,
      linkedin: editLinkedin,
      portfolio: editPortfolio,
      bio: editBio,
      location: editLocation,
      college: editCollege,
    })
    setIsSaving(false)
    if (result.success) {
      toast.success('Profile updated!')
      setIsEditing(false)
    } else {
      toast.error(result.message || 'Failed to save')
    }
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const xp = user?.xp ?? user?.gameStats?.xp ?? 0
  const streak = user?.streak ?? user?.gameStats?.streak ?? 0
  const challengesCompleted = completedChallengeIds.size
  const interviewsCompleted = user?.gameStats?.interviewsCompleted ?? user?.interviewHistory?.length ?? 0
  const level = user?.level ?? 1
  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'

  // Real problem stats by difficulty
  const easySolved = challenges.filter(c => c.difficulty === 'easy' && completedChallengeIds.has(c.id)).length
  const mediumSolved = challenges.filter(c => c.difficulty === 'medium' && completedChallengeIds.has(c.id)).length
  const hardSolved = challenges.filter(c => c.difficulty === 'hard' && completedChallengeIds.has(c.id)).length
  const easyTotal = challenges.filter(c => c.difficulty === 'easy').length
  const mediumTotal = challenges.filter(c => c.difficulty === 'medium').length
  const hardTotal = challenges.filter(c => c.difficulty === 'hard').length

  // Recent activity from real history
  const recentActivity = [
    ...(user?.completedChallenges?.slice(-3).reverse().map((c: any) => ({
      type: 'challenge', title: c.challengeId, difficulty: 'Medium', xp: c.earnedXp,
      time: new Date(c.completedAt).toLocaleDateString(),
    })) || []),
    ...(user?.interviewHistory?.slice(-2).reverse().map((h: any) => ({
      type: 'interview', title: `${h.role} Interview`, difficulty: h.difficulty, xp: h.earnedXp,
      time: new Date(h.completedAt).toLocaleDateString(),
    })) || []),
  ].slice(0, 5)

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <Card className="bg-card/30 border-border/50 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary via-secondary to-primary opacity-80" />
          <CardContent className="relative pt-0 pb-6">
            <div className="absolute -top-16 left-6">
              <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                <AvatarImage src={user?.profilePicture} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-3xl font-bold">
                  {getInitials(user?.name || user?.email || 'U')}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex justify-end pt-4 gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4" />Cancel
                  </Button>
                  <Button size="sm" className="gap-2" onClick={handleSave} disabled={isSaving}>
                    <Save className="w-4 h-4" />{isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/settings">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Settings className="w-4 h-4" />Settings
                    </Button>
                  </Link>
                  <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4" />Edit Profile
                  </Button>
                </>
              )}
            </div>

            <div className="mt-8 space-y-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{user?.name || 'Anonymous'}</h1>
                  <Badge className="bg-secondary/20 text-secondary">Level {level}</Badge>
                </div>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>

              {isEditing ? (
                <div className="space-y-3 max-w-xl">
                  <div>
                    <Label className="text-xs text-muted-foreground">Bio</Label>
                    <Input value={editBio} onChange={e => setEditBio(e.target.value)} placeholder="Tell us about yourself..." className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Location</Label>
                      <Input value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="City, Country" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">College / University</Label>
                      <Input value={editCollege} onChange={e => setEditCollege(e.target.value)} placeholder="Your institution" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">GitHub (username or URL)</Label>
                      <Input value={editGithub} onChange={e => setEditGithub(e.target.value)} placeholder="johndoe" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">LinkedIn (username or URL)</Label>
                      <Input value={editLinkedin} onChange={e => setEditLinkedin(e.target.value)} placeholder="johndoe" className="mt-1" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground">Portfolio URL</Label>
                      <Input value={editPortfolio} onChange={e => setEditPortfolio(e.target.value)} placeholder="https://yoursite.com" className="mt-1" />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {user?.bio && <p className="text-foreground/80 max-w-2xl">{user.bio}</p>}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {user?.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{user.location}</span>
                    )}
                    {user?.college && (
                      <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" />{user.college}</span>
                    )}
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Joined {joinedDate}</span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {user?.github && (
                      <a href={formatGithubUrl(user.github)} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2 hover:border-primary/50">
                          <Github className="w-4 h-4" />GitHub
                        </Button>
                      </a>
                    )}
                    {user?.linkedin && (
                      <a href={formatLinkedinUrl(user.linkedin)} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2 hover:border-primary/50">
                          <Linkedin className="w-4 h-4" />LinkedIn
                        </Button>
                      </a>
                    )}
                    {user?.portfolio && (
                      <a href={normalizeUrl(user.portfolio)} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2 hover:border-primary/50">
                          <Globe className="w-4 h-4" />Portfolio
                        </Button>
                      </a>
                    )}
                    {!user?.github && !user?.linkedin && !user?.portfolio && !isEditing && (
                      <Button variant="outline" size="sm" className="gap-2 opacity-60" onClick={() => setIsEditing(true)}>
                        <Edit className="w-3 h-3" />Add your social links
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Zap, color: "text-primary", bg: "bg-primary/10", value: xp.toLocaleString(), label: "Total XP" },
            { icon: Code, color: "text-secondary", bg: "bg-secondary/10", value: challengesCompleted, label: "Problems Solved" },
            { icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10", value: streak, label: "Day Streak" },
            { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/10", value: interviewsCompleted, label: "Interviews Done" },
          ].map((stat, i) => (
            <Card key={i} className="bg-card/30 border-border/50">
              <CardContent className="p-4 text-center">
                <div className={`p-3 rounded-xl ${stat.bg} w-fit mx-auto mb-2`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity Heatmap */}
        <Card className="bg-card/30 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityHeatmap user={user} />
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="skills" className="space-y-6">
          <TabsList className="bg-card/50 border border-border p-1">
            <TabsTrigger value="skills" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Skills</TabsTrigger>
            <TabsTrigger value="badges" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Badges</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="space-y-4">
            <Card className="bg-card/30 border-border/50">
              <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-primary" />Skill Progress</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {skills.map(skill => (
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
            <Card className="bg-card/30 border-border/50">
              <CardHeader><CardTitle className="flex items-center gap-2"><Code className="w-5 h-5 text-primary" />Problem Statistics</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="text-3xl font-bold text-green-500">{easySolved}</div>
                    <div className="text-sm text-muted-foreground">Easy</div>
                    <div className="text-xs text-muted-foreground mt-1">{easySolved}/{easyTotal}</div>
                    <Progress value={easyTotal > 0 ? (easySolved / easyTotal) * 100 : 0} className="h-1 mt-2" />
                  </div>
                  <div className="text-center p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <div className="text-3xl font-bold text-yellow-500">{mediumSolved}</div>
                    <div className="text-sm text-muted-foreground">Medium</div>
                    <div className="text-xs text-muted-foreground mt-1">{mediumSolved}/{mediumTotal}</div>
                    <Progress value={mediumTotal > 0 ? (mediumSolved / mediumTotal) * 100 : 0} className="h-1 mt-2" />
                  </div>
                  <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div className="text-3xl font-bold text-red-500">{hardSolved}</div>
                    <div className="text-sm text-muted-foreground">Hard</div>
                    <div className="text-xs text-muted-foreground mt-1">{hardSolved}/{hardTotal}</div>
                    <Progress value={hardTotal > 0 ? (hardSolved / hardTotal) * 100 : 0} className="h-1 mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            <Card className="bg-card/30 border-border/50">
              <CardHeader><CardTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-primary" />Earned Badges</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {badges.filter(b => b.earned).map(badge => (
                    <div key={badge.id} className="p-4 rounded-xl bg-card/50 border border-primary/30 text-center hover:border-primary transition-all cursor-pointer" title={badge.description}>
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <div className="font-semibold text-sm">{badge.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{badge.date}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/30 border-border/50">
              <CardHeader><CardTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-muted-foreground" />In Progress</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {badges.filter(b => !b.earned).map(badge => (
                    <div key={badge.id} className="p-4 rounded-xl bg-muted/20 border border-border text-center opacity-70 hover:opacity-100 transition-all cursor-pointer" title={badge.description}>
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
              <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" />Recent Activity</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No activity yet. Start solving challenges!</p>
                  </div>
                ) : recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all">
                    <div className={`p-3 rounded-xl ${activity.type === 'challenge' ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                      {activity.type === 'challenge' ? <Code className="w-5 h-5 text-primary" /> : <User className="w-5 h-5 text-secondary" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{activity.title}</span>
                        {activity.difficulty && (
                          <Badge variant="outline" className={`text-xs ${
                            activity.difficulty === 'Easy' ? 'text-green-500 border-green-500/30' :
                            activity.difficulty === 'Medium' ? 'text-yellow-500 border-yellow-500/30' :
                            'text-red-500 border-red-500/30'
                          }`}>{activity.difficulty}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{activity.time}</div>
                    </div>
                    <div className="text-primary font-semibold">+{activity.xp} XP</div>
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