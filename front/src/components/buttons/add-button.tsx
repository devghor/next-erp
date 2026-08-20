'use client';

import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

interface AddButtonProps extends ComponentProps<typeof Button> {
  label?: string;
}

export function AddButton({ label = 'Add New', ...props }: AddButtonProps) {
  return (
    <Button {...props}>
      <Icons.add /> {label}
    </Button>
  );
}
