import React, { useState } from "react";
import { SafeAreaView, Modal, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";

import YouTubeScreennew from "./screens/YouTubeScreennew";
import GenrePicker from "./screens/GenrePicker";
import { MUSIC_REGIONS } from "./lib/youtubenew";
import { theme } from "./lib/theme";

export default function App() {
  const [region, setRegion] = useState(null);
  // The layover comes up on launch (no country picked yet) and can be
  // re-opened via the "Change" button on the player.
  const [pickerVisible, setPickerVisible] = useState(true);

  const selectRegion = (r) => {
    setRegion(r);
    setPickerVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <YouTubeScreennew
        region={region}
        onChangeRegion={() => setPickerVisible(true)}
      />

      <Modal
        visible={pickerVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => region && setPickerVisible(false)}
      >
        <SafeAreaView style={styles.container}>
          <GenrePicker
            regions={MUSIC_REGIONS}
            selectedKey={region?.key}
            onSelect={selectRegion}
            onClose={region ? () => setPickerVisible(false) : undefined}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
});
