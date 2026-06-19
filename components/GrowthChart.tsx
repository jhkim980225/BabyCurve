'use client';

import { scaleLinear } from 'd3-scale';
import type { MetricData } from '@/lib/types';

interface GrowthChartProps {
  metric: MetricData;
  markerWeek: number;
  markerValue: number;
  width?: number;
  height?: number;
}

const PAD = { top: 16, right: 16, bottom: 28, left: 40 };

export function GrowthChart({
  metric,
  markerWeek,
  markerValue,
  width = 340,
  height = 240,
}: GrowthChartProps) {
  const weeks = Object.keys(metric.weeks).map(Number).sort((a, b) => a - b);
  const rows = weeks.map((w) => ({ w, ...metric.weeks[String(w)] }));

  const minWeek = weeks[0];
  const maxWeek = weeks[weeks.length - 1];
  const maxVal = Math.max(...rows.map((r) => r.p97)) * 1.05;
  const minVal = Math.min(...rows.map((r) => r.p3)) * 0.9;

  const x = scaleLinear().domain([minWeek, maxWeek]).range([PAD.left, width - PAD.right]);
  const y = scaleLinear().domain([minVal, maxVal]).range([height - PAD.bottom, PAD.top]);

  const lineFor = (key: 'p3' | 'p10' | 'p50' | 'p90' | 'p97') =>
    rows.map((r) => `${x(r.w)},${y(r[key])}`).join(' ');

  const bandPolygon = (top: 'p97' | 'p90', bottom: 'p3' | 'p10') => {
    const topPts = rows.map((r) => `${x(r.w)},${y(r[top])}`);
    const botPts = [...rows].reverse().map((r) => `${x(r.w)},${y(r[bottom])}`);
    return [...topPts, ...botPts].join(' ');
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label="Growth chart">
      <polygon points={bandPolygon('p97', 'p3')} fill="rgba(37,99,235,0.10)" />
      <polygon points={bandPolygon('p90', 'p10')} fill="rgba(37,99,235,0.20)" />
      <polyline points={lineFor('p50')} fill="none" stroke="#2563eb" strokeWidth={2} />
      <line
        x1={x(markerWeek)}
        y1={y(markerValue)}
        x2={x(markerWeek)}
        y2={height - PAD.bottom}
        stroke="#1e3a8a"
        strokeDasharray="3 3"
      />
      <circle
        data-testid="marker"
        cx={x(markerWeek)}
        cy={y(markerValue)}
        r={6}
        fill="#1e3a8a"
        stroke="#fff"
        strokeWidth={2}
      />
    </svg>
  );
}
