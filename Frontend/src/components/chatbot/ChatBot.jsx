import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import { useChatbot } from '../../context/ChatbotContext';
import { Box, IconButton, AppBar, Toolbar, Typography, TextField, Paper, Chip, Avatar, Menu, MenuItem, Drawer, List, ListItem, ListItemText, Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Lottie from 'lottie-react';
import PropTypes from 'prop-types';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import { styled } from '@mui/material/styles';
import ImageUpload from '../image/ImageUpload';
import { AuthContext } from '../../context/AuthContext';
import { fetchChatHistoryBySessionId, sendChatMessage, sendFeedbackToServer, fetchUserChatHistories } from '../../services/chatService';
import { fetchGpSlotsByDoctorId } from '../../services/availabilityService';
import { createAppointment } from '../../services/appointmentService';
import { getDoctorById } from '../../services/doctorService';
import animationData from '../../assets/loading.json';
import "../../App.css";
import { sendUserMessage } from '../../services/NotificationService.js';
import { v4 as uuidv4 } from 'uuid';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: 'rgba(25, 118, 210, 0.04)',
        transform: 'scale(1.1)',
    },
}));

const ThumbIcon = styled('div')(({ theme, isActive }) => ({
    color: isActive ? '#5BC0DE' : theme.palette.text.secondary,
    transition: 'all 0.3s ease',
    '&:hover': {
        color: '#5BC0DE',
    },
}));

const DrawerContainer = styled(Box)(({ theme }) => ({
    width: '200px',
    height: '675px',
    position: 'fixed',
    bottom: '50px',
    right: '480px',
    borderRadius: '20px',
    backgroundColor: '#f5f5f5',
    zIndex: 6667,
    overflow: 'auto',
    transition: 'transform 0.3s ease',
    transform: 'translateX(0)',
}));

