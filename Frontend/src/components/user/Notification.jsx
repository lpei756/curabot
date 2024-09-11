import { useState, useEffect, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import { Typography, Box, Button, TextField, Collapse, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { fetchUserNotifications, sendUserMessage, markNotificationAsRead, deleteNotification } from '../../services/NotificationService.js';
import { fetchDoctors } from '../../services/AdminService.js';
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedBlock, setExpandedBlock] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [pdfFile, setPdfFile] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const { userId, authToken } = useContext(AuthContext);

    useEffect(() => {
        if (!userId) {
            setLoading(true);
            return;
        }
        const loadNotifications = async () => {
            try {
                console.log("Fetching notifications for user ID:", userId);
                const notifications = await fetchUserNotifications(userId);
                console.log("Notifications data received:", notifications);
                if (Array.isArray(notifications)) {
                    setNotifications(notifications);
                    console.log("Notifications state updated:", notifications);
                } else {
                    console.error("Unexpected notifications data format:", notifications);
                    setError("Unexpected data format received for notifications.");
                }
            } catch (err) {
                console.error("Error fetching notifications:", err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        const loadDoctors = async () => {
            try {
                console.log("Fetching doctors from the server...");
                const response = await fetchDoctors();
                console.log("Doctors data received:", response);
                if (response && response.doctors && Array.isArray(response.doctors)) {
                    setDoctors(response.doctors);
                    console.log("Doctors set in state:", response.doctors);
                } else {
                    setDoctors([]);
                    setError("Invalid doctors data format");
                    console.error("Invalid doctors data format");
                }
            } catch (err) {
                console.error("Error fetching doctors:", err.message);
                setError("Error fetching doctors: " + err.message);
            }
        };

        loadNotifications();
        loadDoctors();
    }, [userId]);

    const handleSendMessage = async (messageContent, doctorId) => {
        try {
            if (!doctorId) {
                setError("Please select a doctor before sending a message.");
                return;
            }
            if (!messageContent) {
                setError("Message content cannot be empty.");
                return;
            }
            if (!userId) {
                setError("User is not logged in.");
                return;
            }
            const formData = new FormData();
            formData.append('senderId', userId);
            formData.append('receiverId', doctorId);
            formData.append('message', messageContent);
            formData.append('senderModel', "User");
            formData.append('receiverModel', "Doctor");
            if (pdfFile) {
                console.log("Attaching PDF file:", pdfFile.name);
                formData.append('pdfFile', pdfFile);
            } else {
                console.warn("No PDF file selected.");
            }
            const response = await sendUserMessage(formData, authToken);
            console.log("Message sent successfully:", response);
            setNewMessage('');
            setSelectedDoctor('');
            setPdfFile(null);
            setError(null);
            setExpandedBlock('sentMessage');
        } catch (err) {
            console.error("Error sending message:", err.message);
            setError(`Unable to send message: ${err.message}`);
        }
    };

    const handleRepeatPrescription = (notification) => {
        const doctorId = notification.sender;
        const message = "Can you please repeat this prescription for me?";
        handleSendMessage(message, doctorId);
    };

    const handleBackToHomepage = () => {
        navigate('/');
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

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            console.log('Selected PDF file:', file.name);
            setPdfFile(file);
        } else {
            console.error('No file selected.');
        }
    };

    const handleReplyMessageChange = (notificationId, message) => {
        setNotifications(notifications.map(notification =>
            notification._id === notificationId
                ? { ...notification, replyMessage: message }
                : notification
        ));
    };

    const handleSendReply = async (notification) => {
        try {
            if (!notification.replyMessage) {
                setError("Reply message cannot be empty.");
                return;
            }
            const formData = new FormData();
            formData.append('senderId', userId);
            formData.append('receiverId', notification.sender);
            formData.append('message', notification.replyMessage);
            formData.append('senderModel', "User");
            formData.append('receiverModel', "Doctor");

            const response = await sendUserMessage(formData, authToken);
            console.log("Reply sent successfully:", response);

            setNotifications(notifications.map(notif =>
                notif._id === notification._id
                    ? { ...notif, replyMessage: '' }
                    : notif
            ));
            setError(null);
        } catch (err) {
            console.error("Error sending reply:", err.message);
            setError(`Unable to send reply: ${err.message}`);
        }
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
                            {notification.pdfFile && (
                                <Button
                                    variant="outlined"
                                    sx={{ borderColor: '#007bff', color: '#007bff', marginRight: '10px' }}
                                    onClick={() => window.open(`http://localhost:3001${notification.pdfFile}`, '_blank')}
                                >
                                    View PDF
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                sx={{ backgroundColor: notification.isRead ? '#fff' : '#03035d', color: '#fff', marginRight: '10px' }}
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

                            {/* Check for "Prescription created by" in the notification message */}
                            {notification.message.includes("Prescription created by") && (
                                <Button
                                    variant="contained"
                                    sx={{ backgroundColor: '#f0ad4e', color: '#fff', marginLeft: '10px' }}
                                    onClick={() => handleRepeatPrescription(notification)}
                                >
                                    Repeat
                                </Button>
                            )}

                            {/* 回复功能 */}
                            <Box sx={{ marginTop: '10px' }}>
                                <TextField
                                    label="Reply"
                                    variant="outlined"
                                    fullWidth
                                    value={notification.replyMessage || ''}
                                    onChange={(e) => handleReplyMessageChange(notification._id, e.target.value)}
                                    sx={{ marginBottom: '10px' }}
                                />
                                <Button
                                    variant="contained"
                                    sx={{ backgroundColor: '#03035d', color: '#fff' }}
                                    onClick={() => handleSendReply(notification)}
                                >
                                    Send Reply
                                </Button>
                            </Box>
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
                    <InputLabel id="select-doctor-label">Select Doctor</InputLabel>
                    <Select
                        labelId="select-doctor-label"
                        value={selectedDoctor}
                        onChange={(e) => {
                            console.log("Doctor selected:", e.target.value);
                            setSelectedDoctor(e.target.value);
                        }}
                        label="Select Doctor"
                    >
                        {doctors.map((doctor) => (
                            <MenuItem key={doctor._id} value={doctor._id}>
                                {`${doctor.firstName} ${doctor.lastName}`}
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
                    sx={{ backgroundColor: '#fff', color: '#03035d' }}
                    onClick={handleUploadClick}
                >
                    Upload PDF
                    <input
                        type="file"
                        accept="application/pdf"
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </Button>
                <Button
                    variant="contained"
                    sx={{ backgroundColor: '#03035d', color: '#fff' }}
                    onClick={() => handleSendMessage(newMessage, selectedDoctor)}
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
                onClick={handleBackToHomepage}
            >
                Back to Homepage
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
                    backgroundColor: '#fff',
                }
            }}
        >
            <Typography variant="h6" sx={{ marginBottom: '10px' }}>{title}</Typography>
            <Collapse in={isOpen}>
                <Box onClick={(e) => e.stopPropagation()}>
                    {children}
                </Box>
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

export default Notification;
