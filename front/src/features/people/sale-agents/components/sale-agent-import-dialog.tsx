'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { FileUploader } from '@/components/file-uploader';
import { ImportButton } from '@/components/buttons/import-button';
import { importSaleAgentsMutation } from '../api/mutations';
import type { ImportResult } from '../api/types';

const XLSX_MIME_TYPES = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls']
};

export function SaleAgentImportDialog({
  open,
  onOpenChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [result, setResult] = useState<ImportResult | null>(null);

  const importMutation = useMutation({
    ...importSaleAgentsMutation,
    onSuccess: (data) => {
      setResult(data);
      if (data.failures.length === 0) {
        toast.success(`Imported ${data.imported} sale agent(s)`);
      } else {
        toast.warning(
          `Imported ${data.imported} sale agent(s), ${data.failures.length} row(s) failed`
        );
      }
    },
    onError: () => toast.error('Failed to import sale agents')
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setResult(null);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Sale Agents</DialogTitle>
          <DialogDescription>
            Upload an Excel file with <code>name</code>, <code>phone</code>, <code>email</code>,{' '}
            <code>address</code> and <code>commission_rate</code> columns.
          </DialogDescription>
        </DialogHeader>

        <FileUploader
          accept={XLSX_MIME_TYPES}
          maxFiles={1}
          onUpload={async (files) => {
            const file = files[0];
            if (file) {
              await importMutation.mutateAsync(file);
            }
          }}
        />

        {result && result.failures.length > 0 && (
          <div className='max-h-40 space-y-1 overflow-auto text-sm'>
            {result.failures.map((failure, index) => (
              <p key={index} className='text-destructive'>
                Row {failure.row}: {failure.errors.join(', ')}
              </p>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function SaleAgentImportDialogTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ImportButton onClick={() => setOpen(true)} />
      <SaleAgentImportDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
