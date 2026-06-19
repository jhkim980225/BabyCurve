'use client';

import { useState } from 'react';
import { getStandardIndex } from '@/lib/data';

export interface CalcInput {
  standardId: string;
  metricId: string;
  weeks: number;
  days: number;
  value: number;
}

interface InputFormProps {
  onCalculate: (input: CalcInput) => void;
}

export function InputForm({ onCalculate }: InputFormProps) {
  const standards = getStandardIndex().standards;
  const [standardId, setStandardId] = useState(standards[0].id);
  const [metricId, setMetricId] = useState(standards[0].metrics[0]);
  const [weeks, setWeeks] = useState('');
  const [days, setDays] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const metrics = standards.find((s) => s.id === standardId)?.metrics ?? [];

  const submit = () => {
    const w = Number(weeks);
    const d = days === '' ? 0 : Number(days);
    const v = Number(value);
    if (!weeks || Number.isNaN(w) || w < 0) {
      setError('Please enter a valid gestational week.');
      return;
    }
    if (!value || Number.isNaN(v) || v <= 0) {
      setError('Please enter a measurement.');
      return;
    }
    setError('');
    onCalculate({ standardId, metricId, weeks: w, days: d, value: v });
  };

  return (
    <div className="glass-card flex flex-col gap-3 p-4">
      <label className="text-sm">
        Standard
        <select
          aria-label="standard"
          className="mt-1 w-full rounded-lg bg-white/60 p-2"
          value={standardId}
          onChange={(e) => {
            const newStandardId = e.target.value;
            const newMetrics = standards.find((s) => s.id === newStandardId)?.metrics ?? [];
            setStandardId(newStandardId);
            setMetricId(newMetrics[0]);
          }}
        >
          {standards.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        Metric
        <select
          aria-label="metric"
          className="mt-1 w-full rounded-lg bg-white/60 p-2"
          value={metricId}
          onChange={(e) => setMetricId(e.target.value)}
        >
          {metrics.map((m) => (
            <option key={m} value={m}>{m.toUpperCase()}</option>
          ))}
        </select>
      </label>

      <div className="flex gap-2">
        <label className="flex-1 text-sm">
          Weeks
          <input
            aria-label="weeks"
            inputMode="numeric"
            className="mt-1 w-full rounded-lg bg-white/60 p-2"
            value={weeks}
            onChange={(e) => setWeeks(e.target.value)}
          />
        </label>
        <label className="flex-1 text-sm">
          Days
          <input
            aria-label="days"
            inputMode="numeric"
            className="mt-1 w-full rounded-lg bg-white/60 p-2"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </label>
      </div>

      <label className="text-sm">
        Measurement
        <input
          aria-label="measurement"
          inputMode="numeric"
          className="mt-1 w-full rounded-lg bg-white/60 p-2"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={submit}
        className="rounded-xl bg-blue-700 p-3 font-semibold text-white"
      >
        Calculate
      </button>
    </div>
  );
}
