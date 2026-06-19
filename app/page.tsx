'use client';

import { useState } from 'react';
import { InputForm, type CalcInput } from '@/components/InputForm';
import { ResultCard } from '@/components/ResultCard';
import { getStandard } from '@/lib/data';
import { computePercentile } from '@/lib/percentile';

interface Result {
  input: CalcInput;
  percentile: number;
  standardName: string;
}

export default function Home() {
  const [result, setResult] = useState<Result | null>(null);

  const handleCalculate = (input: CalcInput) => {
    const standard = getStandard(input.standardId);
    const metric = standard.metrics[input.metricId];
    const percentile = computePercentile(metric, input.weeks, input.days, input.value);
    setResult({ input, percentile, standardName: standard.name });
  };

  const metric = result ? getStandard(result.input.standardId).metrics[result.input.metricId] : null;

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <h1 className="text-center text-xl font-bold text-blue-900">
        Fetal Growth Calculator
      </h1>
      <InputForm onCalculate={handleCalculate} />
      {result && metric && (
        <ResultCard
          metric={metric}
          weeks={result.input.weeks}
          days={result.input.days}
          value={result.input.value}
          percentile={result.percentile}
          standardName={result.standardName}
        />
      )}
    </main>
  );
}
