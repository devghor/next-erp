// ============================================================
// Money formatting — shared currency/decimal formatter.
// ============================================================
// No equivalent exists in src/lib (checked src/lib/utils.ts: only cn()
// and formatBytes() live there), so this is a new, reusable util.
// ============================================================

export type FormatMoneyOptions = {
  /** ISO 4217 code, e.g. 'USD'. Falls back to plain decimal formatting when omitted or unrecognized. */
  currencyCode?: string | null;
  /** Used only when `currencyCode` is absent — prefixed/suffixed manually since Intl needs a real code. */
  symbol?: string | null;
  locale?: string;
  decimals?: number;
};

/** Formats an amount as currency when a code is available, else as a plain decimal (optionally symbol-prefixed). */
export function formatMoney(amount: number, options: FormatMoneyOptions = {}): string {
  const { currencyCode, symbol, locale = 'en-US', decimals = 2 } = options;
  // Laravel's `decimal:N` model casts serialize as numeric strings (e.g. "65656.00") over the API,
  // so coerce before the finite check — Number.isFinite (unlike the global isFinite) rejects strings outright.
  const numericAmount = typeof amount === 'string' ? Number(amount) : amount;
  const value = Number.isFinite(numericAmount) ? numericAmount : 0;

  if (currencyCode) {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(value);
    } catch {
      // Unrecognized/invalid ISO code — fall through to plain decimal below.
    }
  }

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);

  return symbol ? `${symbol}${formatted}` : formatted;
}

/** Plain fixed-decimal formatting, no currency symbol — for table cells and inputs. */
export function formatDecimal(amount: number, decimals = 2): string {
  const numericAmount = typeof amount === 'string' ? Number(amount) : amount;
  return (Number.isFinite(numericAmount) ? numericAmount : 0).toFixed(decimals);
}

/** Rounds to the given decimal precision (default 2) without the float drift of a plain `.toFixed` round-trip. */
export function roundMoney(amount: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((amount + Number.EPSILON) * factor) / factor;
}
