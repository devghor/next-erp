'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExportButton } from '@/components/buttons/export-button';
import { exportSuppliersPdf, exportSuppliersExcel } from '../api/service';
import { useSupplierFilters } from '../hooks/use-supplier-filters';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function SupplierExportButtons() {
  const filters = useSupplierFilters();

  const pdfMutation = useMutation({
    mutationFn: () => exportSuppliersPdf(filters),
    onSuccess: (blob) => downloadBlob(blob, `suppliers-${Date.now()}.pdf`),
    onError: () => toast.error('Failed to export PDF')
  });

  const excelMutation = useMutation({
    mutationFn: () => exportSuppliersExcel(filters),
    onSuccess: (blob) => downloadBlob(blob, `suppliers-${Date.now()}.xlsx`),
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
