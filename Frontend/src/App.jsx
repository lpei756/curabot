import './App.css';
import { useState, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import AppHeader from './components/layout/AppHeader';
import Register from './components/auth/register/Register';
import AdminRegister from './components/auth/register/AdminRegister';
import ChatBot from './components/chatbot/ChatBot';
import IconButton from '@mui/material/IconButton';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import AppointmentList from './components/appointment/AppointmentList';
import UpdateAppointment from './components/appointment/updateAppointment';
import ReadUser from './components/user/ReadUser';
import Homepage from './components/homepage/Homepage';
import AvailableSlotsCalendar from './components/appointment/AvailableSlotsCalendar';
import ClinicMap from './components/map/ClinicMap';
import AdminPanel from './components/admin/AdminPanel';
import { AdminProvider, AdminContext } from './context/AdminContext';
import SuperAdminPanel from './components/admin/SuperAdminPanel';


function App() {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);

    const toggleChatbot = () => {
        setIsChatbotOpen(!isChatbotOpen);
    }

    return (
        <AuthProvider>
            <AdminProvider> {/* Correct usage of AdminProvider */}
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
                                zIndex: 9999,
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
                            <Route path="/admin/register" element={<AdminRegister />} />
                            <Route path="/admin/panel" element={<AdminPanelWrapper />} />
                            <Route path="/superadmin/panel" element={<SuperAdminPanel />} />
                            <Route path="/user" element={<UserWrapper />} />
                            <Route path="/appointment" element={<AppointmentList />} />
                            <Route path="/appointment/:appointmentID/update" element={<UpdateAppointment />} />
                            <Route path="/appointment/new" element={<AvailableSlotsCalendar />} />
                            <Route path="/map" element ={<ClinicMap />} />
                        </Routes>
                    </div>
                </Router>
            </AdminProvider>
        </AuthProvider>
    );
}

function AdminPanelWrapper() {
    const { role } = useContext(AdminContext);

    if (role === 'superadmin') {
        return <SuperAdminPanel />;
    } else {
        return <AdminPanel />;
    }
}

function UserWrapper() {
    const { userId } = useContext(AuthContext);

    if (!userId) {
        return <p>Loading user information...</p>;
    }

    return <ReadUser userId={userId} />;
}

export default App;
