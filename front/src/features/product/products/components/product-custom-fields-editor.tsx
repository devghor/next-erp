'use client';

import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CustomField } from '@/features/settings/custom-fields/api/types';

interface ProductCustomFieldsEditorProps {
  customFields: CustomField[];
  values: Record<number, string>;
  onChange: (values: Record<number, string>) => void;
}

export function ProductCustomFieldsEditor({ customFields, values, onChange }: ProductCustomFieldsEditorProps) {
  if (customFields.length === 0) return null;

  const setValue = (id: number, value: string) => onChange({ ...values, [id]: value });

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
      {customFields.map((field) => {
        const value = values[field.id] ?? '';

        if (field.type === 'checkbox') {
          return (
            <Field key={field.id} orientation='horizontal'>
              <FieldLabel>
                {field.name}
                {field.is_required && ' *'}
              </FieldLabel>
              <Checkbox
                checked={value === '1'}
                onCheckedChange={(checked) => setValue(field.id, checked ? '1' : '0')}
              />
            </Field>
          );
        }

        if (field.type === 'select' || field.type === 'multi_select') {
          return (
            <Field key={field.id}>
              <FieldLabel>
                {field.name}
                {field.is_required && ' *'}
              </FieldLabel>
              <Select value={value} onValueChange={(v) => setValue(field.id, v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder='Select' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(field.options ?? []).map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          );
        }

        return (
          <Field key={field.id}>
            <FieldLabel>
              {field.name}
              {field.is_required && ' *'}
            </FieldLabel>
            <Input
              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
              value={value}
              onChange={(e) => setValue(field.id, e.target.value)}
            />
          </Field>
        );
      })}
    </div>
  );
}
