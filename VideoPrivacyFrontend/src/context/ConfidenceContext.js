import React, { createContext, useState } from 'react';

const ConfidenceContext = createContext();

const ConfidenceProvider = ({ children }) => {
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [videoUrl, setVideoUrl] = useState('');
  const [jsonFile, setJsonFile] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [faceDetectionData, setFaceDetectionData] = useState([]);
  const [textDetectionData, setTextDetectionData] = useState([]);
  const [speechDetectionData, setSpeechDetectionData] = useState([]);
  const [privacyIssues, setPrivacyIssues] = useState({});
  const [showTextData, setShowTextData] = useState(false);
  const [showSpeechData, setShowSpeechData] = useState(false);
  const [explicitDetectionData, setExplicitDetectionData] = useState([]);
  const [explicitAnalyzed, setExplicitAnalyzed] = useState(false);
  const [selectedParameters, setSelectedParameters] = useState(['PERSON', 'LOCATION', 'ADDRESS', 'ORGANIZATION', 'PHONE_NUMBER']);
  const [globalLoading, setGlobalLoading] = useState(false); // New state for global loading

  return (
    <ConfidenceContext.Provider
      value={{
        confidenceThreshold,
        setConfidenceThreshold,
        videoUrl,
        setVideoUrl,
        jsonFile,
        setJsonFile,
        jsonData,
        setJsonData,
        faceDetectionData,
        setFaceDetectionData,
        textDetectionData,
        setTextDetectionData,
        speechDetectionData,
        setSpeechDetectionData,
        privacyIssues,
        setPrivacyIssues,
        showTextData,
        setShowTextData,
        showSpeechData,
        setShowSpeechData,
        explicitDetectionData,
        setExplicitDetectionData,
        explicitAnalyzed,
        setExplicitAnalyzed,
        selectedParameters,
        setSelectedParameters,
        globalLoading, // Expose global loading state
        setGlobalLoading // Expose setter for global loading state
      }}
    >
      {children}
    </ConfidenceContext.Provider>
  );
};

export { ConfidenceContext, ConfidenceProvider };
