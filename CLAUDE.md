# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Riddimrise is an early-stage **Expo / React Native** mobile app (iOS + Android) for
discovering and playing music across YouTube and Spotify, with an AI-assisted tab.
The visual identity is a dark, Rasta-colored theme (red / gold / green).

The codebase is a **work in progress**: several files are placeholders, stubs, or
incomplete, and the project is not yet runnable as-is (see "Current state & known
gaps" below). Treat most existing files as scaffolding to be built out rather than
finished, working code.

## Tech stack

- **Expo** managed workflow (`app.json` / `eas.json`), targeting iOS and Android.
- **React Native** with functional components and hooks.
- **EAS Build** for `development`, `preview`, and `production` builds.
- External services: OpenAI, Spotify Web API, Google/YouTube Data API, plus a custom
  "trainer" backend endpoint (`trainerUrl`) for playlist generation.

There is **no build tooling checked in yet** — no `package.json`, lockfile, or
`node_modules`. Dependencies referenced in code (e.g. `expo-constants`,
`react-native-youtube-iframe`) must be installed once `package.json` exists.

## Repository structure

```
App.js                  Intended app entry / root component (currently incorrect — see gaps)
app.json                Expo config: name, slug, scheme "riddimrise", android package com.khipsy.riddimrise
eas.json                EAS Build profiles + env var mapping (currently invalid JSON — see gaps)
.env                    Local secrets (should not be committed with real values)
lib/                    Non-UI logic: config + one module per external service
screens/                One React component per app tab/screen
```

### `lib/` — service and config modules

- `config.js` — Single source of truth for secrets. Reads from
  `Constants.manifest?.extra` / `Constants.expoConfig?.extra` and re-exports
  `openAiApiKey`, `spotifyClientId`, `spotifyClientSecret`, `googleApiKey`,
  `youtubeApiKey`. **All other `lib/` modules import their keys from here** — never
  read `process.env` or hardcode keys in service modules.
- `api.js` — `fetchOpenAiCompletion(prompt)` calls the OpenAI completions API.
- `spotify.js` — `fetchSpotifyPlaylists()` (stub; OAuth Client Credentials flow not
  implemented, returns `[]`).
- `youtube.js` — `fetchYouTubeVideos(query)` calls the YouTube Data API search endpoint.
- `youtubenew.js` — Newer YouTube module (intended replacement for `youtube.js`):
  `youtubeSearch(q, max)` returns normalized `{id, title, thumb}[]`;
  `youtubeSearchLatest`/`fetchLatestMusic(genre)` return newest-first, Music-category
  results filtered by `publishedAfter` and merged/deduped across the phrases in
  `MUSIC_GENRES` (dancehall / reggae / African); `trainAlgo(weights)` POSTs to the
  `trainerUrl` backend to build a playlist.
- `theme.js` — Exports `theme` (dark mode, Rasta palette). Import colors from here
  rather than hardcoding hex values in screens.

### `screens/` — UI tabs

- `AIScreen.js`, `SpotifyScreen.js`, `YouTubeScreen.js` — currently all placeholder
  screens rendering "Coming Soon" text.
- `YouTubeScreennew.js` — The real YouTube tab: a continuous player that fetches the
  latest dancehall / reggae / African music via `lib/youtubenew.js` (`fetchLatestMusic`),
  auto-advances through the queue on track end, and offers a genre selector
  (`MUSIC_GENRES`). Uses `react-native-youtube-iframe` for playback.

## Conventions

- **Secrets flow:** app config (`eas.json` `env` → Expo `extra`) → `lib/config.js` →
  service modules. Add a new key by extending both `eas.json` env blocks and
  `config.js`, then importing the export where needed.
- **Service modules** live in `lib/`, are plain async functions returning parsed JSON
  or normalized objects, throw on missing keys / failed responses, and contain no JSX.
- **Screens** are default-exported functional components with a co-located
  `StyleSheet.create` block at the bottom of the file.
- **Theme:** dark background `#121212`/`#111`, primary red `#E53935`, gold accent
  `#FBC02D`/`#FCDD09`, green `#388E3C`. Prefer `theme.js` values for new UI.
- **"new" file variants** (`youtubenew.js`, `YouTubeScreennew.js`) are the direction of
  travel; prefer building on these over the older `youtube.js` / placeholder screens.

## Current state & known gaps

Verify these before assuming anything runs; fix opportunistically when touching a file:

- **No `package.json`** — the project cannot install deps, run, or build until one is
  created with Expo/React Native and the imported libraries.
- **`App.js` is wrong** — it contains a copy of the `app.json` Expo config instead of a
  React root component. A real entry point (registering screens, e.g. via a navigator)
  needs to be written.
- **`eas.json` is invalid JSON** — the `env` blocks use bare `process.env.OPENAI_API_KEY`
  (unquoted JS), which is not valid JSON. EAS expects either quoted string values or the
  keys defined via EAS environment variables/secrets.
- **`config.js` is missing `trainerUrl`**, but `lib/youtubenew.js` imports it — add the
  export (and its source in `eas.json`/`extra`) before using `trainAlgo`.
- **Duplicate/placeholder screens** — `AIScreen.js` and `YouTubeScreen.js` both define a
  component literally named `SpotifyScreen`; these need real implementations and correct
  names/exports.
- **`.env` contains a real-looking OpenAI key** committed to the repo. Do not reuse or
  echo it; it should be rotated and removed from version control, with `.env` gitignored.

## Development workflow

Standard Expo commands once `package.json` and dependencies exist:

```bash
npm install                 # install dependencies (after package.json is created)
npx expo start              # start the Metro dev server / Expo Go
npx expo start --android    # open on Android emulator/device
npx expo start --ios        # open on iOS simulator/device
```

EAS builds (profiles defined in `eas.json`):

```bash
eas build --profile development --platform android
eas build --profile preview --platform android      # internal APK
eas build --profile production --platform android    # app-bundle for store
```

No test runner or linter is configured yet; there are no tests to run.
