'use client';

import { useState } from 'react';
import { dueDateFromLMP, gestationalAgeFromLMP } from '@/lib/dueDate';
import { useT } from '@/components/I18nProvider';

interface GestationalAge {
  weeks: number;
  days: number;
}

interface DueDateCalculatorProps {
  onApplyGA: (ga: GestationalAge) => void;
  /** Optional override for "today" — useful in tests to make output deterministic. */
  todayISO?: string;
}

export function DueDateCalculator({ onApplyGA, todayISO }: DueDateCalculatorProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [lmp, setLmp] = useState('');
  const [edd, setEdd] = useState<string | null>(null);
  const [ga, setGa] = useState<GestationalAge | null>(null);

  const handleCalculate = () => {
    if (!lmp) return;
    const today = todayISO ?? new Date().toISOString().slice(0, 10);
    const computedEdd = dueDateFromLMP(lmp);
    const computedGa = gestationalAgeFromLMP(lmp, today);
    setEdd(computedEdd);
    setGa(computedGa);
  };

  const handleApplyGA = () => {
    if (ga) {
      onApplyGA(ga);
    }
  };

  return (
    <div className="glass-card flex flex-col gap-3 p-4">
      <button
        type="button"
        className="flex items-center justify-between font-semibold text-blue-900"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span>{t('dueDate.panelTitle')}</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-3">
          <label className="text-sm">
            {t('dueDate.lmpLabel')}
            <input
              aria-label="lmp"
              type="date"
              className="mt-1 w-full rounded-lg bg-white/60 p-2"
              value={lmp}
              onChange={(e) => setLmp(e.target.value)}
            />
          </label>

          <button
            type="button"
            onClick={handleCalculate}
            className="rounded-xl bg-blue-700 p-3 font-semibold text-white"
          >
            {t('dueDate.calculateButton')}
          </button>

          {edd && (
            <p className="text-sm font-semibold text-blue-900">
              {t('dueDate.edd', { date: edd })}
            </p>
          )}

          {ga && (
            <>
              <p className="text-sm text-blue-900">
                {t('dueDate.ga', { weeks: ga.weeks, days: ga.days })}
              </p>
              <button
                type="button"
                onClick={handleApplyGA}
                className="rounded-xl bg-green-700 p-2 text-sm font-semibold text-white"
              >
                {t('dueDate.useGaButton')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
