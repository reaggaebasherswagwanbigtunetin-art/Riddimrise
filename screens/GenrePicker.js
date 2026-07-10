import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { theme } from "../lib/theme";

// The layover shown on launch (and re-openable) so the listener picks which
// country's latest music plays next.
export default function GenrePicker({ regions, selectedKey, onSelect, onClose }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>Riddimrise</Text>
        <Text style={styles.subtitle}>Where you tuning in from?</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {regions.map((r) => {
          const active = r.key === selectedKey;
          return (
            <TouchableOpacity
              key={r.key}
              style={[styles.card, active && styles.cardActive]}
              activeOpacity={0.8}
              onPress={() => onSelect(r)}
            >
              <Text style={styles.flag}>{r.flag}</Text>
              <Text style={styles.label}>{r.label}</Text>
              <Text style={styles.styles} numberOfLines={2}>
                {r.styles}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {!!onClose && !!selectedKey && (
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>Back to what's playing</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingTop: 24, paddingHorizontal: 20, paddingBottom: 12 },
  brand: { color: theme.colors.primary, fontSize: 28, fontWeight: "800" },
  subtitle: { color: theme.colors.text, opacity: 0.7, fontSize: 15, marginTop: 4 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 12,
  },
  card: {
    width: "47%",
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 20,
    paddingHorizontal: 14,
    marginBottom: 14,
    alignItems: "center",
  },
  cardActive: {
    borderColor: theme.colors.accent,
    borderWidth: 2,
  },
  flag: { fontSize: 40 },
  label: { color: theme.colors.text, fontSize: 17, fontWeight: "700", marginTop: 8 },
  styles: {
    color: theme.colors.secondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
  closeBtn: {
    margin: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
  },
  closeText: { color: theme.colors.text, fontSize: 16, fontWeight: "700" },
});
