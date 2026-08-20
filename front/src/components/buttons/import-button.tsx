'use client';

import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export function ImportButton(props: ComponentProps<typeof Button>) {
  return (
    <Button variant='outline' {...props}>
      <Icons.upload className='h-4 w-4' /> Import
    </Button>
  );
}
