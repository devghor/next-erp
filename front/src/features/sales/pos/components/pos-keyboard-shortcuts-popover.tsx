'use client';

import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icons } from '@/components/icons';

const SHORTCUTS: { keys: string[]; description: string }[] = [
  { keys: ['F1'], description: 'Open checkout' },
  { keys: ['F2'], description: 'Hold sale (save as draft)' },
  { keys: ['F3'], description: 'Focus search / scan input' },
  { keys: ['F4'], description: 'Open held sales' },
  { keys: ['F9'], description: 'Open / close cash register' },
  { keys: ['Esc'], description: 'Close the open dialog' }
];

export function PosKeyboardShortcutsPopover() {
  return (
    <Popover>
      <PopoverTrigger render={<Button type='button' variant='ghost' size='icon' aria-label='Keyboard shortcuts' />}>
        <Icons.keyboard className='h-5 w-5' />
      </PopoverTrigger>
      <PopoverContent align='end' className='w-72'>
        <p className='mb-2 text-sm font-semibold'>Keyboard Shortcuts</p>
        <ul className='space-y-1.5'>
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.description} className='flex items-center justify-between gap-2 text-sm'>
              <span className='text-muted-foreground'>{shortcut.description}</span>
              <span className='flex gap-1'>
                {shortcut.keys.map((key) => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
