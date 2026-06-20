import type { MetricData } from './types';

export function gestationalWeeksToDecimal(weeks: number, days: number): number {
  return weeks + days / 7;
}

/** Interpolate each percentile's value across the two bounding weeks; clamp outside the range. */
export function interpolateCutoffs(
  metric: MetricData,
  weekDecimal: number,
): Record<string, number> {
  const weekKeys = Object.keys(metric.weeks).map(Number).sort((a, b) => a - b);
  const first = weekKeys[0];
  const last = weekKeys[weekKeys.length - 1];
  if (weekDecimal <= first) return { ...metric.weeks[String(first)] };
  if (weekDecimal >= last) return { ...metric.weeks[String(last)] };

  let lower = first;
  let upper = last;
  for (let i = 0; i < weekKeys.length - 1; i++) {
    if (weekDecimal >= weekKeys[i] && weekDecimal <= weekKeys[i + 1]) {
      lower = weekKeys[i];
      upper = weekKeys[i + 1];
      break;
    }
  }
  const lo = metric.weeks[String(lower)];
  const hi = metric.weeks[String(upper)];
  const t = (weekDecimal - lower) / (upper - lower);
  const result: Record<string, number> = {};
  for (const p of metric.percentiles) {
    const k = String(p);
    result[k] = lo[k] + t * (hi[k] - lo[k]);
  }
  return result;
}

/** Map a measured value to a percentile by interpolating between cutoff points; clamp to the min/max percentile. */
export function valueToPercentile(
  value: number,
  cutoffs: Record<string, number>,
  percentiles: number[],
): number {
  const points = percentiles
    .map((p) => ({ p, v: cutoffs[String(p)] }))
    .sort((a, b) => a.v - b.v);

  if (value <= points[0].v) return points[0].p;
  if (value >= points[points.length - 1].v) return points[points.length - 1].p;

  for (let i = 0; i < points.length - 1; i++) {
    if (value >= points[i].v && value <= points[i + 1].v) {
      if (points[i + 1].v === points[i].v) {
        let j = i + 1;
        while (j < points.length - 1 && points[j + 1].v === points[i].v) j++;
        return points[j].p;
      }
      if (value === points[i + 1].v) {
        let j = i + 1;
        while (j < points.length - 1 && points[j + 1].v === points[i + 1].v) j++;
        return points[j].p;
      }
      const t = (value - points[i].v) / (points[i + 1].v - points[i].v);
      return points[i].p + t * (points[i + 1].p - points[i].p);
    }
  }
  return points[points.length - 1].p;
}

export function computePercentile(
  metric: MetricData,
  weeks: number,
  days: number,
  value: number,
): number {
  const cutoffs = interpolateCutoffs(metric, gestationalWeeksToDecimal(weeks, days));
  return valueToPercentile(value, cutoffs, metric.percentiles);
}
