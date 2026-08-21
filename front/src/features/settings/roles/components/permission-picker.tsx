'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import type { PermissionGroup } from '../api/types';

type PermissionsFieldApi = {
  name: string;
  state: {
    value: string[];
    meta: {
      errors: Array<{ message?: string } | undefined>;
      isTouched: boolean;
      isValid: boolean;
    };
  };
  pushValue: (value: string) => void;
  removeValue: (index: number) => void;
};

/**
 * Grouped multi-select checkbox picker over a `permissions: string[]` array
 * field. Not registered in the shared `@/lib/form` field registry — the
 * grouping-by-module UI is bespoke, so this is wired via raw `form.Field`
 * (mode='array') rather than `form.AppField`, per docs/forms.md's guidance
 * for one-off custom fields.
 */
export function PermissionPicker({
  field,
  groups
}: {
  field: PermissionsFieldApi;
  groups: PermissionGroup[];
}) {
  const selected = field.state.value;
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const [search, setSearch] = useState('');

  function toggle(name: string, checked: boolean) {
    if (checked) {
      if (!selected.includes(name)) field.pushValue(name);
    } else {
      const index = selected.indexOf(name);
      if (index > -1) field.removeValue(index);
    }
  }

  function toggleGroup(group: PermissionGroup, checked: boolean) {
    group.permissions.forEach((permission) => toggle(permission.name, checked));
  }

  const query = search.trim().toLowerCase();
  const filteredGroups = query
    ? groups
        .map((group) => ({
          ...group,
          permissions: group.permissions.filter(
            (permission) =>
              permission.name.toLowerCase().includes(query) ||
              (permission.label ?? '').toLowerCase().includes(query) ||
              group.group.toLowerCase().includes(query)
          )
        }))
        .filter((group) => group.permissions.length > 0)
    : groups;

  return (
    <FieldSet>
      <FieldLegend variant='label'>Permissions *</FieldLegend>
      <div className='relative'>
        <Icons.search className='text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 h-4 w-4' />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search permissions...'
          className='pl-8'
        />
      </div>
      <div className='space-y-4'>
        {filteredGroups.length === 0 && (
          <p className='text-muted-foreground text-sm'>
            No permissions match &quot;{search}&quot;.
          </p>
        )}
        {filteredGroups.map((group) => {
          const groupNames = group.permissions.map((p) => p.name);
          const selectedCount = groupNames.filter((name) => selected.includes(name)).length;
          const allSelected = groupNames.length > 0 && selectedCount === groupNames.length;
          const someSelected = selectedCount > 0 && !allSelected;

          return (
            <div key={group.group} className='rounded-lg border p-3'>
              <Field orientation='horizontal' className='mb-2'>
                <Checkbox
                  id={`role-permission-group-${group.group}`}
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={(checked) => toggleGroup(group, checked === true)}
                />
                <FieldLabel
                  htmlFor={`role-permission-group-${group.group}`}
                  className='font-medium'
                >
                  {group.group}
                </FieldLabel>
              </Field>
              <FieldGroup data-slot='checkbox-group' className='gap-2 pl-6'>
                {group.permissions.map((permission) => (
                  <Field key={permission.id} orientation='horizontal' data-invalid={isInvalid}>
                    <Checkbox
                      id={`role-permission-${permission.id}`}
                      checked={selected.includes(permission.name)}
                      aria-invalid={isInvalid}
                      onCheckedChange={(checked) => toggle(permission.name, checked === true)}
                    />
                    <FieldLabel
                      htmlFor={`role-permission-${permission.id}`}
                      className='font-normal'
                    >
                      {permission.label ?? permission.name}
                    </FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
            </div>
          );
        })}
      </div>
      {isInvalid && <FieldError id={`${field.name}-error`} errors={field.state.meta.errors} />}
    </FieldSet>
  );
}
