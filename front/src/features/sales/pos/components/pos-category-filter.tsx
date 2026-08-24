'use client';

import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { categoriesQueryOptions } from '@/features/product/categories/api/queries';
import { brandsQueryOptions } from '@/features/product/brands/api/queries';
import { cn } from '@/lib/utils';

const ALL = 'all';

export interface PosCategoryFilterProps {
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
  brandId: string;
  onBrandChange: (brandId: string) => void;
}

export function PosCategoryFilter({
  categoryId,
  onCategoryChange,
  brandId,
  onBrandChange
}: PosCategoryFilterProps) {
  const { data: categoriesData } = useQuery(categoriesQueryOptions({ per_page: 100 }));
  const { data: brandsData } = useQuery(brandsQueryOptions({ per_page: 100 }));

  const categories = categoriesData?.data ?? [];
  const brands = brandsData?.data ?? [];

  return (
    <div className='flex items-center gap-2 border-b px-3 py-2'>
      <ScrollArea className='min-w-0 flex-1 whitespace-nowrap'>
        <div className='flex items-center gap-2 pb-1'>
          <Button
            type='button'
            size='sm'
            variant={categoryId === ALL ? 'default' : 'outline'}
            className='shrink-0 rounded-full'
            onClick={() => onCategoryChange(ALL)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              type='button'
              size='sm'
              variant={categoryId === String(category.id) ? 'default' : 'outline'}
              className={cn('shrink-0 rounded-full')}
              onClick={() => onCategoryChange(String(category.id))}
            >
              {category.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation='horizontal' />
      </ScrollArea>

      <Select value={brandId} onValueChange={(value) => onBrandChange(value ?? ALL)}>
        <SelectTrigger className='h-9 w-40 shrink-0'>
          <SelectValue placeholder='All brands' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All brands</SelectItem>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={String(brand.id)}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
