'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { saleExchangesQueryOptions } from '../../api/queries';
import { useSaleExchangeFilters } from '../../hooks/use-sale-exchange-filters';
import { columns } from './columns';

export function ExchangesTable() {
  const filters = useSaleExchangeFilters();

  const { data, isPending, isFetching } = useQuery({
    ...saleExchangesQueryOptions(filters),
    placeholderData: keepPreviousData
  });

  const { table, applyColumnFilters, resetColumnFilters } = useDataTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.meta.last_page ?? 1,
    shallow: true
  });

  if (isPending) {
    return <ExchangesTableSkeleton />;
  }

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <DataTableToolbar table={table} onApplyFilters={applyColumnFilters} onResetFilters={resetColumnFilters} />
      {isFetching ? (
        <DataTableSkeleton columnCount={columns.length} withViewOptions={false} withPagination={false} filterCount={0} />
      ) : (
        <DataTable table={table} />
      )}
    </div>
  );
}

export function ExchangesTableSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4'>
      <div className='bg-muted h-10 w-full rounded' />
      <div className='bg-muted h-96 w-full rounded-lg' />
      <div className='bg-muted h-10 w-full rounded' />
    </div>
  );
}
