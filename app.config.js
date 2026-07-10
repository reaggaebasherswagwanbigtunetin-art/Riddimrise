// Loads .env for local `expo start`; on EAS builds the same vars are injected
// via eas.json. Layers `extra` (read by lib/config.js) on top of app.json.
import "dotenv/config";
import appJson from "./app.json";

export default () => ({
  ...appJson.expo,
  extra: {
    openAiApiKey: process.env.OPENAI_API_KEY,
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    googleApiKey: process.env.GOOGLE_API_KEY,
    youtubeApiKey: process.env.YOUTUBE_API_KEY,
  },
});
