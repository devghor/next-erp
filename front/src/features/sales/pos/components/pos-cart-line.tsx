'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { rowTotal, type PosCartLine as PosCartLineType } from '../hooks/use-pos-cart';
import { formatMoney } from '../lib/money';

export interface PosCartLineProps {
  line: PosCartLineType;
  currencyCode?: string | null;
  onUpdate: (patch: Partial<PosCartLineType>) => void;
  onRemove: () => void;
}

export function PosCartLine({ line, currencyCode, onUpdate, onRemove }: PosCartLineProps) {
  const total = rowTotal(line);
  const overStock = typeof line.stock === 'number' && line.qty > line.stock;

  return (
    <div className='space-y-2 border-b px-3 py-2 last:border-b-0'>
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0'>
          <p className='truncate text-sm font-medium'>{line.product_name}</p>
          <p className='text-muted-foreground truncate text-xs'>
            {[line.product_code, line.variant_name, line.batch_no].filter(Boolean).join(' · ')}
          </p>
        </div>
        <Button type='button' variant='ghost' size='icon' className='h-7 w-7 shrink-0' onClick={onRemove} aria-label='Remove line'>
          <Icons.trash className='h-4 w-4' />
        </Button>
      </div>

      <div className='flex flex-wrap items-end gap-2'>
        <div className='flex items-center gap-1'>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='h-8 w-8'
            onClick={() => onUpdate({ qty: Math.max(0.0001, line.qty - 1) })}
          >
            <Icons.minus className='h-3.5 w-3.5' />
          </Button>
          <Input
            type='number'
            min={0.0001}
            step='0.0001'
            value={line.qty}
            onChange={(e) => onUpdate({ qty: Number(e.target.value) || 0 })}
            className='h-8 w-16 text-center'
          />
          <Button type='button' variant='outline' size='icon' className='h-8 w-8' onClick={() => onUpdate({ qty: line.qty + 1 })}>
            <Icons.add className='h-3.5 w-3.5' />
          </Button>
        </div>

        <div className='flex flex-col gap-0.5'>
          <span className='text-muted-foreground text-[10px]'>Price</span>
          <Input
            type='number'
            min={0}
            step='0.01'
            value={line.net_unit_price}
            onChange={(e) => onUpdate({ net_unit_price: Number(e.target.value) || 0 })}
            className='h-8 w-20'
          />
        </div>

        <div className='flex flex-col gap-0.5'>
          <span className='text-muted-foreground text-[10px]'>Discount</span>
          <Input
            type='number'
            min={0}
            step='0.01'
            value={line.discount}
            onChange={(e) => onUpdate({ discount: Number(e.target.value) || 0 })}
            className='h-8 w-20'
          />
        </div>

        <div className='flex flex-col gap-0.5'>
          <span className='text-muted-foreground text-[10px]'>Tax %</span>
          <Input
            type='number'
            min={0}
            step='0.01'
            value={line.tax_rate}
            onChange={(e) => onUpdate({ tax_rate: Number(e.target.value) || 0 })}
            className='h-8 w-16'
          />
        </div>

        <div className='ml-auto text-right'>
          <span className='text-muted-foreground text-[10px] block'>Total</span>
          <span className='text-sm font-semibold'>{formatMoney(total, { currencyCode })}</span>
        </div>
      </div>

      {overStock && (
        <p className={cn('text-xs font-medium text-amber-600')}>
          Only {line.stock} in stock at this warehouse.
        </p>
      )}
    </div>
  );
}
