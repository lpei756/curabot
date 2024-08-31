import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Typography, Box, Button, TextField, Collapse, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { fetchAdminNotifications, sendDoctorMessage, markNotificationAsRead, deleteNotification } from '../../services/NotificationService.js';
import { fetchAllPatients } from '../../services/AdminService';
import { AdminContext } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";

function AdminNotification() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedBlock, setExpandedBlock] = useState('receivedNotifications');
    const [newMessage, setNewMessage] = useState('');
    const [selectedPatient, setSelectedPatient] = useState('');
    const [Patients, setPatients] = useState([]);
    const navigate = useNavigate();
    const { adminId } = useContext(AdminContext);

    useEffect(() => {
        if (!adminId) {
            setLoading(true);
            return;
        }

        const loadNotifications = async () => {
            try {
                console.log("Fetching notifications for admin ID:", adminId);
                const data = await fetchAdminNotifications(adminId);
                console.log("Notifications data received:", data);
                setNotifications(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching notifications:", err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const loadPatients = async () => {
            try {
                console.log("Fetching Patients from the server...");
                const response = await fetchAllPatients();
                console.log("Patients data received:", response);
                setPatients(response);
            } catch (err) {
                console.error("Error fetching patients:", err.message);
                setError(err.message);
            }
        };

        loadNotifications();
        loadPatients();
    }, [adminId]);



    const handleSendMessage = async () => {
        try {
            if (!selectedPatient) {
                throw new Error("No patient selected.");
            }
            if (!newMessage) {
                throw new Error("Message content is empty.");
            }
            const senderModel = "Admin";
            const receiverModel = "User";
            console.log("Sending message to patient ID:", selectedPatient);
            console.log("Message content:", newMessage);
            const response = await sendDoctorMessage({
                senderId: adminId,
                receiverId: selectedPatient,
                message: newMessage,
                senderModel: senderModel,
                receiverModel: receiverModel
            });
            console.log("Message sent successfully:", response);
            setNewMessage('');
            setSelectedPatient('');
            setError(null);
            setExpandedBlock('sentMessage');
        } catch (err) {
            console.error("Error sending message:", err.message);
            setError(`Unable to send message: ${err.message}`);
        }
    };

    const handleBackToAdminPanel = () => {
        navigate('/admin/panel');
    };
    const handleMarkAsRead = async (notificationId) => {
        try {
            console.log("Marking notification as read, ID:", notificationId);
            await markNotificationAsRead(notificationId);
            setNotifications(notifications.map(notification =>
                notification._id === notificationId
                    ? { ...notification, isRead: true }
                    : notification
            ));
            console.log("Notification marked as read successfully");
        } catch (err) {
            console.error("Error marking notification as read:", err.message);
            setError(err.message);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            console.log("Deleting notification, ID:", notificationId);
            await deleteNotification(notificationId);
            setNotifications(notifications.filter(notification => notification._id !== notificationId));
            console.log("Notification deleted successfully");
        } catch (err) {
            console.error("Error deleting notification:", err.message);
            setError(err.message);
        }
    };

    const toggleBlock = (block) => {
        console.log("Toggling block:", block);
        setExpandedBlock(expandedBlock === block ? null : block);
    };
    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography>Error: {error}</Typography>;
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '800px',
                margin: 'auto',
                padding: '20px',
                backgroundColor: '#f8f6f6',
                boxSizing: 'border-box'
            }}
        >
            <Block
                title="Received Notifications"
                isOpen={expandedBlock === 'receivedNotifications'}
                onClick={() => toggleBlock('receivedNotifications')}
            >
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <Box key={notification._id} sx={{ marginBottom: '10px' }}>
                            <Typography><strong>From:</strong> {notification.senderName}</Typography>
                            <Typography><strong>Message:</strong> {notification.message}</Typography>
                            <Typography><strong>Date:</strong> {new Date(notification.date).toLocaleString()}</Typography>
                            <Button
                                variant="contained"
                                sx={{ backgroundColor: notification.isRead ? '#d3d3d3' : '#03035d', color: '#fff', marginRight: '10px' }}
                                disabled={notification.isRead}
                                onClick={() => handleMarkAsRead(notification._id)}
                            >
                                {notification.isRead ? 'Read' : 'Mark as Read'}
                            </Button>
                            <Button
                                variant="outlined"
                                sx={{ borderColor: '#ff0000', color: '#ff0000' }}
                                onClick={() => handleDeleteNotification(notification._id)}
                            >
                                Delete
                            </Button>
                        </Box>
                    ))
                ) : (
                    <Typography>No notifications received.</Typography>
                )}
            </Block>

            <Box
                sx={{
                    width: '100%',
                    padding: '15px',
                    marginBottom: '15px',
                    border: '2px solid #ddd',
                    borderRadius: '5px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#fff',
                }}
            >
                <Typography variant="h6" sx={{ marginBottom: '10px' }}>Send a Message</Typography>
                <FormControl fullWidth sx={{ marginBottom: '10px' }}>
                    <InputLabel id="select-patient-label">Select Patient</InputLabel>
                    <Select
                        labelId="select-patient-label"
                        value={selectedPatient}
                        onChange={(e) => {
                            console.log("Patient selected:", e.target.value);
                            setSelectedPatient(e.target.value);
                        }}
                        label="Select Patient"
                    >
                        {Patients.map((patient) => (
                            <MenuItem key={patient._id} value={patient._id}>
                                {`${patient.firstName} ${patient.lastName}`}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    label="New Message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    sx={{ marginBottom: '10px' }}
                />
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: '#03035d',
                        color: '#fff',
                    }}
                    onClick={handleSendMessage}
                >
                    Send Message
                </Button>
                {expandedBlock === 'sentMessage' && (
                    <Typography sx={{ marginTop: '10px', color: 'green' }}>Message sent successfully!</Typography>
                )}
            </Box>
            <Button
                variant="contained"
                sx={{
                    mt: 4,
                    backgroundColor: '#03035d',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: '#03035d',
                    }
                }}
                onClick={handleBackToAdminPanel}
            >
                Back to Admin Panel
            </Button>
        </Box>

    );
}

function Block({ title, isOpen, onClick, children }) {
    return (
        <Box
            onClick={onClick}
            sx={{
                width: '100%',
                padding: '15px',
                marginBottom: '15px',
                border: '2px solid #ddd',
                borderRadius: '5px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#fff',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                '&:hover': {
                    backgroundColor: '#f0f0f0',
                }
            }}
        >
            <Typography variant="h6" sx={{ marginBottom: '10px' }}>{title}</Typography>
            <Collapse in={isOpen}>
                {children}
            </Collapse>
        </Box>
    );
}

Block.propTypes = {
    title: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

export default AdminNotification;
