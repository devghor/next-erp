'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { Brand } from '../../api/types';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Brand>[] = [
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
    id: 'id',
    accessorKey: 'id',
    header: ({ column }: { column: Column<Brand, unknown> }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    meta: {
      label: 'ID',
      placeholder: 'Search id...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Brand, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <Avatar size='sm'>
          <AvatarImage src={row.original.image ?? undefined} alt={row.original.name} />
          <AvatarFallback>{row.original.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span>{row.original.name}</span>
      </div>
    ),
    meta: {
      label: 'Name',
      placeholder: 'Search name...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }: { column: Column<Brand, unknown> }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => formatDate(cell.getValue<Brand['created_at']>()),
    meta: {
      label: 'Created At',
      variant: 'dateRange' as const,
      icon: Icons.calendar
    },
    enableColumnFilter: true
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
