import React, { useRef, useEffect, useContext, useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { ConfidenceContext } from '../context/ConfidenceContext';

const ExplicitDetectionPage = () => {
  const {
    videoUrl,
    jsonData,
    explicitDetectionData,
    setExplicitDetectionData,
    explicitAnalyzed,
    setExplicitAnalyzed
  } = useContext(ConfidenceContext);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoUrl) {
      if (videoRef.current) {
        videoRef.current.src = videoUrl;
        console.log("Video URL set to:", videoUrl);
      }
    }
  }, [videoUrl]);

  const handleParseVideo = () => {
    setLoading(true);

    // Simulating an API call to get the JSON data
    setTimeout(() => {
      const explicitFramesAnnotations = jsonData?.annotation_results?.find(result => result.explicit_annotation)?.explicit_annotation.frames || [];

      const indexedExplicitFramesAnnotations = explicitFramesAnnotations.map(frame => ({
        time_offset: nullableTimeOffsetToSeconds(frame.time_offset),
        explicit_likelyhood: frame.pornography_likelihood
      }));

      setExplicitDetectionData(indexedExplicitFramesAnnotations);
      setExplicitAnalyzed(true);
      setLoading(false);
    }, 2000);
  };

  const likelihoodSegments = {
    'VERY_LIKELY': { segments: [], count: 0 },
    'LIKELY': { segments: [], count: 0 },
    'POSSIBLE': { segments: [], count: 0 },
    'UNLIKELY': { segments: [], count: 0 },
    'VERY_UNLIKELY': { segments: [], count: 0 },
  };

  explicitDetectionData.forEach(shot => {
    likelihoodSegments[shot.explicit_likelyhood].segments.push(shot.time_offset);
  });

  const segmentStyle = (segment) => {
    if (!videoRef.current || !videoRef.current.duration) {
      return {};
    }
    return {
      left: `${(segment / videoRef.current.duration) * 100}%`,
      width: '5px'
    };
  };

  const handleShotClick = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const updateTime = () => {
        setCurrentTime(video.currentTime);
      };

      video.addEventListener('timeupdate', updateTime);

      return () => {
        video.removeEventListener('timeupdate', updateTime);
      };
    }
  }, []);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Explicit Content Detection
      </Typography>
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleParseVideo}
          disabled={!videoUrl || loading || explicitAnalyzed}
        >
          {loading ? <CircularProgress size={24} /> : 'Analyze Video'}
        </Button>
      </Box>
      {videoUrl && (
        <Box mt={2} position="relative">
          <video ref={videoRef} controls width="100%">
            Your browser does not support the video tag.
          </video>
        </Box>
      )}
      {explicitAnalyzed && explicitDetectionData.length > 0 && (
        <Box mt={2}>
          <Typography variant="h6">Explicit Content Detection Results</Typography>
          <Box mt={1} p={1} bgcolor="grey.100" borderRadius={4}>
            {Object.keys(likelihoodSegments).map((key) => (
              <Box key={key + 'z'} mb={2}>
                <Typography variant="subtitle2" className="label">{key}</Typography>
                <Box className="segment-timeline" position="relative" height="20px" bgcolor="grey.300">
                  {likelihoodSegments[key].segments.map((segment, index) => (
                    <Box
                      key={index}
                      className="segment"
                      style={segmentStyle(segment)}
                      onClick={() => handleShotClick(segment)}
                      position="absolute"
                      height="100%"
                      bgcolor="red"
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
      {explicitAnalyzed && explicitDetectionData.length === 0 && (
        <Box mt={2}>
          <Typography variant="body2" className="data-warning">
            No explicit content detection data in JSON
          </Typography>
        </Box>
      )}

      {/* Inline Styles */}
      <style>
        {`
          .current-likelihood {
            width: 150px;
            display: inline-block;
          }
          .data-warning {
            color: red;
          }
          .label {
            margin-bottom: 4px;
          }
          .segment-timeline {
            display: flex;
            position: relative;
          }
          .segment {
            background-color: red;
            height: 100%;
            cursor: pointer;
          }
        `}
      </style>
    </Box>
  );
};

const nullableTimeOffsetToSeconds = (timeOffset) => {
  if (!timeOffset) return 0;
  return timeOffset.seconds + (timeOffset.nanos || 0) / 1e9;
};

export default ExplicitDetectionPage;
