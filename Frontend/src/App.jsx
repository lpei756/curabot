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
import Notification from './components/user/Notification';
import Homepage from './components/homepage/Homepage';
import AvailableSlotsCalendar from './components/appointment/AvailableSlotsCalendar';
import ClinicMap from './components/map/ClinicMap';
import AdminPanel from './components/admin/AdminPanel';
import { AdminProvider } from './context/AdminContext';
import SuperAdminPanel from './components/admin/SuperAdminPanel';
import ReadPatient from './components/admin/ReadPatient';
import ReadAdmin from './components/admin/ReadAdmin';
import Lottie from 'lottie-react';
import animationData from './assets/loading.json';

function App() {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);

    const toggleChatbot = () => {
        setIsChatbotOpen(prevState => !prevState);
    };

    return (
        <AuthProvider>
            <AdminProvider>
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
                            <Route path="/admin/panel" element={<AdminPanel />} />
                            <Route path="/superadmin/panel" element={<SuperAdminPanel />} />
                            <Route path="/admin/panel/patient/:patientId" element={<ReadPatient returnPath="/admin/panel" />} />
                            <Route path="/superadmin/panel/patient/:patientId" element={<ReadPatient returnPath="/superadmin/panel" />} />
                            <Route path="/admin/:adminId" element={<ReadAdmin />} />
                            <Route path="/user" element={<UserWrapper />} />
                            <Route path="/appointment" element={<AppointmentList />} />
                            <Route path="/notification" element={<NotificationWrapper />} />
                            <Route path="/appointment/:appointmentID/update" element={<UpdateAppointment />} />
                            <Route path="/appointment/new" element={<AvailableSlotsCalendar />} />
                            <Route path="/map" element={<ClinicMap />} />
                        </Routes>
                    </div>
                </Router>
            </AdminProvider>
        </AuthProvider>
    );
}

function UserWrapper() {
    const { userId } = useContext(AuthContext);

    if (!userId) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                <Lottie
                    animationData={animationData}
                    style={{
                        width: '200px',
                        height: '200px',
                        zIndex: 1,
                        pointerEvents: 'none'
                    }}
                />
            </div>
        );
    }

    return <ReadUser userId={userId} />;
}

function NotificationWrapper() {
    const { userId } = useContext(AuthContext);

    if (!userId) {
        return <p>Loading user information...</p>;
    }

    return <Notification userId={userId} />;
}

export default App;
