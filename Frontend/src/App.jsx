// App.jsx
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import AppHeader from './components/AppHeader';
import Register from './components/Register';
import ChatBot from './components/ChatBot';
import IconButton from '@mui/material/IconButton';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { AuthProvider } from './context/AuthContext';
import Appointment from './components/Appointment';

function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);


  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  }

  const toggleRegister = () => {
    setIsRegisterOpen(!isRegisterOpen);
  };


  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
        <AppHeader toggleRegister={toggleRegister} />
        {isRegisterOpen && <Register onClose={toggleRegister} />}
          {isChatbotOpen && <ChatBot isOpen={isChatbotOpen} toggleChatbot={toggleChatbot} />}
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
            {isChatbotOpen ? <ExpandMoreRoundedIcon /> : <SmartToyRoundedIcon />}
          </IconButton>
          <Routes> {/* Use Routes instead of Switch */}
            <Route path="/appointment/new" element={<Appointment />} /> {/* Use element with JSX */}
            <Route path="/appointment/edit/:id" element={<Appointment />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
