import { requireAuth } from '@/lib/supabase/auth';
import { ClassDetailView } from '@/components/teacher/ClassDetailView';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ClassPageProps {
  params: {
    classId: string;
  };
}

export default async function ClassPage({ params }: ClassPageProps) {
  // Strict authentication guard
  const user = await requireAuth('/teacher');
  
  return <ClassDetailView classId={params.classId} userId={user.id} />;
}
