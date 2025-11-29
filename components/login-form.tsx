'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useTabSession } from '@/lib/auth/useTabSession'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabSessionId = useTabSession()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!tabSessionId) {
      setError('Session initialization failed. Please refresh the page.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          tabSessionId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setError(`Too many login attempts. Please try again later.`)
          setRemainingAttempts(data.remainingAttempts || 0)
        } else {
          setError(data.error || 'Login failed')
          setRemainingAttempts(data.remainingAttempts)
        }
        return
      }

      // Check if password change is required
      if (data.user?.passwordChangeRequired) {
        router.push('/auth/update-password')
        return
      }

      // Redirect to the original destination or default to /teacher
      const redirectTo = searchParams.get('redirectTo') || '/teacher'
      router.push(redirectTo)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!tabSessionId}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!tabSessionId}
                />
              </div>
              {error && (
                <div className="space-y-1">
                  <p className="text-sm text-red-500">{error}</p>
                  {remainingAttempts !== null && remainingAttempts > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                    </p>
                  )}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading || !tabSessionId}>
                {!tabSessionId ? 'Initializing...' : isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
