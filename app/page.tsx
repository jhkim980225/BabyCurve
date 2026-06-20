'use client';

import { useState } from 'react';
import { InputForm, type CalcInput } from '@/components/InputForm';
import { ResultCard } from '@/components/ResultCard';
import { HistoryPanel } from '@/components/HistoryPanel';
import { getStandard } from '@/lib/data';
import { computePercentile } from '@/lib/percentile';
import { addMeasurement, clearMeasurements, getMeasurements, type Measurement } from '@/lib/storage';

interface Result {
  input: CalcInput;
  percentile: number;
  standardName: string;
}

export default function Home() {
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Measurement[]>([]);

  const handleCalculate = (input: CalcInput) => {
    const standard = getStandard(input.standardId);
    const metric = standard.metrics[input.metricId];
    const percentile = computePercentile(metric, input.weeks, input.days, input.value);
    setResult({ input, percentile, standardName: standard.name });
    // Refresh history to show all saved entries for this standard+metric
    setHistory(getMeasurements());
  };

  const handleSave = () => {
    if (!result) return;
    addMeasurement({
      standardId: result.input.standardId,
      metricId: result.input.metricId,
      weeks: result.input.weeks,
      days: result.input.days,
      value: result.input.value,
      percentile: result.percentile,
    });
    setHistory(getMeasurements());
  };

  const handleClear = () => {
    clearMeasurements();
    setHistory([]);
  };

  const metric = result
    ? getStandard(result.input.standardId).metrics[result.input.metricId]
    : null;

  // Filter history to current standard+metric only
  const filteredHistory = result
    ? history.filter(
        (m) => m.standardId === result.input.standardId && m.metricId === result.input.metricId,
      )
    : [];

  // Map history entries to extraMarkers (week decimal)
  const extraMarkers = filteredHistory.map((m) => ({
    week: m.weeks + m.days / 7,
    value: m.value,
  }));

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <h1 className="text-center text-xl font-bold text-blue-900">
        Fetal Growth Calculator
      </h1>
      <InputForm onCalculate={handleCalculate} />
      {result && metric && (
        <>
          <ResultCard
            metric={metric}
            weeks={result.input.weeks}
            days={result.input.days}
            value={result.input.value}
            percentile={result.percentile}
            standardName={result.standardName}
            extraMarkers={extraMarkers}
          />
          <HistoryPanel
            measurements={filteredHistory}
            onSave={handleSave}
            onClear={handleClear}
          />
        </>
      )}
    </main>
  );
}
