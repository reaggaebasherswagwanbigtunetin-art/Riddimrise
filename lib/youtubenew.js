import { youtubeApiKey, trainerUrl } from "./config";

// YouTube's built-in "Music" category. Restricting search to this avoids
// pulling in interviews, reactions, and other non-music clips.
const MUSIC_CATEGORY_ID = "10";

// The only genres this screen plays. Each genre fans out to a few search
// phrases so we cover the sub-styles people actually mean (e.g. "African"
// includes Afrobeats, Amapiano, and Naija).
export const MUSIC_GENRES = [
  {
    key: "all",
    label: "All",
    queries: ["new dancehall song", "new reggae song", "new afrobeats song", "new amapiano song"],
  },
  {
    key: "dancehall",
    label: "Dancehall",
    queries: ["latest dancehall song", "new dancehall riddim"],
  },
  {
    key: "reggae",
    label: "Reggae",
    queries: ["latest reggae song", "new roots reggae"],
  },
  {
    key: "african",
    label: "African",
    queries: ["latest afrobeats song", "new amapiano song", "latest naija music", "new african music"],
  },
];

// Countries/regions shown in the layover picker. Each resolves to a set of
// search phrases tuned to that place's dominant styles, so "latest music"
// really means the freshest riddims/afrobeats/amapiano etc. from there.
export const MUSIC_REGIONS = [
  {
    key: "mix",
    label: "Global Mix",
    flag: "🌍",
    styles: "Dancehall · Afrobeats · Reggae · Amapiano",
    queries: ["new dancehall song", "new afrobeats song", "new reggae song", "new amapiano song"],
  },
  {
    key: "jamaica",
    label: "Jamaica",
    flag: "🇯🇲",
    styles: "Dancehall · Reggae",
    queries: ["latest jamaican dancehall song", "new dancehall riddim", "new roots reggae song"],
  },
  {
    key: "nigeria",
    label: "Nigeria",
    flag: "🇳🇬",
    styles: "Afrobeats · Naija",
    queries: ["latest nigerian afrobeats song", "new naija music", "latest afrobeats song"],
  },
  {
    key: "ghana",
    label: "Ghana",
    flag: "🇬🇭",
    styles: "Afrobeats · Highlife · Hiplife",
    queries: ["latest ghana music", "new ghanaian afrobeats song", "latest highlife song", "new hiplife song"],
  },
  {
    key: "zimbabwe",
    label: "Zimbabwe",
    flag: "🇿🇼",
    styles: "Zimdancehall · Sungura",
    queries: ["latest zimdancehall song", "new zimbabwe music", "latest zim dancehall", "new sungura song"],
  },
  {
    key: "south_africa",
    label: "South Africa",
    flag: "🇿🇦",
    styles: "Amapiano · Gqom",
    queries: ["latest amapiano song", "new south african music", "latest gqom song"],
  },
  {
    key: "tanzania",
    label: "Tanzania",
    flag: "🇹🇿",
    styles: "Bongo Flava",
    queries: ["latest bongo flava song", "new tanzania music", "latest bongo flava"],
  },
  {
    key: "kenya",
    label: "Kenya",
    flag: "🇰🇪",
    styles: "Gengetone · Afro-pop",
    queries: ["latest kenyan music", "new gengetone song", "latest kenya afro pop"],
  },
];

function daysAgoIso(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

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

// Search restricted to fresh, music-category videos, sorted newest-first.
export async function youtubeSearchLatest(q, max = 8, publishedAfter) {
  if (!youtubeApiKey) throw new Error("YouTube API key not set");
  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    order: "date",
    videoCategoryId: MUSIC_CATEGORY_ID,
    maxResults: String(max),
    q,
    key: youtubeApiKey,
  });
  if (publishedAfter) params.set("publishedAfter", publishedAfter);
  const r = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
  const j = await r.json();
  if (!j.items) return [];
  return j.items.map(i => ({
    id: i.id.videoId,
    title: i.snippet.title,
    channel: i.snippet.channelTitle,
    thumb: i.snippet.thumbnails?.medium?.url,
    publishedAt: i.snippet.publishedAt,
  }));
}

// Build a de-duplicated, newest-first playlist for a genre by merging the
// results of each of its search phrases. `sinceDays` keeps it to "latest".
// `exclude` is a set/array of video ids already seen, so paging in more tracks
// never re-surfaces one that has already played.
export async function fetchLatestMusic(key = "mix", { max = 20, sinceDays = 90, exclude } = {}) {
  const catalog = [...MUSIC_REGIONS, ...MUSIC_GENRES];
  const g = catalog.find(x => x.key === key) || MUSIC_REGIONS[0];
  const publishedAfter = daysAgoIso(sinceDays);
  const perQuery = Math.max(4, Math.ceil(max / g.queries.length));
  const excluded = exclude instanceof Set ? exclude : new Set(exclude || []);

  const batches = await Promise.all(
    g.queries.map(q => youtubeSearchLatest(q, perQuery, publishedAfter).catch(() => []))
  );

  const seen = new Set();
  const merged = [];
  for (const items of batches) {
    for (const item of items) {
      if (item.id && !seen.has(item.id) && !excluded.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    }
  }

  merged.sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
  return merged.slice(0, max);
}

export async function trainAlgo({ old = 0.2, similar = 0.3, focal = 0.3, bangers = 0.2, seeds = [] }) {
  const res = await fetch(trainerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weights: { old, similar, focal, bangers }, seeds })
  });
  if (!res.ok) throw new Error("Trainer failed");
  return res.json(); // {playlistId, count}
}
