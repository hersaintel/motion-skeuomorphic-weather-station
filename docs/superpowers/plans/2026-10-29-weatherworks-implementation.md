# Weatherworks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publicly publish Weatherworks, a responsive React weather station proving that Motion animations and a coherent skeuomorphic material system can reinforce accessible physical affordances across desktop, tablet, and iPhone 15 layouts.

**Architecture:** A Vite React TypeScript application keeps weather-domain parsing and API access separate from a stateful station controller and source-owned visual components. Open-Meteo supplies live forecast and geocoding data; deterministic bundled data renders immediately and serves as the initial-request fallback, while later refresh failures preserve the last successful live snapshot. Motion drives semantic state transitions, layout reflow, gestures, and gauge values under a global reduced-motion policy.

**Tech Stack:** React 19, TypeScript, Vite, `motion`/`motion/react`, Open-Meteo, CSS Modules plus global design tokens, Vitest, React Testing Library, MSW, Playwright, ESLint, optional Python Pillow for screenshot validation/contact-sheet assembly, GitHub CLI.

**Spec:** `docs/superpowers/specs/2026-10-29-weather-station-design.md`

## Global Constraints

- Project root: `/home/hersa/Hermes/motion-skeuomorphic-weather-station`.
- Public repository: prefer `hersaintel/motion-skeuomorphic-weather-station`; verify availability before writing permanent links.
- Install Motion through the `motion` package and import React APIs from `motion/react`.
- React version must be at least 18.2; this project selects React 19.
- Use documented Open-Meteo forecast and geocoding endpoints without credentials or API keys.
- Offline support means API-failure fallback using bundled data, not service-worker/PWA cold-start support.
- Initial API failure retains bundled data; later refresh/location failures retain the last successful live readings.
- Source-own components and CSS; do not add a second UI/component framework.
- Desktop capture: `1440 × 900` CSS pixels.
- Tablet capture: `834 × 1112` CSS pixels.
- Mobile capture: iPhone 15 logical viewport `393 × 852` CSS pixels at device scale factor 3.
- Mobile touch targets must be at least 44 CSS pixels and respect safe-area insets.
- Use `MotionConfig reducedMotion="user"` and explicit reduced-motion handling for gauges and drawers.
- No credentials, local absolute paths, generated dependencies, unverified deployment links, or synthetic product screenshots may enter the repository.
- README author: `@hersaintel`; license: MIT; deployment status: `Not deployed` unless a verified deployment is added later.

## File Structure

