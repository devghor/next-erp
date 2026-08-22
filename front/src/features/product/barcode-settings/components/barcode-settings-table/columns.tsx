'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import type { Column, ColumnDef } from '@tanstack/react-table';
import type { BarcodeSetting } from '../../api/types';
import { CellAction } from './cell-action';

export const columns: ColumnDef<BarcodeSetting>[] = [
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
    header: ({ column }: { column: Column<BarcodeSetting, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <span>{row.original.name}</span>
        {row.original.is_default && <Badge variant='secondary'>Default</Badge>}
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
    id: 'dimensions',
    header: 'Label Size',
    cell: ({ row }) => `${row.original.width} × ${row.original.height} mm`
  },
  {
    id: 'stickers_in_one_sheet',
    accessorKey: 'stickers_in_one_sheet',
    header: 'Labels / Sheet'
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
