import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { can } from '@/lib/can';
import { PosShellLoader } from '@/features/sales/pos/components/pos-shell-loader';

export const metadata = {
  title: 'POS'
};

export default async function PosPage() {
  const session = await auth();

  if (!can(session?.permissions, 'ACCESS_SALE_POS')) {
    redirect('/dashboard/overview');
  }

  return <PosShellLoader />;
}
