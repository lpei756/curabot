import { useState, useEffect, useContext, useRef } from 'react';
import { Typography, Box, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { fetchUserNotifications, sendUserMessage, markNotificationAsRead, deleteNotification } from '../../services/NotificationService.js';
import { fetchDoctors } from '../../services/AdminService.js';
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
const apiUrl = import.meta.env.VITE_API_URL;
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
                maxWidth: '1300px',
                margin: 'auto',
                padding: '20px',
                backgroundColor: '#f8f6f6',
                boxSizing: 'border-box',
                minHeight: '100vh'
            }}
        >
            <Box sx={{
                flex: 1,
                marginRight: '10px',
                padding: '20px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                height: '100%',
                gap: '20px',
                alignItems: 'center',
            }}>
                <Box sx={{ width: '100%', maxHeight: '700px', overflowY: 'auto' }}>
                    <Typography variant="h6" gutterBottom>Received Notifications</Typography>
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <Box
                                key={notification._id}
                                sx={{
                                    marginBottom: '20px',
                                    padding: '15px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px'
                                }}
                            >
                                <Typography><strong>From:</strong> {notification.senderName}</Typography>
                                <Typography><strong>Message:</strong> {notification.message}</Typography>
                                <Typography><strong>Date:</strong> {new Date(notification.date).toLocaleString()}</Typography>

                                {notification.pdfFile && (
                                    <Box sx={{ marginBottom: '10px' }}>
                                        <Button
                                            variant="outlined"
                                            sx={{ borderColor: '#007bff', color: '#007bff' }}
                                            onClick={() => window.open(`${apiUrl}${notification.pdfFile}`, '_blank')}
                                        >
                                            View PDF
                                        </Button>
                                    </Box>
                                )}

                                <Box sx={{ marginTop: '10px' }}>
                                    <TextField
                                        label="Reply"
                                        variant="outlined"
                                        fullWidth
                                        value={notification.replyMessage || ''}
                                        onChange={(e) => handleReplyMessageChange(notification._id, e.target.value)}
                                        sx={{ marginBottom: '10px' }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: '5px', marginTop: '10px' }}>
                                    <Button
                                        variant="contained"
                                        sx={{ backgroundColor: notification.isRead ? '#fff' : '#03035d', color: notification.isRead ? '#000' : '#fff' }}
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

                                    {notification.message.includes("Prescription created by") && (
                                        <Button
                                            variant="contained"
                                            sx={{ backgroundColor: '#f0ad4e', color: '#fff' }}
                                            onClick={() => handleRepeatPrescription(notification)}
                                        >
                                            Repeat
                                        </Button>
                                    )}

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
                </Box>

                <Box
                    sx={{
                        width: '100%',
                        padding: '20px',
                        height: '50%',
                        marginBottom: '20px',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
                        backgroundColor: '#03035d'
                    }}
                >
                    <Typography variant="h6" sx={{ marginBottom: '16px', color: '#f8f6f6' }}>
                        Send a Message
                    </Typography>

                    <FormControl fullWidth sx={{ marginBottom: '16px', '& .MuiInputLabel-root': { color: '#f8f6f6' }, '& .MuiOutlinedInput-root': { borderColor: '#f8f6f6' } }}>
                        <InputLabel id="select-doctor-label">Select Doctor</InputLabel>
                        <Select
                            labelId="select-doctor-label"
                            value={selectedDoctor}
                            onChange={(e) => {
                                console.log("Doctor selected:", e.target.value);
                                setSelectedDoctor(e.target.value);
                            }}
                            label="Select Doctor"
                            sx={{
                                '& .MuiSelect-select': { color: '#f8f6f6' },
                                '& .MuiSelect-icon': { color: '#f8f6f6' },
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#f8f6f6' }
                            }}
                        >
                            {doctors.map((doctor) => (
                                <MenuItem key={doctor._id} value={doctor._id} sx={{ color: '#f8f6f6' }}>
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
                        sx={{ marginBottom: '16px', backgroundColor: '#f8f6f6' }}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Button
                            variant="outlined"
                            sx={{ borderColor: '#f8f6f6', color: '#f8f6f6' }}
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
                            sx={{
                                backgroundColor: '#f8f6f6',
                                color: '#03035d',
                                '&:hover': {
                                    backgroundColor: '#0056b3',
                                }
                            }}
                            onClick={() => handleSendMessage(newMessage, selectedDoctor)}
                        >
                            Send Message
                        </Button>
                    </Box>

                    {expandedBlock === 'sentMessage' && (
                        <Typography sx={{ marginTop: '16px', color: 'green' }}>
                            Message sent successfully!
                        </Typography>
                    )}
                </Box>
            </Box>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                    variant="contained"
                    sx={{
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
        </Box>
    );
}

export default Notification;
