import { useState, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import AppHeader from './components/AppHeader';
import Register from './components/Register';
import ChatBot from './components/ChatBot';
import IconButton from '@mui/material/IconButton';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Appointment from './components/createAppointment';
import ReadAppointment from './components/readAppointment';
import AppointmentList from './components/AppointmentList';
import UpdateAppointment from './components/updateAppointment';
import ReadUser from "./components/ReadUser.jsx";
import Homepage from './components/Homepage';

function App() {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);

    const toggleChatbot = () => {
        setIsChatbotOpen(!isChatbotOpen);
        console.log('Chatbot toggled:', !isChatbotOpen); // Debugging
    }

    return (
        <AuthProvider>
            <Router>
                <div className="app-container">
                    <AppHeader />
                    {isChatbotOpen && <ChatBot isOpen={isChatbotOpen} toggleChatbot={toggleChatbot} />}
                    <IconButton
                        className="chatbot-button"
                        color="primary"
                        onClick={toggleChatbot}
                        sx={{
                            position: 'fixed',
                            bottom: 16,
                            right: 16,
                            backgroundColor: '#03035d',
                            color: 'white',
                            zIndex: 9999, // Ensure it appears on top
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
                    <Routes>
                        <Route path="/" element={<Homepage />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/user" element={<UserWrapper />} />
                        <Route path="/appointment/new" element={<Appointment />} />
                        <Route path="/appointment" element={<AppointmentList />} />
                        <Route path="/appointment/:appointmentID/update" element={<UpdateAppointment />} />
                        <Route path="/appointment/:appointmentId" element={<ReadAppointment />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

function UserWrapper() {
    const { userId } = useContext(AuthContext);

    if (!userId) {
        return <p>Loading user information...</p>;
    }

    return <ReadUser userId={userId} />;
}

export default App;
