'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useTabSession, addTabSessionHeader } from '@/lib/auth/useTabSession'
import { useState } from 'react'

export function LogoutButton() {
  const router = useRouter()
  const tabSessionId = useTabSession()
  const [isLoading, setIsLoading] = useState(false)

  const logout = async () => {
    setIsLoading(true)
    
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: addTabSessionHeader({}, tabSessionId),
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
      router.push('/auth/login')
      router.refresh()
    }
  }

  return (
    <Button onClick={logout} disabled={isLoading}>
      {isLoading ? 'Logging out...' : 'Logout'}
    </Button>
  )
}
