# Fetal Growth Calculator — Plan 1: Foundation & Core Percentile Calculator

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working single-page web app where a user picks a growth standard + metric, enters gestational age and a measurement, and sees the percentile marked as a point on a color-band D3 growth curve, styled in the light-blue glass theme.

**Architecture:** Next.js (App Router) with `output: 'export'` for static generation. Pure-function percentile logic in `lib/`, data-driven standards loaded from JSON, presentation split into focused components (`InputForm`, `GrowthChart`, `ResultCard`). TDD for all logic via Vitest; component render tests via Testing Library + jsdom.

**Tech Stack:** Next.js 14+, TypeScript, Tailwind CSS, D3 (d3-scale, d3-shape), Vitest, @testing-library/react.

**Scope note:** This plan is the foundation. EFW auto-calc, measurement tracking, due-date calculator, i18n + first-entry language selection, week-by-week development info (Plan 2), and SEO + Capacitor packaging (Plan 3) are intentionally out of scope here. Plan 1 ships a fully working English-only single-feature app.

---

### Task 1: Scaffold Next.js + TypeScript + Tailwind project

**Files:**
- Create: `package.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: Create the Next.js app non-interactively**

Run:
```bash
npx create-next-app@latest . --ts --tailwind --app --eslint --no-src-dir --import-alias "@/*" --use-npm
```
Expected: project files created in the current directory. If it complains the directory is non-empty (the `docs/` and `.gitignore` exist), choose to proceed/overwrite-none; existing `docs/` and `.gitignore` must remain.

- [ ] **Step 2: Configure static export**

Replace `next.config.mjs` with:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
```

- [ ] **Step 3: Verify the dev build runs**

Run: `npm run build`
Expected: PASS — build completes and produces an `out/` directory.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js + TS + Tailwind with static export"
```

---

### Task 2: Set up Vitest + Testing Library

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Modify: `package.json` (scripts + devDeps)

- [ ] **Step 1: Install test dependencies**

Run:
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Add test script to `package.json`**

Add to the `"scripts"` object:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Verify the test runner starts**

Run: `npx vitest run`
Expected: PASS — "No test files found" (exit 0) or runs with 0 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: add Vitest + Testing Library setup"
```

---

### Task 3: Define data types and `interpolateCutoffs`

**Files:**
- Create: `lib/types.ts`, `lib/percentile.ts`, `lib/percentile.test.ts`

- [ ] **Step 1: Create types in `lib/types.ts`**

```ts
export interface PercentileCutoffs {
  p3: number;
  p10: number;
  p50: number;
  p90: number;
  p97: number;
}

export interface MetricData {
  unit: string;
  /** key = integer gestational week as string, e.g. "30" */
  weeks: Record<string, PercentileCutoffs>;
}

export interface GrowthStandard {
  id: string;
  name: string;
  source: string;
  /** key = metric id: "efw" | "bpd" | "hc" | "ac" | "fl" */
  metrics: Record<string, MetricData>;
}

export const PERCENTILE_KEYS = [
  { key: 'p3', value: 3 },
  { key: 'p10', value: 10 },
  { key: 'p50', value: 50 },
  { key: 'p90', value: 90 },
  { key: 'p97', value: 97 },
] as const;
```

- [ ] **Step 2: Write the failing test in `lib/percentile.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { interpolateCutoffs, gestationalWeeksToDecimal } from './percentile';
import type { MetricData } from './types';

const metric: MetricData = {
  unit: 'g',
  weeks: {
    '28': { p3: 880, p10: 1000, p50: 1150, p90: 1300, p97: 1400 },
    '32': { p3: 1450, p10: 1650, p50: 1900, p90: 2150, p97: 2300 },
  },
};

describe('gestationalWeeksToDecimal', () => {
  it('converts weeks + days to a decimal week', () => {
    expect(gestationalWeeksToDecimal(30, 0)).toBe(30);
    expect(gestationalWeeksToDecimal(30, 7)).toBe(31);
    expect(gestationalWeeksToDecimal(28, 0)).toBe(28);
  });
});

describe('interpolateCutoffs', () => {
  it('returns exact cutoffs at a known week', () => {
    expect(interpolateCutoffs(metric, 28)).toEqual(metric.weeks['28']);
  });

  it('linearly interpolates the midpoint between two weeks', () => {
    const mid = interpolateCutoffs(metric, 30);
    expect(mid.p50).toBeCloseTo(1525, 5); // (1150 + 1900) / 2
    expect(mid.p3).toBeCloseTo(1165, 5);  // (880 + 1450) / 2
  });

  it('clamps below the lowest known week', () => {
    expect(interpolateCutoffs(metric, 20)).toEqual(metric.weeks['28']);
  });

  it('clamps above the highest known week', () => {
    expect(interpolateCutoffs(metric, 40)).toEqual(metric.weeks['32']);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run lib/percentile.test.ts`
