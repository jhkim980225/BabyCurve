export interface MetricData {
  unit: string;
  /** percentiles present in the data, ascending, e.g. [3,10,50,90,97] or [5,10,50,90,95] */
  percentiles: number[];
  /** weekKey -> (percentile-as-string -> value), e.g. weeks["28"]["50"] = 1209 */
  weeks: Record<string, Record<string, number>>;
}

export interface GrowthStandard {
  id: string;
  name: string;
  source: string;
  metrics: Record<string, MetricData>;
}
