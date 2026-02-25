import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import LoginForm from '@/components/admin/LoginForm';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();
  if (session) {
    redirect('/admin/dashboard');
  }

  return <LoginForm />;
}
