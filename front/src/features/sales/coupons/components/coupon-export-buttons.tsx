'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExportButton } from '@/components/buttons/export-button';
import { exportCouponsPdf, exportCouponsExcel } from '../api/service';
import { useCouponFilters } from '../hooks/use-coupon-filters';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function CouponExportButtons() {
  const filters = useCouponFilters();

  const pdfMutation = useMutation({
    mutationFn: () => exportCouponsPdf(filters),
    onSuccess: (blob) => downloadBlob(blob, `coupons-${Date.now()}.pdf`),
    onError: () => toast.error('Failed to export PDF')
  });

  const excelMutation = useMutation({
    mutationFn: () => exportCouponsExcel(filters),
    onSuccess: (blob) => downloadBlob(blob, `coupons-${Date.now()}.xlsx`),
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
