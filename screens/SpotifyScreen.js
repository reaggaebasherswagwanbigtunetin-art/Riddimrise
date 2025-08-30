import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SpotifyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Spotify Tab (Coming Soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#FCDD09', fontSize: 18 }
});