```text
motion-skeuomorphic-weather-station/
├── docs/
│   ├── images/
│   │   ├── weatherworks-desktop.png
│   │   ├── weatherworks-tablet.png
│   │   ├── weatherworks-iphone-15.png
│   │   └── weatherworks-contact-sheet.png
│   └── superpowers/
│       ├── specs/2026-10-29-weather-station-design.md
│       └── plans/2026-10-29-weatherworks-implementation.md
├── scripts/
│   └── build_contact_sheet.py
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── App.test.tsx
│   ├── components/
│   │   ├── ConditionDisplay.tsx
│   │   ├── ForecastTray.tsx
│   │   ├── InstrumentGauge.tsx
│   │   ├── LocationSearch.tsx
│   │   ├── StationControls.tsx
│   │   ├── WeatherStation.tsx
│   │   └── WeatherStation.test.tsx
│   ├── styles/
│   │   ├── globals.css
│   │   ├── tokens.css
│   │   └── weather-station.css
│   ├── test/
│   │   ├── handlers.ts
│   │   ├── server.ts
│   │   └── setup.ts
│   ├── weather/
│   │   ├── api.test.ts
│   │   ├── api.ts
│   │   ├── fallback.ts
│   │   ├── transform.test.ts
│   │   ├── transform.ts
│   │   ├── types.ts
│   │   ├── useWeatherStation.test.tsx
│   │   └── useWeatherStation.ts
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/
│   ├── accessibility.spec.ts
│   ├── responsive.spec.ts
│   ├── station.spec.ts
│   └── visual.spec.ts
├── .gitignore
├── eslint.config.js
├── index.html
├── LICENSE
├── package.json
├── package-lock.json
├── playwright.config.ts
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Review Focus

- **Malformed or non-2xx Open-Meteo responses:** parsing must reject invalid payloads without blanking the station; pinned in Task 3 API tests and Task 4 controller tests.
- **Out-of-order location requests:** a stale response must never replace the currently selected location; pinned in Task 4 controller tests.
- **Refresh failure after live data exists:** keep the last successful live readings and expose retry/error status; pinned in Task 4 controller tests and Task 8 Playwright tests.
- **Ambiguous keyboard-driven location search:** arrow keys, Enter, Escape, focus restoration, and screen-reader status must remain correct; pinned in Task 7 component and Task 8 Playwright tests.
- **Reduced-motion users:** no spring travel, sliding drawer, or animated gauge sweep may be required to perceive state; pinned in Task 6 component tests and Task 8 Playwright tests.

---

### Task 1: Project foundation and executable quality baseline

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/app/App.test.tsx`
- Create: `src/test/setup.ts`
- Create: `vite.config.ts`
- Create: `playwright.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `eslint.config.js`
- Create: `.gitignore`

**Interfaces:**
- Consumes: Approved design specification.
- Produces: A React 19 Vite application; scripts `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`, and `check`; testing environment with jest-dom matchers.

- [ ] **Step 1: Initialize Git and scaffold the Vite React TypeScript project without overwriting `docs/`**

Run the Vite initializer in a temporary directory, copy only the required project files into the repository root, and preserve the approved spec and plan.

- [ ] **Step 2: Install runtime and development dependencies**

Runtime dependencies: `react`, `react-dom`, `motion`.

Development dependencies: Vite React TypeScript defaults plus `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `msw`, and `@playwright/test`.

- [ ] **Step 3: Write the failing application smoke test**

In `src/app/App.test.tsx`, render `<App />` and assert that heading `Weatherworks` and region name `Atmospheric instrument console` exist.

- [ ] **Step 4: Run the smoke test and verify RED**

Run: `npm test -- src/app/App.test.tsx`

Expected: FAIL because the required heading/region is absent.

- [ ] **Step 5: Implement the minimal application shell**

Export `function App(): JSX.Element` from `src/app/App.tsx`; include the required heading and named region only.

- [ ] **Step 6: Run foundation checks and verify GREEN**

Run:

```bash
npm run lint
npm run typecheck
npm test -- src/app/App.test.tsx
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit the foundation with the approved documents**

```bash
git add .gitignore docs package.json package-lock.json index.html src vite.config.ts playwright.config.ts tsconfig*.json eslint.config.js
git commit -m "chore: scaffold Weatherworks application"
```

### Task 2: Weather domain model, fallback data, and pure transformations

**Files:**
- Create: `src/weather/types.ts`
- Create: `src/weather/fallback.ts`
- Create: `src/weather/transform.ts`
- Create: `src/weather/transform.test.ts`

**Interfaces:**
- Consumes: Raw Open-Meteo forecast payload shape.
- Produces:
  - `type UnitSystem = 'metric' | 'imperial'`
  - `type WeatherSource = 'fallback' | 'live'`
  - `interface LocationChoice { id: string; name: string; admin1?: string; country: string; latitude: number; longitude: number; timezone: string }`
  - `interface DailyForecast { date: string; weatherCode: number; highC: number; lowC: number; precipitationProbability: number; sunrise: string; sunset: string }`
  - `interface WeatherSnapshot { location: LocationChoice; observedAt: string; temperatureC: number; apparentTemperatureC: number; pressureHpa: number; windSpeedKph: number; windDirectionDegrees: number; humidityPercent: number; weatherCode: number; daily: DailyForecast[]; source: WeatherSource }`
  - `const FALLBACK_WEATHER: WeatherSnapshot`
  - `parseForecastResponse(raw: unknown, location: LocationChoice): WeatherSnapshot`
  - `temperatureFor(snapshotValueC: number, units: UnitSystem): number`
  - `windSpeedFor(kph: number, units: UnitSystem): number`
  - `weatherConditionFor(code: number): { label: string; symbol: string }`

- [ ] **Step 1: Write failing transformation tests**

Cover a valid payload, missing current conditions, misaligned daily arrays, unknown weather code, Celsius/Fahrenheit conversion, and kph/mph conversion. Assert exact rounded values and that invalid payloads throw `WeatherPayloadError`.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- src/weather/transform.test.ts`

