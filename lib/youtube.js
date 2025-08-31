import { youtubeApiKey } from "./config";

export async function fetchYouTubeVideos(query) {
  if (!youtubeApiKey) {
    throw new Error("YouTube API key not set");
  }
  // This is a simple placeholder implementation
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${youtubeApiKey}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch YouTube videos");
  return response.json();
}
