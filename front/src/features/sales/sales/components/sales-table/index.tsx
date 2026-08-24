'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { salesQueryOptions } from '../../api/queries';
import { useSaleFilters } from '../../hooks/use-sale-filters';
import { columns } from './columns';
import { SalesTableActionBar } from './action-bar';

export function SalesTable() {
  const filters = useSaleFilters();

  const { data, isPending, isFetching } = useQuery({
    ...salesQueryOptions(filters),
    placeholderData: keepPreviousData
  });

  const { table, applyColumnFilters, resetColumnFilters } = useDataTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.meta.last_page ?? 1,
    shallow: true,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  if (isPending) {
    return <SalesTableSkeleton />;
  }

  const hasSelection = table.getFilteredSelectedRowModel().rows.length > 0;

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <DataTableToolbar table={table} onApplyFilters={applyColumnFilters} onResetFilters={resetColumnFilters}>
        {hasSelection && <SalesTableActionBar table={table} />}
      </DataTableToolbar>
      {isFetching ? (
        <DataTableSkeleton columnCount={columns.length} withViewOptions={false} withPagination={false} filterCount={0} />
      ) : (
        <DataTable table={table} />
      )}
    </div>
  );
}

export function SalesTableSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4'>
      <div className='bg-muted h-10 w-full rounded' />
      <div className='bg-muted h-96 w-full rounded-lg' />
      <div className='bg-muted h-10 w-full rounded' />
    </div>
  );
}
