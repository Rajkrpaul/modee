'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp'
import { toast } from 'sonner'
import {
  Loader2,
  Mail,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Gamepad2,
} from 'lucide-react'

function VerifyEmailContent() {
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isVerified, setIsVerified] = useState(false)
  
  const { verifyEmail, resendOTP } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  useEffect(() => {
    if (!email) {
      router.push('/signup')
    }
  }, [email, router])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Invalid OTP', {
        description: 'Please enter the complete 6-digit code.',
      })
      return
    }

    setIsVerifying(true)
    const result = await verifyEmail(email, otp)
    setIsVerifying(false)

    if (result.success) {
      setIsVerified(true)
      toast.success('Email verified!', {
        description: 'Your account is now active.',
      })
      setTimeout(() => router.push('/dashboard'), 2000)
    } else {
      toast.error('Verification failed', {
        description: result.message,
      })
      setOtp('')
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    setIsResending(true)
    const result = await resendOTP(email)
    setIsResending(false)

    if (result.success) {
      toast.success('OTP sent!', {
        description: 'Check your email for the new verification code.',
      })
      setResendCooldown(60)
    } else {
      toast.error('Failed to resend', {
        description: result.message,
      })
    }
  }

  useEffect(() => {
    if (otp.length === 6) {
      handleVerify()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp])

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
          <p className="text-muted-foreground mb-4">
            Redirecting you to the dashboard...
          </p>
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Gamepad2 className="w-6 h-6 text-primary" />
          </div>
          <span className="text-2xl font-bold">PrepQuest</span>
        </div>

        <Card className="glass border-border/50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>
              {"We've sent a 6-digit verification code to"}
              <br />
              <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isVerifying}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerify}
              className="w-full gap-2"
              disabled={otp.length !== 6 || isVerifying}
            >
              {isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {"Didn't receive the code?"}
              </p>
              <Button
                variant="ghost"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResending}
                className="gap-2"
              >
                {isResending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Make sure to check your spam folder if you do not see the email.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
