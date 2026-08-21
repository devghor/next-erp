import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getQueryClient } from '@/lib/query-client';

type CompanyState = {
  activeCompanyId: string | null;
  setActiveCompanyId: (id: string) => void;
};

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      activeCompanyId: null,
      setActiveCompanyId: (id) => {
        set({ activeCompanyId: id });
        // Central refetch point — switching company can change the scope of
        // any query in the app, so invalidate everything here rather than
        // having each feature thread the active company id into its own
        // query key. No naming convention required on the query-key side.
        getQueryClient().invalidateQueries();
      }
    }),
    { name: 'active-company' }
  )
);
