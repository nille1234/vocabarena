import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TeacherDashboard } from '@/components/teacher/TeacherDashboard';

export default async function TeacherPage() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  // Strict authentication check - redirect if no user or error
  if (!user || error) {
    redirect('/auth/login?redirectTo=/teacher');
  }
  
  return <TeacherDashboard />;
}
