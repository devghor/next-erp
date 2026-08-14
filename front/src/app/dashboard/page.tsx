import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    return redirect('/auth/sign-in');
  }
  redirect('/dashboard/overview');
}
