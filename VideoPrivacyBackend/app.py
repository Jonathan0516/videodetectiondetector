from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import storage, videointelligence
import yt_dlp as youtube_dl
import os
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the Google Cloud Storage client
client = storage.Client.from_service_account_json('your/service-account.json')
bucket_name = 'privacy-sider'
folder_path = 'backend/'

# Initialize the Video Intelligence client
video_client = videointelligence.VideoIntelligenceServiceClient.from_service_account_file(
    'your/service-account.json'
)

def list_formats(video_url):
    ydl_opts = {
        'listformats': True
    }
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        ydl.download([video_url])

@app.route('/upload-video', methods=['POST'])
def upload_video():
    data = request.get_json()
    video_url = data.get('url')
    
    if not video_url:
        return jsonify({'success': False, 'message': 'No URL provided'})

    try:
        # Download video from YouTube using yt_dlp
        ydl_opts = {
            'format': 'best',
            'outtmpl': '%(title)s.%(ext)s',
        }

        try:
            with youtube_dl.YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(video_url, download=True)
                filename = ydl.prepare_filename(info_dict)
            
            print(f"Downloaded video to {filename}")

            # Upload video to GCS
            blob = client.bucket(bucket_name).blob(folder_path + filename)
            blob.upload_from_filename(filename)

            # Make the blob publicly accessible
            blob.make_public()

            gcs_url = blob.public_url
            print(f"Uploaded video to GCS: {gcs_url}")
            os.remove(filename)  # Clean up the local file

            return jsonify({'success': True, 'message': 'Video uploaded successfully, ready for analysis', 'filename': filename, 'gcs_url': gcs_url})
        
        except youtube_dl.utils.DownloadError as e:
            error_msg = str(e)
            if "Requested format is not available" in error_msg:
                list_formats(video_url)
            return jsonify({'success': False, 'message': 'Requested format is not available. Use --list-formats for a list of available formats.'})
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'success': False, 'message': str(e)})

@app.route('/analyze-video', methods=['POST'])
def analyze_video():
    data = request.get_json()
    filename = data.get('filename')
    
    if not filename:
        return jsonify({'success': False, 'message': 'No filename provided'})

    try:
        gcs_uri = f"gs://{bucket_name}/{folder_path}{filename}"
        output_uri = f"gs://{bucket_name}/{folder_path}output-{int(time.time())}.json"

        features = [
            # videointelligence.Feature.OBJECT_TRACKING,
            # videointelligence.Feature.LABEL_DETECTION,
            # videointelligence.Feature.SHOT_CHANGE_DETECTION,
            videointelligence.Feature.SPEECH_TRANSCRIPTION,
            # videointelligence.Feature.LOGO_RECOGNITION,
            videointelligence.Feature.EXPLICIT_CONTENT_DETECTION,
            videointelligence.Feature.TEXT_DETECTION,
            videointelligence.Feature.FACE_DETECTION,
            # videointelligence.Feature.PERSON_DETECTION
        ]

        transcript_config = videointelligence.SpeechTranscriptionConfig(
            language_code="en-US", enable_automatic_punctuation=True
        )

        person_config = videointelligence.PersonDetectionConfig(
            include_bounding_boxes=True,
            include_attributes=False,
            include_pose_landmarks=True,
        )

        face_config = videointelligence.FaceDetectionConfig(
            include_bounding_boxes=True, include_attributes=True
        )

        video_context = videointelligence.VideoContext(
            speech_transcription_config=transcript_config,
            person_detection_config=person_config,
            face_detection_config=face_config
        )

        operation = video_client.annotate_video(
            request={"features": features,
                     "input_uri": gcs_uri,
                     "output_uri": output_uri,
                     "video_context": video_context}
        )

        # Wait for the operation to complete
        result = operation.result(timeout=300)

        # Fetch the generated JSON file
        blob = client.bucket(bucket_name).blob(output_uri.replace(f"gs://{bucket_name}/", ""))
        json_data = blob.download_as_string()

        return jsonify({'success': True, 'message': 'Video analysis completed', 'data': json_data.decode('utf-8')})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'success': False, 'message': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
