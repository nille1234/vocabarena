import { LogoutButton } from '@/components/logout-button'
import { requireAuth } from '@/lib/supabase/auth'

export default async function ProtectedPage() {
  // Strict authentication guard - validates user and session
  const user = await requireAuth('/protected')

  return (
    <div className="flex h-svh w-full items-center justify-center gap-2">
      <p>
        Hello <span>{user.email}</span>
      </p>
      <LogoutButton />
    </div>
  )
}
