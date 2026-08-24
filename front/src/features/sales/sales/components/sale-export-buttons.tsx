'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExportButton } from '@/components/buttons/export-button';
import { exportSalesPdf, exportSalesExcel } from '../api/service';
import { useSaleFilters } from '../hooks/use-sale-filters';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function SaleExportButtons() {
  const filters = useSaleFilters();

  const pdfMutation = useMutation({
    mutationFn: () => exportSalesPdf(filters),
    onSuccess: (blob) => downloadBlob(blob, `sales-${Date.now()}.pdf`),
    onError: () => toast.error('Failed to export PDF')
  });

  const excelMutation = useMutation({
    mutationFn: () => exportSalesExcel(filters),
    onSuccess: (blob) => downloadBlob(blob, `sales-${Date.now()}.xlsx`),
    onError: () => toast.error('Failed to export Excel')
  });

  const isPending = pdfMutation.isPending || excelMutation.isPending;

  return <ExportButton onExportPdf={() => pdfMutation.mutate()} onExportExcel={() => excelMutation.mutate()} isPending={isPending} />;
}
