
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

# Video Intelligence Microservices Backend Configuration

This README provides instructions on how to configure and run the video intelligence microservices backend. The services include explicit content detection, face detection, speech transcription, and text detection, all utilizing Google Cloud Video Intelligence API and registered with Nacos for service discovery.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- Python 3.7+
- pip (Python package installer)
- Flask
- Google Cloud SDK
- Nacos Server

### Google Cloud Setup

1. **Create a Google Cloud Project**:
   
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project.

2. **Enable Video Intelligence API**:
   
   - In your project, navigate to the **API & Services** > **Library**.
   - Search for "Video Intelligence API" and enable it.

3. **Create a Service Account**:
   
   - Navigate to **IAM & Admin** > **Service Accounts**.
   - Create a new service account with appropriate roles (e.g., `Video Intelligence API Admin`).
   - Download the JSON key file for the service account.

4. **Install Google Cloud SDK**:
   
   - Follow the instructions at [Google Cloud SDK installation](https://cloud.google.com/sdk/docs/install) to install the SDK.

5. **Set Up Authentication**:
   
   - Set the environment variable to point to your service account JSON key file:
     
     ```bash
     export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account.json"
     ```

### Nacos Server Setup

1. **Download and Install Nacos**:
   
   - Follow the instructions at [Nacos GitHub Repository](https://github.com/alibaba/nacos) to download and start the Nacos server locally or on a remote server.

2. **Start Nacos Server**:
   
   - Run the Nacos server by following the instructions in the repository or the provided documentation.
   - Access the Nacos dashboard at `http://localhost:8848/nacos`.

### Python Environment Setup

1. **Install Required Python Packages**:
   - Create a virtual environment (optional but recommended):
     
     ```bash
     python3 -m venv venv
     source venv/bin/activate  # On Windows use `venv\Scripts\activate`
     ```
   - Install the required Python packages:
     
     ```bash
     pip install flask google-cloud-videointelligence nacos-python
     ```

## Configuration

### Nacos Configuration

- Update the `nacosConfig.py` with your Nacos server details:
  
  ```python
  SERVER_ADDRESSES = "localhost:8848"
  NAMESPACE = "public"
  USERNAME = "nacos"
  PASSWORD = "nacos"
  ```

### Flask Applications

- Ensure each microservice (explicit content detection, face detection, speech transcription, text detection) is properly set up with the correct Google Cloud service account path:
  
  ```python
  video_client = videointelligence.VideoIntelligenceServiceClient.from_service_account_file(
      '/path/to/your/service-account.json'
  )
  ```

## Running the Microservices

Each microservice can be started by running the respective Python file. For example:

```bash
python explicit_content_detection_service.py
python face_detection_service.py
python speech_transcription_service.py
python text_detection_service.py
```

Each service will register itself with Nacos and run on its specified port.

### Available Endpoints

1. **Explicit Content Detection**:
   
   - URL: `http://<HOST>:5004/analyze/explicit-content-detection`
   - Method: `POST`
   - Request Body:
     
     ```json
     {
       "gcs_uri": "gs://your-bucket/your-video-file.mp4"
     }
     ```

2. **Face Detection**:
   
   - URL: `http://<HOST>:5002/analyze/face-detection`
   - Method: `POST`
   - Request Body:
     
     ```json
     {
       "gcs_uri": "gs://your-bucket/your-video-file.mp4"
     }
     ```

3. **Speech Transcription**:
   
   - URL: `http://<HOST>:5003/analyze/speech-transcription`
   - Method: `POST`
   - Request Body:
     
     ```json
     {
       "gcs_uri": "gs://your-bucket/your-video-file.mp4"
     }
     ```

4. **Text Detection**:
   
   - URL: `http://<HOST>:5001/analyze/text-detection`
   - Method: `POST`
   - Request Body:
     
     ```json
     {
       "gcs_uri": "gs://your-bucket/your-video-file.mp4"
     }
     ```

## Conclusion

After completing the setup, your services should be running and accessible via their respective endpoints. These services are now registered with Nacos and can be discovered by other services or clients.

If you encounter any issues, refer to the logs for debugging information, and ensure that your Google Cloud and Nacos configurations are correctly set up.
