import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { uploadVideo, getUploadedVideos, deleteVideo } from '../lib/cloudStorage';

export default function CloudStorageScreen() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const uploadedVideos = await getUploadedVideos();
      setVideos(uploadedVideos);
    } catch (error) {
      Alert.alert('Error', 'Failed to load videos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      // Check if the user canceled the picker
      if (result.canceled) {
        return;
      }

      // Validate that we have assets
      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        await handleUploadVideo(file);
      } else {
        Alert.alert('Error', 'No file selected');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video: ' + error.message);
    }
  };

  const handleUploadVideo = async (videoFile) => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a video title');
      return;
    }

    try {
      setUploading(true);
      const metadata = {
        title: title.trim(),
        description: description.trim(),
      };

      const result = await uploadVideo(videoFile, metadata);
      
      if (result.success) {
        Alert.alert('Success', 'Video uploaded successfully!');
        setTitle('');
        setDescription('');
        await loadVideos();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload video: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVideo(videoId);
              await loadVideos();
              Alert.alert('Success', 'Video deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete video: ' + error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Cloud Video Storage</Text>
      </View>

      {/* Upload Section */}
      <View style={styles.uploadSection}>
        <Text style={styles.sectionTitle}>Upload Video</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Video Title"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description (optional)"
          placeholderTextColor="#888"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
        
        <TouchableOpacity
          style={[styles.button, uploading && styles.buttonDisabled]}
          onPress={handlePickVideo}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#111" />
          ) : (
            <Text style={styles.buttonText}>Select & Upload Video</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Videos List Section */}
      <View style={styles.videosSection}>
        <Text style={styles.sectionTitle}>My Videos ({videos.length})</Text>
        
        {loading ? (
          <ActivityIndicator color="#FCDD09" size="large" style={styles.loader} />
        ) : videos.length === 0 ? (
          <Text style={styles.emptyText}>No videos uploaded yet</Text>
        ) : (
          videos.map((video) => (
            <View key={video.id} style={styles.videoCard}>
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>{video.title}</Text>
                {video.description && (
                  <Text style={styles.videoDescription}>{video.description}</Text>
                )}
                <Text style={styles.videoMeta}>
                  Uploaded: {new Date(video.uploadedAt).toLocaleDateString()}
                </Text>
                <Text style={styles.videoMeta}>File: {video.name}</Text>
              </View>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteVideo(video.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  header: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 2,
    borderBottomColor: '#FCDD09',
  },
  headerText: {
    color: '#FCDD09',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  uploadSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: '#FCDD09',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 10,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#FCDD09',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: 'bold',
  },
  videosSection: {
    padding: 20,
  },
  loader: {
    marginTop: 20,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  videoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  videoInfo: {
    marginBottom: 10,
  },
  videoTitle: {
    color: '#FCDD09',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  videoDescription: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
  },
  videoMeta: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
