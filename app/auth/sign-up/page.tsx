import { redirect } from 'next/navigation'

export default function Page() {
  // This redirect is handled by middleware now to avoid error overlay
  // Sign-up is invite-only, so redirect to login
  redirect('/auth/login')
}
