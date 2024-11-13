import React from 'react';
import { Box, Container, Drawer, List, ListItem, ListItemIcon } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, Navigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VideoUploadAndAnalysis from './components/VideoUploadAndAnalysis';
import SettingsPage from './components/SettingsPage';
import TextDetectionPage from './components/TextDetectionPage';
import SpeechDetectionPage from './components/SpeechDetectionPage';
import ExplicitDetectionPage from './components/ExplicitDetectionPage';
import { ConfidenceProvider } from './context/ConfidenceContext';
import { styled } from '@mui/material/styles';

const drawerWidth = 80;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
}));

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  display: 'flex',
  justifyContent: 'center',
  ...(selected && {
    backgroundColor: theme.palette.action.selected,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  }),
}));

const NavItem = ({ to, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <StyledListItem button component={Link} to={to} selected={isActive}>
      <ListItemIcon>{icon}</ListItemIcon>
    </StyledListItem>
  );
};

function App() {
  return (
    <ConfidenceProvider>
      <Router>
        <Box display="flex" width="100%">
          <Container maxWidth="md" style={{ flexGrow: 1, marginRight: drawerWidth }}>
            <Box my={4}>
              <Routes>
                <Route path="/" element={<Navigate to="/settings" />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/analysis" element={<VideoUploadAndAnalysis />} />
                <Route path="/text-detection" element={<TextDetectionPage />} />
                <Route path="/speech-detection" element={<SpeechDetectionPage />} />
                <Route path="/explicit-detection" element={<ExplicitDetectionPage />} />
              </Routes>
            </Box>
          </Container>
          <StyledDrawer variant="permanent" anchor="right">
            <List>
              <NavItem to="/settings" icon={<SettingsIcon />} />
              <NavItem to="/analysis" icon={<CloudUploadIcon />} />
              <NavItem to="/text-detection" icon={<TextFieldsIcon />} />
              <NavItem to="/speech-detection" icon={<RecordVoiceOverIcon />} />
              <NavItem to="/explicit-detection" icon={<VisibilityIcon />} />
            </List>
          </StyledDrawer>
        </Box>
      </Router>
    </ConfidenceProvider>
  );
}

export default App;
