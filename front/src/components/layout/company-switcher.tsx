'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { useActiveCompany } from '@/hooks/use-active-company';

export function CompanySwitcher() {
  const { companies, activeCompany, setActiveCompanyId, isLoading } = useActiveCompany();

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className='flex items-center gap-2 rounded-md p-2'>
            <Skeleton className='size-8 rounded-lg' />
            <div className='grid flex-1 gap-1.5'>
              <Skeleton className='h-3.5 w-24' />
              <Skeleton className='h-3 w-16' />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (companies.length === 0) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size='lg'
                className='data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground'
              />
            }
          >
            <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
              <Icons.company className='size-4' />
            </div>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-semibold'>
                {activeCompany?.name || 'Select company'}
              </span>
              {activeCompany?.short_name && (
                <span className='truncate text-xs'>{activeCompany.short_name}</span>
              )}
            </div>
            <Icons.chevronsUpDown className='ml-auto size-4' />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--anchor-width) min-w-56 rounded-lg'
            side='bottom'
            align='start'
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className='text-muted-foreground text-xs'>
                Companies
              </DropdownMenuLabel>
              {companies.map((company) => (
                <DropdownMenuItem
                  key={company.id}
                  onClick={() => setActiveCompanyId(company.id)}
                  className='gap-2'
                >
                  <Icons.company className='size-4' />
                  <span className='truncate'>{company.name}</span>
                  {company.id === activeCompany?.id && <Icons.check className='ml-auto size-4' />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
