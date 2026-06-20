'use client';

import { useRef } from 'react';
import { GrowthChart } from './GrowthChart';
import { ResultActions } from './ResultActions';
import { ordinalSuffix } from '@/lib/ordinal';
import type { MetricData } from '@/lib/types';

interface ResultCardProps {
  metric: MetricData;
  weeks: number;
  days: number;
  value: number;
  percentile: number;
  standardName: string;
  extraMarkers?: { week: number; value: number }[];
}

export function ResultCard({
  metric,
  weeks,
  days,
  value,
  percentile,
  standardName,
  extraMarkers,
}: ResultCardProps) {
  const rounded = Math.round(percentile);
  const markerWeek = weeks + days / 7;
  const cardRef = useRef<HTMLDivElement>(null);
  const fileName = `babycurve-${standardName.replace(/\s+/g, '-').toLowerCase()}-w${weeks}.png`;
  const shareTitle = `BabyCurve · ${rounded}${ordinalSuffix(rounded)} percentile at ${weeks}w`;

  return (
    <div className="glass-card p-4 text-center" ref={cardRef}>
      <p className="text-xs uppercase tracking-widest text-slate-500">
        Week {weeks}
        {days ? ` + ${days}` : ''} · {standardName}
      </p>
      <p className="my-1 text-5xl font-bold text-blue-900">
        {rounded}
        <span className="align-top text-lg text-blue-500">{ordinalSuffix(rounded)}</span>
      </p>
      <p className="mb-3 text-xs uppercase tracking-widest text-slate-500">percentile</p>

      <GrowthChart
        metric={metric}
        markerWeek={markerWeek}
        markerValue={value}
        extraMarkers={extraMarkers}
      />

      <ResultActions targetRef={cardRef} fileName={fileName} shareTitle={shareTitle} />

      <p className="mt-3 text-[10px] text-slate-400">
        For reference only · Not medical advice
      </p>
    </div>
  );
}
