'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { PosKeyboardShortcutsPopover } from './pos-keyboard-shortcuts-popover';
import type { CashRegister } from '../api/types';

export interface PosSelectOption {
  value: string;
  label: string;
}

export interface PosTopbarProps {
  warehouseId: string;
  onWarehouseChange: (value: string) => void;
  warehouseOptions: PosSelectOption[];
  billerId: string;
  onBillerChange: (value: string) => void;
  billerOptions: PosSelectOption[];
  customerId: string;
  onCustomerChange: (value: string) => void;
  customerOptions: PosSelectOption[];
  onAddCustomer: () => void;
  currencyId: string;
  onCurrencyChange: (value: string) => void;
  currencyOptions: PosSelectOption[];
  register: CashRegister | null;
  cashRegisterActive: boolean;
  onOpenCashRegister: () => void;
  onOpenHeldSales: () => void;
  keyboardActive: boolean;
  showKeyboard: boolean;
  onToggleKeyboard: () => void;
  /** Sales queued offline (use-offline-queue.ts) still waiting to sync. */
  offlineQueueCount?: number;
}

export function PosTopbar({
  warehouseId,
  onWarehouseChange,
  warehouseOptions,
  billerId,
  onBillerChange,
  billerOptions,
  customerId,
  onCustomerChange,
  customerOptions,
  onAddCustomer,
  currencyId,
  onCurrencyChange,
  currencyOptions,
  register,
  cashRegisterActive,
  onOpenCashRegister,
  onOpenHeldSales,
  keyboardActive,
  showKeyboard,
  onToggleKeyboard,
  offlineQueueCount = 0
}: PosTopbarProps) {
  return (
    <div className='bg-background flex flex-wrap items-center gap-2 border-b p-2'>
      <Link href='/dashboard/overview' className='hover:bg-accent flex items-center gap-2 rounded-md px-2 py-1.5'>
        <Icons.pos className='h-5 w-5' />
        <span className='hidden text-sm font-semibold sm:inline'>POS</span>
      </Link>

      <Select value={warehouseId} onValueChange={(value) => onWarehouseChange(value ?? '')}>
        <SelectTrigger className='h-9 w-40'>
          <SelectValue placeholder='Warehouse' />
        </SelectTrigger>
        <SelectContent>
          {warehouseOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={billerId} onValueChange={(value) => onBillerChange(value ?? '')}>
        <SelectTrigger className='h-9 w-36'>
          <SelectValue placeholder='Biller' />
        </SelectTrigger>
        <SelectContent>
          {billerOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className='flex items-center gap-1'>
        <Select value={customerId} onValueChange={(value) => onCustomerChange(value ?? '')}>
          <SelectTrigger className='h-9 w-44'>
            <SelectValue placeholder='Customer' />
          </SelectTrigger>
          <SelectContent>
            {customerOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type='button' variant='outline' size='icon' className='h-9 w-9' onClick={onAddCustomer} aria-label='Add customer'>
          <Icons.add className='h-4 w-4' />
        </Button>
      </div>

      <Select value={currencyId} onValueChange={(value) => onCurrencyChange(value ?? '')}>
        <SelectTrigger className='h-9 w-32'>
          <SelectValue placeholder='Currency' />
        </SelectTrigger>
        <SelectContent>
          {currencyOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className='ml-auto flex items-center gap-1.5'>
        {offlineQueueCount > 0 && (
          <Badge variant='outline' className='gap-1.5 border-amber-400 text-amber-600' title={`${offlineQueueCount} sale(s) queued offline, syncing automatically`}>
            <Icons.offline className='h-3.5 w-3.5' />
            {offlineQueueCount} pending sync
          </Badge>
        )}

        {cashRegisterActive && (
          <Button type='button' variant='outline' size='sm' onClick={onOpenCashRegister} className='gap-1.5'>
            <span className={register ? 'h-2 w-2 rounded-full bg-emerald-500' : 'h-2 w-2 rounded-full bg-muted-foreground'} />
            {register ? 'Register Open' : 'Register Closed'}
          </Button>
        )}

        <Button type='button' variant='outline' size='sm' onClick={onOpenHeldSales} className='gap-1.5'>
          <Icons.history className='h-4 w-4' />
          Held Sales
        </Button>

        {keyboardActive && (
          <Button
            type='button'
            variant={showKeyboard ? 'default' : 'outline'}
            size='icon'
            onClick={onToggleKeyboard}
            aria-label='Toggle on-screen keyboard'
          >
            <Icons.keyboard className='h-4 w-4' />
          </Button>
        )}

        <PosKeyboardShortcutsPopover />

        <Button
          type='button'
          variant='ghost'
          size='icon'
          render={<Link href='/dashboard/overview' aria-label='Exit POS' />}
        >
          <Icons.close className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}

