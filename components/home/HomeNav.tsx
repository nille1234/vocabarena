'use client'

import { Button } from "@/components/ui/button"
import { Sparkles, LogIn, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function HomeNav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    // Check for valid session
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth check error:', error)
          setIsAuthenticated(false)
        } else {
          // Only set authenticated if we have a valid session
          setIsAuthenticated(!!session)
        }
      } catch (err) {
        console.error('Auth check failed:', err)
        setIsAuthenticated(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <nav className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-heading font-bold">Quizzy</span>
          </div>
          <div className="flex items-center gap-3">
            {isChecking ? (
              <div className="h-9 w-20" />
            ) : isAuthenticated ? (
              <Button variant="default" size="sm" asChild>
                <Link href="/teacher">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
