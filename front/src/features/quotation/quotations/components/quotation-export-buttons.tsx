'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExportButton } from '@/components/buttons/export-button';
import { exportQuotationsPdf, exportQuotationsExcel } from '../api/service';
import { useQuotationFilters } from '../hooks/use-quotation-filters';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function QuotationExportButtons() {
  const filters = useQuotationFilters();

  const pdfMutation = useMutation({
    mutationFn: () => exportQuotationsPdf(filters),
    onSuccess: (blob) => downloadBlob(blob, `quotations-${Date.now()}.pdf`),
    onError: () => toast.error('Failed to export PDF')
  });

  const excelMutation = useMutation({
    mutationFn: () => exportQuotationsExcel(filters),
    onSuccess: (blob) => downloadBlob(blob, `quotations-${Date.now()}.xlsx`),
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
