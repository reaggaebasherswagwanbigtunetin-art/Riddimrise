import Constants from "expo-constants";

const config = Constants.manifest?.extra || Constants.expoConfig?.extra || {};

export const openAiApiKey = config.openAiApiKey;
export const spotifyClientId = config.spotifyClientId;
export const spotifyClientSecret = config.spotifyClientSecret;
export const googleApiKey = config.googleApiKey;
export const youtubeApiKey = config.youtubeApiKey;
export const trainerUrl = config.trainerUrl;

// Firebase configuration for cloud storage
export const firebaseConfig = {
  apiKey: config.firebaseApiKey,
  authDomain: config.firebaseAuthDomain,
  projectId: config.firebaseProjectId,
  storageBucket: config.firebaseStorageBucket,
  messagingSenderId: config.firebaseMessagingSenderId,
  appId: config.firebaseAppId
};
