'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { getQueryClient } from '@/lib/query-client';
import { couriersQueryOptions } from '@/features/sales/couriers/api/queries';
import { createChallanMutation } from '../api/mutations';
import { availablePackingSlipsQueryOptions, challanKeys } from '../api/queries';

const NONE = 'none';

export function ChallanCreateDialog() {
  const [open, setOpen] = useState(false);
  const [courierId, setCourierId] = useState<string>(NONE);
  const [selectedSlipIds, setSelectedSlipIds] = useState<number[]>([]);

  const { data: couriersData } = useQuery(couriersQueryOptions({ per_page: 100 }));
  const { data: availableSlips, isFetching: loadingSlips } = useQuery({
    ...availablePackingSlipsQueryOptions(),
    enabled: open
  });

  const courierOptions = [
    { value: NONE, label: 'None' },
    ...(couriersData?.data ?? []).map((c) => ({ value: String(c.id), label: c.name }))
  ];

  const createMutation = useMutation({
    ...createChallanMutation,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: challanKeys.all });
      toast.success('Challan created');
      reset();
      setOpen(false);
    },
    onError: () => toast.error("Couldn't create challan. Try again.")
  });

  function reset() {
    setCourierId(NONE);
    setSelectedSlipIds([]);
  }

  function handleSubmit() {
    if (selectedSlipIds.length === 0) return;
    createMutation.mutate({
      courier_id: courierId === NONE ? null : Number(courierId),
      packing_slip_ids: selectedSlipIds
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
      <DialogTrigger render={<AddButton label='New Challan' />} />
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Create Challan</DialogTitle>
          <DialogDescription>Hand off pending packing slips to a courier for delivery.</DialogDescription>
        </DialogHeader>

        <div className='space-y-3'>
          <Select value={courierId} onValueChange={(value) => setCourierId(value ?? NONE)}>
            <SelectTrigger>
              <SelectValue placeholder='Courier' />
            </SelectTrigger>
            <SelectContent>
              {courierOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className='max-h-72 space-y-1 overflow-y-auto rounded-md border p-2'>
            {loadingSlips && <p className='text-muted-foreground p-2 text-sm'>Loading packing slips...</p>}
            {!loadingSlips && (availableSlips ?? []).length === 0 && (
              <p className='text-muted-foreground p-2 text-sm'>No pending packing slips to hand off.</p>
            )}
            {(availableSlips ?? []).map((slip) => (
              <label key={slip.id} className='hover:bg-muted flex items-center gap-2 rounded p-2 text-sm'>
                <Checkbox
                  checked={selectedSlipIds.includes(slip.id)}
                  onCheckedChange={(checked) =>
                    setSelectedSlipIds((prev) => (checked ? [...prev, slip.id] : prev.filter((id) => id !== slip.id)))
                  }
                />
                <span className='flex-1'>
                  {slip.reference_no} — {slip.sale_reference_no ?? '—'} ({slip.customer_name ?? '—'})
                </span>
                <span className='text-muted-foreground'>{slip.amount.toFixed(2)}</span>
              </label>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <LoadingButton
            loading={createMutation.isPending}
            disabled={selectedSlipIds.length === 0}
            onClick={handleSubmit}
          >
            Create Challan
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
