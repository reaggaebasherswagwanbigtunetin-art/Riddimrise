import Constants from "expo-constants";

const config = Constants.manifest?.extra || Constants.expoConfig?.extra || {};

export const openAiApiKey = config.openAiApiKey;
export const spotifyClientId = config.spotifyClientId;
export const spotifyClientSecret = config.spotifyClientSecret;
export const googleApiKey = config.googleApiKey;
export const youtubeApiKey = config.youtubeApiKey;
