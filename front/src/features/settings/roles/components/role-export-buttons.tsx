'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExportButton } from '@/components/buttons/export-button';
import { exportRolesPdf, exportRolesExcel } from '../api/service';
import { useRoleFilters } from '../hooks/use-role-filters';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function RoleExportButtons() {
  const filters = useRoleFilters();

  const pdfMutation = useMutation({
    mutationFn: () => exportRolesPdf(filters),
    onSuccess: (blob) => downloadBlob(blob, `roles-${Date.now()}.pdf`),
    onError: () => toast.error('Failed to export PDF')
  });

  const excelMutation = useMutation({
    mutationFn: () => exportRolesExcel(filters),
    onSuccess: (blob) => downloadBlob(blob, `roles-${Date.now()}.xlsx`),
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
