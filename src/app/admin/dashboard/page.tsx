import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect('/admin');
  }

  return <AdminDashboard username={session.username} />;
}
