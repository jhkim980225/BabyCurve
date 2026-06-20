'use client';

import { useState } from 'react';
import { InputForm, type CalcInput } from '@/components/InputForm';
import { ResultCard } from '@/components/ResultCard';
import { HistoryPanel } from '@/components/HistoryPanel';
import { getStandard } from '@/lib/data';
import { computePercentile } from '@/lib/percentile';
import { addMeasurement, clearMeasurements, getMeasurements, type Measurement } from '@/lib/storage';
import { Disclaimer } from '@/components/Disclaimer';
import { DevInfo } from '@/components/DevInfo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useT } from '@/components/I18nProvider';

interface Result {
  input: CalcInput;
  percentile: number;
  standardName: string;
}

interface LocalePageProps {
  params: Promise<{ locale: string }>;
}

export default function LocalePage({ params: _params }: LocalePageProps) {
  const t = useT();
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Measurement[]>([]);

  const handleCalculate = (input: CalcInput) => {
    const standard = getStandard(input.standardId);
    const metric = standard.metrics[input.metricId];
    const percentile = computePercentile(metric, input.weeks, input.days, input.value);
    setResult({ input, percentile, standardName: standard.name });
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

  const filteredHistory = result
    ? history.filter(
        (m) => m.standardId === result.input.standardId && m.metricId === result.input.metricId,
      )
    : [];

  const extraMarkers = filteredHistory.map((m) => ({
    week: m.weeks + m.days / 7,
    value: m.value,
  }));

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-900">
          {t('app.title')}
        </h1>
        <LanguageSwitcher />
      </div>
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
          <DevInfo week={result.input.weeks} />
          <HistoryPanel
            measurements={filteredHistory}
            onSave={handleSave}
            onClear={handleClear}
          />
        </>
      )}
      <Disclaimer />
    </main>
  );
}
