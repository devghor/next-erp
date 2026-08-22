'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExportButton } from '@/components/buttons/export-button';
import { exportPurchasesPdf, exportPurchasesExcel } from '../api/service';
import { usePurchaseFilters } from '../hooks/use-purchase-filters';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function PurchaseExportButtons() {
  const filters = usePurchaseFilters();

  const pdfMutation = useMutation({
    mutationFn: () => exportPurchasesPdf(filters),
    onSuccess: (blob) => downloadBlob(blob, `purchases-${Date.now()}.pdf`),
    onError: () => toast.error('Failed to export PDF')
  });

  const excelMutation = useMutation({
    mutationFn: () => exportPurchasesExcel(filters),
    onSuccess: (blob) => downloadBlob(blob, `purchases-${Date.now()}.xlsx`),
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
