
# Video Parsing Sidebar Plugin

This project is a video parsing sidebar plugin that allows users to analyze videos for various types of content such as face detection, text detection, speech detection, and explicit content detection. The application uses React for the frontend and Express for the backend, with Google Cloud Video Intelligence API to perform the video analysis.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [How to Use](#how-to-use)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Video Upload:** Upload video files for analysis.
- **Face Detection:** Detects and highlights faces in videos.
- **Text Detection:** Recognizes and displays text detected in videos.
- **Speech Detection:** Transcribes and detects speech, with privacy detection options.
- **Explicit Content Detection:** Analyzes videos for explicit content.

## Installation

### Prerequisites

Before running this project, ensure you have the following installed:

- Node.js (version 14 or higher)
- npm (version 6 or higher)
- Google Cloud account with Video Intelligence API enabled
- Chrome browser (if testing the Chrome extension)

### Clone the Repository

```bash
git clone https://github.com/Jonathan0516/VideoPrivacyFrontend.git
cd video-parsing-sidebar
```

### Backend Setup

1. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create an `uploads` directory in the `backend` folder to store uploaded video files.

3. Start the backend server:

   ```bash
   node server.js
   ```

### Frontend Setup

1. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Start the frontend development server:

   ```bash
   npm start
   ```

### Chrome Extension Setup

1. Go to `chrome://extensions/` in Chrome.
2. Enable "Developer mode" in the top right corner.
3. Click "Load unpacked" and select the `frontend/public` folder of your project.
4. The extension should now be loaded into Chrome.

## Running the Application

- **Backend Server:** Runs on `http://localhost:5001`
- **Frontend Development Server:** Runs on `http://localhost:3000`

To analyze a video:
1. Upload the video through the "Upload and Analyze Video" option.
2. Navigate to the desired detection page (Face Detection, Text Detection, etc.) to see the results.

## Project Structure

- **backend/**: Contains the Express server setup and file upload logic.
- **frontend/**: Contains the React frontend, including components for each detection type.
- **public/**: Public assets for the frontend and Chrome extension files.

## How to Use

1. **Upload Video:**
   - Enter the video URL or upload a video file through the settings page.
   - Click "Upload and Analyze Video" to start the analysis process.

2. **Face Detection:**
   - Go to the Face Detection page after uploading a video.
   - Click "Parse Video" to start face detection.

3. **Text Detection:**
   - Navigate to the Text Detection page.
   - Click "Parse Video" to analyze the video for text.

4. **Speech Detection:**
   - Go to the Speech Detection page.
   - Click "Parse Video" and enable "Privacy Detection" if required.

5. **Explicit Content Detection:**
   - Open the Explicit Content Detection page.
   - Click "Analyze Video" to detect explicit content.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
