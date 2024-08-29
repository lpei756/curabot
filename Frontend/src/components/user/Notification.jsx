import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Typography, Box, Button, TextField, Collapse } from '@mui/material';
import { fetchUserNotifications, sendUserMessage, markNotificationAsRead, deleteNotification } from '../../services/NotificationService.js';
import { AuthContext } from "../../context/AuthContext";

function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedBlock, setExpandedBlock] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const { userId } = useContext(AuthContext);

    useEffect(() => {
        if (!userId) {
            setLoading(true);
            return;
        }
        const loadNotifications = async () => {
            try {
                const data = await fetchUserNotifications(userId);
                setNotifications(data.notifications);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();
    }, [userId]);

    const handleSendMessage = async () => {
        try {
            await sendUserMessage(userId, newMessage);
            setNewMessage('');
            setError(null);
            setExpandedBlock('sentMessage');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications(notifications.map(notification =>
                notification._id === notificationId
                    ? { ...notification, isRead: true }
                    : notification
            ));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            await deleteNotification(notificationId);
            setNotifications(notifications.filter(notification => notification._id !== notificationId));
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleBlock = (block) => {
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

            <Block
                title="Send a Message"
                isOpen={expandedBlock === 'sendMessage'}
                onClick={() => toggleBlock('sendMessage')}
            >
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
            </Block>
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

export default Notification;
