import { useState, useEffect, useCallback } from 'react';

const BASE = '/api';

export function useGet<T>(path: string, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(BASE + path);
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => { refetch(); }, deps);

  return { data, loading, refetch };
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiFormPost(path: string, form: Record<string, string>) {
  const body = new URLSearchParams(form);
  return fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
}
