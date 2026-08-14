import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import SignUpViewPage from '@/features/auth/components/sign-up-view';

export const metadata: Metadata = {
  title: 'Authentication | Sign Up',
  description: 'Sign Up page for authentication.'
};

export default async function Page() {
  const session = await auth();
  if (session?.user) {
    redirect('/dashboard/overview');
  }
  return <SignUpViewPage />;
}
