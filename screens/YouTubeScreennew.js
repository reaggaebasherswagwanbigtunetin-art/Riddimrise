import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

import { fetchLatestMusic } from "../lib/youtubenew";
import { theme } from "../lib/theme";

// `region` is a MUSIC_REGIONS entry chosen in the layover; `onChangeRegion`
// pops that layover back up so the listener can switch countries.
export default function YouTubeScreennew({ region, onChangeRegion }) {
  const [tracks, setTracks] = useState([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Guards against a slow response for an old region overwriting a newer one.
  const requestId = useRef(0);
  // Every video id that has already played (or been queued), so nothing repeats
  // across the initial queue and any pages fetched later.
  const playedIds = useRef(new Set());
  const loadingMore = useRef(false);

  const regionKey = region?.key;

  const load = useCallback(async (key) => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    playedIds.current = new Set();
    try {
      const results = await fetchLatestMusic(key, { max: 20 });
      if (id !== requestId.current) return;
      results.forEach((t) => playedIds.current.add(t.id));
      setTracks(results);
      setIndex(0);
      setPlaying(results.length > 0);
      if (results.length === 0) {
        setError("No fresh tracks found right now — try again shortly.");
      }
    } catch (e) {
      if (id !== requestId.current) return;
      setError(e.message || "Could not load the latest music.");
      setTracks([]);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (regionKey) load(regionKey);
  }, [regionKey, load]);

  // Fetch another page of the latest tracks, excluding everything already
  // seen, and append the new ones to the queue. Returns how many were added.
  const loadMore = useCallback(async () => {
    if (loadingMore.current) return 0;
    loadingMore.current = true;
    const id = requestId.current;
    try {
      const more = await fetchLatestMusic(regionKey, {
        max: 20,
        exclude: playedIds.current,
      });
      if (id !== requestId.current) return 0;
      const fresh = more.filter((t) => !playedIds.current.has(t.id));
      fresh.forEach((t) => playedIds.current.add(t.id));
      if (fresh.length) setTracks((prev) => [...prev, ...fresh]);
      return fresh.length;
    } catch {
      return 0;
    } finally {
      loadingMore.current = false;
    }
  }, [regionKey]);

  // When a track finishes, move to the next unplayed one. If the queue is
  // exhausted, page in more latest tracks rather than replaying old ones.
  const onStateChange = useCallback(
    async (state) => {
      if (state !== "ended") return;
      if (index + 1 < tracks.length) {
        setIndex(index + 1);
        setPlaying(true);
        return;
      }
      const added = await loadMore();
      if (added > 0) {
        setIndex((prev) => prev + 1);
        setPlaying(true);
      } else {
        setPlaying(false);
        setError("You're all caught up on the latest — check back soon.");
      }
    },
    [index, tracks.length, loadMore]
  );

  const current = tracks[index];

  const renderTrack = ({ item, index: i }) => {
    const active = i === index;
    return (
      <TouchableOpacity
        style={[styles.row, active && styles.rowActive]}
        onPress={() => {
          setIndex(i);
          setPlaying(true);
        }}
      >
        {item.thumb ? (
          <Image source={{ uri: item.thumb }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]} />
        )}
        <View style={styles.rowText}>
          <Text style={styles.rowTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {!!item.channel && (
            <Text style={styles.rowChannel} numberOfLines={1}>
              {item.channel}
            </Text>
          )}
        </View>
        {active && <Text style={styles.nowPlaying}>♪</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.regionBar}>
        <Text style={styles.regionLabel} numberOfLines={1}>
          {region ? `${region.flag}  ${region.label}` : "Pick a country"}
          {region?.styles ? <Text style={styles.regionStyles}>{`   ${region.styles}`}</Text> : null}
        </Text>
        {!!onChangeRegion && (
          <TouchableOpacity style={styles.changeBtn} onPress={onChangeRegion}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.player}>
        {current ? (
          <YoutubePlayer
            height={220}
            play={playing}
            videoId={current.id}
            onChangeState={onStateChange}
          />
        ) : (
          <View style={styles.playerPlaceholder}>
            {loading ? (
              <ActivityIndicator color={theme.colors.accent} />
            ) : (
              <Text style={styles.placeholderText}>
                {error || "Nothing playing"}
              </Text>
            )}
          </View>
        )}
        {!!current && (
          <Text style={styles.currentTitle} numberOfLines={2}>
            {current.title}
          </Text>
        )}
      </View>

      {loading && tracks.length > 0 && (
        <ActivityIndicator style={styles.inlineLoader} color={theme.colors.accent} />
      )}

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={renderTrack}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          tracks.length ? <Text style={styles.upNext}>Up next</Text> : null
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.placeholderText}>
              {error || "No tracks yet."}
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  regionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  regionLabel: { flex: 1, color: theme.colors.text, fontSize: 18, fontWeight: "700" },
  regionStyles: { color: theme.colors.secondary, fontSize: 12, fontWeight: "500" },
  changeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
  },
  changeText: { color: theme.colors.text, fontSize: 14, fontWeight: "700" },
  player: { paddingHorizontal: 8 },
  playerPlaceholder: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  placeholderText: {
    color: theme.colors.text,
    textAlign: "center",
    padding: 16,
    opacity: 0.7,
  },
  currentTitle: {
    color: theme.colors.accent,
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 8,
  },
  inlineLoader: { marginVertical: 8 },
  list: { paddingHorizontal: 8, paddingBottom: 24 },
  upNext: {
    color: theme.colors.secondary,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  rowActive: { backgroundColor: theme.colors.card, borderRadius: 8 },
  thumb: { width: 96, height: 54, borderRadius: 4, backgroundColor: "#000" },
  thumbFallback: { backgroundColor: theme.colors.card },
  rowText: { flex: 1, marginLeft: 10 },
  rowTitle: { color: theme.colors.text, fontSize: 14 },
  rowChannel: { color: theme.colors.text, opacity: 0.6, fontSize: 12, marginTop: 2 },
  nowPlaying: { color: theme.colors.accent, fontSize: 18, marginLeft: 8 },
});