Expected: FAIL because the module and interfaces do not exist.

- [ ] **Step 3: Implement domain types, deterministic fallback data, parser, mappings, and conversions**

The fallback location is a clearly identified demonstration location. The fallback snapshot must include at least five daily entries and `source: 'fallback'`.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npm test -- src/weather/transform.test.ts`

Expected: all transformation tests pass.

- [ ] **Step 5: Commit the weather domain**

```bash
git add src/weather/types.ts src/weather/fallback.ts src/weather/transform.ts src/weather/transform.test.ts
git commit -m "feat(weather): add forecast domain model"
```

### Task 3: Open-Meteo forecast and geocoding clients

**Files:**
- Create: `src/weather/api.ts`
- Create: `src/weather/api.test.ts`
- Create: `src/test/handlers.ts`
- Create: `src/test/server.ts`
- Modify: `src/test/setup.ts`

**Interfaces:**
- Consumes: `LocationChoice`, `UnitSystem`, `WeatherSnapshot`, and `parseForecastResponse` from Task 2.
- Produces:
  - `fetchForecast(location: LocationChoice, signal: AbortSignal): Promise<WeatherSnapshot>`
  - `searchLocations(query: string, signal: AbortSignal): Promise<LocationChoice[]>`
  - `class WeatherRequestError extends Error { status?: number }`

- [ ] **Step 1: Configure MSW test lifecycle**

Start the server before all tests, reset handlers after each test, and close it after all tests; unhandled requests must fail tests.

- [ ] **Step 2: Write failing API tests**

Assert forecast query coordinates and requested fields, valid response transformation, geocoding result normalization, trimmed query handling, fewer-than-three-character query returning `[]` without a request, non-2xx rejection, malformed JSON rejection, and AbortError propagation.

- [ ] **Step 3: Run tests and verify RED**

Run: `npm test -- src/weather/api.test.ts`

Expected: FAIL because the clients do not exist.

- [ ] **Step 4: Implement the clients against documented Open-Meteo endpoints**

Use `https://api.open-meteo.com/v1/forecast` and `https://geocoding-api.open-meteo.com/v1/search`. Build URLs with `URL`/`URLSearchParams`; never concatenate unescaped user input.

- [ ] **Step 5: Run tests and verify GREEN**

Run: `npm test -- src/weather/api.test.ts`

Expected: all API tests pass and MSW reports no unhandled requests.

- [ ] **Step 6: Commit the network boundary**

```bash
git add src/weather/api.ts src/weather/api.test.ts src/test/handlers.ts src/test/server.ts src/test/setup.ts
git commit -m "feat(weather): add Open-Meteo clients"
```

### Task 4: Weather station state controller and failure policy

**Files:**
- Create: `src/weather/useWeatherStation.ts`
- Create: `src/weather/useWeatherStation.test.tsx`

**Interfaces:**
- Consumes: Task 2 fallback/domain functions and Task 3 API clients.
- Produces:
  - `type LoadState = 'idle' | 'loading' | 'live' | 'fallback' | 'error'`
  - `interface WeatherStationState { snapshot: WeatherSnapshot; units: UnitSystem; loadState: LoadState; message: string; selectedDay: string; searchResults: LocationChoice[]; searchState: 'idle' | 'loading' | 'ready' | 'empty' | 'error' }`
  - `useWeatherStation(): { state: WeatherStationState; refresh(): Promise<void>; selectLocation(location: LocationChoice): Promise<void>; search(query: string): Promise<void>; selectDay(date: string): void; setUnits(units: UnitSystem): void; forceFallback(): void }`

- [ ] **Step 1: Write failing controller tests for initial loading and success**

