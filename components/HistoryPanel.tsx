'use client';

import type { Measurement } from '@/lib/storage';
import { useT } from '@/components/I18nProvider';

interface HistoryPanelProps {
  measurements: Measurement[];
  onSave: () => void;
  onClear: () => void;
}

export function HistoryPanel({ measurements, onSave, onClear }: HistoryPanelProps) {
  const t = useT();
  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-blue-900">{t('history.title')}</h2>
        <button
          onClick={onSave}
          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
        >
          {t('history.saveToHistory')}
        </button>
      </div>

      {measurements.length > 0 && (
        <>
          <ul className="flex flex-col gap-1">
            {measurements.map((m) => (
              <li
                key={m.id}
                className="flex justify-between rounded bg-white/40 px-2 py-1 text-xs text-slate-700"
              >
                <span>
                  {m.weeks}w{m.days > 0 ? `+${m.days}d` : ''} · {m.value}
                </span>
                <span className="font-semibold text-blue-800">{Math.round(m.percentile)}th %ile</span>
              </li>
            ))}
          </ul>
          <button
            onClick={onClear}
            className="self-end text-xs text-slate-400 underline hover:text-red-500"
          >
            {t('history.clearAll')}
          </button>
        </>
      )}
    </div>
  );
}
