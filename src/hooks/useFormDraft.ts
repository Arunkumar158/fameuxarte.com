/**
 * useFormDraft
 * Persists and restores a form's state to/from localStorage so that
 * unsaved data survives tab switches, app-minimise events, and page reloads
 * on mobile browsers.
 *
 * Usage:
 *   const { draft, setDraft, clearDraft, hasDraft } = useFormDraft<MyForm>('my-form-key');
 */

import { useState, useCallback } from 'react';

function readDraft<T>(key: string): Partial<T> | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Partial<T>) : null;
  } catch {
    return null;
  }
}

function writeDraft<T>(key: string, value: Partial<T>): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded – silently ignore
  }
}

interface UseFormDraftReturn<T> {
  draft: Partial<T> | null;
  setDraft: (value: Partial<T>) => void;
  clearDraft: () => void;
  hasDraft: boolean;
}

export function useFormDraft<T>(key: string): UseFormDraftReturn<T> {
  const [draft, setDraftState] = useState<Partial<T> | null>(() => readDraft<T>(key));

  const setDraft = useCallback(
    (value: Partial<T>) => {
      setDraftState(value);
      writeDraft(key, value);
    },
    [key]
  );

  const clearDraft = useCallback(() => {
    setDraftState(null);
    try {
      localStorage.removeItem(key);
    } catch {}
  }, [key]);

  return { draft, setDraft, clearDraft, hasDraft: draft !== null };
}
