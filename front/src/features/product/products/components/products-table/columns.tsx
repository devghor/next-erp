'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { Product } from '../../api/types';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Product>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked === true)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(checked === true)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        {row.original.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={row.original.images[0]} alt={row.original.name} className='h-8 w-8 rounded object-cover' />
        ) : (
          <div className='bg-muted flex h-8 w-8 items-center justify-center rounded'>
            <Icons.product className='text-muted-foreground h-4 w-4' />
          </div>
        )}
        <span>{row.original.name}</span>
      </div>
    ),
    meta: {
      label: 'Name',
      placeholder: 'Search name or code...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Code' />
    )
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ cell }) => <Badge variant='outline' className='capitalize'>{cell.getValue<string>()}</Badge>
  },
  {
    id: 'category_name',
    accessorKey: 'category_name',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Category' />
    ),
    cell: ({ row }) => row.original.category_name ?? 'N/A'
  },
  {
    id: 'brand_name',
    accessorKey: 'brand_name',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Brand' />
    ),
    cell: ({ row }) => row.original.brand_name ?? 'N/A'
  },
  {
    id: 'stock',
    accessorKey: 'stock',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Stock' />
    ),
    cell: ({ row }) => {
      const product = row.original;
      const isLow = product.stock <= product.alert_quantity;
      return (
        <span className={isLow ? 'text-destructive font-medium' : undefined}>
          {product.stock} {product.unit_name ?? ''}
        </span>
      );
    }
  },
  {
    id: 'price',
    accessorKey: 'price',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ row }) => Number(row.original.price).toFixed(2)
  },
  {
    id: 'cost',
    accessorKey: 'cost',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Cost' />
    ),
    cell: ({ row }) => Number(row.original.cost).toFixed(2)
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => formatDate(cell.getValue<Product['created_at']>()),
    meta: { label: 'Created At', variant: 'dateRange' as const, icon: Icons.calendar },
    enableColumnFilter: true
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
