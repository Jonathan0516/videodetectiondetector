import React, { useContext, useRef, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid, Chip, Card, CardContent } from '@mui/material';
import { ConfidenceContext } from '../context/ConfidenceContext';
import { Face_Track } from './FaceDetection';

const VideoUploadAndAnalysis = () => {
  const {
    confidenceThreshold,
    videoUrl,
    jsonData,
    faceDetectionData,
    setFaceDetectionData
  } = useContext(ConfidenceContext);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  const handleParseVideo = () => {
    if (jsonData) {
      const faceAnnotations = extractFaceDetectionData(jsonData);
      setFaceDetectionData(faceAnnotations);
    }
  };

  const extractFaceDetectionData = (data) => {
    if (!data.annotation_results) return [];
    const faceAnnotations = data.annotation_results.flatMap(result =>
      result.face_detection_annotations ? result.face_detection_annotations : []
    ).map(annotation => new Face_Track(annotation, videoRef.current.videoHeight, videoRef.current.videoWidth));
    return faceAnnotations;
  };

  const drawBoundingBoxes = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const currentTime = video.currentTime;
    faceDetectionData.forEach(track => {
      if (track.confidence >= confidenceThreshold) {
        const bbox = track.current_bounding_box(currentTime);
        if (bbox) {
          const scaleX = canvas.width / video.videoWidth;
          const scaleY = canvas.height / video.videoHeight;

          ctx.strokeStyle = 'rgba(255,0,0,0.7)';
          ctx.lineWidth = 2;
          ctx.strokeRect(bbox.x * scaleX, bbox.y * scaleY, bbox.width * scaleX, bbox.height * scaleY);
        }
      }
    });

    animationFrameRef.current = requestAnimationFrame(drawBoundingBoxes);
  };

  const handleJumpToTime = (seconds) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = seconds;
      video.play();
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('play', () => {
        animationFrameRef.current = requestAnimationFrame(drawBoundingBoxes);
      });

      return () => {
        video.removeEventListener('play', () => {
          cancelAnimationFrame(animationFrameRef.current);
        });
      };
    }
  }, [faceDetectionData, confidenceThreshold]);

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.src = videoUrl;
      console.log("Video URL set to:", videoUrl);
    }
  }, [videoUrl]);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Face Detection
      </Typography>
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleParseVideo}
          disabled={!videoUrl || !jsonData}
        >
          Parse Video
        </Button>
      </Box>
      {videoUrl && (
        <Box mt={2} position="relative" boxShadow={3} borderRadius={4}>
          <video ref={videoRef} controls width="100%" style={{ borderRadius: '8px' }}>
            Your browser does not support the video tag.
          </video>
          <canvas 
            ref={canvasRef} 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%', 
              pointerEvents: 'none' 
            }} 
            width={videoRef.current?.clientWidth}
            height={videoRef.current?.clientHeight}
          />
        </Box>
      )}
      {faceDetectionData.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6">Face Detection Data</Typography>
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            {faceDetectionData.map((track, index) => (
              track.confidence >= confidenceThreshold && (
                <Card key={index} elevation={3} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}>
                  <CardContent onClick={() => handleJumpToTime(track.start_time)} style={{ cursor: 'pointer' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Confidence: {track.confidence.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">Start Time: {track.start_time} seconds</Typography>
                    <Typography variant="body2">End Time: {track.end_time} seconds</Typography>
                    <Grid container spacing={0.5} mt={1}>
                      {Object.entries(track.attributes).map(([name, confidence], i) => (
                        <Grid item key={i}>
                          <Chip
                            label={`${name}: ${(confidence * 100).toFixed(2)}%`}
                            size="small"
                            style={{ fontSize: '0.75rem' }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                    <Box mt={1}>
                      {track.thumbnail && (
                        <img
                          src={`data:image/png;base64,${track.thumbnail}`}
                          alt="Face Thumbnail"
                          style={{ width: '100px', borderRadius: '4px' }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              )
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default VideoUploadAndAnalysis;
