import { redirect } from 'next/navigation'

export default function Page() {
  // Redirect to login page - sign-up is invite-only
  redirect('/auth/login')
}
