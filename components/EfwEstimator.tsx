'use client';

import { useState } from 'react';
import { estimateEFWPartial } from '@/lib/efw';
import { useT } from '@/components/I18nProvider';

interface EfwEstimatorProps {
  onEstimated: (grams: number) => void;
}

export function EfwEstimator({ onEstimated }: EfwEstimatorProps) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [bpd, setBpd] = useState('');
  const [hc, setHc] = useState('');
  const [ac, setAc] = useState('');
  const [fl, setFl] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState('');

  const handleEstimate = () => {
    const parsed = {
      bpd: bpd !== '' ? parseFloat(bpd) : undefined,
      hc: hc !== '' ? parseFloat(hc) : undefined,
      ac: ac !== '' ? parseFloat(ac) : undefined,
      fl: fl !== '' ? parseFloat(fl) : undefined,
    };
    const grams = estimateEFWPartial(parsed);
    if (grams === null) {
      setError(t('efw.errorMissingAll'));
      setResult(null);
    } else {
      setError('');
      setResult(grams);
      onEstimated(grams);
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
        <span>{t('efw.panelTitle')}</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <label className="flex-1 text-sm">
              {t('efw.bpd')}
              <input
                aria-label="bpd"
                inputMode="decimal"
                className="mt-1 w-full rounded-lg bg-white/60 p-2"
                value={bpd}
                onChange={(e) => setBpd(e.target.value)}
              />
            </label>
            <label className="flex-1 text-sm">
              {t('efw.hc')}
              <input
                aria-label="hc"
                inputMode="decimal"
                className="mt-1 w-full rounded-lg bg-white/60 p-2"
                value={hc}
                onChange={(e) => setHc(e.target.value)}
              />
            </label>
          </div>

          <div className="flex gap-2">
            <label className="flex-1 text-sm">
              {t('efw.ac')}
              <input
                aria-label="ac"
                inputMode="decimal"
                className="mt-1 w-full rounded-lg bg-white/60 p-2"
                value={ac}
                onChange={(e) => setAc(e.target.value)}
              />
            </label>
            <label className="flex-1 text-sm">
              {t('efw.fl')}
              <input
                aria-label="fl"
                inputMode="decimal"
                className="mt-1 w-full rounded-lg bg-white/60 p-2"
                value={fl}
                onChange={(e) => setFl(e.target.value)}
              />
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {result !== null && (
            <p className="text-sm font-semibold text-blue-900">
              {t('efw.result', { grams: result })}
            </p>
          )}

          <button
            type="button"
            onClick={handleEstimate}
            className="rounded-xl bg-blue-700 p-3 font-semibold text-white"
          >
            {t('efw.estimateButton')}
          </button>
        </div>
      )}
    </div>
  );
}
