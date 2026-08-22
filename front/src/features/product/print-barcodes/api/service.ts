// ============================================================
// Print Barcodes Service — Data Access Layer
// ============================================================
// Calls the Laravel backend directly from the browser (no Next.js
// route handler / BFF) — see docs/data-fetching.md pattern 4.
// ============================================================

import { apiClient } from '@/lib/api-client';
import type { PrintBarcodesPayload } from './types';

export async function printBarcodes(payload: PrintBarcodesPayload): Promise<Blob> {
  return apiClient<Blob>('/product/products/print-barcodes', {
    method: 'POST',
    data: payload,
    responseType: 'blob'
  });
}
