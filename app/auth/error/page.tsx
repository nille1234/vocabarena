import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'

export default async function Page({ searchParams }: { searchParams: Promise<{ error: string }> }) {
  const params = await searchParams
  const errorMessage = params?.error || 'An unspecified error occurred.'

  // Provide helpful messages for common errors
  const getHelpfulMessage = (error: string) => {
    if (error.includes('Invalid confirmation link') || error.includes('token')) {
      return 'The confirmation link may have expired or is invalid. Please request a new confirmation email.'
    }
    if (error.includes('already registered') || error.includes('already exists')) {
      return 'This email is already registered. Try logging in instead.'
    }
    return 'Please try again or contact support if the problem persists.'
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-2xl">Authentication Error</CardTitle>
              </div>
              <CardDescription>
                {getHelpfulMessage(errorMessage)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">
                  <strong>Error details:</strong> {errorMessage}
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link href="/auth/login">Go to Login</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/auth/sign-up">Create New Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
