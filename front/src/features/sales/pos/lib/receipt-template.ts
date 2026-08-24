// ============================================================
// Receipt templates — thermal (58mm/80mm) + normal (A4) print markup.
// ============================================================
// Pure string builders (no React) so `window.print()` against a
// hidden iframe/new window can consume the HTML directly — see
// components/pos-receipt.tsx for the trigger.
//
// Visually modeled on salespro's actual invoice templates
// (resources/views/backend/setting/invoice_setting/{a4,80mm,58mm}.blade.php):
// A4 gets the blue table-header row + light-blue totals block + "in words"
// line; thermal gets the centered header, dotted item dividers, and the
// grey Paid/Change bar. Barcode/QR images and the full drag-drop
// invoice-builder customization (logos, per-column toggles, primary color
// picker) are out of scope here — this ports the fixed visual structure,
// not the admin-configurable builder.
// ============================================================

import { formatMoney } from './money';

export type ReceiptLine = {
  name: string;
  qty: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
};

export type ReceiptPayment = {
  method: string;
  amount: number;
};

export type ReceiptData = {
  companyName: string;
  warehouseName?: string | null;
  billerName?: string | null;
  cashierName?: string | null;
  referenceNo: string;
  date: string;
  customerName?: string | null;
  lines: ReceiptLine[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  grandTotal: number;
  paid: number;
  change: number;
  due: number;
  payments: ReceiptPayment[];
  currencyCode?: string | null;
  note?: string | null;
};

const PRIMARY_COLOR = '#014b94';
const TOTALS_BG = 'rgb(205, 218, 235)';

function money(data: ReceiptData, amount: number): string {
  return formatMoney(amount, { currencyCode: data.currencyCode });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const ONES = [
  '',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen'
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function threeDigitsToWords(n: number): string {
  const parts: string[] = [];
  if (n >= 100) {
    parts.push(ONES[Math.floor(n / 100)], 'hundred');
    n %= 100;
  }
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)]);
    n %= 10;
    if (n > 0) parts.push(ONES[n]);
  } else if (n > 0) {
    parts.push(ONES[n]);
  }
  return parts.join(' ');
}

/** Integer amount to words, e.g. 1234 -> "one thousand two hundred thirty four". Matches salespro's "In Words" invoice line (whole-number only, no cents spelled out). */
export function numberToWords(amount: number): string {
  const n = Math.floor(Math.max(0, amount));
  if (n === 0) return 'zero';

  const scales: [number, string][] = [
    [1_000_000_000, 'billion'],
    [1_000_000, 'million'],
    [1_000, 'thousand'],
    [1, '']
  ];

  let remaining = n;
  const parts: string[] = [];
  for (const [scale, label] of scales) {
    if (remaining >= scale) {
      const chunk = Math.floor(remaining / scale);
      remaining %= scale;
      const words = threeDigitsToWords(chunk);
      parts.push(label ? `${words} ${label}` : words);
    }
  }
  return parts.join(' ').trim();
}

function totalsRow(label: string, value: string, bold = false): string {
  return `
    <tr>
      <td class="td-text" colspan="3">${escapeHtml(label)}</td>
      <td class="td-text${bold ? ' grand' : ''}" style="text-align:center;">${value}</td>
    </tr>`;
}