Assert immediate fallback snapshot, loading status during request, live replacement on success, and accessible status text.

- [ ] **Step 2: Write failing controller tests for failure policies**

Assert initial request failure retains `FALLBACK_WEATHER`; refresh failure after live success preserves the exact live snapshot; retry can recover; malformed response follows the same policy.

- [ ] **Step 3: Write failing controller tests for race conditions and search**

Resolve location B before location A and assert A cannot overwrite B. Assert a superseded request is aborted, empty search is represented distinctly, and fewer than three characters do not request.

- [ ] **Step 4: Run tests and verify RED**

Run: `npm test -- src/weather/useWeatherStation.test.tsx`

Expected: FAIL because the hook does not exist.

- [ ] **Step 5: Implement the controller with request sequence IDs plus AbortController**

Keep the previous valid snapshot in state during loading. Only the active sequence may commit a response. `forceFallback()` replaces the current snapshot with bundled data and an explicit demonstration message.

- [ ] **Step 6: Run tests and verify GREEN**

Run: `npm test -- src/weather/useWeatherStation.test.tsx`

Expected: all state, failure, search, and race tests pass.

- [ ] **Step 7: Commit the controller**

```bash
git add src/weather/useWeatherStation.ts src/weather/useWeatherStation.test.tsx
git commit -m "feat(weather): manage live and fallback station data"
```

### Task 5: Skeuomorphic material tokens and semantic station shell

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/styles/globals.css`
- Create: `src/styles/weather-station.css`
- Create: `src/components/WeatherStation.tsx`
- Create: `src/components/ConditionDisplay.tsx`
- Create: `src/components/StationControls.tsx`
- Create: `src/components/WeatherStation.test.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: `useWeatherStation()` and Task 2 conversion/condition functions.
- Produces: Semantic console structure with named regions, live/fallback status, readings, refresh/unit/fallback controls, and stable `data-testid` hooks only where accessible queries are insufficient.

- [ ] **Step 1: Write failing semantic and state tests**

Assert named main region, live status region, location heading, labeled readings, metric/imperial controls, refresh control, fallback control, loading `aria-busy`, error text, and disabled refresh while the active request is loading.

- [ ] **Step 2: Run component tests and verify RED**

Run: `npm test -- src/components/WeatherStation.test.tsx`

Expected: FAIL because components do not exist.

- [ ] **Step 3: Define the global material tokens**

Create exact token groups for upper-left lighting, metal frame, molded plastic, glass, raised/inset elevation, focus ring, radii, spacing, touch targets, and motion durations. Keep readable flat-color fallbacks before gradients/shadows.

- [ ] **Step 4: Implement the semantic station shell without advanced animation**

Wire Task 4 actions and states. Use native buttons, fieldsets/radios or equivalent semantic unit controls, headings, definition lists, and status regions.

- [ ] **Step 5: Implement responsive structural CSS**

Desktop uses a console grid, tablet uses a two-column instrument layout, and mobile uses a single-column safe-area-aware layout. Do not shrink the desktop grid wholesale.

- [ ] **Step 6: Run component and static quality checks**

Run:

```bash
npm test -- src/components/WeatherStation.test.tsx
npm run lint
npm run typecheck
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit the station shell**

```bash
git add src/app/App.tsx src/main.tsx src/components src/styles

