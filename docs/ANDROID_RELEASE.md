# BabyCurve — Android Release Guide

> **Important:** BabyCurve is an informational reference tool only. It is NOT a medical or diagnostic device.
> The in-app disclaimer must be displayed to users, and this must be stated in your Play Store listing.
> See the [Play Console Submission Checklist](#play-console-submission-checklist) section for details.

---

## Prerequisites

| Requirement | Version / Notes |
|---|---|
| JDK | **17** (Capacitor 6 requires Java 17; do NOT use JDK 21+ with this Capacitor version) |
| Android Studio | Latest stable (Hedgehog 2023.1.1 or newer). Installs Android SDK automatically. |
| Android SDK | API level 34 (compileSdkVersion). Install via Android Studio → SDK Manager. |
| `ANDROID_HOME` env var | Set to your SDK root, e.g. `C:\Users\<you>\AppData\Local\Android\Sdk` |
| `adb` in PATH | Ships with platform-tools. Add `%ANDROID_HOME%\platform-tools` to `PATH`. |
| Node.js | 18 LTS or newer |
| Capacitor CLI | `@capacitor/cli@6` (installed as dev dependency in this project) |

### Environment Variables (Windows)

```powershell
$env:ANDROID_HOME = "C:\Users\<you>\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
```

Add these permanently via System Properties → Environment Variables.

---

## Dev Build Loop

### 1. Static web export

```bash
npm run build
```

This outputs the static site to `out/`. The `trailingSlash: true` setting in `next.config.mjs`
ensures locale routes resolve correctly inside the Android WebView (e.g. `/en` → `out/en/index.html`).

### 2. Sync web assets into the Android project

```bash
npx cap sync android
```

This copies `out/` into `android/app/src/main/assets/public/` and updates Capacitor config.
**Run this step every time you rebuild the Next.js app.**

### 3a. Build debug APK via command line

```bash
cd android
# Windows
.\gradlew.bat assembleDebug
# macOS / Linux
./gradlew assembleDebug
```

Debug APK output path:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 3b. Open in Android Studio

```bash
npx cap open android
```

Then use **Build → Build Bundle(s) / APK(s) → Build APK(s)** in Android Studio.

### 4. Install on a connected device

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

To see connected devices:
```bash
adb devices
```

---

## Release Build (Google Play)

### Step 1 — Generate an upload keystore

Run this **once** and store the keystore file securely (outside the repository).

```bash
keytool -genkey -v \
  -keystore babycurve-upload.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias babycurve-upload \
  -dname "CN=BabyCurve, OU=Mobile, O=YourOrg, L=City, S=State, C=KR"
```

### Step 2 — Create `android/key.properties`

```properties
storePassword=<keystore-password>
keyPassword=<key-password>
keyAlias=babycurve-upload
storeFile=../babycurve-upload.jks
```

**Add `android/key.properties` to `.gitignore`** — never commit secrets.

### Step 3 — Configure signing in `android/app/build.gradle`

Add the following at the top of `android/app/build.gradle` (before the `android {}` block):

```groovy
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Inside the `android { ... }` block, add:

```groovy
signingConfigs {
    release {
        keyAlias     keystoreProperties['keyAlias']
        keyPassword  keystoreProperties['keyPassword']
        storeFile    keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword keystoreProperties['storePassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### Step 4 — Build the release AAB

```bash
cd android
.\gradlew.bat bundleRelease   # Windows
./gradlew bundleRelease        # macOS / Linux
```

AAB output path:
```
android/app/build/outputs/bundle/release/app-release.aab
```

Upload this `.aab` file to Google Play Console (not the `.apk`).

---

## Play Console Submission Checklist

### App Identity (Placeholders to Finalize)

- [ ] **App ID:** Currently `app.babycurve` — confirm this is your registered Play Developer account ID.
  Changing the app ID after first upload is not possible.
- [ ] **App name:** "BabyCurve" — confirm localized names for all 9 supported locales.
- [ ] **BASE_URL / domain:** Update `lib/seo.ts` with your production domain before release.
  This affects sitemap.xml, robots.txt, and canonical URLs.
- [ ] **Growth data:** Confirm the WHO/CDC growth curve data in `data/` is the latest published version.
- [ ] **Developer info:** Verify developer name and contact email in Play Console are accurate.

### Store Listing Assets

| Asset | Spec |
|---|---|
| App icon | 512 × 512 px, PNG, no alpha |
| Feature graphic | 1024 × 500 px, JPG or PNG |
| Phone screenshots | At least 2, 16:9 or 9:16, min 320 px on shortest side |
| Tablet screenshots | Recommended for 7" and 10" form factors |
| Short description | ≤ 80 characters |
| Full description | ≤ 4000 characters |

All text assets should be provided for each supported language (en, ko, ja, zh-CN, zh-TW, id, th, vi, es-MX).

### Privacy Policy

- [ ] Host a Privacy Policy at a public URL (e.g. `https://babycurve.app/privacy`).
- [ ] Link it in Play Console under **Store listing → Privacy Policy**.
- [ ] The policy must disclose what data is collected (local storage only — locale preference and entered measurements), and confirm no data leaves the device.

### App Content Rating

- [ ] Complete the **Content Rating Questionnaire** in Play Console.
  For a health/medical reference app with no user-generated content, this will typically
  result in a "Everyone" (E) rating.
- [ ] Choose the correct **App Category:** Health & Fitness or Medical.

### Data Safety Form

Complete the **Data Safety** section in Play Console. For BabyCurve:

- Data collection: **No** (all data stays on device — localStorage only).
- Data sharing: **No**.
- Security practices: Confirm the app uses HTTPS for any external requests (none currently).

### Medical / Health App Considerations

> **CRITICAL — Prominent Disclaimer Required**

BabyCurve is an informational reference app, not a medical device. You must:

1. **In-app disclaimer:** Ensure the app displays a clear disclaimer on first launch and/or
   prominently on the measurement results screen, e.g.:
   > "BabyCurve is for informational purposes only and is not a substitute for professional
   > medical advice, diagnosis, or treatment. Always consult your pediatrician with questions
   > about your child's growth."

2. **Play Store listing:** Include this disclaimer (or a condensed version) in the Full Description.

3. **Play Console — Medical apps policy:** Review
   [Google Play Medical apps policy](https://support.google.com/googleplay/android-developer/answer/9876791).
   Apps that display health data must not make diagnostic claims. BabyCurve plots percentiles
   and displays educational information only — ensure no copy implies diagnostic capability.

4. **Sensitive permissions:** BabyCurve does not request sensitive permissions
   (camera, location, contacts, etc.). If any are added in future, update this checklist.

### Release Track Recommendation

1. **Internal testing** → share with testers via email.
2. **Closed testing (Alpha)** → gather feedback from a small group.
3. **Open testing (Beta)** → broader rollout.
4. **Production** → full release after stability confirmed.

---

## Notes for CI / Automated Builds

- `android/local.properties` is git-ignored. CI must write it at build time:
  ```bash
  echo "sdk.dir=$ANDROID_HOME" > android/local.properties
  ```
- `android/key.properties` and the `.jks` keystore must be injected via CI secrets.
- Always run `npx cap sync android` before building in CI to ensure web assets are current.
- The `android/app/src/main/assets/public/` directory is git-ignored (regenerated by `cap sync`).

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `invalid source release: 21` | Wrong JDK version (Capacitor 6 needs JDK 17) | Set `JAVA_HOME` to JDK 17 |
| `SDK XML version 4` warning | Newer SDK tools vs. older Gradle plugin | Safe to ignore; build still succeeds |
| `No such file: local.properties` | Missing local.properties | Create `android/local.properties` with `sdk.dir=...` |
| WebView shows blank page | `cap sync` not run after `npm run build` | Run `npx cap sync android` |
| Locale routes don't resolve | Missing `trailingSlash: true` in `next.config.mjs` | Already set; ensure `npm run build` was re-run |
