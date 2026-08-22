'use client';

import type { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { can } from '@/lib/can';

interface CanProps {
  permission: string | string[];
  children: ReactNode;
}

export function Can({ permission, children }: CanProps) {
  const { data: session } = useSession();
  return can(session?.permissions, permission) ? <>{children}</> : null;
}
