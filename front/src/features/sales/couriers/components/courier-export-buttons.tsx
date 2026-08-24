'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExportButton } from '@/components/buttons/export-button';
import { exportCouriersPdf, exportCouriersExcel } from '../api/service';
import { useCourierFilters } from '../hooks/use-courier-filters';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function CourierExportButtons() {
  const filters = useCourierFilters();

  const pdfMutation = useMutation({
    mutationFn: () => exportCouriersPdf(filters),
    onSuccess: (blob) => downloadBlob(blob, `couriers-${Date.now()}.pdf`),
    onError: () => toast.error('Failed to export PDF')
  });

  const excelMutation = useMutation({
    mutationFn: () => exportCouriersExcel(filters),
    onSuccess: (blob) => downloadBlob(blob, `couriers-${Date.now()}.xlsx`),
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
