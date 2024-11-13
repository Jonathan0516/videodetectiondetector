from flask import Flask, request, jsonify
from google.cloud import videointelligence
from nacosConfig import register_service

app = Flask(__name__)

video_client = videointelligence.VideoIntelligenceServiceClient.from_service_account_file(
    '/your/service-account.json'  
)

@app.route('/analyze/speech-transcription', methods=['POST'])
def analyze_speech_transcription():
    data = request.get_json()
    gcs_uri = data.get('gcs_uri')

    if not gcs_uri:
        return jsonify({'success': False, 'message': 'No GCS URI provided'})

    try:
        transcript_config = videointelligence.SpeechTranscriptionConfig(
            language_code="en-US", enable_automatic_punctuation=True
        )

        video_context = videointelligence.VideoContext(
            speech_transcription_config=transcript_config
        )

        operation = video_client.annotate_video(
            request={
                "features": [videointelligence.Feature.SPEECH_TRANSCRIPTION],
                "input_uri": gcs_uri,
                "video_context": video_context
            }
        )

        result = operation.result(timeout=300)
        return jsonify({'success': True, 'message': 'Speech transcription completed', 'result': result})
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

if __name__ == '__main__':
    register_service("speech-transcription-service", 5003)
    app.run(host='0.0.0.0', port=5003, debug=True)
