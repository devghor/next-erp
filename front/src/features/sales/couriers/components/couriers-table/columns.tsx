'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { Courier } from '../../api/types';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Courier>[] = [
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
    header: ({ column }: { column: Column<Courier, unknown> }) => (
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
    header: ({ column }: { column: Column<Courier, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
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
    id: 'type',
    accessorKey: 'type',
    header: ({ column }: { column: Column<Courier, unknown> }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ cell }) => (
      <Badge variant='outline' className='capitalize'>
        {cell.getValue<Courier['type']>()}
      </Badge>
    ),
    meta: {
      label: 'Type',
      variant: 'select' as const,
      options: [
        { label: 'Steadfast', value: 'steadfast' },
        { label: 'Pathao', value: 'pathao' },
        { label: 'Manual', value: 'manual' }
      ],
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'phone_number',
    accessorKey: 'phone_number',
    header: ({ column }: { column: Column<Courier, unknown> }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    meta: {
      label: 'Phone',
      variant: 'text' as const,
      icon: Icons.phone
    }
  },
  {
    id: 'is_active',
    accessorKey: 'is_active',
    header: ({ column }: { column: Column<Courier, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => (
      <Badge variant={cell.getValue<boolean>() ? 'default' : 'secondary'}>
        {cell.getValue<boolean>() ? 'Active' : 'Inactive'}
      </Badge>
    )
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }: { column: Column<Courier, unknown> }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => formatDate(cell.getValue<Courier['created_at']>()),
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
