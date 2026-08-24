'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExportButton } from '@/components/buttons/export-button';
import { exportSaleAgentsPdf, exportSaleAgentsExcel } from '../api/service';
import { useSaleAgentFilters } from '../hooks/use-sale-agent-filters';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function SaleAgentExportButtons() {
  const filters = useSaleAgentFilters();

  const pdfMutation = useMutation({
    mutationFn: () => exportSaleAgentsPdf(filters),
    onSuccess: (blob) => downloadBlob(blob, `sale-agents-${Date.now()}.pdf`),
    onError: () => toast.error('Failed to export PDF')
  });

  const excelMutation = useMutation({
    mutationFn: () => exportSaleAgentsExcel(filters),
    onSuccess: (blob) => downloadBlob(blob, `sale-agents-${Date.now()}.xlsx`),
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
