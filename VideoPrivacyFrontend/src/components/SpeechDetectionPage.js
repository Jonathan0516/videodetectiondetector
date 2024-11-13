import React, { useContext, useRef, useEffect, useState } from 'react';
import { Box, Typography, Button, Switch, FormControlLabel, CircularProgress, Paper, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ConfidenceContext } from '../context/ConfidenceContext';

const SpeechDetectionPage = () => {
  const {
    videoUrl,
    jsonData,
    speechDetectionData,
    setSpeechDetectionData,
    privacyIssues,
    setPrivacyIssues,
    showSpeechData,
    setShowSpeechData,
    selectedParameters
  } = useContext(ConfidenceContext);

  const [privacyDetection, setPrivacyDetection] = useState(false);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    if (jsonData && jsonData.annotation_results) {
      const results = jsonData.annotation_results.find(result => result.speech_transcriptions);
      const speechTracks = results ? results.speech_transcriptions : [];
      if (videoRef.current) {
        setSpeechDetectionData(speechTracks.filter(track => track.alternatives && track.alternatives.length));
      }
    }
  }, [jsonData, setSpeechDetectionData]);

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.src = videoUrl;
      console.log("Video URL set to:", videoUrl);
    }
  }, [videoUrl]);

  const handlePrivacyDetectionToggle = () => {
    setPrivacyDetection(!privacyDetection);
  };

  const handleParseVideo = async () => {
    setLoading(true);

    if (privacyDetection) {
      const issues = await checkPrivacyIssues(speechDetectionData);
      setPrivacyIssues(issues);
    } else {
      setPrivacyIssues({});
    }

    setLoading(false);
    setShowSpeechData(true);
  };

  const checkPrivacyIssues = async (speechTracks) => {
    const issues = {};
    for (let track of speechTracks) {
      for (let alternative of track.alternatives) {
        const response = await detectPrivacyIssues(alternative.transcript);
        if (response.length > 0) {
          issues[alternative.transcript] = response;
        }
      }
    }
    return issues;
  };

  const detectPrivacyIssues = async (text) => {
    const apiKey = '*';
    const response = await fetch(`https://language.googleapis.com/v1/documents:analyzeEntities?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        document: {
          type: 'PLAIN_TEXT',
          content: text,
        },
        encodingType: 'UTF8',
      }),
    });

    if (!response.ok) {
      console.error('Error fetching privacy issues:', response.statusText);
      return [];
    }

    const data = await response.json();
    if (data.entities) {
      return data.entities.filter(entity => 
        selectedParameters.includes(entity.type)
      ).map(entity => entity.name);
    }
    return [];
  };

  const handleJumpToTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Speech Detection
      </Typography>
      <Box mt={2} display="flex" alignItems="center">
        <Button
          variant="contained"
          color="primary"
          onClick={handleParseVideo}
          disabled={!videoUrl || loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Parse Video'}
        </Button>
        <FormControlLabel
          control={
            <Switch
              checked={privacyDetection}
              onChange={handlePrivacyDetectionToggle}
              name="privacyDetection"
              color="primary"
            />
          }
          label="Privacy Detection"
          style={{ marginLeft: 16 }}
        />
      </Box>
      {videoUrl && (
        <Box mt={2} position="relative" boxShadow={3} borderRadius={4}>
          <video ref={videoRef} controls width="100%" style={{ borderRadius: '8px' }}>
            Your browser does not support the video tag.
          </video>
        </Box>
      )}
      {showSpeechData && (
        <Box mt={4}>
          <Typography variant="h6">Speech Detection Data</Typography>
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            {speechDetectionData.map((track, index) => (
              (track.alternatives || []).map((alternative, altIndex) => (
                <Card key={`${index}-${altIndex}`} elevation={3} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}>
                  <CardContent>
                    {alternative.words && alternative.words.map((word, wordIndex) => (
                      <Typography
                        key={`${index}-${altIndex}-${wordIndex}`}
                        component="span"
                        style={{
                          backgroundColor: privacyIssues[word.word] ? 'rgba(255,0,0,0.3)' : 'transparent',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleJumpToTime(word.startTime?.seconds ?? 0)}
                      >
                        {word.word}{' '}
                      </Typography>
                    ))}
                    {privacyIssues[alternative.transcript] && (
                      <Box mt={1}>
                        <Typography variant="body2" color="error">
                          Privacy Risk: {privacyIssues[alternative.transcript].join(', ')}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SpeechDetectionPage;
