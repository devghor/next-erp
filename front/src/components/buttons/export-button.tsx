'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';

interface ExportButtonProps {
  onExportPdf: () => void;
  onExportExcel: () => void;
  isPending?: boolean;
}

export function ExportButton({ onExportPdf, onExportExcel, isPending }: ExportButtonProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger render={<Button variant='outline' disabled={isPending} />}>
        <Icons.download className='h-4 w-4' /> Export
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={onExportPdf}>
          <Icons.fileTypePdf className='mr-2 h-4 w-4' /> PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportExcel}>
          <Icons.fileTypeXls className='mr-2 h-4 w-4' /> Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
