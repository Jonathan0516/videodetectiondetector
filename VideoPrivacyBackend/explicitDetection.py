from flask import Flask, request, jsonify
from google.cloud import videointelligence
from nacosConfig import register_service

app = Flask(__name__)

video_client = videointelligence.VideoIntelligenceServiceClient.from_service_account_file(
    '/your/service-account.json' 
)

@app.route('/analyze/explicit-content-detection', methods=['POST'])
def analyze_explicit_content_detection():
    data = request.get_json()
    gcs_uri = data.get('gcs_uri')

    if not gcs_uri:
        return jsonify({'success': False, 'message': 'No GCS URI provided'})

    try:
        operation = video_client.annotate_video(
            request={
                "features": [videointelligence.Feature.EXPLICIT_CONTENT_DETECTION],
                "input_uri": gcs_uri
            }
        )

        result = operation.result(timeout=300)
        return jsonify({'success': True, 'message': 'Explicit content detection completed', 'result': result})
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

if __name__ == '__main__':
    register_service("explicit-content-detection-service", 5004)
    app.run(host='0.0.0.0', port=5004, debug=True)
