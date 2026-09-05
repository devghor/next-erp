'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { buildReceiptHtml, type ReceiptData } from '../lib/receipt-template';
import type { PosThermalInvoiceSize } from '../api/types';

/** Opens a blank window with the receipt markup and triggers the print dialog — used for one-click reprints from the held-sales drawer. */
export function printReceiptDirectly(
  data: ReceiptData,
  invoiceOption: 'thermal' | 'normal',
  thermalSize: PosThermalInvoiceSize = '80mm'
) {
  const html = buildReceiptHtml(data, invoiceOption, thermalSize);
  const printWindow = window.open('', '_blank', 'width=420,height=640');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.addEventListener('load', () => {
    printWindow.focus();
    printWindow.print();
  });
}

export interface PosReceiptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ReceiptData | null;
  invoiceOption: 'thermal' | 'normal';
  thermalSize: PosThermalInvoiceSize;
  /** salespro auto-opens the print dialog right after a sale completes when `pos_setting.show_print_invoice` is on — the cashier isn't required to click Print. Only meant for that one moment; leave off for manual reprints. */
  autoPrint?: boolean;
}

/** Print-preview dialog for the just-completed (or reprinted) sale's receipt, thermal (58mm/80mm) or normal. */
export function PosReceipt({ open, onOpenChange, data, invoiceOption, thermalSize, autoPrint }: PosReceiptProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const autoPrintedRef = useRef(false);

  function handlePrint() {
    iframeRef.current?.contentWindow?.focus();
    iframeRef.current?.contentWindow?.print();
  }

  function writeReceipt() {
    if (!open || !data || !iframeRef.current) return;
    const html = buildReceiptHtml(data, invoiceOption, thermalSize);
    const doc = iframeRef.current.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }
  }

  useEffect(() => {
    autoPrintedRef.current = false;
    writeReceipt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, data, invoiceOption, thermalSize]);

  /** Radix mounts a fresh `<iframe>` DOM node each time the dialog opens, and that mount can land in a
   * render pass after the effect above already ran with `open`/`data` set — leaving the ref null when the
   * effect fires and the receipt never written. Writing again the instant the node itself attaches closes that gap. */
  function attachIframeRef(node: HTMLIFrameElement | null) {
    iframeRef.current = node;
    if (node) writeReceipt();
  }

  function handleIframeLoad() {
    if (!autoPrint || autoPrintedRef.current) return;
    autoPrintedRef.current = true;
    handlePrint();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[92vh] flex-col sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Receipt</DialogTitle>
          <DialogDescription>
            {invoiceOption === 'thermal' ? `Thermal · ${thermalSize}` : 'Normal invoice'}
          </DialogDescription>
        </DialogHeader>

        <div className='bg-muted flex-1 overflow-auto rounded-md'>
          <iframe
            ref={attachIframeRef}
            title='Receipt preview'
            sandbox='allow-same-origin allow-modals'
            className='h-[60vh] w-full border-0 bg-white'
            onLoad={handleIframeLoad}
          />
        </div>

        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button type='button' onClick={handlePrint}>
            <Icons.printer className='mr-1.5 h-4 w-4' /> Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
