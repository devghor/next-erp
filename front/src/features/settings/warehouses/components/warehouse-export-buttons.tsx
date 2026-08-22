'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExportButton } from '@/components/buttons/export-button';
import { exportWarehousesPdf, exportWarehousesExcel } from '../api/service';
import { useWarehouseFilters } from '../hooks/use-warehouse-filters';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function WarehouseExportButtons() {
  const filters = useWarehouseFilters();

  const pdfMutation = useMutation({
    mutationFn: () => exportWarehousesPdf(filters),
    onSuccess: (blob) => downloadBlob(blob, `warehouses-${Date.now()}.pdf`),
    onError: () => toast.error('Failed to export PDF')
  });

  const excelMutation = useMutation({
    mutationFn: () => exportWarehousesExcel(filters),
    onSuccess: (blob) => downloadBlob(blob, `warehouses-${Date.now()}.xlsx`),
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