Expected: FAIL — cannot import `interpolateCutoffs` / `gestationalWeeksToDecimal` (not defined).

- [ ] **Step 4: Implement in `lib/percentile.ts`**

```ts
import type { MetricData, PercentileCutoffs } from './types';
import { PERCENTILE_KEYS } from './types';

export function gestationalWeeksToDecimal(weeks: number, days: number): number {
  return weeks + days / 7;
}

export function interpolateCutoffs(
  metric: MetricData,
  weekDecimal: number,
): PercentileCutoffs {
  const weekKeys = Object.keys(metric.weeks)
    .map(Number)
    .sort((a, b) => a - b);

  const first = weekKeys[0];
  const last = weekKeys[weekKeys.length - 1];

  if (weekDecimal <= first) return metric.weeks[String(first)];
  if (weekDecimal >= last) return metric.weeks[String(last)];

  let lower = first;
  let upper = last;
  for (let i = 0; i < weekKeys.length - 1; i++) {
    if (weekDecimal >= weekKeys[i] && weekDecimal <= weekKeys[i + 1]) {
      lower = weekKeys[i];
      upper = weekKeys[i + 1];
      break;
    }
  }

  const lo = metric.weeks[String(lower)];
  const hi = metric.weeks[String(upper)];
  const t = (weekDecimal - lower) / (upper - lower);

  const result = {} as PercentileCutoffs;
  for (const { key } of PERCENTILE_KEYS) {
    result[key] = lo[key] + t * (hi[key] - lo[key]);
  }
  return result;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run lib/percentile.test.ts`
Expected: PASS — all tests in both describe blocks green.

- [ ] **Step 6: Commit**

```bash
git add lib/types.ts lib/percentile.ts lib/percentile.test.ts
git commit -m "feat: add growth data types and cutoff interpolation"
```

---

### Task 4: Implement `valueToPercentile`

**Files:**
- Modify: `lib/percentile.ts`, `lib/percentile.test.ts`

- [ ] **Step 1: Add the failing test to `lib/percentile.test.ts`**

```ts
import { valueToPercentile } from './percentile';

describe('valueToPercentile', () => {
  const cutoffs = { p3: 880, p10: 1000, p50: 1150, p90: 1300, p97: 1400 };

  it('returns 50 at the median value', () => {
    expect(valueToPercentile(1150, cutoffs)).toBeCloseTo(50, 5);
  });

  it('interpolates between p50 and p90', () => {
    // halfway between 1150 (p50) and 1300 (p90) => percentile 70
    expect(valueToPercentile(1225, cutoffs)).toBeCloseTo(70, 5);
  });

  it('clamps to 3 below the lowest cutoff', () => {
    expect(valueToPercentile(500, cutoffs)).toBe(3);
  });

  it('clamps to 97 above the highest cutoff', () => {
    expect(valueToPercentile(2000, cutoffs)).toBe(97);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/percentile.test.ts`
Expected: FAIL — `valueToPercentile` is not exported.

- [ ] **Step 3: Add the implementation to `lib/percentile.ts`**

```ts
export function valueToPercentile(
  value: number,
  cutoffs: PercentileCutoffs,
): number {
  const points = PERCENTILE_KEYS.map(({ key, value: p }) => ({
    p,
    v: cutoffs[key],
  })).sort((a, b) => a.v - b.v);

  if (value <= points[0].v) return points[0].p;
  if (value >= points[points.length - 1].v) return points[points.length - 1].p;

  for (let i = 0; i < points.length - 1; i++) {
    if (value >= points[i].v && value <= points[i + 1].v) {
      const t = (value - points[i].v) / (points[i + 1].v - points[i].v);
      return points[i].p + t * (points[i + 1].p - points[i].p);
    }
  }
  return points[points.length - 1].p;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/percentile.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/percentile.ts lib/percentile.test.ts
git commit -m "feat: add value-to-percentile interpolation"
```

---

### Task 5: Implement `computePercentile` orchestrator

**Files:**
- Modify: `lib/percentile.ts`, `lib/percentile.test.ts`

- [ ] **Step 1: Add the failing test to `lib/percentile.test.ts`**

```ts
import { computePercentile } from './percentile';

describe('computePercentile', () => {
  it('combines week interpolation and value lookup', () => {
    // week 30 (midpoint of 28/32) => p50 cutoff = 1525
    const result = computePercentile(metric, 30, 0, 1525);
    expect(result).toBeCloseTo(50, 5);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/percentile.test.ts`
