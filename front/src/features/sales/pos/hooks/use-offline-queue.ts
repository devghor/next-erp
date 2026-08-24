'use client';

// ============================================================
// Offline sale queue — persists a checkout payload to localStorage when
// `createSaleMutation` fails offline/on a network error, then retries it
// on mount, on `online`, and on a 30s interval while items remain.
// ============================================================
// Key is versioned per the repo's client-localstorage-schema convention
// (.agents/skills/vercel-react-best-practices/rules/client-localstorage-schema.md):
// a `_v1` suffix so a future breaking payload-shape change can migrate
// instead of crashing on old entries.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api-client';
import { createSaleMutation } from '@/features/sales/sales/api/mutations';
import { saleKeys } from '@/features/sales/sales/api/queries';
import type { SaleMutationPayload } from '@/features/sales/sales/api/types';

const STORAGE_KEY = 'pos_offline_queue_v1';
const FLUSH_INTERVAL_MS = 30_000;

export type OfflineQueueItem = {
  client_reference: string;
  payload: SaleMutationPayload;
  queued_at: string;
};

/** A network-level failure (no HTTP response at all, or the browser reports itself offline) — the case the queue exists for, as opposed to a real validation/auth error the mutation's own `onError` should surface. */
export function isOfflineFailure(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  return error instanceof ApiError && error.status == null;
}

function readQueue(): OfflineQueueItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as OfflineQueueItem[]) : [];
  } catch {
    // Unavailable (private browsing/quota) or corrupt — treat as empty.
    return [];
  }
}

function writeQueue(items: OfflineQueueItem[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Same as above — the queue then only lives in memory for this session.
  }
}

export function useOfflineQueue() {
  const [items, setItems] = useState<OfflineQueueItem[]>([]);
  const flushingRef = useRef(false);
  const queryClient = useQueryClient();
  const mutation = useMutation(createSaleMutation);

  useEffect(() => {
    setItems(readQueue());
  }, []);

  const enqueue = useCallback((payload: SaleMutationPayload, clientReference: string) => {
    setItems((prev) => {
      if (prev.some((item) => item.client_reference === clientReference)) return prev;
      const next = [...prev, { client_reference: clientReference, payload, queued_at: new Date().toISOString() }];
      writeQueue(next);
      return next;
    });
  }, []);

  const flush = useCallback(async () => {
    if (flushingRef.current) return;
    const current = readQueue();
    if (current.length === 0) return;
    flushingRef.current = true;

    const remaining: OfflineQueueItem[] = [];
    let syncedCount = 0;
    for (const item of current) {
      try {
        await mutation.mutateAsync({ ...item.payload, client_reference: item.client_reference });
        syncedCount += 1;
      } catch (error) {
        // A 422 here means the backend already has this client_reference (a
        // prior sync attempt got the sale created but the response was lost)
        // — treat it as synced rather than retrying forever.
        if (error instanceof ApiError && error.status === 422) {
          syncedCount += 1;
        } else {
          remaining.push(item);
        }
      }
    }

    writeQueue(remaining);
    setItems(remaining);
    flushingRef.current = false;

    if (syncedCount > 0) {
      queryClient.invalidateQueries({ queryKey: saleKeys.all });
      toast.success(`${syncedCount} queued offline sale${syncedCount === 1 ? '' : 's'} synced`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]);

  // Flush on mount and whenever the browser comes back online.
  useEffect(() => {
    flush();
    window.addEventListener('online', flush);
    return () => window.removeEventListener('online', flush);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep retrying every 30s only while something is actually queued.
  useEffect(() => {
    if (items.length === 0) return;
    const interval = window.setInterval(flush, FLUSH_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [items.length, flush]);

  return { pendingCount: items.length, items, enqueue, flush };
}

export type UseOfflineQueueReturn = ReturnType<typeof useOfflineQueue>;
