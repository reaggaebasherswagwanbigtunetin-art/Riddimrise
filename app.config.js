// Loads .env for local `expo start`; on EAS cloud builds the same vars come from
// EAS environment variables/secrets (dashboard or `eas env:create`). Layers
// `extra` (read by lib/config.js) on top of app.json.
import "dotenv/config";
import appJson from "./app.json";

export default () => ({
  ...appJson.expo,
  extra: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    googleApiKey: process.env.GOOGLE_API_KEY,
    youtubeApiKey: process.env.YOUTUBE_API_KEY,
    trainerUrl: process.env.TRAINER_URL,
  },
});
