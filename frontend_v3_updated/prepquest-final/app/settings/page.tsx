'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import {
  User,
  Mail,
  Lock,
  Bell,
  Palette,
  Volume2,
  Eye,
  Trash2,
  Loader2,
  Camera,
  Save,
  Shield,
  Settings,
  Gamepad2,
  ArrowLeft,
  LogOut,
} from 'lucide-react'

export default function SettingsPage() {
  const { user, isLoading: authLoading, updateUser, changePassword, deleteAccount, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  // Profile state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Preferences state
  const [notifications, setNotifications] = useState(true)
  const [soundEffects, setSoundEffects] = useState(true)
  const [streakVisibility, setStreakVisibility] = useState(true)

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setNotifications(user.preferences?.notifications ?? true)
      setSoundEffects(user.preferences?.soundEffects ?? true)
      setStreakVisibility(user.preferences?.streakVisibility ?? true)
    }
  }, [user])

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }

    setIsSavingProfile(true)
    const result = await updateUser({ name: name.trim() })
    setIsSavingProfile(false)

    if (result.success) {
      toast.success('Profile updated!')
    } else {
      toast.error(result.message || 'Failed to update profile')
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required')
      return
    }

    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setIsChangingPassword(true)
    const result = await changePassword(currentPassword, newPassword)
    setIsChangingPassword(false)

    if (result.success) {
      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      toast.error(result.message || 'Failed to change password')
    }
  }

  const handleSavePreferences = async () => {
    const result = await updateUser({
      preferences: {
        theme: theme as 'light' | 'dark' | 'system',
        notifications,
        soundEffects,
        streakVisibility,
      },
    })

    if (result.success) {
      toast.success('Preferences saved!')
    } else {
      toast.error(result.message || 'Failed to save preferences')
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password')
      return
    }

    setIsDeleting(true)
    const result = await deleteAccount(deletePassword)
    setIsDeleting(false)

    if (result.success) {
      toast.success('Account deleted')
      router.push('/login')
    } else {
      toast.error(result.message || 'Failed to delete account')
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center neon-glow">
                <Gamepad2 className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold">PrepQuest</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
            <Avatar className="w-10 h-10 border-2 border-primary/30">
              <AvatarImage src={user.profilePicture} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {getInitials(user.name || user.email)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary" />
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your account and preferences
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="glass w-full justify-start overflow-x-auto">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="account" className="gap-2">
                <Shield className="w-4 h-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2">
                <Settings className="w-4 h-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="danger" className="gap-2 text-destructive">
                <Trash2 className="w-4 h-4" />
                Danger Zone
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and profile picture
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={user.profilePicture} />
                        <AvatarFallback className="text-2xl bg-primary/20">
                          {getInitials(user.name || user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors">
                        <Camera className="w-4 h-4 text-primary-foreground" />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-semibold">{user.name || 'Anonymous'}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Level {user.level} | {user.xp} XP
                      </p>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Email (read-only) */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={email}
                        disabled
                        className="pl-10 opacity-60"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Contact support to change your email address
                    </p>
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="gap-2"
                  >
                    {isSavingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account">
              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="gap-2"
                  >
                    {isChangingPassword ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <div className="space-y-6">
                {/* Appearance */}
                <Card className="glass border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Appearance
                    </CardTitle>
                    <CardDescription>
                      Customize how PrepQuest looks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Theme</Label>
                        <p className="text-sm text-muted-foreground">
                          Choose your preferred theme
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {(['light', 'dark', 'system'] as const).map((t) => (
                          <Button
                            key={t}
                            variant={theme === t ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTheme(t)}
                            className="capitalize"
                          >
                            {t}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="glass border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notifications
                    </CardTitle>
                    <CardDescription>
                      Manage your notification preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about challenges and achievements
                        </p>
                      </div>
                      <Switch
                        checked={notifications}
                        onCheckedChange={setNotifications}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Gamification */}
                <Card className="glass border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5" />
                      Gamification
                    </CardTitle>
                    <CardDescription>
                      Customize your gaming experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4" />
                          Sound Effects
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Play sounds for XP gains and achievements
                        </p>
                      </div>
                      <Switch
                        checked={soundEffects}
                        onCheckedChange={setSoundEffects}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Streak Visibility
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Show your streak on your public profile
                        </p>
                      </div>
                      <Switch
                        checked={streakVisibility}
                        onCheckedChange={setStreakVisibility}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={handleSavePreferences} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Preferences
                </Button>
              </div>
            </TabsContent>

            {/* Danger Zone Tab */}
            <TabsContent value="danger">
              <Card className="glass border-destructive/30 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-destructive">Delete Account</CardTitle>
                  <CardDescription>
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account, all your progress, XP, badges, and remove your data from
                          our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-2 py-4">
                        <Label htmlFor="deletePassword">Enter your password to confirm</Label>
                        <Input
                          id="deletePassword"
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          placeholder="Your password"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletePassword('')}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={isDeleting || !deletePassword}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Delete Account'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <div className="mt-6 pt-6 border-t border-border">
                    <Button variant="outline" onClick={handleLogout} className="gap-2">
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}