/** A4-ish normal invoice — blue table-header row, light-blue totals block, "in words" line. Matches invoice_setting/a4.blade.php's visual identity. */
export function buildNormalReceiptHtml(data: ReceiptData): string {
  const totalBeforeTax = data.subtotal - data.tax;

  const lineRows = data.lines
    .map(
      (line, index) => `
        <tr>
          <td style="border:1px solid #222;padding:3px 6px;text-align:center;">${index + 1}</td>
          <td style="border:1px solid #222;padding:3px 6px;">${escapeHtml(line.name)}</td>
          <td style="border:1px solid #222;padding:3px 6px;text-align:center;">${line.qty}</td>
          <td style="border:1px solid #222;padding:3px 6px;text-align:center;">${money(data, line.unitPrice)}</td>
          <td style="border:1px solid #222;padding:3px 6px;text-align:center;">${line.discount > 0 ? money(data, line.discount) : '-'}</td>
          <td style="border:1px solid #222;padding:3px 6px;text-align:center;">${money(data, line.tax)}</td>
          <td style="border:1px solid #222;padding:3px 6px;text-align:center;font-weight:600;">${money(data, line.total)}</td>
        </tr>`
    )
    .join('');

  const paymentRows = data.payments
    .map(
      (payment) => `
        <tr>
          <td style="padding:4px 6px;border-bottom:1px solid #ddd;">${escapeHtml(payment.method)}</td>
          <td style="padding:4px 6px;border-bottom:1px solid #ddd;text-align:right;">${money(data, payment.amount)}</td>
        </tr>`
    )
    .join('');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(data.companyName)}_Sale_${escapeHtml(data.referenceNo)}</title>
    <style>
      span, td { font-size: 13px; line-height: 1.4; }
      table, tr, td { font-family: sans-serif; border-collapse: collapse; }
      body { max-width: 780px; margin: 0 auto; padding: 20px 30px; color: #111; }
      h1 { margin: 0; }
      @media print {
        tr.table-header { background-color: ${PRIMARY_COLOR} !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        td.td-text { background-color: ${TOTALS_BG} !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        @page { margin: 12mm; }
      }
      .td-text { background-color: ${TOTALS_BG}; }
      .grand { font-size: 15px; font-weight: 700; }
    </style>
  </head>
  <body>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:9px 0;width:55%;vertical-align:top;">
          <h1>${escapeHtml(data.companyName)}</h1>
          ${data.warehouseName ? `<div>${escapeHtml(data.warehouseName)}</div>` : ''}
        </td>
        <td style="width:45%;text-align:right;vertical-align:top;">
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid #aaa;padding:2px 0;"><span>Reference:</span> <span>${escapeHtml(data.referenceNo)}</span></div>
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid #aaa;padding:2px 0;"><span>Date:</span> <span>${escapeHtml(data.date)}</span></div>
          ${data.billerName ? `<div style="display:flex;justify-content:space-between;border-bottom:1px solid #aaa;padding:2px 0;"><span>Biller:</span> <span>${escapeHtml(data.billerName)}</span></div>` : ''}
          ${data.cashierName ? `<div style="display:flex;justify-content:space-between;border-bottom:1px solid #aaa;padding:2px 0;"><span>Served By:</span> <span>${escapeHtml(data.cashierName)}</span></div>` : ''}
        </td>
      </tr>
    </table>

    ${
      data.customerName
        ? `<table style="width:100%;border-collapse:collapse;margin-top:4px;">
      <tr>
        <td style="padding:4px 0;">
          <h2 style="background-color:${PRIMARY_COLOR};color:#fff;padding:3px 10px;margin:0 0 6px;display:inline-block;">Bill To</h2>
          <div style="margin-left:4px;">Customer: ${escapeHtml(data.customerName)}</div>
        </td>
      </tr>
    </table>`
        : ''
    }

    <table style="width:100%;border-collapse:collapse;margin-top:4px;">
      <tr class="table-header" style="background-color:${PRIMARY_COLOR};color:#fff;">
        <td style="border:1px solid #222;padding:3px 6px;width:4%;text-align:center;">#</td>
        <td style="border:1px solid #222;padding:3px 6px;width:40%;text-align:center;">Description</td>
        <td style="border:1px solid #222;padding:3px 6px;width:8%;text-align:center;">Qty</td>
        <td style="border:1px solid #222;padding:3px 6px;width:12%;text-align:center;">Unit Price</td>
        <td style="border:1px solid #222;padding:3px 6px;width:12%;text-align:center;">Discount</td>
        <td style="border:1px solid #222;padding:3px 6px;width:10%;text-align:center;">Tax</td>
        <td style="border:1px solid #222;padding:3px 6px;width:14%;text-align:center;">Subtotal</td>
      </tr>
      ${lineRows}
      ${totalsRow('Total Before Tax', money(data, totalBeforeTax))}
      ${totalsRow('Tax', money(data, data.tax))}
      ${data.discount > 0 ? totalsRow('Discount', money(data, data.discount)) : ''}
      ${data.shipping > 0 ? totalsRow('Shipping Cost', money(data, data.shipping)) : ''}
      ${totalsRow('Grand Total', money(data, data.grandTotal), true)}
      <tr>
        <td class="td-text" colspan="4" style="vertical-align:top;">
          In Words:<br /><span style="text-transform:capitalize;">${escapeHtml(numberToWords(data.grandTotal))}</span> ${escapeHtml(data.currencyCode ?? '')} only
        </td>
      </tr>
      ${totalsRow('Paid', money(data, data.paid))}
      ${data.change > 0 ? totalsRow('Change', money(data, data.change)) : totalsRow('Due', money(data, data.due))}
    </table>

    ${
      data.payments.length > 0
        ? `<table style="width:320px;margin-top:16px;">
      <thead><tr><th style="text-align:left;padding:4px 6px;border-bottom:1px solid #222;">Payment</th><th style="text-align:right;padding:4px 6px;border-bottom:1px solid #222;">Amount</th></tr></thead>
      <tbody>${paymentRows}</tbody>
    </table>`
        : ''
    }

    ${data.note ? `<p>${escapeHtml(data.note)}</p>` : ''}

    <div style="text-align:center;margin-top:24px;">
      <strong>Thank you for shopping with us!</strong>
    </div>
  </body>
</html>`;
}

const THERMAL_WIDTH: Record<'58mm' | '80mm', string> = {
  '58mm': '58mm',
  '80mm': '80mm'
};

/** Narrow single-column layout for a thermal printer roll — centered header, dotted item dividers, grey Paid/Change bar. Matches invoice_setting/{58mm,80mm}.blade.php's visual identity (regular sans-serif, not monospace — the old app didn't use Courier here either). */
export function buildThermalReceiptHtml(data: ReceiptData, size: '58mm' | '80mm' = '80mm'): string {
  const width = THERMAL_WIDTH[size];
  const totalBeforeTax = data.subtotal - data.tax;

  const lineRows = data.lines
    .map(
      (line) => `
        <tr style="border-top:1px dotted #999;">
          <td style="width:75%;padding:4px 4px 4px 0;vertical-align:top;">
            <strong>${escapeHtml(line.name)}</strong><br />
            <span style="font-size:0.8em;color:#333;">${line.qty} x ${money(data, line.unitPrice)}${line.discount > 0 ? ` &minus; ${money(data, line.discount)}` : ''}</span>
          </td>
          <td style="width:25%;padding:4px 0;text-align:right;vertical-align:bottom;">${money(data, line.total)}</td>
        </tr>`
    )
    .join('');

  const paymentRows = data.payments
    .map(
      (payment) => `
        <tr style="background-color:#ddd;">
          <td style="padding:4px;width:55%;">Paid By: ${escapeHtml(payment.method)}</td>
          <td style="padding:4px;width:45%;text-align:right;">${money(data, payment.amount)}</td>
        </tr>`
    )
    .join('');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Receipt ${escapeHtml(data.referenceNo)}</title>
    <style>
      * { font-family: 'Ubuntu', Arial, sans-serif; box-sizing: border-box; }
      @page { size: ${width} auto; margin: 2mm; }
      body { width: ${width}; margin: 0 auto; padding: 4px 6px; font-size: 12px; line-height: 1.4; color: #000; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 3px 0; }
      .centered { text-align: center; }
      small { font-size: 0.8em; }
    </style>
  </head>
  <body>
    <div class="centered">
      <h2 style="margin:0 0 4px;">${escapeHtml(data.companyName)}</h2>
      ${data.warehouseName ? `<div>${escapeHtml(data.warehouseName)}</div>` : ''}
    </div>
    <p style="margin:6px 0;">
      Date: ${escapeHtml(data.date)}<br />
      Reference: ${escapeHtml(data.referenceNo)}<br />
      ${data.customerName ? `Customer: ${escapeHtml(data.customerName)}<br />` : ''}
    </p>
    <table>
      <tbody>
        ${lineRows}
        <tr style="border-top:1px dotted #999;"><th style="text-align:left;" colspan="1">Total Before Tax</th><th style="text-align:right;">${money(data, totalBeforeTax)}</th></tr>
        <tr><th style="text-align:left;">Tax</th><th style="text-align:right;">${money(data, data.tax)}</th></tr>
        ${data.discount > 0 ? `<tr><th style="text-align:left;">Discount</th><th style="text-align:right;">${money(data, data.discount)}</th></tr>` : ''}
        ${data.shipping > 0 ? `<tr><th style="text-align:left;">Shipping Cost</th><th style="text-align:right;">${money(data, data.shipping)}</th></tr>` : ''}
        <tr><th style="text-align:left;">Grand Total</th><th style="text-align:right;">${money(data, data.grandTotal)}</th></tr>
        ${data.due > 0 && data.change <= 0 ? `<tr><th style="text-align:left;">Due</th><th style="text-align:right;">${money(data, data.due)}</th></tr>` : ''}
        <tr>
          <th class="centered" colspan="2" style="text-transform:capitalize;">In Words: ${escapeHtml(numberToWords(data.grandTotal))} ${escapeHtml(data.currencyCode ?? '')}</th>
        </tr>
        ${paymentRows}
        ${
          data.change > 0
            ? `<tr style="background-color:#ddd;"><td style="padding:4px;">Change</td><td style="padding:4px;text-align:right;">${money(data, data.change)}</td></tr>`
            : ''
        }
        <tr>
          <td class="centered" colspan="2">
            <small>${data.cashierName ? `Served By: ${escapeHtml(data.cashierName)}` : ''}</small><br />
            ${data.note ? escapeHtml(data.note) : '<strong>Thank you for shopping with us!</strong>'}
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
}

export function buildReceiptHtml(
  data: ReceiptData,
  invoiceOption: 'thermal' | 'normal',
  thermalSize: '58mm' | '80mm' = '80mm'
): string {
  return invoiceOption === 'thermal' ? buildThermalReceiptHtml(data, thermalSize) : buildNormalReceiptHtml(data);
}
