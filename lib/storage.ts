const STORAGE_KEY = 'babycurve.measurements';

export interface Measurement {
  id: string;
  standardId: string;
  metricId: string;
  weeks: number;
  days: number;
  value: number;
  percentile: number;
  ts: number;
}

export function getMeasurements(): Measurement[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Measurement[];
  } catch {
    return [];
  }
}

export function clearMeasurements(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function addMeasurement(
  m: Omit<Measurement, 'id' | 'ts'> & { id?: string; ts?: number },
): Measurement {
  if (typeof window === 'undefined') {
    // SSR fallback: return a valid object without persisting
    const ts = m.ts ?? Date.now();
    const id = m.id ?? (String(ts) + Math.random());
    return { ...m, id, ts } as Measurement;
  }
  const ts = m.ts ?? Date.now();
  const id = m.id ?? (typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : String(ts) + Math.random());
  const entry: Measurement = { ...m, id, ts } as Measurement;
  const existing = getMeasurements();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...existing]));
  return entry;
}
