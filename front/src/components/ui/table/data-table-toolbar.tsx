'use client';

import type { Column, ColumnFiltersState, Table } from '@tanstack/react-table';
import * as React from 'react';

import { DataTableDateFilter } from '@/components/ui/table/data-table-date-filter';
import { DataTableFacetedFilter } from '@/components/ui/table/data-table-faceted-filter';
import { DataTableSliderFilter } from '@/components/ui/table/data-table-slider-filter';
import { DataTableViewOptions } from '@/components/ui/table/data-table-view-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

interface DataTableToolbarProps<TData> extends React.ComponentProps<'div'> {
  table: Table<TData>;
  onApplyFilters?: () => void;
  onResetFilters?: () => void;
}

export function DataTableToolbar<TData>({
  table,
  children,
  className,
  onApplyFilters,
  onResetFilters,
  ...props
}: DataTableToolbarProps<TData>) {
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [appliedFilters, setAppliedFilters] = React.useState<ColumnFiltersState>(
    () => table.getState().columnFilters
  );
  const filterCount = appliedFilters.length;
  const isFiltered = filterCount > 0;

  const columns = React.useMemo(
    () => table.getAllColumns().filter((column) => column.getCanFilter()),
    [table]
  );

  const activeFilters = React.useMemo(() => {
    return appliedFilters
      .map((filter) => {
        const column = table.getColumn(filter.id);
        const columnMeta = column?.columnDef.meta;
        const label = columnMeta?.label ?? filter.id;

        const rawValues = Array.isArray(filter.value) ? filter.value : [filter.value];
        const displayValue = rawValues
          .map((rawValue) => {
            const option = columnMeta?.options?.find((opt) => opt.value === rawValue);
            return option?.label ?? String(rawValue);
          })
          .join(', ');

        return { id: filter.id, label, displayValue };
      })
      .filter((filter) => filter.displayValue);
  }, [table, appliedFilters]);

  const revertDraftToApplied = React.useCallback(() => {
    for (const column of columns) {
      const applied = appliedFilters.find((filter) => filter.id === column.id);
      column.setFilterValue(applied?.value);
    }
  }, [columns, appliedFilters]);

  const onFilterOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        revertDraftToApplied();
      }
      setFilterOpen(open);
    },
    [revertDraftToApplied]
  );

  const onReset = React.useCallback(() => {
    if (onResetFilters) {
      onResetFilters();
    } else {
      table.resetColumnFilters();
    }
    setAppliedFilters([]);
  }, [table, onResetFilters]);

  const onApply = React.useCallback(() => {
    onApplyFilters?.();
    setAppliedFilters(table.getState().columnFilters);
    setFilterOpen(false);
  }, [table, onApplyFilters]);

  const onRemoveFilter = React.useCallback(
    (columnId: string) => {
      table.getColumn(columnId)?.setFilterValue(undefined);
      onApplyFilters?.();
      setAppliedFilters((prev) => prev.filter((filter) => filter.id !== columnId));
    },
    [table, onApplyFilters]
  );

  return (
    <div
      role='toolbar'
      aria-orientation='horizontal'
      className={cn('flex w-full flex-col gap-2 p-1', className)}
      {...props}
    >
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            aria-label='Toggle filters'
            aria-pressed={filterOpen}
            variant='outline'
            size='sm'
            className='border-dashed'
            onClick={() => setFilterOpen(true)}
          >
            <Icons.filter />
            Filter
            {isFiltered && (
              <span className='bg-primary text-primary-foreground rounded-full px-1.5 text-xs'>
                {filterCount}
              </span>
            )}
          </Button>
          {activeFilters.map((filter) => (
            <span
              key={filter.id}
              className='bg-muted text-muted-foreground inline-flex max-w-60 items-center gap-1 rounded-md py-1 pr-1 pl-2 text-xs'
            >
              <span className='truncate'>
                {filter.label}: {filter.displayValue}
              </span>
              <button
                type='button'
                aria-label={`Remove ${filter.label} filter`}
                onClick={() => onRemoveFilter(filter.id)}
                className='hover:bg-accent rounded-sm p-0.5'
              >
                <Icons.close className='size-3' />
              </button>
            </span>
          ))}
          {isFiltered && (
            <Button aria-label='Clear all filters' variant='ghost' size='sm' onClick={onReset}>
              <Icons.close />
              Clear All
            </Button>
          )}
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          {children}
          <DataTableViewOptions table={table} />
        </div>
      </div>

      <Sheet open={filterOpen} onOpenChange={onFilterOpenChange}>
        <SheetContent side='right' className='flex w-full flex-col sm:max-w-sm'>
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Narrow down the results below.</SheetDescription>
          </SheetHeader>
          <div className='flex flex-1 flex-col gap-4 overflow-auto px-4'>
            {columns.map((column) => (
              <div key={column.id} className='flex flex-col gap-1.5'>
                <span className='text-sm font-medium'>
                  {column.columnDef.meta?.label ?? column.id}
                </span>
                <DataTableToolbarFilter column={column} />
              </div>
            ))}
          </div>
          <div className='flex items-center gap-2 border-t p-4'>
            {onApplyFilters && (
              <Button aria-label='Apply filters' className='flex-1' onClick={onApply}>
                <Icons.check />
                Apply
              </Button>
            )}
            {isFiltered && (
              <Button
                aria-label='Reset filters'
                variant='outline'
                className='border-dashed'
                onClick={onReset}
              >
                <Icons.close />
                Reset
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
interface DataTableToolbarFilterProps<TData> {
  column: Column<TData>;
}

function DataTableToolbarFilter<TData>({ column }: DataTableToolbarFilterProps<TData>) {
  {
    const columnMeta = column.columnDef.meta;

    const onFilterRender = React.useCallback(() => {
      if (!columnMeta?.variant) return null;

      switch (columnMeta.variant) {
        case 'text':
          return (
            <Input
              placeholder={columnMeta.placeholder ?? columnMeta.label}
              aria-label={columnMeta.label ?? 'Filter'}
              value={(column.getFilterValue() as string) ?? ''}
              onChange={(event) => column.setFilterValue(event.target.value)}
              className='h-8 w-full'
            />
          );

        case 'number':
          return (
            <div className='relative w-full'>
              <Input
                type='number'
                inputMode='numeric'
                placeholder={columnMeta.placeholder ?? columnMeta.label}
                aria-label={columnMeta.label ?? 'Filter'}
                value={(column.getFilterValue() as string) ?? ''}
                onChange={(event) => column.setFilterValue(event.target.value)}
                className={cn('h-8 w-full', columnMeta.unit && 'pr-8')}
              />
              {columnMeta.unit && (
                <span className='bg-accent text-muted-foreground absolute top-0 right-0 bottom-0 flex items-center rounded-r-md px-2 text-sm'>
                  {columnMeta.unit}
                </span>
              )}
            </div>
          );

        case 'range':
          return <DataTableSliderFilter column={column} title={columnMeta.label ?? column.id} />;

        case 'date':
        case 'dateRange':
          return (
            <DataTableDateFilter
              column={column}
              title={columnMeta.label ?? column.id}
              multiple={columnMeta.variant === 'dateRange'}
            />
          );

        case 'select':
        case 'multiSelect':
          return (
            <DataTableFacetedFilter
              column={column}
              title={columnMeta.label ?? column.id}
              options={columnMeta.options ?? []}
              multiple={columnMeta.variant === 'multiSelect'}
            />
          );

        default:
          return null;
      }
    }, [column, columnMeta]);

    return onFilterRender();
  }
}