git commit -m "feat(ui): add tactile weather station shell"
```

### Task 6: Motion-powered gauges, physical controls, and reduced motion

**Files:**
- Create: `src/components/InstrumentGauge.tsx`
- Create: `src/components/InstrumentGauge.test.tsx`
- Modify: `src/components/ConditionDisplay.tsx`
- Modify: `src/components/StationControls.tsx`
- Modify: `src/components/WeatherStation.tsx`
- Modify: `src/styles/weather-station.css`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: Current weather values and Task 5 controls.
- Produces:
  - `InstrumentGauge({ label, value, min, max, unit, formatValue }: InstrumentGaugeProps): JSX.Element`
  - Global `<MotionConfig reducedMotion="user">` policy.
  - Motion variants for button press, status change, gauge value, and panel entrance.

- [ ] **Step 1: Write failing gauge accessibility tests**

Assert each gauge exposes label, current value, minimum, maximum, and unit without requiring SVG interpretation. Assert out-of-range inputs clamp visually while preserving the displayed validated value policy.

- [ ] **Step 2: Write failing reduced-motion tests**

Mock `useReducedMotion()` to `true`; assert the gauge uses immediate value updates, status/panel variants omit travel transforms, and controls remain fully perceivable.

- [ ] **Step 3: Run tests and verify RED**

Run: `npm test -- src/components/InstrumentGauge.test.tsx`

Expected: FAIL because the gauge and motion policy do not exist.

- [ ] **Step 4: Implement MotionConfig and animated SVG gauges**

Animate needle/value changes with a spring in normal mode and duration 0 in reduced mode. Ensure the SVG is decorative when equivalent semantic values are adjacent.

- [ ] **Step 5: Add physical control motion states**

Use `whileHover` only as enhancement, `whileTap` for a short depress response, and CSS `:focus-visible` independent of Motion. Disabled controls must not animate as enabled.

- [ ] **Step 6: Run motion component tests and verify GREEN**

Run:

```bash
npm test -- src/components/InstrumentGauge.test.tsx src/components/WeatherStation.test.tsx
npm run typecheck
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit Motion instrument behavior**

```bash
git add src/app/App.tsx src/components src/styles/weather-station.css
git commit -m "feat(motion): animate tactile weather instruments"
```

### Task 7: Forecast tray and accessible animated location search

**Files:**
- Create: `src/components/ForecastTray.tsx`
- Create: `src/components/ForecastTray.test.tsx`
- Create: `src/components/LocationSearch.tsx`
- Create: `src/components/LocationSearch.test.tsx`
- Modify: `src/components/WeatherStation.tsx`
- Modify: `src/styles/weather-station.css`

**Interfaces:**
- Consumes: `DailyForecast[]`, selected date, `selectDay`, `search`, `searchResults`, `selectLocation`, and search state from Task 4.
- Produces:
  - `ForecastTray({ days, selectedDate, onSelect }: ForecastTrayProps): JSX.Element`
  - `LocationSearch({ state, onSearch, onSelect }: LocationSearchProps): JSX.Element`
  - Shared `layoutId="selected-forecast-day"` indicator and `AnimatePresence` detail/search surfaces.

- [ ] **Step 1: Write failing forecast tests**

Assert days are keyboard-selectable, selection updates `aria-pressed` or tab semantics consistently, selected details update, and selection remains visible without animation.

- [ ] **Step 2: Write failing location-search keyboard tests**

Assert expansion moves focus to input; fewer than three characters gives guidance; ArrowDown/ArrowUp traverse results; Enter selects; Escape closes; closing restores focus to the trigger; empty/error states are announced.

- [ ] **Step 3: Run tests and verify RED**

Run: `npm test -- src/components/ForecastTray.test.tsx src/components/LocationSearch.test.tsx`

Expected: FAIL because both components do not exist.

- [ ] **Step 4: Implement the forecast tray with layout and presence animation**

Use Motion `layout` for card reflow and a shared `layoutId` for the selected indicator. Use opacity-only transitions when reduced motion is requested.

- [ ] **Step 5: Implement combobox/listbox location search**

Use correct ARIA ownership, active-descendant or roving focus behavior, request-state announcements, and explicit submit/debounce behavior. Avoid focusable elements inside options.

- [ ] **Step 6: Run component tests and verify GREEN**

Run:

