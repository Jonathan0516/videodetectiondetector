// GlobalLoadingOverlay.js

import React, { useContext, useEffect, useState } from 'react';
import { ConfidenceContext } from '../context/ConfidenceContext';
import { Box, Typography, LinearProgress, Fade, Zoom } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const GlobalLoadingOverlay = () => {
  const { globalLoading, setGlobalLoading, jsonData } = useContext(ConfidenceContext);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);

  useEffect(() => {
    let interval;

    if (globalLoading) {
      setProgress(0);
      setCompleted(false);
      setShowCheckmark(false);

      // Simulate progress bar
      interval = setInterval(() => {
        setProgress((prevProgress) => {
          // Cap progress at 90% until JSON is received
          if (prevProgress >= 90) {
            return prevProgress;
          }
          return prevProgress + Math.random() * 3; // Slow increment
        });
      }, 1500); // Slow progress increment

      // Jump to 100% and show checkmark when JSON data is received
      if (jsonData) {
        clearInterval(interval);
        setProgress(100);
        setCompleted(true);
        setTimeout(() => {
          setShowCheckmark(true);
          setGlobalLoading(false);
        }, 500); // Delay to transition to checkmark
      }
    }

    return () => {
      clearInterval(interval);
    };
  }, [globalLoading, jsonData, setGlobalLoading]);

  if (!globalLoading) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay for better visibility
        zIndex: 1300,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        color: '#fff',
        textAlign: 'center',
        padding: 2
      }}
    >
      {completed ? (
        <Zoom in={showCheckmark}>
          <CheckCircleOutlineIcon sx={{ fontSize: 60 }} color="success" />
        </Zoom>
      ) : (
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {Math.floor(progress)}%
        </Typography>
      )}
      <LinearProgress
        variant="determinate"
        value={completed ? 100 : progress}
        sx={{
          width: '80%',
          mt: 2,
          height: '8px',
          borderRadius: '4px',
          bgcolor: 'rgba(255, 255, 255, 0.1)'
        }}
      />
      <Typography mt={2} variant="body1">
        {completed ? 'Analysis Completed!' : 'Uploading and analyzing video...'}
      </Typography>
      <Fade in={!completed}>
        <Typography mt={1} variant="body2" sx={{ maxWidth: '80%' }}>
          Please do not close the plugin or navigate away; the analysis will stop if you do.
        </Typography>
      </Fade>
    </Box>
  );
};

export default GlobalLoadingOverlay;
