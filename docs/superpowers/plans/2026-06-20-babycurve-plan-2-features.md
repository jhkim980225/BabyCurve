# BabyCurve — Plan 2: Features (EFW auto-calc, tracking, due-date, share, i18n, dev info)

> Execute task-by-task with TDD. Each task: failing test → implement → pass → commit. Build (`npm run build`) and full suite (`npm test`) must stay green.

**Goal:** Extend the working Plan-1 calculator with: EFW auto-calc from biometrics, due-date/gestational-age calculator, measurement history tracking on the chart, save-image + share, an always-visible medical disclaimer, full i18n with a first-entry language selector across 9 locales, and a week-by-week development info panel.

**Stack (unchanged):** Next.js 16 static export, React 19, Tailwind v4, D3, Vitest. i18n via `next-intl` with App Router `[locale]` routing + `generateStaticParams` (required for static-export SEO per language).

**Locales:** en (default), es-MX, ja, zh-TW, zh-CN, ko, th, vi, id.

---

### Task A: Hadlock EFW auto-calc (`lib/efw.ts`)
Pure function `estimateEFW({ bpd, hc, ac, fl })` (all in cm) using Hadlock 4-parameter formula:
`log10(EFW) = 1.3596 - 0.00386*AC*FL + 0.0064*HC + 0.00061*BPD*AC + 0.0424*AC + 0.174*FL`, return grams (10^result), rounded.
- TDD: assert a known reference case within tolerance (e.g. BPD 8.7, HC 31, AC 30, FL 6.5 → ~2300-2500 g range; pin the exact computed value with toBeCloseTo).
- Also export `estimateEFWPartial` returning null if any of the 4 inputs missing.

### Task B: Due-date / gestational-age calculator (`lib/dueDate.ts`)
Pure functions:
- `dueDateFromLMP(lmpISO: string): string` — Naegele: LMP + 280 days, return ISO date.
- `gestationalAgeFromLMP(lmpISO, todayISO): { weeks, days }` — days diff / 7.
- `gestationalAgeFromEDD(eddISO, todayISO): { weeks, days }` — 280 - daysUntilEDD.
TDD each with fixed dates (pass dates in as args; never call Date.now in lib — keep pure).

### Task C: Measurement history tracking (`lib/storage.ts` + chart)
- `lib/storage.ts`: `saveMeasurement(entry)`, `getMeasurements()`, `clearMeasurements()` backed by localStorage under key `babycurve.measurements`. Entry: `{ id, standardId, metricId, weeks, days, value, percentile, ts }`. Guard for SSR (typeof window).
- `GrowthChart`: accept optional `extraMarkers: {week, value}[]` and render them as smaller secondary points (distinct style) so the user sees their trajectory. Keep the primary marker.
- UI: a "Save to history" button on the result; a small history list with clear-all; plot saved points of the same standard+metric on the chart.
- TDD storage with a localStorage mock; component test that extraMarkers render.

### Task D: Save image + share (`components/ResultActions.tsx`)
- Install `html-to-image`. `ResultCard` wraps its content in a ref'd container.
- Buttons: **Save image** (html-to-image → PNG download) and **Share** (Web Share API with the PNG file; fallback to download if unsupported).
- TDD: component renders both buttons; Share button hidden/fallback path when `navigator.share` undefined (mock).

### Task E: Always-visible medical disclaimer (`components/Disclaimer.tsx` + footer)
- A footer disclaimer rendered on every page (not only after calculate), for Play/SEO compliance. Localized string.

### Task F: i18n + first-entry language selection
- Add `next-intl`. Restructure routing to `app/[locale]/...` with `generateStaticParams` returning all 9 locales; `app/page.tsx` (root) redirects/links to a locale.
- Messages in `messages/<locale>.json`. Fully translate **en**; for the other 8, seed files with the en values as placeholders (mark for native translation) so the app builds and runs in every locale. Replace ALL hardcoded English UI strings (InputForm, ResultCard, Disclaimer, dev info labels) with message keys.
- First-entry language selector: a screen/modal shown when no stored locale preference (`babycurve.locale`); 9 languages in native script; selection stores preference and routes to that locale. Web: default suggestion from `navigator.language`. A language switcher in the header to change anytime.
- `<html lang>` reflects the active locale; add `hreflang` alternates (can land here or in Plan 3 SEO).
- Tests: messages load per locale; switching locale changes rendered strings; first-entry selector appears only without a stored preference.

### Task G: Week-by-week development info (`data/development/*.json` + `components/DevInfo.tsx`)
- JSON structure `data/development/en.json`: `{ "<week>": { "sizeComparison": "...", "milestone": "..." } }` for weeks ~8–40 (English placeholder content, clearly marked "sample — replace with client content"). One file per locale (en seeded; others fall back to en if missing).
- `DevInfo` component: given the entered week, show that week's size comparison + milestone in a glass card. Localized labels.
- Test: renders the correct week entry; falls back gracefully when a week is missing.

---

## Notes / constraints
- Real translations and real clinical/dev-info content are CLIENT-provided; this plan ships English content + structurally-complete placeholders for other locales so everything builds and is swappable.
- Keep `npm run build` (static export, all 9 locale routes) and `npm test` green at every commit.
- Follow existing glass-card styling and light-blue theme; respect system dark mode.
