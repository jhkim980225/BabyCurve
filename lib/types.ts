export interface PercentileCutoffs {
  p3: number;
  p10: number;
  p50: number;
  p90: number;
  p97: number;
}

export interface MetricData {
  unit: string;
  /** key = integer gestational week as string, e.g. "30" */
  weeks: Record<string, PercentileCutoffs>;
}

export interface GrowthStandard {
  id: string;
  name: string;
  source: string;
  /** key = metric id: "efw" | "bpd" | "hc" | "ac" | "fl" */
  metrics: Record<string, MetricData>;
}

export const PERCENTILE_KEYS = [
  { key: 'p3', value: 3 },
  { key: 'p10', value: 10 },
  { key: 'p50', value: 50 },
  { key: 'p90', value: 90 },
  { key: 'p97', value: 97 },
] as const;
