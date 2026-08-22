'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { CustomField } from '../../api/types';
import { CellAction } from './cell-action';

export const columns: ColumnDef<CustomField>[] = [
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
    header: ({ column }: { column: Column<CustomField, unknown> }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    meta: { label: 'ID', placeholder: 'Search id...', variant: 'text' as const, icon: Icons.text },
    enableColumnFilter: true
  },
  {
    id: 'belongs_to',
    accessorKey: 'belongs_to',
    header: ({ column }: { column: Column<CustomField, unknown> }) => (
      <DataTableColumnHeader column={column} title='Belongs To' />
    ),
    cell: ({ cell }) => <Badge variant='outline'>{cell.getValue<string>()}</Badge>,
    meta: {
      label: 'Belongs To',
      placeholder: 'Search belongs to...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<CustomField, unknown> }) => (
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
    header: ({ column }: { column: Column<CustomField, unknown> }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ cell }) => <span className='capitalize'>{cell.getValue<string>().replace('_', ' ')}</span>
  },
  {
    id: 'is_required',
    accessorKey: 'is_required',
    header: ({ column }: { column: Column<CustomField, unknown> }) => (
      <DataTableColumnHeader column={column} title='Required' />
    ),
    cell: ({ cell }) => (cell.getValue<boolean>() ? 'Yes' : 'No')
  },
  {
    id: 'is_table',
    accessorKey: 'is_table',
    header: ({ column }: { column: Column<CustomField, unknown> }) => (
      <DataTableColumnHeader column={column} title='Table Column' />
    ),
    cell: ({ cell }) => (cell.getValue<boolean>() ? 'Yes' : 'No')
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }: { column: Column<CustomField, unknown> }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => formatDate(cell.getValue<CustomField['created_at']>()),
    meta: { label: 'Created At', variant: 'dateRange' as const, icon: Icons.calendar },
    enableColumnFilter: true
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
