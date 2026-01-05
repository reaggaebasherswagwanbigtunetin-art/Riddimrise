# Cloud Video Storage

## Overview

The Riddimrise app now includes cloud video storage functionality, allowing users to upload, manage, and store videos in the cloud.

## Features

- **Video Upload**: Select and upload videos from your device
- **Metadata Management**: Add titles and descriptions to your videos
- **Video List**: View all uploaded videos with metadata
- **Delete Videos**: Remove videos from cloud storage
- **Cloud Integration**: Ready for Firebase Storage integration

## Setup

### 1. Firebase Configuration (Optional)

To use real cloud storage with Firebase, you need to set up a Firebase project and configure the environment variables:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firebase Storage in your project
3. Add the following environment variables to your `.env` file:

```bash
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

### 2. Development Mode

The cloud storage module includes a mock storage implementation that works without Firebase configuration. This is perfect for:
- Development and testing
- Prototyping
- Demonstrating the UI and functionality

Videos are stored in-memory during the app session. To upgrade to persistent cloud storage, configure Firebase as described above.

## Usage

### Accessing Cloud Storage

1. Launch the Riddimrise app
2. Tap the **Storage** tab at the bottom navigation bar
3. You'll see the Cloud Video Storage screen

### Uploading a Video

1. Enter a title for your video (required)
2. Optionally add a description
3. Tap "Select & Upload Video"
4. Choose a video file from your device
5. The video will be uploaded with the provided metadata

### Managing Videos

- **View Videos**: All uploaded videos are displayed in a list with their metadata
- **Video Information**: Each video card shows:
  - Title
  - Description (if provided)
  - Upload date
  - File name
- **Delete Videos**: Tap the "Delete" button on any video card to remove it

## Technical Details

### Architecture

- **`lib/cloudStorage.js`**: Core storage module with upload, retrieve, and delete functions
- **`screens/CloudStorageScreen.js`**: User interface for video management
- **`lib/config.js`**: Configuration management including Firebase settings

### API Functions

#### `uploadVideo(videoFile, metadata)`
Upload a video to cloud storage
- **videoFile**: Object with `uri`, `name`, `type` properties
- **metadata**: Object with `title`, `description` properties
- **Returns**: Promise with upload result

#### `getUploadedVideos()`
Retrieve all uploaded videos
- **Returns**: Promise with array of video objects

#### `deleteVideo(videoId)`
Remove a video from storage
- **videoId**: ID of video to delete
- **Returns**: Promise with success status

#### `updateVideoMetadata(videoId, metadata)`
Update video metadata
- **videoId**: ID of video to update
- **metadata**: New metadata object
- **Returns**: Promise with updated video

### Permissions

The app requires the following Android permissions (already configured in `app.json`):
- `READ_EXTERNAL_STORAGE`: Read video files from device
- `WRITE_EXTERNAL_STORAGE`: Cache files during upload

### Dependencies

The cloud storage feature uses:
- `expo-document-picker`: For selecting video files from device
- React Native core components for UI

## Future Enhancements

Potential improvements to the cloud storage feature:

1. **Video Playback**: Add in-app video player for uploaded videos
2. **Video Thumbnails**: Automatically generate and display thumbnails
3. **Search & Filter**: Search videos by title/description
4. **Sharing**: Share videos with other users
5. **Categories/Tags**: Organize videos with tags or categories
6. **Upload Progress**: Show detailed upload progress with percentage
7. **Batch Upload**: Upload multiple videos at once
8. **Video Compression**: Compress videos before upload to save bandwidth
9. **Cloud Sync**: Sync videos across multiple devices

## Troubleshooting

### Videos not persisting after app restart
If you're using the mock storage (without Firebase), videos are stored in-memory and will be lost when the app restarts. Configure Firebase Storage for persistent storage.

### Upload fails
- Check that the file is a valid video format
- Ensure you've entered a title
- Verify Firebase configuration if using cloud storage
- Check network connectivity

### Permission errors
- Ensure the app has storage permissions on your device
- Check Android settings if prompted

## Support

For issues or questions about the cloud storage feature, please refer to the main repository documentation or create an issue.
