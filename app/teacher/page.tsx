import { requireAuth } from '@/lib/supabase/auth';
import { TeacherDashboard } from '@/components/teacher/TeacherDashboard';

// Force dynamic rendering - never cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TeacherPage() {
  // Strict authentication guard - validates user and session
  // Automatically redirects to login if authentication fails
  const user = await requireAuth('/teacher');
  
  // Pass user data to client component for additional verification
  return <TeacherDashboard userId={user.id} userEmail={user.email || ''} />;
}
