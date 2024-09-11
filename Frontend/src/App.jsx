import './App.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatbotProvider, useChatbot } from './context/ChatbotContext';
import AppHeader from './components/layout/AppHeader';
import AdminHeader from './components/layout/AdminHeader';
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
import AdminNotification from './components/admin/AdminNotification';
import Dashboard from './components/dashboard/Dashboard';
import TestResultPage from './components/testresult/TestResult';
import AdminTestResultsPage from './components/admin/AdminTestResult';
import AdminTestResultDetailPage from './components/admin/AdminTestResultDeatil';
import Prescription from './components/admin/Prescription.jsx';
import Prescriptions from './components/prescriptions/Prescriptions';
import PrescriptionList from './components/prescriptions/PrescriptionList';

function App() {
    return (
        <AuthProvider>
            <AdminProvider>
                <ChatbotProvider>
                    <Router>
                        <div className="app-container">
                            <ConditionalHeader />
                            <div className="main-content">
                                <Routes>
                                    <Route path="/" element={<Homepage />} />
                                    <Route path="/register" element={<Register />} />
                                    <Route path="/admin/register" element={<AdminRegister />} />
                                    <Route path="/admin/panel" element={<AdminPanel />} />
                                    <Route path="/superadmin/panel" element={<SuperAdminPanel />} />
                                    <Route path="/admin/panel/adminnotification" element={<AdminNotification />} />
                                    <Route path="/admin/panel/patient/:patientId" element={<ReadPatient returnPath="/admin/panel" />} />
                                    <Route path="/admin/panel/test-result" element={<AdminTestResultsPage returnPath="/admin/panel"/>} />
                                    <Route path="/admin/panel/test-result/:id" element={<AdminTestResultDetailPage returnPath="/admin/panel"/>} />
                                    <Route path="/superadmin/panel/patient/:patientId" element={<ReadPatient returnPath="/superadmin/panel" />} />
                                    <Route path="/admin/:adminId" element={<ReadAdmin />} />
                                    <Route path="/user" element={<ReadUser />} />
                                    <Route path="/prescriptions" element={<Prescriptions />} />
                                    <Route path="/prescriptions/:userId" element={<PrescriptionList />} />
                                    <Route path="/appointment" element={<AppointmentList />} />
                                    <Route path="/notification" element={<Notification />} />
                                    <Route path="/appointment/:appointmentID/update" element={<UpdateAppointment />} />
                                    <Route path="/appointment/new" element={<AvailableSlotsCalendar />} />
                                    <Route path="/map" element={<ClinicMap />} />
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/test-result" element={<TestResultPage />} />
                                    <Route path="/prescriptions/admin/:adminId" element={<Prescription />} />
                                </Routes>
                            </div>
                            <ChatbotButtonAndComponent />
                        </div>
                    </Router>
                </ChatbotProvider>
            </AdminProvider>
        </AuthProvider>
    );
}

const ConditionalHeader = () => {
    const location = useLocation();
    const adminRoutes = [
        '/admin/panel',
        '/superadmin/panel',
        '/admin/panel/adminnotification',
        '/admin/panel/patient',
        '/admin/panel/test-result',
        '/superadmin/panel/patient',
        '/admin/:adminId',
    ];

    const isAdminRoute = adminRoutes.some(route => location.pathname.startsWith(route));
    const port = window.location.port;

    if (isAdminRoute && (port === '5174' || port === '5175')) {
        return <AdminHeader />;
    }

    return <AppHeader />;
};

const ChatbotButtonAndComponent = () => {
    const { isChatbotOpen, toggleChatbot } = useChatbot();

    return (
        <>
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
                        color: '#68cde6',
                        backgroundColor: '#03035d'
                    },
                    '&:focus': {
                        outline: 'none',
                    },
                    padding: '16px',
                    borderRadius: '50%',
                    boxShadow: 3,
                }}
            >
                {isChatbotOpen ? <ExpandMoreRoundedIcon /> : <SmartToyRoundedIcon />}
            </IconButton>
        </>
    );
};

export default App;
