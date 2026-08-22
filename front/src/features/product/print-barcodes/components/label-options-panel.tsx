'use client';

import { useQuery } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { barcodeSettingsQueryOptions } from '@/features/product/barcode-settings/api/queries';
import type { PrintOptions } from '../api/types';

interface LabelOptionsPanelProps {
  barcodeSettingId: string;
  onBarcodeSettingChange: (id: string) => void;
  print: PrintOptions;
  onPrintChange: (print: PrintOptions) => void;
}

const TOGGLES: {
  key: keyof PrintOptions & ('name' | 'price' | 'business_name' | 'brand_name');
  label: string;
}[] = [
  { key: 'business_name', label: 'Business Name' },
  { key: 'brand_name', label: 'Brand' },
  { key: 'name', label: 'Product Name' },
  { key: 'price', label: 'Price' }
];

export function LabelOptionsPanel({
  barcodeSettingId,
  onBarcodeSettingChange,
  print,
  onPrintChange
}: LabelOptionsPanelProps) {
  const { data } = useQuery(barcodeSettingsQueryOptions({ per_page: 100 }));
  const options = data?.data ?? [];

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor='barcode_setting'>Label Template *</FieldLabel>
        <Select
          name='barcode_setting'
          value={barcodeSettingId}
          onValueChange={(value) => onBarcodeSettingChange(value ?? '')}
        >
          <SelectTrigger id='barcode_setting'>
            <SelectValue placeholder='Select a label template'>
              {(value: string) => options.find((opt) => String(opt.id) === value)?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.map((opt) => (
                <SelectItem key={opt.id} value={String(opt.id)}>
                  {opt.name}
                  {opt.is_default ? ' (Default)' : ''}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <FieldDescription>Manage templates under Product → Barcode Settings.</FieldDescription>
      </Field>

      <Field>
        <FieldLabel>Information on Label</FieldLabel>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {TOGGLES.map(({ key, label }) => {
            const sizeKey = `${key}_size` as keyof PrintOptions;
            return (
              <div key={key} className='space-y-2 rounded-md border p-3'>
                <div className='flex items-center gap-2'>
                  <Checkbox
                    id={key}
                    checked={print[key]}
                    onCheckedChange={(checked) =>
                      onPrintChange({ ...print, [key]: checked === true })
                    }
                  />
                  <Label htmlFor={key}>{label}</Label>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-muted-foreground text-xs'>Size:</span>
                  <Input
                    type='number'
                    min={6}
                    max={72}
                    className='h-8 w-20'
                    value={print[sizeKey] as number}
                    onChange={(e) => onPrintChange({ ...print, [sizeKey]: Number(e.target.value) })}
                    disabled={!print[key]}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Field>
    </FieldGroup>
  );
}
