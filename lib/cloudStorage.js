import { firebaseConfig } from "./config";

/**
 * Cloud Storage Service for video uploads
 * This module provides functionality to upload videos to cloud storage
 * and retrieve stored videos.
 */

// Mock storage for development - replace with actual Firebase implementation when configured
let videoStorage = [];

/**
 * Upload a video to cloud storage
 * @param {Object} videoFile - Video file object with uri, name, type
 * @param {Object} metadata - Video metadata (title, description, etc.)
 * @returns {Promise<Object>} Upload result with video URL and metadata
 */
export async function uploadVideo(videoFile, metadata = {}) {
  if (!videoFile || !videoFile.uri) {
    throw new Error("Video file is required");
  }

  // Simulate cloud upload
  const videoId = Date.now().toString();
  const uploadedVideo = {
    id: videoId,
    url: videoFile.uri,
    name: videoFile.name || `video_${videoId}.mp4`,
    title: metadata.title || "Untitled Video",
    description: metadata.description || "",
    uploadedAt: new Date().toISOString(),
    size: videoFile.size || 0,
    thumbnail: metadata.thumbnail || null,
  };

  videoStorage.push(uploadedVideo);
  
  return {
    success: true,
    video: uploadedVideo,
  };
}

/**
 * Get all uploaded videos from cloud storage
 * @returns {Promise<Array>} List of uploaded videos
 */
export async function getUploadedVideos() {
  return [...videoStorage].reverse(); // Most recent first
}

/**
 * Get a specific video by ID
 * @param {string} videoId - Video ID
 * @returns {Promise<Object|null>} Video object or null if not found
 */
export async function getVideoById(videoId) {
  return videoStorage.find(v => v.id === videoId) || null;
}

/**
 * Delete a video from cloud storage
 * @param {string} videoId - Video ID to delete
 * @returns {Promise<boolean>} Success status
 */
export async function deleteVideo(videoId) {
  const index = videoStorage.findIndex(v => v.id === videoId);
  if (index !== -1) {
    videoStorage.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Update video metadata
 * @param {string} videoId - Video ID
 * @param {Object} metadata - New metadata
 * @returns {Promise<Object|null>} Updated video or null if not found
 */
export async function updateVideoMetadata(videoId, metadata) {
  const video = videoStorage.find(v => v.id === videoId);
  if (video) {
    Object.assign(video, {
      ...metadata,
      id: video.id, // Preserve ID
      uploadedAt: video.uploadedAt, // Preserve upload date
    });
    return video;
  }
  return null;
}

/**
 * Initialize Firebase Storage (call this when Firebase credentials are available)
 * @returns {boolean} Success status
 */
export function initializeFirebaseStorage() {
  if (!firebaseConfig.apiKey || !firebaseConfig.storageBucket) {
    console.warn("Firebase configuration incomplete. Using mock storage.");
    return false;
  }
  
  // Firebase initialization would go here
  // import { initializeApp } from 'firebase/app';
  // import { getStorage } from 'firebase/storage';
  // const app = initializeApp(firebaseConfig);
  // const storage = getStorage(app);
  
  return true;
}