function ChatBot() {
    const { toggleChatbot } = useChatbot();
    const { authToken } = useContext(AuthContext);
    const [messages, setMessages] = useState([
        { type: 'bot', message: 'Kia Ora! My name is Cura. How can I assist you today?' }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [sessionId, setSessionId] = useState(localStorage.getItem('chatSessionId') || null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [recentChatSessions, setRecentChatSessions] = useState([]);
    const [filteredChatSessions, setFilteredChatSessions] = useState([]);
    const [chatHistoriesFetched, setChatHistoriesFetched] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchSuggestion, setSearchSuggestion] = useState(null);
    const scrollContainerRef = useRef(null);
    const messageRefs = useRef({});
    const messagesEndRef = useRef(null);
    const { userId } = useContext(AuthContext);
    const [doctorAvailability, setDoctorAvailability] = useState(null);
    const [searchClicked, setSearchClicked] = useState(false);
    const [error, setError] = useState(null);
    const [scrollToMessageId, setScrollToMessageId] = useState(null);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

    const quickChats = [
        "How can I book a new appointment",
        "How do I cancel my appointment",
        "Change my appointment time",
        "When is my next appointment",
        "How do I check my insurance details",
        "How can I get my medical records",
    ];

    useEffect(() => {
        const fetchChatHistory = async () => {
            if (sessionId) {
                try {
                    const history = await fetchChatHistoryBySessionId(sessionId, authToken);
                    const formattedMessages = history.messages.map((msg) => {
                        const isHtml = /<\/?[a-z][\s\S]*>/i.test(msg.message);
                        return {
                            ...msg,
                            type: msg.sender === 'bot' ? 'bot' : 'user',
                            isHtml: isHtml,
                        };
                    });
                    setMessages(formattedMessages);
                } catch (error) {
                    console.error('Failed to fetch chat history:', error);
                    if (error.response && error.response.status === 404) {
                        setSessionId(null);
                        localStorage.removeItem('chatSessionId');
                    }
                }
            }
        };

        fetchChatHistory();
    }, [sessionId, authToken]);

    useEffect(() => {
        const fetchUserHistories = async () => {
            try {
                const histories = await fetchUserChatHistories(userId, authToken);
                histories.sort((a, b) => {
                    const dateA = new Date(a.messages[0].timestamp);
                    const dateB = new Date(b.messages[0].timestamp);
                    return dateB - dateA;
                });

                const groupedHistories = groupMessagesByDate(histories);
                setRecentChatSessions(groupedHistories);
                setChatHistoriesFetched(true);
            } catch (error) {
                console.error('Failed to fetch chat histories:', error);
            }
        };

        if (!chatHistoriesFetched && userId) {
            fetchUserHistories();
        }
    }, [userId, authToken, chatHistoriesFetched]);

    useEffect(() => {
        if (shouldScrollToBottom && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, shouldScrollToBottom]);

    const isSignificantTimeGap = (previousTimestamp, currentTimestamp) => {
        const timeGapInMs = new Date(currentTimestamp).getTime() - new Date(previousTimestamp).getTime();
        const timeGapInMinutes = timeGapInMs / (60 * 1000);
        const significantGap = timeGapInMinutes > 5;

        return significantGap;
    };

    const handleDoctorSelection = async (doctorID) => {
        try {
            setIsLoading(true);
            const data = await fetchGpSlotsByDoctorId(doctorID);

            const availableSlots = data.filter(data => !data.isBooked);

            setDoctorAvailability(availableSlots);
        } catch (error) {
            console.error('Error fetching doctor availability:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (scrollToMessageId && messageRefs.current[scrollToMessageId]) {
            // Scroll to the specific message when `scrollToMessageId` is set
            messageRefs.current[scrollToMessageId].scrollIntoView({ behavior: 'smooth', block: 'center' });
            setScrollToMessageId(null); // Clear the scrollToMessageId after scrolling
        } else if (shouldScrollToBottom && messagesEndRef.current) {
            // Regular scroll to the bottom when new messages are sent/received
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, scrollToMessageId, shouldScrollToBottom]);

    React.useEffect(() => {
        window.handleDoctorSelection = handleDoctorSelection;
        return () => {
            delete window.handleDoctorSelection;
        };
    }, []);

    const handleRepeatPrescription = async (encodedData) => {
        const { id, doctorId, patientName, medications, instructions } = JSON.parse(decodeURIComponent(encodedData));

        const message = "Can you please repeat this prescription for me?";

        if (!doctorId) {
            console.error("Doctor ID is missing for this prescription.");
            setError("Doctor ID is missing for this prescription.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('senderId', userId);
            formData.append('receiverId', doctorId);
            formData.append('message', message);
            formData.append('senderModel', "User");
            formData.append('receiverModel', "Doctor");

            const response = await sendUserMessage(formData, authToken);
            console.log("Message sent successfully:", response);
        } catch (err) {
            console.error("Error sending repeat request:", err.message);
            setError(`Unable to send repeat request: ${err.message}`);
        }
    };

    React.useEffect(() => {
        window.repeatPrescription = handleRepeatPrescription;
        return () => {
            delete window.repeatPrescription;
        };
    }, []);

    const handleBookSlot = async (slot) => {
        try {
            setIsLoading(true);

            const doctorResponse = await getDoctorById(slot.doctorID);
            const clinicID = doctorResponse.clinic;

            const appointmentData = {
                dateTime: new Date(slot.startTime).toISOString().slice(0, 16),
                clinic: clinicID,
                assignedGP: slot.doctorID,
                slotId: slot._id
            };

            const response = await createAppointment(appointmentData);
            console.log('Appointment created successfully:', response);

            setMessages((prevMessages) => [
                ...prevMessages,
                { id: uuidv4(), type: 'bot', message: 'Your appointment has been booked successfully.' }
            ]);

        } catch (error) {
            console.error('Error booking appointment:', error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { id: uuidv4(), type: 'bot', message: 'There was an error booking your appointment. Please try again.' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = useCallback(async (event, quickMessage = null) => {
        if (event) event.preventDefault();
        const messageToSend = quickMessage || inputValue;
        if (messageToSend.trim() === '') return;

        const messageId = uuidv4();

        setMessages((prevMessages) => [
            ...prevMessages,
            { id: messageId, type: 'user', message: messageToSend }
        ]);
        setInputValue('');
        setIsLoading(true);

        setShouldScrollToBottom(true);

        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            const response = await sendChatMessage(messageToSend, authToken, userLocation, sessionId);

            if (response.data.sessionId && response.data.sessionId !== sessionId) {
                setSessionId(response.data.sessionId);
                localStorage.setItem('chatSessionId', response.data.sessionId);
            }

            setMessages((prevMessages) => [
                ...prevMessages,
                { id: uuidv4(), type: 'bot', message: response.data.reply, isHtml: true, feedbackSent: false }
            ]);

            setShouldScrollToBottom(true);

        } catch (error) {
            let errorMessage = 'Sorry, something went wrong. Please try again.';
            if (error.message === 'Unauthorized') {
                errorMessage = 'Please log in to continue your request.';
            }
            setMessages((prevMessages) => [
                ...prevMessages,
                { id: uuidv4(), type: 'bot', message: errorMessage }
            ]);
            setShouldScrollToBottom(true);
        } finally {
            setIsLoading(false);
        }
    }, [inputValue, authToken, sessionId]);

    const handleQuickChat = useCallback((message) => {
        handleSend(null, message);
    }, [handleSend]);

    const handleImageUpload = (uploadedImage) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            {
                type: 'user',
                message: `Image uploaded: ${uploadedImage.filename}`,
                imageUrl: uploadedImage.url
            }
        ]);
    };

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setIsImageDialogOpen(true);
    };

    const handleFeedback = async (index, feedback) => {
        const message = messages[index];
        if (!message.id) {
            console.error('Message ID is missing, cannot send feedback');
            return;
        }

        if (message.feedbackSent) {
            console.log('Feedback has already been sent for this message');
            return;
        }

        setMessages(prevMessages =>
            prevMessages.map((msg, i) =>
                i === index ? { ...msg, liked: feedback, feedbackSent: true } : msg
            )
        );

        try {
            const response = await sendFeedbackToServer(message.id, feedback);
            console.log('Feedback response:', response);
        } catch (error) {
            console.error('Failed to send feedback:', error);
        }
    };

    const toggleDrawer = () => {
        setDrawerOpen((prevDrawerOpen) => !prevDrawerOpen);
    };

    const groupMessagesByDate = (chatSessions) => {
        const groupedByDate = {};

        chatSessions.forEach(session => {
            session.messages.forEach(message => {
                const date = new Date(message.timestamp).toLocaleDateString();
                if (!groupedByDate[date]) {
                    groupedByDate[date] = [];
                }
                groupedByDate[date].push({
                    ...message,
                    sessionId: session._id
                });
            });
        });

        return groupedByDate;
    };

    const showChatHistoryForDate = (date, messageId = null) => {
        const messagesForDate = recentChatSessions[date] || [];

        const formattedMessages = messagesForDate.map(msg => ({
            ...msg,
            type: msg.sender === 'bot' ? 'bot' : 'user',
            isHtml: /<\/?[a-z][\s\S]*>/i.test(msg.message)
        }));

        setMessages(formattedMessages);
        setSelectedSessionId(date);
        if (messageId) {
            setScrollToMessageId(messageId);  // We set this to scroll to the exact message later
        } else {
            setScrollToMessageId(null);  // If no specific message, reset scroll target
        }

        setShouldScrollToBottom(false);  // Disable automatic scrolling to the bottom
    };

    const handleSearchChange = (event) => {
        const searchTerm = event.target.value.trim();
        setSearchTerm(searchTerm);
        setSearchClicked(false);
        setFilteredChatSessions([]);
        if (searchTerm === '') {
            setSearchSuggestion(null);

        } else {
            setSearchSuggestion(`Search for: "${searchTerm}"`);
        }
    };

    const handleSearchClick = () => {
        const filteredSessions = {};
        setSearchClicked(true);

        if (searchTerm.trim() !== '') {
            Object.keys(recentChatSessions).forEach(date => {
                const filteredMessages = recentChatSessions[date]
                    .filter(message =>
                        message.message.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(message => {
                        // Find the search term index
                        const searchIndex = message.message.toLowerCase().indexOf(searchTerm.toLowerCase());
                        const totalCharacters = 20; // Total number of characters before and after the search term
                        const half = Math.floor(totalCharacters / 2); // To balance before and after the search term

                        // Calculate start and end indices for truncation
                        const start = Math.max(0, searchIndex - half);
                        const end = Math.min(message.message.length, searchIndex + searchTerm.length + half);

                        // Extract text before, the term itself, and after the search term
                        const beforeText = message.message.slice(start, searchIndex);
                        const afterText = message.message.slice(searchIndex + searchTerm.length, end);

                        // Create the truncated message with ellipses if necessary
                        const truncatedMessage = `${start > 0 ? '...' : ''}${beforeText}${message.message.substr(searchIndex, searchTerm.length)}${afterText}${end < message.message.length ? '...' : ''}`;

                        // Return the truncated message along with original message metadata
                        return {
                            ...message,
                            truncatedMessage
                        };
                    });
                if (filteredMessages.length > 0) {
                    filteredSessions[date] = filteredMessages;
                }
            });

            setFilteredChatSessions(filteredSessions);
        }
    };

    return (
        <>
            {drawerOpen && (
                <DrawerContainer>
                    <AppBar
                        position="sticky"
                        sx={{
                            backgroundColor: '#03035D',
                            boxShadow: 'none',
                            borderTopLeftRadius: '20px',
                            borderTopRightRadius: '20px',
                            height: '60px',
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: '0 16px',
                        }}
                    >
                        <TextField
                            size="small"
                            variant="standard"
                            fullWidth
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search..."
                            InputProps={{
                                startAdornment: (
                                    <SearchRoundedIcon sx={{ color: 'white' }} />
                                )
                            }}
                            sx={{
                                borderRadius: '5px',
                                marginLeft: '8px',
                                '& .MuiInputBase-root': { color: 'white' },
                                '& .MuiInputLabel-root': { color: 'white' },
                                '& .MuiInput-underline:before': { borderBottomColor: 'white' },
                                '& .MuiInput-underline:after': { borderBottomColor: '#68cde6' },
                            }}
                        />
                    </AppBar>

                    <List>
                        {searchTerm !== '' && !searchClicked && (
                            <ListItem onClick={handleSearchClick}>
                                <ListItemText
                                    primary={
                                        <span style={{ color: 'black' }}>
                                            Search for:{" "}
                                            <span style={{ color: '#03035D', fontWeight: 'bold' }}>
                                                "{searchTerm}"
                                            </span>
                                        </span>
                                    }
                                />
                            </ListItem>
                        )}

                        {searchTerm === '' && !searchClicked && Object.keys(recentChatSessions).map((date, index) => (
                            <ListItem
                                key={index}
                                onClick={() => showChatHistoryForDate(date)}
                                sx={{
                                    bgcolor: selectedSessionId === date ? '#03035D' : 'transparent',
                                    transition: 'background-color 0.3s ease',
                                    '&:hover': {
                                        bgcolor: selectedSessionId === date ? '#03035D' : '#68cde6',
                                        '& .MuiListItemText-primary': { color: 'white' },
                                    },
                                    borderRadius: '8px',
                                    mb: 1,
                                }}
                            >
                                <ListItemText
                                    primary={date}
                                    sx={{
                                        color: selectedSessionId === date ? 'white' : 'black',
                                        transition: 'color 0.3s ease',
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>

                    {Object.keys(filteredChatSessions).length > 0 && (
                        <List>
                            {Object.keys(filteredChatSessions).map((date, index) => (
                                filteredChatSessions[date].map((message, msgIndex) => (
                                    <ListItem key={`${date}-${msgIndex}`}
                                        onClick={() => showChatHistoryForDate(date, message.id)}
                                        sx={{
                                            bgcolor: selectedSessionId === `${date}-${msgIndex}` ? '#03035D' : 'transparent',
                                            transition: 'background-color 0.3s ease',
                                            '&:hover': {
                                                bgcolor: selectedSessionId === `${date}-${msgIndex}` ? '#03035D' : '#68cde6',
                                                '& .MuiListItemText-primary': { color: 'white' },
                                            },
                                            borderRadius: '8px',
                                            mb: 1,
                                        }}
                                    >
                                        {message.sender === 'bot' ? (
                                            <Avatar alt="Bot Avatar" src="icon.png" sx={{ width: 30, height: 30, mr: 1 }} />
                                        ) : (
                                            <Avatar alt="User Avatar" sx={{ bgcolor: '#03035D', width: 30, height: 30, mr: 1 }} />
                                        )}
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body1" sx={{ color: 'black' }}>
                                                <span dangerouslySetInnerHTML={{ __html: message.truncatedMessage.replace(new RegExp(searchTerm, 'gi'), match => `<span style="color: #03035D">${match}</span>`) }} />
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'gray' }}>
                                                {new Date(message.timestamp).toLocaleString(undefined, {
                                                    year: 'numeric',
                                                    month: 'numeric',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: false,
                                                })}
                                            </Typography>
                                        </Box>
                                    </ListItem>
                                ))
                            ))}
                        </List>
                    )}

                    {Object.keys(filteredChatSessions).length === 0 && searchClicked && (
                        <ListItem>
                            <ListItemText
                                primary={
                                    <span style={{ color: 'black' }}>
                                        No results found for "{searchTerm}"
                                    </span>
                                }
                            />
                        </ListItem>
                    )}
                </DrawerContainer>
            )}

            <Box
                className="chatbot-container"
                sx={{
                    width: '450px',
                    height: '675px',
                    position: 'fixed',
                    bottom: '50px',
                    right: '30px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    backgroundColor: '#f5f5f5',
                    flexDirection: 'column',
                    zIndex: 6666
                }}
            >
                <AppBar position="static" sx={{
                    backgroundColor: '#03035D',
                    boxShadow: 'none',
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px',
                    height: '60px',
                    zIndex: 9997,
                }}>
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{
                            fontWeight: 'bold',
                            color: 'white',
                        }}>
                            Cura
                        </Typography>
                        <Box>
                            {authToken && (
                                <IconButton
                                    color="inherit"
                                    onClick={toggleDrawer}
                                    sx={{
                                        transition: 'color 0.3s ease',
                                        '&:hover': {
                                            color: '#68cde6',
                                        },
                                        '&:focus': {
                                            outline: 'none',
                                            boxShadow: 'none',
                                        },
                                    }}
                                >
                                    <HistoryRoundedIcon />
                                </IconButton>
                            )}
                            <IconButton
                                edge="end"
                                color="inherit"
                                onClick={toggleChatbot}
                                sx={{
                                    transition: 'color 0.3s ease',
                                    '&:hover': {
                                        color: '#5BC0DE',
                                    },
                                    '&:focus': {
                                        outline: 'none',
                                        boxShadow: 'none',
                                        backgroundColor: 'transparent',
                                    },
                                }}
                            >
                                <ClearRoundedIcon />
                            </IconButton>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Box flexGrow={1} p={2} overflow="auto" sx={{ backgroundColor: '#f5f5f5', zIndex: 9997 }}>
                    {messages.map((msg, index) => {
                        // Add logging for timestamps
                        //if (index > 0) {
                        //    console.log(`Comparing Message ${index - 1} at ${messages[index - 1].timestamp} with Message ${index} at ${msg.timestamp}`);
                        //}
                        const showTimestamp = index === 0 || isSignificantTimeGap(messages[index - 1].timestamp, msg.timestamp);
                        //console.log(`Message ${index} showTimestamp: ${showTimestamp}`);

                        return (
                            <React.Fragment key={index}>
                                {showTimestamp && (
                                    <Typography variant="caption" sx={{ textAlign: 'center', display: 'block', color: '#888' }}>
                                        {new Date(msg.timestamp).toLocaleString()}
                                    </Typography>
                                )}

                                <Box
                                    display="flex"
                                    mb={2}
                                    alignItems="flex-start"
                                    justifyContent={msg.type === 'bot' ? 'flex-start' : 'flex-end'}
                                    ref={el => (messageRefs.current[msg.id] = el)}
                                    key={msg.id}
                                >
                                    {msg.type === 'bot' && (
                                        <Avatar alt="Bot Avatar" src="icon.png" sx={{ width: 45, height: 45 }} />
                                    )}
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            ml: msg.type === 'bot' ? 2 : 0,
                                            mr: msg.type === 'user' ? 2 : 0,
                                            bgcolor: msg.type === 'bot' ? '#f0f0f0' : '#03035D',
                                            color: msg.type === 'bot' ? '#333' : 'white',
                                            p: 2,
                                            borderRadius: 3,
                                            maxWidth: "75%",
                                        }}
                                    >
                                        {msg.isHtml ? (
                                            <Typography dangerouslySetInnerHTML={{ __html: msg.message }} />
                                        ) : msg.imageUrl ? (
                                            <img
                                                src={msg.imageUrl}
                                                alt="Uploaded"
                                                style={{ maxWidth: '100px', cursor: 'pointer' }}
                                                onClick={() => handleImageClick(msg.imageUrl)}
                                            />
                                        ) : (
                                            <Typography>{msg.message}</Typography>
                                        )}

                                        {msg.type === 'bot' && index !== 0 && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                <StyledIconButton
                                                    onClick={() => handleFeedback(index, true)}
                                                    aria-label="thumbs up"
                                                >
                                                    <ThumbIcon isActive={msg.liked === true}>
                                                        <ThumbUpOutlinedIcon />
                                                    </ThumbIcon>
                                                </StyledIconButton>
                                                <StyledIconButton
                                                    onClick={() => handleFeedback(index, false)}
                                                    aria-label="thumbs down"
                                                >
                                                    <ThumbIcon isActive={msg.liked === false}>
                                                        <ThumbDownOutlinedIcon />
                                                    </ThumbIcon>
                                                </StyledIconButton>
                                            </Box>
                                        )}

                                    </Paper>
                                    {msg.type === 'user' && (
                                        <Avatar alt="User Avatar" sx={{ bgcolor: '#03035D', width: 40, height: 40 }} />
                                    )}
                                </Box>

                            </React.Fragment>
                        );
                    })}

                    {doctorAvailability && (
                        <Box p={2} sx={{ backgroundColor: '#f5f5f5', borderRadius: 2, border: '1px solid #ddd', width: '80%', margin: '0 auto' }}>
                            <Typography variant="h6">Doctor Availability:</Typography>
                            {doctorAvailability.length > 0 ? (
                                doctorAvailability.map((slot, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        <Typography>
                                            Date: {new Date(slot.date).toLocaleDateString()}
                                        </Typography>
                                        <Typography sx={{ mt: 1 }}>
                                            Time: {new Date(slot.startTime).toLocaleTimeString()} to {new Date(slot.endTime).toLocaleTimeString()}
                                        </Typography>
                                        <Button
                                            sx={{
                                                mr: 1,
                                                marginTop: '10px',
                                                bgcolor: '#03035D',
                                                color: 'white',
                                                borderRadius: '20px',
                                            }}
                                            onClick={() => handleBookSlot(slot)}
                                        >
                                            MAKE AN APPOINTMENT
                                        </Button>
                                    </Box>
                                ))
                            ) : (
                                <Typography>No availability data found.</Typography>
                            )}
                        </Box>
                    )}

                    {isLoading && (
                        <Box display="flex" justifyContent="center" p={2}>
                            <Lottie
                                animationData={animationData}
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    zIndex: 1,
                                    justifyContent: 'center',
                                    pointerEvents: 'auto'
                                }}
                            />
                        </Box>
                    )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#CCCCDE', p: 1 }}>
                    <IconButton onClick={() => scrollContainerRef.current.scrollBy({ left: -100, behavior: 'smooth' })} size="small">
                        <ChevronLeftIcon />
                    </IconButton>
                    <Box
                        ref={scrollContainerRef}
                        sx={{
                            display: 'flex',
                            overflowX: 'hidden',
                            flexGrow: 1,
                            mx: 1,
                            '&::-webkit-scrollbar': { display: 'none' },
                            scrollbarWidth: 'none'
                        }}
                    >
                        {quickChats.map((chat, index) => (
                            <Chip
                                key={index}
                                label={chat}
                                onClick={() => handleQuickChat(chat)}
                                sx={{
                                    mr: 1,
                                    bgcolor: '#03035D',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: '#5BC0DE',
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                            />
                        ))}
                    </Box>
                    <IconButton onClick={() => scrollContainerRef.current.scrollBy({ left: 100, behavior: 'smooth' })} size="small">
                        <ChevronRightIcon />
                    </IconButton>
                </Box>

                <Paper component="form" onSubmit={handleSend} elevation={0} sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'white',
                    borderTop: '1px solid #e0e0e0'
                }}>
                    <IconButton color="primary" aria-label="add" onClick={() => setIsImageUploadOpen(true)}>
                        <AttachFileRoundedIcon />
                    </IconButton>
                    <TextField
                        variant="standard"
                        placeholder="Type a message..."
                        fullWidth
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        sx={{ mx: 2 }}
                        InputProps={{
                            disableUnderline: true,
                        }}
                    />
                    {inputValue.trim() !== '' && (
                        <IconButton type="submit" aria-label="send"
                            sx={{
                                color: '#03035D',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    color: '#5BC0DE',
                                }
                            }}
                        >
                            <SendRoundedIcon />
                        </IconButton>
                    )}

                </Paper>
            </Box>

            <ImageUpload
                open={isImageUploadOpen}
                onClose={() => setIsImageUploadOpen(false)}
                onImageUploaded={handleImageUpload}
            />
            <Dialog open={isImageDialogOpen} onClose={() => setIsImageDialogOpen(false)} maxWidth="md">
                <DialogContent>
                    {selectedImage && (
                        <img src={selectedImage} alt="Full Size" style={{ width: '100%', height: 'auto' }} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

ChatBot.propTypes = {
    toggleChatbot: PropTypes.func.isRequired,
};

export default ChatBot;