```bash
npm test -- src/components/ForecastTray.test.tsx src/components/LocationSearch.test.tsx src/components/WeatherStation.test.tsx
npm run lint
npm run typecheck
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit forecast and search interactions**

```bash
git add src/components src/styles/weather-station.css
git commit -m "feat(ui): add animated forecast and location search"
```

### Task 8: Browser verification across live, failure, keyboard, and responsive paths

**Files:**
- Create: `tests/station.spec.ts`
- Create: `tests/accessibility.spec.ts`
- Create: `tests/responsive.spec.ts`
- Modify: `playwright.config.ts`

**Interfaces:**
- Consumes: Complete application from Tasks 1–7.
- Produces: Repeatable browser-level acceptance tests and named Playwright projects `desktop`, `tablet`, and `iphone-15`.

- [ ] **Step 1: Configure exact browser projects**

- `desktop`: viewport `1440 × 900`.
- `tablet`: viewport `834 × 1112`, touch enabled.
- `iphone-15`: viewport `393 × 852`, device scale factor 3, touch/mobile enabled.

- [ ] **Step 2: Write failing live/fallback browser tests**

Route Open-Meteo requests with deterministic fixtures. Assert initial fallback is visible before live data, live data replaces it, initial request failure retains bundled data, and refresh failure after live success retains the live temperature/location while exposing retry.

- [ ] **Step 3: Write failing keyboard and reduced-motion browser tests**

Cover search open/type/results/navigation/select/close, forecast-day selection, unit toggle, refresh, focus visibility, and `reducedMotion: 'reduce'` without travel-dependent assertions.

- [ ] **Step 4: Write failing responsive assertions**

Assert the mobile console is single-column with no horizontal overflow, controls are at least 44 CSS pixels, tablet uses the expected two-column instrument region, desktop uses the full console grid, and safe-area padding is applied on mobile.

- [ ] **Step 5: Run tests and correct application defects until GREEN**

Run: `npm run test:e2e`

Expected: all tests pass in Chromium for all three projects.

- [ ] **Step 6: Run the complete quality suite**

Run: `npm run check`

Expected: lint, typecheck, unit/component tests, production build, and Playwright tests all exit 0.

- [ ] **Step 7: Commit browser acceptance coverage**

```bash
git add tests playwright.config.ts src
git commit -m "test: verify Weatherworks browser behavior"
```

### Task 9: Real screenshots, visual inspection, and contact sheet

**Files:**
- Create: `tests/visual.spec.ts`
- Create: `docs/images/weatherworks-desktop.png`
- Create: `docs/images/weatherworks-tablet.png`
- Create: `docs/images/weatherworks-iphone-15.png`
- Create: `scripts/build_contact_sheet.py`
- Create: `docs/images/weatherworks-contact-sheet.png`

**Interfaces:**
- Consumes: Named Playwright projects and deterministic weather fixtures from Task 8.
- Produces: Real-browser portfolio screenshots with exact dimensions and a Pillow-validated contact sheet.

- [ ] **Step 1: Write the visual capture test**

Load deterministic live weather, wait for fonts and settled instrument state, and capture one full-page screenshot per named project into `docs/images/`.

- [ ] **Step 2: Run the capture test**

Run: `npx playwright test tests/visual.spec.ts --update-snapshots`

Expected: three PNG files produced from real Chromium rendering.

- [ ] **Step 3: Implement the Pillow validation/contact-sheet script**

`build_contact_sheet.py` must verify the three source image dimensions against the named viewport expectations, label each panel, and write `weatherworks-contact-sheet.png`. It must fail non-zero on missing or incorrectly sized images.

- [ ] **Step 4: Run image validation**

Run: `python scripts/build_contact_sheet.py`

Expected: dimension checks pass and the contact sheet is created.

- [ ] **Step 5: Visually inspect every screenshot**

Confirm no clipping, horizontal overflow, empty panels, focus artifacts, request errors, personal data, browser chrome, or contradictory lighting. If any defect exists, fix the app and recapture all affected images.

- [ ] **Step 6: Commit visual evidence**

```bash
git add tests/visual.spec.ts scripts/build_contact_sheet.py docs/images src
git commit -m "docs: add responsive Weatherworks previews"
```

### Task 10: Documentation, repository quality gate, and public publication

**Files:**
- Create: `README.md`
- Create: `LICENSE`
- Modify if required: `.gitignore`
- Modify after completion: `/home/hersa/Documents/HERSA/sar/Hermes/Journal/2026-10-29.md`

**Interfaces:**
- Consumes: Verified commands, architecture, screenshots, dependency decisions, and final repository metadata.
- Produces: Portfolio-ready public repository and daily journal record.

- [ ] **Step 1: Confirm GitHub identity and repository-name availability**

Run:

```bash
gh auth status
gh api user --jq '.login'
gh repo view hersaintel/motion-skeuomorphic-weather-station >/dev/null 2>&1 && echo EXISTS || echo AVAILABLE
```

Expected: authenticated owner is `hersaintel`; select the preferred name if available, otherwise choose a clear available variant before writing links.

- [ ] **Step 2: Write the README from verified evidence**

Include title/value proposition, contact sheet plus individually labeled desktop/tablet/iPhone 15 captures and exact dimensions, features, Motion adoption, material tokens, live/fallback policy, architecture/data flow, stack, installation, usage, testing commands, project structure, accessibility, Open-Meteo attribution, deployment status `Not deployed`, contribution guidance, MIT license, and author `@hersaintel`.

- [ ] **Step 3: Add the MIT license**

Use the current year and copyright holder `Cory / @hersaintel` without adding unsupported contributors.

- [ ] **Step 4: Run final verification against the committed-tree candidate**

Run:

```bash
npm ci
npm run check
python scripts/build_contact_sheet.py
git status --short
git diff --check
```

Expected: all checks pass; only intended documentation/license changes are unstaged before the final commit.

- [ ] **Step 5: Stage and audit the complete publication diff**

Inspect staged filenames, `git diff --cached --stat`, secrets/token patterns, `/home/` paths, email addresses, private-key markers, databases, nested `.git` directories, `node_modules`, `dist`, Playwright reports, trace files, and files over 1 MiB. Review every match rather than treating fixtures or lockfile integrity strings as credentials.

- [ ] **Step 6: Commit the publication documentation**

```bash
git add README.md LICENSE .gitignore docs scripts package*.json src tests *.config.* tsconfig*.json index.html
git commit -m "docs: document Motion weather station showcase"
```

- [ ] **Step 7: Verify the local committed state once more**

Run:

```bash
npm run check
git status --short --branch
git log --oneline --decorate -10
```

Expected: quality suite passes and the working tree is clean.

- [ ] **Step 8: Create and push the public repository**

Run with the verified repository name:

```bash
gh repo create hersaintel/motion-skeuomorphic-weather-station --public --source . --remote origin --description "Motion-powered skeuomorphic weather station with live Open-Meteo data and responsive instrument layouts" --push
```

- [ ] **Step 9: Verify external GitHub state**

Read back repository visibility, default branch, remote commit SHA, recursive tree, raw README content, LICENSE, and every screenshot object. Require local `HEAD` to equal remote `main` before declaring publication complete.

- [ ] **Step 10: Journal completion narrowly in the approved Obsidian folder**

Append or create the current dated note under `/home/hersa/Documents/HERSA/sar/Hermes/Journal/` with project purpose, repository URL, commit SHA, checks executed, screenshot paths, and any limitations. Do not scan any other vault path.

- [ ] **Step 11: Deliver the verified result**

Report the public repository URL, final commit, exact passing commands/results, screenshot paths/dimensions, live/fallback behavior, Motion version and integration points, deployment status, and limitations.

## Self-Review

- **Spec coverage:** Every design section maps to Tasks 2–10: live/fallback data, responsive layouts, skeuomorphic materials, Motion adoption, accessibility, testing, screenshots, README, publication, and journaling are all represented.
- **Step scan:** Each checklist item performs one inspectable action; TDD tasks separate failing tests, RED execution, implementation, GREEN execution, and commits.
- **Type consistency:** Tasks 2–7 share the exact `LocationChoice`, `WeatherSnapshot`, `UnitSystem`, controller, and component interfaces defined in their Interfaces blocks.
- **Review Focus:** Malformed payloads, stale requests, refresh failure retention, ambiguous keyboard search, and reduced motion each have named tests in Tasks 3, 4, 6, 7, and 8.
- **Proportion:** The plan specifies interfaces, acceptance tests, commands, and task boundaries without prescribing full implementation bodies.
