# NOTES

## How to run

```bash
# 1. Clone your repo and install deps
npm install

# 2. Install Zustand (added as a dep, but npm install handles it)
# (it's already in package.json)

# 3. Add your OpenWeatherMap key
cp .env.example .env
# edit .env → OPENWEATHERMAP_API_KEY=your_key_here

# 4. iOS
cd ios && pod install && cd ..
npm run ios

# 5. Android
npm run android

# 6. Tests
npm test
```

Open-Meteo works with no API key. OpenWeatherMap requires a free key from
https://openweathermap.org/api.

---

## Key architectural decisions

### Service abstraction — registry pattern

Every weather provider implements `IWeatherService` (name, fetchWeather).
A central `serviceRegistry.ts` maps string names → service instances.
Adding a third provider is one line in that file; nothing else changes.

I chose a simple object map over a class-based factory because the services
are stateless — they hold no user-specific state and can be singletons.
If a service ever needed per-request config (e.g. user-specific API keys)
I would switch to a factory function.

### State management — Zustand

Zustand over Context because:
- No provider wrapper needed in App.tsx
- Selectors avoid re-renders on unrelated state slices
- The store is testable in isolation (plain JS, no React test harness needed)
- Adding a caching layer or persistence later is straightforward

The store owns the validation call — it validates before fetching, so the
UI doesn't need to import the validator directly. This keeps WeatherScreen
a thin wiring layer.

### Validation — pure function

`validateLocation` is a pure function that inspects a string and returns a
discriminated union `{valid: true, value} | {valid: false, reason}`.

**What counts as valid:**
- Trimmed length between 2 and 100 characters
- Only Unicode letters, digits, spaces, hyphens, commas, periods, apostrophes
  (covers "São Paulo", "Saint-Étienne", "Washington, D.C.", "Coeur d'Alene")
- Must contain at least one letter (rejects pure digit strings)

I deliberately do not validate that the place exists — that's the service's
job (it returns `NOT_FOUND`). The validator only protects against obviously
malformed input and provides user-friendly messages before any network call.

### Error distinction

`WeatherServiceError` carries a `code` field (`NOT_FOUND | NETWORK |
SERVICE_UNAVAILABLE | UNKNOWN`). The store maps this to a human-readable
string. The UI distinguishes validation errors (shown inline on the input)
from service errors (shown in the weather display area).

### Service-specific theming

`colors.ts` exports a `serviceThemes` map and a `getServiceTheme` helper.
The header background and toggle button accent colour both derive from the
active service. Components don't know which service is active — they just
consume `theme.accent`. This is the foundation for the theming discussion
in the follow-up interview.

---

## Trade-offs due to the time limit

- **No caching.** Every submit or service switch makes a live network call.
  I would add a simple in-memory cache (keyed on `${location}:${service}`)
  with a TTL of a few minutes.

- **No offline mode.** A cached last result + a "last updated" timestamp
  would be the first step.

- **No location autocomplete.** Open-Meteo's geocoding API supports it;
  I would debounce the input and show a suggestion list.

- **No Fahrenheit toggle.** Easy to add — a unit preference in the store,
  and a conversion function at display time.

- **Limited accessibility.** I added `accessibilityLabel` and `accessibilityRole`
  to interactive elements, but haven't run VoiceOver/TalkBack end-to-end.

- **No loading skeleton.** The WeatherDisplay shows a plain "Loading…" text;
  a skeleton screen would look much better.

---

## What I'd improve with more time

1. **Caching layer** — wrap `IWeatherService` with a `CachedWeatherService`
   decorator so the caching logic is provider-agnostic.
2. **Location autocomplete** — debounce the text input, call Open-Meteo's
   geocoding search endpoint, show a flat list of suggestions.
3. **Richer weather data** — humidity, wind speed, "feels like", daily
   forecast. The current `WeatherData` type is intentionally minimal.
4. **Theming via Context** — expose the merged theme via a `ThemeContext` so
   every component can access accent colours without importing
   `getServiceTheme` directly.
5. **E2E tests** — Detox test that enters a city, switches services, and
   verifies the weather card updates.
6. **CI pipeline** — GitHub Actions running `npm test` and `npm run typecheck`
   on every PR.

---

## How I used AI (Claude)

I used Claude (claude-sonnet) for this submission. Specifically:

- **Scaffolding the implementations**: I described the Open-Meteo and
  OpenWeatherMap API shapes and asked it to generate the service classes,
  WMO code mapping, and error handling. I reviewed and adjusted the error
  code choices and the shape of the geocoding + forecast fetch chain.

- **Generating test cases**: I asked for a comprehensive test suite for the
  validator and both services. I reviewed each test to ensure it actually
  tests the right thing (e.g. that WMO code 1 maps to "Mainly clear", not
  just any non-null string).

- **Brainstorming validation rules**: I listed candidate rules and asked
  Claude to identify edge cases I might miss (e.g. apostrophes in city names,
  accented characters). I chose the final rules myself.

**Where I did not use AI:**
- The architecture decisions (registry pattern, Zustand, error code taxonomy,
  validation philosophy) were mine. I can explain and defend every structural
  choice.
- The trade-off analysis in this file reflects my own thinking about what
  matters at interview time.

I can explain and defend every line in the follow-up interview.
