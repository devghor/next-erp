import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import SignInViewPage from '@/features/auth/components/sign-in-view';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default async function Page() {
  const session = await auth();
  if (session?.user) {
    redirect('/dashboard/overview');
  }
  return <SignInViewPage />;
}
