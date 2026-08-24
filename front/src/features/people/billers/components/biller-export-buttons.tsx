'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExportButton } from '@/components/buttons/export-button';
import { exportBillersPdf, exportBillersExcel } from '../api/service';
import { useBillerFilters } from '../hooks/use-biller-filters';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function BillerExportButtons() {
  const filters = useBillerFilters();

  const pdfMutation = useMutation({
    mutationFn: () => exportBillersPdf(filters),
    onSuccess: (blob) => downloadBlob(blob, `billers-${Date.now()}.pdf`),
    onError: () => toast.error('Failed to export PDF')
  });

  const excelMutation = useMutation({
    mutationFn: () => exportBillersExcel(filters),
    onSuccess: (blob) => downloadBlob(blob, `billers-${Date.now()}.xlsx`),
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
