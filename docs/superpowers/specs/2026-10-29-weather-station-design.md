# Motion Skeuomorphic Weather Station — Design

## Intent

Create a standalone public demonstration showing how the `motion` library from `motiondivision/motion` complements the `skeuomorphic-ui` skill. The project should prove that animation reinforces physical affordances, state, and hierarchy rather than adding decorative movement.

The application is a responsive retro-modern weather station that retrieves live weather without requiring an API key and falls back to bundled demonstration data when an API request fails. Full cold-start offline/PWA behavior is outside this project.

## Goals

- Demonstrate Motion for React in a coherent modern-skeuomorphic interface.
- Use live no-key weather data from Open-Meteo with a bundled offline fallback.
- Show meaningful spring, gesture, presence, SVG, and layout animations.
- Respect reduced-motion preferences and preserve semantic keyboard-accessible controls.
- Adapt the instrument panel for desktop, tablet, and a real named phone viewport.
- Include real browser screenshots and clear technical documentation.
- Publish a verified public GitHub repository owned by `@hersaintel`.

## Non-goals

- Forecasting weather independently or claiming meteorological accuracy beyond the upstream provider.
- Building user accounts, persistent cloud storage, maps, alerts, or a backend service.
- Providing service-worker caching or a guaranteed cold launch without network access.
- Reproducing a complete vintage operating system.
- Using animation where immediate state changes are clearer.
- Deploying the application unless a suitable existing deployment target is explicitly requested later.

## Anti-goals

The project fails its purpose if it becomes a flat dashboard with generic drop shadows, a motion-heavy demo that ignores reduced-motion settings, a screenshot-only mockup, or an application that cannot show useful content without network access.

## Constraints

- Project root: `/home/hersa/Hermes/motion-skeuomorphic-weather-station`.
- Public GitHub repository: prefer `hersaintel/motion-skeuomorphic-weather-station` if available.
- Frontend-only application; no credentials or API keys.
- Source-owned visual components and CSS tokens.
- Motion must be installed through the `motion` package and imported from `motion/react`.
- Live data must come from documented Open-Meteo endpoints; location search uses its geocoding API.
- A deterministic fallback dataset must be bundled and visibly identified when active.
- README claims, screenshots, tests, links, and repository state must be verified before publication.

## Approaches Considered

### 1. Tactile focus timer

A mechanical timer would provide clear drag and spring interactions with no network dependency. It was recommended initially because it is focused and deterministic, but it would exercise fewer data-driven layout transitions and was not selected.

### 2. Retro weather station — selected

A responsive instrument panel with gauges, forecast cards, and location search exercises Motion’s springs, shared layout changes, presence transitions, animated SVG values, and interaction states. It also gives skeuomorphism a justified physical metaphor. The tradeoff is additional network/error/fallback behavior.

### 3. Skeuomorphic audio mixer

A mixer would provide the strongest direct physical-control metaphor, but accessible rotary controls, audio behavior, and input-device testing would make it substantially larger than necessary for a library adoption test.

## Selected Technical Approach

### Stack

- React 19 with Vite and TypeScript.
- `motion` using `motion/react`.
- CSS Modules or a small global token stylesheet; no component framework.
- Open-Meteo forecast and geocoding APIs.
- Vitest and React Testing Library for unit/component tests.
- Playwright for responsive browser tests and screenshots.
- ESLint and TypeScript checks.
- Optional Pillow script for screenshot dimension validation and contact-sheet assembly only.

### Why this stack

React exposes Motion’s layout, presence, gesture, SVG, and reduced-motion APIs in one cohesive integration. Vite keeps the test repository small and easy to run. Source-owned CSS makes the skeuomorphic material system inspectable and avoids introducing a second UI library that would obscure the Motion evaluation.

## Product Design

### Working title

**Weatherworks** — a tactile atmospheric instrument console.

### Main surfaces

1. **Instrument header**
   - Product identity and current location.
   - Search button/input with animated expansion.
   - Live/offline indicator with explicit text, not color alone.

2. **Primary instrument cluster**
   - Temperature dial with an animated SVG needle.
   - Weather-condition glass display.
   - Pressure and wind sub-gauges.
   - Controls use metal bezels, inset glass, readable labels, and a single upper-left key light.

3. **Forecast tray**
   - Daily forecast cards that enter/exit with `AnimatePresence`.
   - Selected day uses a shared `layoutId` indicator.
   - Cards reflow through Motion layout animations across breakpoints.

4. **Detail drawer**
   - Selected-day details slide or fade into an inset panel.
   - Reduced-motion mode uses opacity/state changes instead of large transforms.

5. **Demonstration controls**
   - Refresh weather.
   - Force offline fallback for testing.
   - Toggle measurement units.
   - Disabled/loading/error states are visible and testable.

### Responsive behavior

