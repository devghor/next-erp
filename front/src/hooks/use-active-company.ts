'use client';

import { useSession } from 'next-auth/react';
import * as React from 'react';
import { useCompanyStore } from '@/store/company-store';

export function useActiveCompany() {
  const { data: session, status } = useSession();
  const companies = React.useMemo(() => session?.user?.companies ?? [], [session]);
  const activeCompanyId = useCompanyStore((state) => state.activeCompanyId);
  const setActiveCompanyId = useCompanyStore((state) => state.setActiveCompanyId);

  const activeCompany = companies.find((company) => company.id === activeCompanyId) ?? companies[0];

  React.useEffect(() => {
    const isStale = activeCompanyId && !companies.some((company) => company.id === activeCompanyId);
    if ((!activeCompanyId || isStale) && companies[0]) {
      setActiveCompanyId(companies[0].id);
    }
  }, [activeCompanyId, companies, setActiveCompanyId]);

  return { companies, activeCompany, setActiveCompanyId, isLoading: status === 'loading' };
}
