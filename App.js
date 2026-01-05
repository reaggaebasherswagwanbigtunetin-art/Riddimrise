import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import YouTubeScreen from './screens/YouTubeScreen';
import SpotifyScreen from './screens/SpotifyScreen';
import AIScreen from './screens/AIScreen';
import CloudStorageScreen from './screens/CloudStorageScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('youtube');

  const renderScreen = () => {
    switch (activeTab) {
      case 'youtube':
        return <YouTubeScreen />;
      case 'spotify':
        return <SpotifyScreen />;
      case 'ai':
        return <AIScreen />;
      case 'storage':
        return <CloudStorageScreen />;
      default:
        return <YouTubeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {renderScreen()}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'youtube' && styles.activeTab]} 
          onPress={() => setActiveTab('youtube')}
        >
          <Text style={[styles.tabText, activeTab === 'youtube' && styles.activeTabText]}>YouTube</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'spotify' && styles.activeTab]} 
          onPress={() => setActiveTab('spotify')}
        >
          <Text style={[styles.tabText, activeTab === 'spotify' && styles.activeTabText]}>Spotify</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'ai' && styles.activeTab]} 
          onPress={() => setActiveTab('ai')}
        >
          <Text style={[styles.tabText, activeTab === 'ai' && styles.activeTabText]}>AI</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'storage' && styles.activeTab]} 
          onPress={() => setActiveTab('storage')}
        >
          <Text style={[styles.tabText, activeTab === 'storage' && styles.activeTabText]}>Storage</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    borderTopWidth: 3,
    borderTopColor: '#FCDD09',
  },
  tabText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FCDD09',
  },
});