- **Desktop:** `1440 × 900` CSS pixels; multi-instrument console with forecast tray beside or below the main cluster.
- **Tablet:** `834 × 1112` CSS pixels; two-column instrument layout with larger touch controls.
- **Mobile:** iPhone 15 logical viewport `393 × 852` CSS pixels at device scale factor 3; single-column console, bottom-safe-area spacing, compact gauge hierarchy, and touch targets of at least 44 CSS pixels.
- Breakpoints adapt structure and detail density rather than scaling the desktop panel.

## Skeuomorphic Material System

- One upper-left key light and restrained ambient fill.
- Brushed metal for frames, dark molded plastic for controls, and glass for readout surfaces.
- Raised buttons depress on press through both visual depth and Motion spring response.
- Inset displays remain high-contrast and readable.
- CSS custom properties define materials, bevels, radii, shadows, focus rings, and motion timings.
- Texture is generated with CSS gradients; no large raster texture assets.

## Motion Adoption

Motion is used only where it explains interaction or change:

- Spring-loaded button press/release states.
- Search-panel expansion and collapse.
- Forecast-card entrance/exit via `AnimatePresence`.
- Shared selected-day indicator via `layoutId`.
- Reflow between responsive layouts via `layout`.
- Animated SVG gauge needles and weather values.
- Loading/error/offline indicator transitions.
- `MotionConfig reducedMotion="user"` plus `useReducedMotion` for bespoke gauge and drawer behavior.

Continuous decorative loops and large parallax effects are excluded.

## Data Flow

1. Start with bundled deterministic fallback data so the first render is useful.
2. Resolve the default demonstration location from a checked-in configuration value, not device geolocation.
3. Request live current and daily forecast data from Open-Meteo.
4. Replace fallback data with validated live data when the request succeeds.
5. On an initial timeout, malformed response, or network failure, retain bundled fallback data and expose an accessible fallback status message.
6. If a later refresh or location change fails after live data has loaded, retain the last successfully loaded live readings rather than replacing them with bundled data; expose the failure and retry action without blanking the instruments.
7. Location search queries Open-Meteo’s geocoding endpoint after explicit submission or debounced input of at least three characters.
8. Changing location cancels or supersedes stale requests and transitions the instrument values to the new dataset.

## Error Handling

- Initial network failure: show bundled fallback data and an explicit retry control.
- Refresh failure after live data exists: retain the last successful readings and show an explicit failure/retry state.
- Empty location search: show an inline accessible message.
- Ambiguous results: show a keyboard-navigable result list.
- Invalid/malformed API response: reject it through a parser boundary and retain fallback data.
- Slow request: show a loading state without blanking existing readings.
- Stale request completion: ignore responses that no longer match the active request.

## Accessibility

- Semantic buttons, form controls, headings, lists, and status regions.
- Visible `:focus-visible` treatment independent of material shadows.
- Full keyboard access to search, unit selection, forecast cards, retry, and demonstration controls.
- State is not communicated by depth, color, texture, or motion alone.
- `MotionConfig reducedMotion="user"` and targeted `useReducedMotion` fallbacks.
- Readable contrast on glass, metal, and plastic surfaces.
- Touch targets of at least 44 CSS pixels.
- Browser zoom/reflow and mobile safe-area behavior included in Playwright checks.

## Testing Strategy

Use test-driven development for production behavior:

- Unit tests for weather-code mapping, unit conversion, response validation, fallback selection, and stale-request handling.
- Component tests for loading, live, offline, empty-search, ambiguous-search, error, unit toggle, and keyboard behavior.
- Motion behavior assertions focus on final state, accessible semantics, and reduced-motion policy rather than fragile timing internals.
- Playwright tests for desktop, tablet, and iPhone 15 layouts; keyboard flow; network-failure fallback; and screenshot capture.
- Quality commands cover lint, TypeScript, unit/component tests, production build, and browser tests.

## Screenshots and README

Commit real browser captures for:

- Desktop `1440 × 900`.
- Tablet `834 × 1112`.
- iPhone 15 `393 × 852`, DPR 3.
- Optional contact sheet assembled from those captures.

The README will explain Motion adoption, design tokens/materials, live and fallback data behavior, exact viewport dimensions, accessibility, stack, architecture, installation, testing, project structure, deployment status, upstream API attribution, MIT license, and author `@hersaintel`.

## Publication and Verification

- Confirm the desired repository name is available before writing permanent repository URLs.
- Audit staged files for secrets, credentials, local paths, generated dependencies, nested repositories, and oversized assets.
- Use focused Conventional Commits.
- Create the repository as public, as explicitly requested.
- Verify remote visibility, default branch, commit SHA, recursive tree, README, license, and screenshot files after pushing.
- Journal the completed work in the allowed Hermes Obsidian journal directory only.

## Builder Decisions Left Open

The implementer may choose the exact component boundaries, typography, default demonstration city, weather-icon drawing approach, CSS Module versus a single scoped stylesheet, and the precise spring constants, provided they satisfy the interaction, accessibility, testing, and verification requirements above.
