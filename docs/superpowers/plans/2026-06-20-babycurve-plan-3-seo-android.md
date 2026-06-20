# BabyCurve — Plan 3: SEO, branding, Capacitor Android packaging

> Execute task-by-task. Keep `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build` (all 9 locale routes) green.

**Goal:** Make BabyCurve discoverable (per-locale SEO metadata, hreflang, sitemap, robots, JSON-LD), apply consistent BabyCurve branding, and package the static web build into an installable Android app via Capacitor (offline-capable), with a documented Play Store submission path.

**Stack:** Next.js 16 static export, Capacitor (Android). Site base URL: configurable, default `https://babycurve.app` (placeholder — replace with the real domain).

---

### Task A: Branding pass
- App title/H1 "BabyCurve" (keep a descriptive subtitle like "Fetal Growth Calculator" for clarity/SEO). Update `app/[locale]/page.tsx` header to show BabyCurve as the brand with the localized descriptive subtitle (`app.title` already keyed).
- Ensure `messages/*.json` `app.title` stays the descriptive name; add `app.brand` = "BabyCurve" (same in all locales, it's a brand).
- Replace the default Next.js favicon with a simple BabyCurve favicon if feasible (skip if it requires binary asset generation — leave the existing favicon and note it).
- Tests: header renders "BabyCurve".

### Task B: Per-locale SEO metadata + hreflang
- In `app/[locale]/layout.tsx`, add Next.js `generateMetadata({ params })` returning localized `title`, `description` (from messages), `alternates: { canonical, languages: { <locale>: /<locale> } }` for hreflang, and `openGraph` (title, description, locale, type=website, url). Provide an `x-default` alternate → `/en`.
- Centralize site config in `lib/seo.ts` (BASE_URL, default OG image path, helper to build alternates for a path). 
- Tests: `lib/seo.test.ts` — alternates include all 9 locales + x-default; generateMetadata returns localized title for a couple of locales.

### Task C: sitemap.xml + robots.txt + JSON-LD
- `app/sitemap.ts` (Next.js Metadata Route) listing all 9 locale URLs with `alternates.languages` (hreflang in sitemap). Confirm it emits to `out/sitemap.xml` under static export.
- `app/robots.ts` → allow all + point to `${BASE_URL}/sitemap.xml`.
- JSON-LD: a `WebApplication` (or `MedicalWebPage`/`SoftwareApplication`) structured-data `<script type="application/ld+json">` injected in `app/[locale]/layout.tsx` (name BabyCurve, description, inLanguage, applicationCategory MedicalApplication, isAccessibleForFree true). Keep it minimal and valid.
- Tests: sitemap function returns 9 entries; robots returns the sitemap URL; a JSON-LD object builder in lib/seo.ts is valid JSON with required fields.

### Task D: Capacitor Android project
- Install `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`.
- `capacitor.config.ts`: `appId: 'app.babycurve'` (reverse-domain), `appName: 'BabyCurve'`, `webDir: 'out'`. (Static export already outputs to `out/`.)
- For the app to work offline with the `[locale]` routes, set the app to load `/en` (or a stored locale) by default. Since Capacitor serves `out/` from the file system, ensure relative asset paths work: in `next.config.mjs` keep `images.unoptimized` (already set); if needed set `trailingSlash: true` so directory-index routes resolve under file://. Verify `out/en/index.html` loads standalone (open file and confirm assets resolve — relative `_next` paths).
- Run `npx cap add android` to generate the `android/` project; `npx cap sync`.
- The Gradle/APK build needs the Android SDK. ATTEMPT `cd android && ./gradlew assembleDebug` (or `gradlew.bat` on Windows). If the SDK/JDK is missing, DO NOT block — capture the error, and document the exact local build prerequisites and commands instead. Report whether an APK was produced.
- Add `android/` build outputs and Capacitor caches to `.gitignore` appropriately (commit the `android/` project sources but ignore `android/app/build/`, `.gradle/`, `local.properties`).

### Task E: Play Store submission docs
- `docs/ANDROID_RELEASE.md`: prerequisites (JDK 17, Android SDK/Studio), commands to build a debug APK and a signed release AAB (`./gradlew bundleRelease` with a keystore), where the AAB lands, and a Play Console submission checklist (app content, data safety form, medical disclaimer, store listing assets: icon 512, feature graphic, screenshots, privacy policy URL). Note medical-app review considerations (disclaimer, not a diagnostic device).

---

## Constraints / notes
- BASE_URL and the real package id / domain are placeholders to confirm with the client before public launch.
- Actual Play Store registration, signing keystore, and store listing assets (icon/screenshots/privacy policy) require the client's developer account — out of scope to submit; this plan makes the project build-ready and documents the path.
- Keep all 9 locale routes prerendering; SEO routes (sitemap/robots) must appear in `out/`.
