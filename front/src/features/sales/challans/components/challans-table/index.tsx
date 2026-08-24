'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useDataTable } from '@/hooks/use-data-table';
import { challansQueryOptions } from '../../api/queries';
import { useChallanFilters } from '../../hooks/use-challan-filters';
import { columns } from './columns';

export function ChallansTable() {
  const filters = useChallanFilters();

  const { data, isPending, isFetching } = useQuery({
    ...challansQueryOptions(filters),
    placeholderData: keepPreviousData
  });

  const { table } = useDataTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.meta.last_page ?? 1,
    shallow: true
  });

  if (isPending) {
    return <ChallansTableSkeleton />;
  }

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {isFetching ? (
        <DataTableSkeleton columnCount={columns.length} withViewOptions={false} withPagination={false} filterCount={0} />
      ) : (
        <DataTable table={table} />
      )}
    </div>
  );
}

export function ChallansTableSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4'>
      <div className='bg-muted h-96 w-full rounded-lg' />
    </div>
  );
}
