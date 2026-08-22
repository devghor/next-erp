'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { formatDate } from '@/lib/format';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { Unit } from '../../api/types';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Unit>[] = [
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
    header: ({ column }: { column: Column<Unit, unknown> }) => (
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
    id: 'code',
    accessorKey: 'code',
    header: ({ column }: { column: Column<Unit, unknown> }) => (
      <DataTableColumnHeader column={column} title='Code' />
    ),
    meta: {
      label: 'Code',
      placeholder: 'Search code...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Unit, unknown> }) => (
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
    id: 'base_unit_name',
    accessorKey: 'base_unit_name',
    header: ({ column }: { column: Column<Unit, unknown> }) => (
      <DataTableColumnHeader column={column} title='Base Unit' />
    ),
    cell: ({ cell }) => cell.getValue<Unit['base_unit_name']>() ?? 'N/A'
  },
  {
    id: 'operator',
    accessorKey: 'operator',
    header: ({ column }: { column: Column<Unit, unknown> }) => (
      <DataTableColumnHeader column={column} title='Operator' />
    )
  },
  {
    id: 'operation_value',
    accessorKey: 'operation_value',
    header: ({ column }: { column: Column<Unit, unknown> }) => (
      <DataTableColumnHeader column={column} title='Operation Value' />
    )
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }: { column: Column<Unit, unknown> }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => formatDate(cell.getValue<Unit['created_at']>()),
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
