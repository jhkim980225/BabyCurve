'use client';

import { scaleLinear } from 'd3-scale';
import type { MetricData } from '@/lib/types';

interface GrowthChartProps {
  metric: MetricData;
  markerWeek: number;
  markerValue: number;
  width?: number;
  height?: number;
  extraMarkers?: { week: number; value: number }[];
}

const PAD = { top: 16, right: 16, bottom: 28, left: 40 };

export function GrowthChart({
  metric,
  markerWeek,
  markerValue,
  width = 340,
  height = 240,
  extraMarkers = [],
}: GrowthChartProps) {
  const weekNums = Object.keys(metric.weeks).map(Number).sort((a, b) => a - b);

  if (weekNums.length < 2) return null;

  const sorted = [...metric.percentiles].sort((a, b) => a - b);

  const rows = weekNums.map((w) => ({ w, data: metric.weeks[String(w)] }));

  const minWeek = weekNums[0];
  const maxWeek = weekNums[weekNums.length - 1];

  const loKey = String(sorted[0]);
  const hiKey = String(sorted[sorted.length - 1]);

  const maxVal = Math.max(...rows.map((r) => r.data[hiKey])) * 1.05;
  const minVal = Math.min(...rows.map((r) => r.data[loKey])) * 0.9;

  const clampedWeek = Math.min(maxWeek, Math.max(minWeek, markerWeek));
  const clampedValue = Math.min(maxVal, Math.max(minVal, markerValue));

  const x = scaleLinear().domain([minWeek, maxWeek]).range([PAD.left, width - PAD.right]);
  const y = scaleLinear().domain([minVal, maxVal]).range([height - PAD.bottom, PAD.top]);

  const lineFor = (pKey: string) =>
    rows.map((r) => `${x(r.w)},${y(r.data[pKey])}`).join(' ');

  const bandPolygon = (topKey: string, bottomKey: string) => {
    const topPts = rows.map((r) => `${x(r.w)},${y(r.data[topKey])}`);
    const botPts = [...rows].reverse().map((r) => `${x(r.w)},${y(r.data[bottomKey])}`);
    return [...topPts, ...botPts].join(' ');
  };

  // Median: percentile equal to 50, else closest to 50
  const medianP = sorted.includes(50)
    ? 50
    : sorted.reduce((best, p) => (Math.abs(p - 50) < Math.abs(best - 50) ? p : best), sorted[0]);
  const medianKey = String(medianP);

  // Bands
  const bands: React.ReactNode[] = [];
  if (sorted.length >= 2) {
    bands.push(
      <polygon
        key="outer"
        points={bandPolygon(hiKey, loKey)}
        fill="rgba(37,99,235,0.10)"
      />,
    );
  }
  if (sorted.length >= 4) {
    const innerLoKey = String(sorted[1]);
    const innerHiKey = String(sorted[sorted.length - 2]);
    bands.push(
      <polygon
        key="inner"
        points={bandPolygon(innerHiKey, innerLoKey)}
        fill="rgba(37,99,235,0.20)"
      />,
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label="Growth chart">
      {bands}
      <polyline points={lineFor(medianKey)} fill="none" stroke="#2563eb" strokeWidth={2} />
      <line
        x1={x(clampedWeek)}
        y1={y(clampedValue)}
        x2={x(clampedWeek)}
        y2={height - PAD.bottom}
        stroke="#1e3a8a"
        strokeDasharray="3 3"
      />
      {extraMarkers.map((em, i) => {
        const cx = x(Math.min(maxWeek, Math.max(minWeek, em.week)));
        const cy = y(Math.min(maxVal, Math.max(minVal, em.value)));
        return (
          <circle
            key={i}
            data-testid="extra-marker"
            cx={cx}
            cy={cy}
            r={4}
            fill="rgba(124,58,237,0.7)"
          />
        );
      })}
      <circle
        data-testid="marker"
        cx={x(clampedWeek)}
        cy={y(clampedValue)}
        r={6}
        fill="#1e3a8a"
        stroke="#fff"
        strokeWidth={2}
      />
    </svg>
  );
}
