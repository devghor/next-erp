'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

const ROWS = ['1234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

export interface PosOnscreenKeyboardProps {
  onKey: (char: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  onClose: () => void;
  className?: string;
}

/**
 * Touch-only virtual keyboard, shown when `posSettings.keyboard_active` is
 * on (a POS terminal with no physical keyboard). Purely presentational —
 * `pos-shell.tsx` wires its callbacks to whichever field currently has
 * cashier focus (the search input by default).
 */
export function PosOnscreenKeyboard({ onKey, onBackspace, onEnter, onClose, className }: PosOnscreenKeyboardProps) {
  const [shift, setShift] = useState(false);

  return (
    <Card className={cn('space-y-1.5 p-2', className)}>
      {ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className='flex justify-center gap-1'>
          {row.split('').map((char) => (
            <Button
              key={char}
              type='button'
              variant='outline'
              size='sm'
              className='h-10 w-9 px-0'
              onClick={() => onKey(shift ? char.toUpperCase() : char)}
            >
              {shift ? char.toUpperCase() : char}
            </Button>
          ))}
        </div>
      ))}
      <div className='flex justify-center gap-1'>
        <Button type='button' variant={shift ? 'default' : 'outline'} size='sm' className='h-10 px-3' onClick={() => setShift((s) => !s)}>
          Shift
        </Button>
        <Button type='button' variant='outline' size='sm' className='h-10 flex-1' onClick={() => onKey(' ')}>
          <Icons.space className='h-4 w-4' />
        </Button>
        <Button type='button' variant='outline' size='sm' className='h-10 px-3' onClick={onBackspace}>
          <Icons.backspace className='h-4 w-4' />
        </Button>
        <Button type='button' size='sm' className='h-10 px-3' onClick={onEnter}>
          Enter
        </Button>
        <Button type='button' variant='ghost' size='sm' className='h-10 px-2' onClick={onClose} aria-label='Hide keyboard'>
          <Icons.close className='h-4 w-4' />
        </Button>
      </div>
    </Card>
  );
}