Expected: FAIL — `computePercentile` not exported.

- [ ] **Step 3: Add the implementation to `lib/percentile.ts`**

```ts
export function computePercentile(
  metric: MetricData,
  weeks: number,
  days: number,
  value: number,
): number {
  const cutoffs = interpolateCutoffs(metric, gestationalWeeksToDecimal(weeks, days));
  return valueToPercentile(value, cutoffs);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run lib/percentile.test.ts`
Expected: PASS — all percentile tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/percentile.ts lib/percentile.test.ts
git commit -m "feat: add computePercentile orchestrator"
```

---

### Task 6: Add sample standard data + data loader

**Files:**
- Create: `data/standards/index.json`, `data/standards/who.json`, `lib/data.ts`, `lib/data.test.ts`

- [ ] **Step 1: Create `data/standards/index.json`**

```json
{
  "standards": [
    { "id": "who", "name": "WHO Fetal Growth", "metrics": ["efw", "bpd", "hc", "ac", "fl"] }
  ]
}
```

- [ ] **Step 2: Create `data/standards/who.json` (sample values — to be replaced by client data)**

```json
{
  "id": "who",
  "name": "WHO Fetal Growth",
  "source": "Sample placeholder data — replace with client-provided WHO tables",
  "metrics": {
    "efw": {
      "unit": "g",
      "weeks": {
        "24": { "p3": 480, "p10": 540, "p50": 640, "p90": 740, "p97": 810 },
        "28": { "p3": 880, "p10": 1000, "p50": 1150, "p90": 1300, "p97": 1400 },
        "32": { "p3": 1450, "p10": 1650, "p50": 1900, "p90": 2150, "p97": 2300 },
        "36": { "p3": 2100, "p10": 2400, "p50": 2700, "p90": 3050, "p97": 3250 },
        "40": { "p3": 2700, "p10": 3050, "p50": 3450, "p90": 3850, "p97": 4100 }
      }
    }
  }
}
```

- [ ] **Step 3: Write the failing test in `lib/data.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { getStandardIndex, getStandard } from './data';

