# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Riddimrise is an early-stage **Expo / React Native** mobile app (iOS + Android) for
discovering and playing music across YouTube and Spotify, with an AI-assisted tab.
The visual identity is a dark, Rasta-colored theme (red / gold / green).

The codebase is a **work in progress**. The YouTube tab is functional and the app is
launchable once dependencies are installed, but the Spotify/AI tabs are still
placeholders (see "Current state & known gaps"). Treat the placeholder screens as
scaffolding to be built out.

## Tech stack

- **Expo** managed workflow (`app.json` / `eas.json`), targeting iOS and Android.
- **React Native** with functional components and hooks.
- **EAS Build** for `development`, `preview`, and `production` builds.
- External services: OpenAI, Spotify Web API, Google/YouTube Data API, plus a custom
  "trainer" backend endpoint (`trainerUrl`) for playlist generation.

`package.json` targets the **Expo SDK 51** stack (React Native 0.74). Run
`npm install` (or `npx expo install` to reconcile versions) before first run; there is
no lockfile committed yet.

## Repository structure

```
App.js                  Root component: mounts YouTubeScreennew + the layover Modal
app.config.js           Dynamic Expo config — spreads app.json and injects `extra` (API keys) from env
app.json                Static Expo base config: name, slug, scheme "riddimrise", android package com.khipsy.riddimrise
babel.config.js         babel-preset-expo
eas.json                EAS Build profiles + env var mapping (currently invalid JSON — see gaps)
.env                    Local secrets, gitignored (loaded by app.config.js via dotenv)
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
  `youtubeSearchLatest`/`fetchLatestMusic(key, {exclude})` return newest-first,
  Music-category results filtered by `publishedAfter`, then merged/deduped across a
  region's or genre's search phrases (and any excluded ids). `MUSIC_REGIONS`
  (Jamaica, Nigeria, Ghana, Zimbabwe, South Africa, Tanzania, Kenya, Global Mix) each
  carry `{key, label, flag, styles, queries}`; `MUSIC_GENRES` is the older
  genre-keyed list. `trainAlgo(weights)` POSTs to the `trainerUrl` backend.
- `theme.js` — Exports `theme` (dark mode, Rasta palette). Import colors from here
  rather than hardcoding hex values in screens.

### `screens/` — UI

- `GenrePicker.js` — The **layover**: a slide-up picker (rendered in a `Modal` from
  `App.js`) of country cards from `MUSIC_REGIONS`. `onSelect(region)` chooses which
  country's latest music plays; shown on launch and re-openable via the player's
  "Change" button.
- `YouTubeScreennew.js` — The real YouTube tab: a continuous player driven by a
  `region` prop. Fetches that country's latest music via `fetchLatestMusic`,
  **auto-advances without ever repeating a track** (tracks played ids, pages in more
  when the queue empties), and shows an "Up next" queue. `react-native-youtube-iframe`
  for playback.
- `AIScreen.js`, `SpotifyScreen.js`, `YouTubeScreen.js` — older placeholder screens
  ("Coming Soon"); not wired into `App.js`.

### App flow

`App.js` holds the selected `region` and whether the layover is visible. On launch the
`GenrePicker` Modal is up; picking a country sets `region` and reveals
`YouTubeScreennew`. The player's "Change" button reopens the layover.

## Conventions

- **Secrets flow:** env var (`.env` locally via dotenv, or `eas.json` `env` on EAS) →
  `app.config.js` `extra` → `lib/config.js` → service modules. Add a new key by
  extending `app.config.js` `extra`, `config.js`, the `eas.json` env blocks, and (for
  local dev) `.env`, then importing the `config.js` export where needed.
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

- **No lockfile / `node_modules`** — run `npm install` (or `npx expo install`) first.
  Dependency versions in `package.json` are pinned to Expo SDK 51 but unverified against
  a real install; `npx expo install` will reconcile them.
- **`eas.json` is invalid JSON** — the `env` blocks use bare `process.env.OPENAI_API_KEY`
  (unquoted JS), which is not valid JSON. EAS expects quoted string values or the keys
  defined via EAS environment variables/secrets. (Local dev works via `.env` + dotenv;
  this only bites EAS builds.)
- **`config.js` is missing `trainerUrl`**, but `lib/youtubenew.js` imports it — add the
  export (and its source in `app.config.js`/`extra`) before using `trainAlgo`.
- **Duplicate/placeholder screens** — `AIScreen.js` and `YouTubeScreen.js` both define a
  component literally named `SpotifyScreen`; these need real implementations. They are
  not currently referenced by `App.js`.
- **`.env` is now gitignored but was previously committed** with a real OpenAI key —
  rotate that key; git history still contains it.
- **`YOUTUBE_API_KEY` must be set** (in `.env` locally) for the YouTube tab to load;
  without it, `fetchLatestMusic` throws "YouTube API key not set", surfaced in the player.

## Development workflow

```bash
npm install                 # or: npx expo install (reconciles SDK 51 versions)
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
