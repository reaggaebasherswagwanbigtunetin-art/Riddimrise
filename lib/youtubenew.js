import { youtubeApiKey, trainerUrl } from "./config";

export async function youtubeSearch(q, max = 12) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${max}&q=${encodeURIComponent(q)}&key=${youtubeApiKey}`;
  const r = await fetch(url);
  const j = await r.json();
  if (!j.items) return [];
  return j.items.map(i => ({
    id: i.id.videoId,
    title: i.snippet.title,
    thumb: i.snippet.thumbnails?.medium?.url,
  }));
}

export async function trainAlgo({ old=0.2, similar=0.3, focal=0.3, bangers=0.2, seeds=[] }) {
  const res = await fetch(trainerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weights: { old, similar, focal, bangers }, seeds })
  });
  if (!res.ok) throw new Error("Trainer failed");
  return res.json(); // {playlistId, count}
}
