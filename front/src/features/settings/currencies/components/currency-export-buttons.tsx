'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExportButton } from '@/components/buttons/export-button';
import { exportCurrenciesPdf, exportCurrenciesExcel } from '../api/service';
import { useCurrencyFilters } from '../hooks/use-currency-filters';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function CurrencyExportButtons() {
  const filters = useCurrencyFilters();

  const pdfMutation = useMutation({
    mutationFn: () => exportCurrenciesPdf(filters),
    onSuccess: (blob) => downloadBlob(blob, `currencies-${Date.now()}.pdf`),
    onError: () => toast.error('Failed to export PDF')
  });

  const excelMutation = useMutation({
    mutationFn: () => exportCurrenciesExcel(filters),
    onSuccess: (blob) => downloadBlob(blob, `currencies-${Date.now()}.xlsx`),
    onError: () => toast.error('Failed to export Excel')
  });

  const isPending = pdfMutation.isPending || excelMutation.isPending;

  return (
    <ExportButton
      onExportPdf={() => pdfMutation.mutate()}
      onExportExcel={() => excelMutation.mutate()}
      isPending={isPending}
    />
  );
}
