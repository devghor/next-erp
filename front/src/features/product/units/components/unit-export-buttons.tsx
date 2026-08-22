'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExportButton } from '@/components/buttons/export-button';
import { exportUnitsPdf, exportUnitsExcel } from '../api/service';
import { useUnitFilters } from '../hooks/use-unit-filters';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function UnitExportButtons() {
  const filters = useUnitFilters();

  const pdfMutation = useMutation({
    mutationFn: () => exportUnitsPdf(filters),
    onSuccess: (blob) => downloadBlob(blob, `units-${Date.now()}.pdf`),
    onError: () => toast.error('Failed to export PDF')
  });

  const excelMutation = useMutation({
    mutationFn: () => exportUnitsExcel(filters),
    onSuccess: (blob) => downloadBlob(blob, `units-${Date.now()}.xlsx`),
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
