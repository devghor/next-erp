'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Icons } from '@/components/icons';
import { productsQueryOptions } from '@/features/product/products/api/queries';
import type { Product } from '@/features/product/products/api/types';

interface ProductPickerProps {
  onSelect: (product: Product) => void;
}

export function ProductPicker({ onSelect }: ProductPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const { data, isFetching } = useQuery({
    ...productsQueryOptions({ name: search || undefined, per_page: 20 }),
    enabled: open
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            aria-controls='product-picker-list'
            className='w-full justify-between font-normal sm:w-96'
          />
        }
      >
        <span className='text-muted-foreground'>Search product by name or code…</span>
        <Icons.search className='ml-2 h-4 w-4 shrink-0 opacity-50' />
      </PopoverTrigger>
      <PopoverContent className='w-(--anchor-width) p-0 sm:w-96'>
        <Command shouldFilter={false}>
          <CommandInput placeholder='Search product…' value={search} onValueChange={setSearch} />
          <CommandList id='product-picker-list'>
            <CommandEmpty>{isFetching ? 'Searching…' : 'No products found.'}</CommandEmpty>
            <CommandGroup>
              {(data?.data ?? []).map((product) => (
                <CommandItem
                  key={product.id}
                  value={String(product.id)}
                  keywords={[product.name, product.code]}
                  onSelect={() => {
                    onSelect(product);
                    setOpen(false);
                    setSearch('');
                  }}
                >
                  <div className='flex flex-col'>
                    <span>{product.name}</span>
                    <span className='text-muted-foreground text-xs'>{product.code}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
