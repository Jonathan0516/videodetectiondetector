import React, { useContext, useRef, useState, useEffect } from 'react';
import { Box, Typography, Slider, TextField, CircularProgress, Button, FormControlLabel, Checkbox } from '@mui/material';
import { ConfidenceContext } from '../context/ConfidenceContext';
import axios from 'axios';
import GlobalLoadingOverlay from './GlobalLoadingOverlay'; // Ensure to import this component

const SettingsPage = () => {
  const {
    confidenceThreshold,
    setConfidenceThreshold,
    videoUrl,
    setVideoUrl,
    setJsonData,
    selectedParameters,
    setSelectedParameters,
    setGlobalLoading
  } = useContext(ConfidenceContext);

  const videoRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSliderChange = (event, newValue) => {
    setConfidenceThreshold(newValue);
  };

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    setSelectedParameters((prev) =>
      checked ? [...prev, value] : prev.filter((param) => param !== value)
    );
  };

  const handleUrlUpload = async () => {
    setLoading(true);
    setGlobalLoading(true); // Set global loading state
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:5000/upload-video', { url: videoUrl });
      if (response.data.success) {
        const gcsUrl = response.data.gcs_url;
        setVideoUrl(gcsUrl);

        try {
          const analysisResponse = await axios.post('http://127.0.0.1:5000/analyze-video', { filename: response.data.filename });
          if (analysisResponse.data.success) {
            setJsonData(JSON.parse(analysisResponse.data.data));
            setGlobalLoading(false); // Analysis complete, turn off global loading
            setLoading(false);
          } else {
            throw new Error('Error analyzing video.');
          }
        } catch (error) {
          setError('Error analyzing video. Please try again.');
          console.error('Error analyzing video:', error);
          setGlobalLoading(false); // Turn off loading on error
          setLoading(false);
        }
      } else {
        throw new Error('Error uploading video.');
      }
    } catch (error) {
      setGlobalLoading(false); // Turn off loading on error
      setLoading(false);
      setError('Error uploading video. Please try again.');
      console.error('Error uploading video:', error);
    }
  };

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.src = videoUrl;
      console.log("Video URL set to:", videoUrl);
    }
  }, [videoUrl]);

  return (
    <Box>
      <GlobalLoadingOverlay /> {/* Include the loading overlay component */}
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      <Box mt={4}>
        <Typography gutterBottom>Confidence Threshold</Typography>
        <Slider
          value={confidenceThreshold}
          onChange={handleSliderChange}
          aria-labelledby="confidence-threshold-slider"
          step={0.01}
          min={0}
          max={1}
          valueLabelDisplay="auto"
        />
        <Typography>Current Threshold: {confidenceThreshold.toFixed(2)}</Typography>
      </Box>
      <Box mt={2}>
        <TextField
          type="url"
          label="Video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          fullWidth
          variant="outlined"
          disabled={loading}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUrlUpload}
          disabled={loading}
          fullWidth
          style={{ marginTop: '16px' }}
        >
          {loading ? <CircularProgress size={24} /> : 'Upload and Analyze Video'}
        </Button>
      </Box>
      <Box mt={2}>
        <Typography gutterBottom>Privacy Detection Parameters</Typography>
        {['PERSON', 'LOCATION', 'ADDRESS', 'ORGANIZATION', 'PHONE_NUMBER'].map((param) => (
          <FormControlLabel
            key={param}
            control={
              <Checkbox
                checked={selectedParameters.includes(param)}
                onChange={handleCheckboxChange}
                value={param}
                color="primary"
              />
            }
            label={param}
          />
        ))}
      </Box>
      {loading && (
        <Box mt={2} display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
          <Typography ml={2}>Uploading and processing video...</Typography>
        </Box>
      )}
      {error && (
        <Box mt={2}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      {videoUrl && !loading && (
        <Box mt={2} position="relative">
          <video ref={videoRef} controls width="100%">
            Your browser does not support the video tag.
          </video>
        </Box>
      )}
    </Box>
  );
};

export default SettingsPage;
