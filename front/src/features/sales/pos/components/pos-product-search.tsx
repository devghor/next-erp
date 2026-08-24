'use client';

import { forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface PosProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  className?: string;
}

/**
 * Autofocused search/scan input — fast keystroke + Enter is how a hardware
 * barcode scanner "types" into whatever's focused, so this stays focused by
 * default and `onEnter` fires the "add best match" flow (see
 * `pos-shell.tsx`'s `handleSearchEnter`). Also filters the product grid live
 * as the cashier types a name/code manually.
 */
export const PosProductSearch = forwardRef<HTMLInputElement, PosProductSearchProps>(function PosProductSearch(
  { value, onChange, onEnter, className },
  ref
) {
  return (
    <div className={cn('relative', className)}>
      <Icons.scan className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2' />
      <Input
        ref={ref}
        autoFocus
        value={value}
        placeholder='Scan barcode or search products by name / code…'
        className='h-12 pl-11 text-base'
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onEnter?.();
          }
        }}
      />
    </div>
  );
});
