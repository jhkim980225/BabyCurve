import type { MetricData, PercentileCutoffs } from './types';
import { PERCENTILE_KEYS } from './types';

export function gestationalWeeksToDecimal(weeks: number, days: number): number {
  return weeks + days / 7;
}

export function interpolateCutoffs(
  metric: MetricData,
  weekDecimal: number,
): PercentileCutoffs {
  const weekKeys = Object.keys(metric.weeks)
    .map(Number)
    .sort((a, b) => a - b);

  const first = weekKeys[0];
  const last = weekKeys[weekKeys.length - 1];

  if (weekDecimal <= first) return metric.weeks[String(first)];
  if (weekDecimal >= last) return metric.weeks[String(last)];

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

  const result = {} as PercentileCutoffs;
  for (const { key } of PERCENTILE_KEYS) {
    result[key] = lo[key] + t * (hi[key] - lo[key]);
  }
  return result;
}

export function valueToPercentile(
  value: number,
  cutoffs: PercentileCutoffs,
): number {
  const points = PERCENTILE_KEYS.map(({ key, value: p }) => ({
    p,
    v: cutoffs[key],
  })).sort((a, b) => a.v - b.v);

  if (value <= points[0].v) return points[0].p;
  if (value >= points[points.length - 1].v) return points[points.length - 1].p;

  for (let i = 0; i < points.length - 1; i++) {
    if (value >= points[i].v && value <= points[i + 1].v) {
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
  return valueToPercentile(value, cutoffs);
}