describe('data loader', () => {
  it('lists available standards from the index', () => {
    const index = getStandardIndex();
    expect(index.standards.map((s) => s.id)).toContain('who');
  });

  it('loads a standard by id with its metrics', () => {
    const who = getStandard('who');
    expect(who.id).toBe('who');
    expect(who.metrics.efw.unit).toBe('g');
    expect(who.metrics.efw.weeks['28'].p50).toBe(1150);
  });

  it('throws for an unknown standard id', () => {
    expect(() => getStandard('nope')).toThrow();
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npx vitest run lib/data.test.ts`
Expected: FAIL — `./data` not found.

- [ ] **Step 5: Implement `lib/data.ts`**

```ts
import type { GrowthStandard } from './types';
import index from '@/data/standards/index.json';
import who from '@/data/standards/who.json';

export interface StandardIndex {
  standards: { id: string; name: string; metrics: string[] }[];
}

const STANDARDS: Record<string, GrowthStandard> = {
  who: who as GrowthStandard,
};

export function getStandardIndex(): StandardIndex {
  return index as StandardIndex;
}

export function getStandard(id: string): GrowthStandard {
  const standard = STANDARDS[id];
  if (!standard) throw new Error(`Unknown growth standard: ${id}`);
  return standard;
}
```

- [ ] **Step 6: Enable JSON imports in `tsconfig.json`**

Ensure `compilerOptions` contains:
```json
"resolveJsonModule": true,
"esModuleInterop": true
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npx vitest run lib/data.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add data/ lib/data.ts lib/data.test.ts tsconfig.json
git commit -m "feat: add sample growth standard data and loader"
```

---

### Task 7: Build the `GrowthChart` D3 band component

**Files:**
- Create: `components/GrowthChart.tsx`, `components/GrowthChart.test.tsx`
- Install: `d3-scale`, `d3-shape`

- [ ] **Step 1: Install D3 modules**

Run:
```bash
npm install d3-scale d3-shape
npm install -D @types/d3-scale @types/d3-shape
```

- [ ] **Step 2: Write the failing test in `components/GrowthChart.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { GrowthChart } from './GrowthChart';
import type { MetricData } from '@/lib/types';

const metric: MetricData = {
  unit: 'g',
  weeks: {
    '24': { p3: 480, p10: 540, p50: 640, p90: 740, p97: 810 },
    '32': { p3: 1450, p10: 1650, p50: 1900, p90: 2150, p97: 2300 },
    '40': { p3: 2700, p10: 3050, p50: 3450, p90: 3850, p97: 4100 },
  },
};

describe('GrowthChart', () => {
  it('renders an svg with band polygons, a median line, and the marked point', () => {
    const { container } = render(
      <GrowthChart metric={metric} markerWeek={32} markerValue={2000} />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
    // two band polygons (p3-p97 outer, p10-p90 inner)
    expect(container.querySelectorAll('polygon').length).toBeGreaterThanOrEqual(2);
    // median polyline
    expect(container.querySelector('polyline')).toBeInTheDocument();
    // marker point
    expect(container.querySelector('[data-testid="marker"]')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run components/GrowthChart.test.tsx`
Expected: FAIL — cannot import `GrowthChart`.

- [ ] **Step 4: Implement `components/GrowthChart.tsx`**

```tsx
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run components/GrowthChart.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/GrowthChart.tsx components/GrowthChart.test.tsx package.json package-lock.json
git commit -m "feat: add D3 color-band growth chart component"
```

---

### Task 8: Build the `InputForm` component

**Files:**
- Create: `components/InputForm.tsx`, `components/InputForm.test.tsx`

- [ ] **Step 1: Write the failing test in `components/InputForm.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputForm } from './InputForm';

describe('InputForm', () => {
  it('calls onCalculate with parsed values', async () => {
    const onCalculate = vi.fn();
    render(<InputForm onCalculate={onCalculate} />);

    await userEvent.type(screen.getByLabelText(/weeks/i), '30');
    await userEvent.type(screen.getByLabelText(/days/i), '2');
    await userEvent.type(screen.getByLabelText(/measurement/i), '1500');
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    expect(onCalculate).toHaveBeenCalledWith({
      standardId: 'who',
      metricId: 'efw',
      weeks: 30,
      days: 2,
      value: 1500,
    });
  });

  it('shows a validation error for an empty measurement', async () => {
    const onCalculate = vi.fn();
    render(<InputForm onCalculate={onCalculate} />);

    await userEvent.type(screen.getByLabelText(/weeks/i), '30');
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    expect(screen.getByText(/enter a measurement/i)).toBeInTheDocument();
    expect(onCalculate).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/InputForm.test.tsx`
Expected: FAIL — cannot import `InputForm`.

- [ ] **Step 3: Implement `components/InputForm.tsx`**

```tsx
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
          onChange={(e) => setStandardId(e.target.value)}
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/InputForm.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/InputForm.tsx components/InputForm.test.tsx
git commit -m "feat: add input form with validation"
```

---

### Task 9: Build the `ResultCard` component

**Files:**
- Create: `components/ResultCard.tsx`, `components/ResultCard.test.tsx`

- [ ] **Step 1: Write the failing test in `components/ResultCard.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultCard } from './ResultCard';
import type { MetricData } from '@/lib/types';

const metric: MetricData = {
  unit: 'g',
  weeks: {
    '28': { p3: 880, p10: 1000, p50: 1150, p90: 1300, p97: 1400 },
    '32': { p3: 1450, p10: 1650, p50: 1900, p90: 2150, p97: 2300 },
  },
};

describe('ResultCard', () => {
  it('shows the rounded percentile, the chart, and the medical disclaimer', () => {
    render(
      <ResultCard
        metric={metric}
        weeks={30}
        days={0}
        value={1525}
        percentile={50}
        standardName="WHO Fetal Growth"
      />,
    );
    expect(screen.getByText(/50/)).toBeInTheDocument();
    expect(screen.getByText(/percentile/i)).toBeInTheDocument();
    expect(screen.getByText(/not medical advice/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /growth chart/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/ResultCard.test.tsx`
Expected: FAIL — cannot import `ResultCard`.

- [ ] **Step 3: Implement `components/ResultCard.tsx`**

```tsx
'use client';

import { GrowthChart } from './GrowthChart';
import type { MetricData } from '@/lib/types';

interface ResultCardProps {
  metric: MetricData;
  weeks: number;
  days: number;
  value: number;
  percentile: number;
  standardName: string;
}

export function ResultCard({
  metric,
  weeks,
  days,
  value,
  percentile,
  standardName,
}: ResultCardProps) {
  const rounded = Math.round(percentile);
  const markerWeek = weeks + days / 7;

  return (
    <div className="glass-card p-4 text-center">
      <p className="text-xs uppercase tracking-widest text-slate-500">
        Week {weeks}
        {days ? ` + ${days}` : ''} · {standardName}
      </p>
      <p className="my-1 text-5xl font-bold text-blue-900">
        {rounded}
        <span className="align-top text-lg text-blue-500">th</span>
      </p>
      <p className="mb-3 text-xs uppercase tracking-widest text-slate-500">percentile</p>

      <GrowthChart metric={metric} markerWeek={markerWeek} markerValue={value} />

      <p className="mt-3 text-[10px] text-slate-400">
        For reference only · Not medical advice
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/ResultCard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/ResultCard.tsx components/ResultCard.test.tsx
git commit -m "feat: add result card with percentile, chart, and disclaimer"
```

---

### Task 10: Wire the single-page flow

**Files:**
- Modify: `app/page.tsx`
- Create: `components/Calculator.test.tsx`

- [ ] **Step 1: Write the failing integration test in `components/Calculator.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';

describe('Calculator page', () => {
  it('shows a result card after entering values and calculating', async () => {
    render(<Home />);
    await userEvent.type(screen.getByLabelText(/weeks/i), '30');
    await userEvent.type(screen.getByLabelText(/measurement/i), '1525');
    await userEvent.click(screen.getByRole('button', { name: /calculate/i }));

    expect(screen.getByText(/percentile/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /growth chart/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run components/Calculator.test.tsx`
Expected: FAIL — page renders no result card (no percentile text) after calculate.

- [ ] **Step 3: Implement `app/page.tsx`**

```tsx
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run components/Calculator.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx components/Calculator.test.tsx
git commit -m "feat: wire single-page calculator flow"
```

---

### Task 11: Apply the light-blue glass theme

**Files:**
- Modify: `app/globals.css`, `app/layout.tsx`

- [ ] **Step 1: Add glass theme styles to `app/globals.css`**

Append:
```css
:root {
  --bg: linear-gradient(160deg, #f5f9ff 0%, #eaf2fe 60%, #e3edfb 100%);
}

body {
  min-height: 100vh;
  background: var(--bg);
  background-attachment: fixed;
}

.glass-card {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 22px;
  box-shadow: 0 6px 24px rgba(37, 99, 235, 0.1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: linear-gradient(165deg, #0d1b3a 0%, #0a1730 70%, #0b1426 100%);
  }
  .glass-card {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4);
    color: #e2e8f0;
  }
}
```

- [ ] **Step 2: Set page metadata + lang in `app/layout.tsx`**

Ensure the exported `metadata` reads:
```tsx
export const metadata = {
  title: 'Fetal Growth Calculator',
  description: 'Check your baby\'s growth percentile on a standard growth curve.',
};
```
And the root element is `<html lang="en">`.

- [ ] **Step 3: Verify the full test suite passes**

Run: `npm test`
Expected: PASS — all lib + component + page tests green.

- [ ] **Step 4: Verify production build + static export**

Run: `npm run build`
Expected: PASS — `out/` directory generated with `index.html`.

- [ ] **Step 5: Manual smoke check**

Run: `npx serve out` (or `npm run dev`) and open the URL.
Expected: light-blue glass page; entering weeks 30 + measurement 1525 and clicking Calculate shows a result card with a percentile near 50 marked on the band chart.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: apply light-blue glass theme with system dark mode"
```

---

## Self-Review

**Spec coverage (Plan 1 scope only):**
- Color-band growth chart with marked point → Tasks 7, 9 ✓
- Percentile calculation (interpolation) → Tasks 3–5 ✓
- Standard selection + EFW/biometric metric selection → Tasks 6, 8 ✓
- Data-driven JSON standards (file-swap update) → Task 6 ✓
- Single-page scroll flow → Task 10 ✓
- Light-blue glass theme + system dark mode → Task 11 ✓
- Medical disclaimer → Task 9 ✓
- Static export (SEO/app foundation) → Tasks 1, 11 ✓
- Deferred to later plans: EFW auto-calc, tracking, due-date calc, i18n + language selection, dev info (Plan 2); SEO meta/hreflang/sitemap, Capacitor packaging (Plan 3).

**Placeholder scan:** No TBD/TODO in steps; every code step contains full code. Sample data in `who.json` is explicitly labeled placeholder to be replaced by client data (a data concern, not a plan placeholder).

**Type consistency:** `CalcInput` (Task 8) matches the object passed in Task 10. `MetricData`/`PercentileCutoffs`/`GrowthStandard` (Task 3) used consistently in Tasks 6, 7, 9, 10. `computePercentile(metric, weeks, days, value)` signature consistent between Task 5 definition and Task 10 call. `GrowthChart` props (`metric`, `markerWeek`, `markerValue`) consistent between Tasks 7, 9.
