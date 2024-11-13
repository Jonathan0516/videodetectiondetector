from flask import Flask, request, jsonify
from google.cloud import videointelligence
from nacosConfig import register_service

app = Flask(__name__)

video_client = videointelligence.VideoIntelligenceServiceClient.from_service_account_file(
    '/your/service-account.json'  
)

@app.route('/analyze/face-detection', methods=['POST'])
def analyze_face_detection():
    data = request.get_json()
    gcs_uri = data.get('gcs_uri')

    if not gcs_uri:
        return jsonify({'success': False, 'message': 'No GCS URI provided'})

    try:
        face_config = videointelligence.FaceDetectionConfig(
            include_bounding_boxes=True, include_attributes=True
        )

        video_context = videointelligence.VideoContext(
            face_detection_config=face_config
        )

        operation = video_client.annotate_video(
            request={
                "features": [videointelligence.Feature.FACE_DETECTION],
                "input_uri": gcs_uri,
                "video_context": video_context
            }
        )

        result = operation.result(timeout=300)
        return jsonify({'success': True, 'message': 'Face detection completed', 'result': result})
    
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

if __name__ == '__main__':
    register_service("face-detection-service", 5002)
    app.run(host='0.0.0.0', port=5002, debug=True)
