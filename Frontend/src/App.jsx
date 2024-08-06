import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './App.css';
import AppHeader from './component/AppHeader';
import ChatBot from './component/ChatBot';
import IconButton from '@mui/material/IconButton';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';

function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  }

  return (
    <div className="app-container">
      <AppHeader />
      {isChatbotOpen && <ChatBot isOpen={isChatbotOpen} toggleChatbot={toggleChatbot}/>}
      <IconButton 
        className="chatbot-button" 
        color="primary" 
        onClick={toggleChatbot} 
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          backgroundColor: '#7AE0F2',
          color: 'white',
          '&:hover': {
            backgroundColor: '#68cde6'
          },
          padding: '16px',
          borderRadius: '50%',
          boxShadow: 3,
        }}
      >
        <SmartToyRoundedIcon fontSize="large" />
      </IconButton>
    </div>
  )
}

export default App;