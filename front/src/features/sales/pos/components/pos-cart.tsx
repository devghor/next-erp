'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Icons } from '@/components/icons';
import { PosCartLine } from './pos-cart-line';
import type { PosCartLine as PosCartLineType } from '../hooks/use-pos-cart';

export interface PosCartProps {
  lines: PosCartLineType[];
  currencyCode?: string | null;
  onUpdateLine: (key: string, patch: Partial<PosCartLineType>) => void;
  onRemoveLine: (key: string) => void;
  onClear: () => void;
}

export function PosCart({ lines, currencyCode, onUpdateLine, onRemoveLine, onClear }: PosCartProps) {
  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='flex items-center justify-between border-b px-3 py-2'>
        <span className='text-sm font-semibold'>Cart ({lines.length})</span>
        {lines.length > 0 && (
          <Button type='button' variant='ghost' size='sm' onClick={onClear}>
            <Icons.trash className='mr-1 h-3.5 w-3.5' /> Clear
          </Button>
        )}
      </div>

      {lines.length === 0 ? (
        <Empty className='flex-1'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <Icons.grid />
            </EmptyMedia>
            <EmptyTitle>Cart is empty</EmptyTitle>
            <EmptyDescription>Scan a barcode or tap a product to add it.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ScrollArea className='flex-1'>
          {lines.map((line) => (
            <PosCartLine
              key={line.key}
              line={line}
              currencyCode={currencyCode}
              onUpdate={(patch) => onUpdateLine(line.key, patch)}
              onRemove={() => onRemoveLine(line.key)}
            />
          ))}
        </ScrollArea>
      )}
    </div>
  );
}
