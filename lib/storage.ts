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

// addMeasurement added in Task 2
