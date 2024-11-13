import React, { useContext, useRef, useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Chip, Card, CardContent } from '@mui/material';
import { ConfidenceContext } from '../context/ConfidenceContext';

const TextDetectionPage = () => {
    const {
        confidenceThreshold,
        videoUrl,
        jsonData,
        textDetectionData,
        setTextDetectionData,
        showTextData,
        setShowTextData,
    } = useContext(ConfidenceContext);

    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [detectedTextOnScreen, setDetectedTextOnScreen] = useState([]);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const animationFrameRef = useRef(null);

    class Text_Frame {
        constructor(json_data, video_height, video_width) {
            this.time_offset = this.nullable_time_offset_to_seconds(json_data.time_offset);

            this.poly = json_data.rotated_bounding_box.vertices.map(vertex => ({
                x: vertex.x || 0,
                y: vertex.y || 0,
            }));
        }

        nullable_time_offset_to_seconds(time_offset) {
            if (!time_offset) return 0;
            return time_offset.seconds + (time_offset.nanos || 0) / 1e9;
        }
    }

    class Text_Segment {
        constructor(json_data, video_height, video_width) {
            this.start_time = this.nullable_time_offset_to_seconds(json_data.segment.start_time_offset);
            this.end_time = this.nullable_time_offset_to_seconds(json_data.segment.end_time_offset);
            this.confidence = json_data.confidence;

            this.frames = json_data.frames.map(frame => new Text_Frame(frame, video_height, video_width));
        }

        nullable_time_offset_to_seconds(time_offset) {
            if (!time_offset) return 0;
            return time_offset.seconds + (time_offset.nanos || 0) / 1e9;
        }
    }

    class Text_Detection {
        constructor(json_data, video_height, video_width, confidence_threshold) {
            this.text = json_data.text;
            this.segments = json_data.segments
                .map(segment => new Text_Segment(segment, video_height, video_width))
                .filter(segment => segment.confidence > confidence_threshold);
        }
    }

    useEffect(() => {
        if (jsonData && jsonData.annotation_results) {
            const results = jsonData.annotation_results.find(result => result.text_annotations);
            if (results) {
                const textTracks = results.text_annotations.map(annotation => {
                    return new Text_Detection(
                        annotation, 
                        videoRef.current.videoHeight, 
                        videoRef.current.videoWidth, 
                        confidenceThreshold
                    );
                });
                setTextDetectionData(textTracks.filter(track => track.segments.length));
            }
        }
    }, [jsonData, confidenceThreshold, setTextDetectionData]);

    useEffect(() => {
        if (videoUrl && videoRef.current) {
            videoRef.current.src = videoUrl;
            console.log("Video URL set to:", videoUrl);
        }
    }, [videoUrl]);

    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video && canvas) {
            const handleResize = () => {
                if (video.videoWidth && video.videoHeight) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    console.log("Canvas resized to:", canvas.width, "x", canvas.height);
                } else {
                    console.log("Video dimensions are not available yet");
                }
            };

            video.addEventListener('loadedmetadata', handleResize);
            window.addEventListener('resize', handleResize);

            handleResize();

            return () => {
                video.removeEventListener('loadedmetadata', handleResize);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    const drawBoundingBoxes = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const currentTime = video.currentTime;
        setCurrentTime(currentTime);

        const detectedTexts = [];

        textDetectionData.forEach(track => {
            track.segments.forEach(segment => {
                if (segment.start_time <= currentTime && segment.end_time >= currentTime) {
                    const frame = segment.frames.find(frame => frame.time_offset <= currentTime);
                    if (frame && frame.poly) {
                        const scaledPoly = frame.poly.map(point => ({
                            x: point.x * video.videoWidth,
                            y: point.y * video.videoHeight
                        }));

                        ctx.strokeStyle = '#4285F4';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(scaledPoly[0].x, scaledPoly[0].y);

                        scaledPoly.forEach(point => {
                            ctx.lineTo(point.x, point.y);
                        });

                        ctx.closePath();
                        ctx.stroke();

                        detectedTexts.push(track.text);
                    }
                }
            });
        });

        setDetectedTextOnScreen(detectedTexts);
        animationFrameRef.current = requestAnimationFrame(drawBoundingBoxes);
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
    }, [textDetectionData]);

    const handleParseVideo = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setShowTextData(true);
        }, 1000);
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
                Text Detection
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
            </Box>
            {videoUrl && (
                <Box mt={2} position="relative">
                    <video ref={videoRef} controls width="100%" />
                    <canvas
                        ref={canvasRef}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none',
                            zIndex: 10,
                        }}
                    />
                </Box>
            )}
            {showTextData && (
                <>
                    <Box mt={4}>
                        <Typography variant="h6">Detected Text on Screen</Typography>
                        <Box mt={2} display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
                            {detectedTextOnScreen.length === 0 ? (
                                <Typography>No text detected at the current time.</Typography>
                            ) : (
                                detectedTextOnScreen.map((text, index) => (
                                    <Chip
                                        key={index}
                                        label={text}
                                        style={{
                                            borderColor: '#4285F4',
                                            borderWidth: '1px',
                                            borderStyle: 'solid',
                                            backgroundColor: 'white',
                                            color: '#4285F4',
                                            fontSize: '12px',
                                            margin: '4px'
                                        }}
                                    />
                                ))
                            )}
                        </Box>
                    </Box>
                    <Box mt={4}>
                        <Typography variant="h6">All Detected Text</Typography>
                        <Box mt={2} display="flex" flexDirection="column" gap={2}>
                            {textDetectionData.map((track, index) => (
                                <Card key={index} elevation={3}>
                                    <CardContent>
                                        <Typography variant="subtitle2">{track.text}</Typography>
                                        {track.segments.map((segment, segIndex) => (
                                            <span
                                                key={segIndex}
                                                className="time-pill"
                                                style={{
                                                    backgroundColor: '#F4B400',
                                                    borderRadius: '10px',
                                                    padding: '0px 4px',
                                                    margin: '1px',
                                                    display: 'inline-block',
                                                    cursor: 'pointer',
                                                    color: 'black'
                                                }}
                                                onClick={() => handleJumpToTime(segment.start_time)}
                                            >
                                                {parseInt(segment.start_time)}s
                                            </span>
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default TextDetectionPage;
