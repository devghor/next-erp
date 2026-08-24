'use client';

import { useEffect, useRef, type RefObject } from 'react';

const DEFAULT_MAX_INTERVAL_MS = 40;
const DEFAULT_MIN_LENGTH = 3;

export type UseBarcodeScannerOptions = {
  /** Called with the accumulated buffer once a fast-typed run is terminated by Enter. */
  onScan: (code: string) => void;
  /** Max ms between keystrokes for a run to still count as "scanner speed" rather than human typing. */
  maxIntervalMs?: number;
  /** Shortest buffer treated as a real scan (guards against a stray Enter). */
  minLength?: number;
  /** Set false to stop listening (e.g. while a modal has its own input focused). */
  enabled?: boolean;
  /**
   * The cashier's own search input, if it already has its own Enter handler
   * wired to the same "look up and add" flow — this hook then no-ops while
   * that element has focus, so a scan while it's focused doesn't fire twice
   * (once via the input's own `onKeyDown`, once via this window listener).
   */
  ignoreWhenFocusedRef?: RefObject<HTMLElement | null>;
};

/**
 * Global keydown listener that recognizes hardware barcode-scanner input:
 * scanners emit keystrokes far faster than a human can type, terminated by
 * Enter. Buffers characters typed within `maxIntervalMs` of each other and
 * fires `onScan` with the buffer when Enter arrives fast enough after the
 * last keystroke to still be "the scanner", not a manual Enter press.
 *
 * No-ops while `ignoreWhenFocusedRef`'s element has focus, so it doesn't
 * double-fire alongside that element's own Enter handler.
 */
export function useBarcodeScanner({
  onScan,
  maxIntervalMs = DEFAULT_MAX_INTERVAL_MS,
  minLength = DEFAULT_MIN_LENGTH,
  enabled = true,
  ignoreWhenFocusedRef
}: UseBarcodeScannerOptions) {
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (ignoreWhenFocusedRef?.current && document.activeElement === ignoreWhenFocusedRef.current) {
        return;
      }

      const now = performance.now();
      const elapsed = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (event.key === 'Enter') {
        const code = bufferRef.current;
        bufferRef.current = '';
        if (code.length >= minLength && elapsed <= maxIntervalMs) {
          onScanRef.current(code);
        }
        return;
      }

      if (event.key.length !== 1) return; // ignore modifiers/arrows/etc.

      if (elapsed > maxIntervalMs) {
        bufferRef.current = event.key;
      } else {
        bufferRef.current += event.key;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, maxIntervalMs, minLength, ignoreWhenFocusedRef]);
}
