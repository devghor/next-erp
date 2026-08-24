'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

function PosShellSkeleton() {
  return (
    <div className='flex h-full w-full gap-3 p-3'>
      <div className='flex-1 space-y-3'>
        <Skeleton className='h-12 w-full' />
        <Skeleton className='h-full w-full' />
      </div>
      <Skeleton className='h-full w-[380px]' />
    </div>
  );
}

// Company-scoped data (products, customers, warehouses, POS settings, ...) is
// only resolvable client-side — X-Company-ID comes from the client-only
// company-store (see src/lib/api-client.ts). ssr:false must be called from
// within a Client Component (Next 16 disallows it in Server Components), so
// this loader exists purely to host that call, same as user-listing.tsx does
// for the settings/users feature.
const PosShellImpl = dynamic(() => import('./pos-shell').then((mod) => mod.PosShell), {
  ssr: false,
  loading: () => <PosShellSkeleton />
});

export function PosShellLoader() {
  return <PosShellImpl />;
}
