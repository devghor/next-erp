'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingButton } from '@/components/ui/loading-button';
import { AddButton } from '@/components/buttons/add-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { getQueryClient } from '@/lib/query-client';
import { getSales } from '@/features/sales/sales/api/service';
import type { Sale } from '@/features/sales/sales/api/types';
import { createPackingSlipMutation } from '../api/mutations';
import { availableSaleLinesQueryOptions } from '../api/queries';
import { packingSlipKeys } from '../api/queries';

export function PackingSlipCreateDialog() {
  const [open, setOpen] = useState(false);
  const [reference, setReference] = useState('');
  const [matches, setMatches] = useState<Sale[]>([]);
  const [searching, setSearching] = useState(false);
  const [sale, setSale] = useState<Sale | null>(null);
  const [selectedLineIds, setSelectedLineIds] = useState<number[]>([]);

  const { data: lines, isFetching: loadingLines } = useQuery({
    ...availableSaleLinesQueryOptions(sale?.id ?? 0),
    enabled: !!sale
  });

  const createMutation = useMutation({
    ...createPackingSlipMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: packingSlipKeys.all });
      toast.success('Packing slip created, stock deducted');
      reset();
      setOpen(false);
    },
    onError: () => {
      toast.error('Failed to create packing slip');
    }
  });

  function reset() {
    setReference('');
    setMatches([]);
    setSale(null);
    setSelectedLineIds([]);
  }

  async function handleSearch() {
    if (!reference.trim()) return;
    setSearching(true);
    try {
      const res = await getSales({ reference_no: reference.trim(), per_page: 10 });
      setMatches(res.data);
    } finally {
      setSearching(false);
    }
  }

  function handleSubmit() {
    if (!sale || selectedLineIds.length === 0) return;
    const chosen = (lines ?? []).filter((l) => selectedLineIds.includes(l.id));
    createMutation.mutate({
      sale_id: sale.id,
      lines: chosen.map((l) => ({
        product_sale_id: l.id,
        product_id: l.product_id,
        variant_id: l.variant_id
      }))
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={<AddButton label='New Packing Slip' />} />
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Create Packing Slip</DialogTitle>
          <DialogDescription>
            Look up a sale by reference, then pick the lines to pack. Packing pulls stock a
            second time, at the packing stage.
          </DialogDescription>
        </DialogHeader>

        {!sale ? (
          <div className='space-y-3'>
            <div className='flex gap-2'>
              <Input
                placeholder='Sale reference no...'
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button type='button' onClick={handleSearch} disabled={searching}>
                Search
              </Button>
            </div>
            {matches.length > 0 && (
              <div className='max-h-64 space-y-1 overflow-y-auto rounded-md border p-2'>
                {matches.map((m) => (
                  <button
                    key={m.id}
                    type='button'
                    className='hover:bg-muted flex w-full items-center justify-between rounded p-2 text-left text-sm'
                    onClick={() => setSale(m)}
                  >
                    <span>{m.reference_no}</span>
                    <span className='text-muted-foreground'>{m.customer_name ?? '—'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className='space-y-3'>
            <div className='flex items-center justify-between text-sm'>
              <span>
                Sale <strong>{sale.reference_no}</strong> — {sale.customer_name ?? '—'}
              </span>
              <Button type='button' variant='ghost' size='sm' onClick={() => setSale(null)}>
                Change
              </Button>
            </div>
            <div className='max-h-72 space-y-1 overflow-y-auto rounded-md border p-2'>
              {loadingLines && <p className='text-muted-foreground p-2 text-sm'>Loading lines...</p>}
              {!loadingLines && (lines ?? []).length === 0 && (
                <p className='text-muted-foreground p-2 text-sm'>
                  Every line on this sale is already packed.
                </p>
              )}
              {(lines ?? []).map((line) => (
                <label
                  key={line.id}
                  className='hover:bg-muted flex items-center gap-2 rounded p-2 text-sm'
                >
                  <Checkbox
                    checked={selectedLineIds.includes(line.id)}
                    onCheckedChange={(checked) =>
                      setSelectedLineIds((prev) =>
                        checked ? [...prev, line.id] : prev.filter((id) => id !== line.id)
                      )
                    }
                  />
                  <span className='flex-1'>
                    {line.product_name}
                    {line.variant_name ? ` (${line.variant_name})` : ''}
                  </span>
                  <span className='text-muted-foreground'>
                    {line.qty} × {line.net_unit_price.toFixed(2)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <LoadingButton
            loading={createMutation.isPending}
            disabled={!sale || selectedLineIds.length === 0}
            onClick={handleSubmit}
          >
            Create Packing Slip
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
