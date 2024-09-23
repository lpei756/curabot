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
    const messagesEndRef = useRef(null);
    const { userId } = useContext(AuthContext);
    const [doctorAvailability, setDoctorAvailability] = useState(null);

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
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

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

    React.useEffect(() => {
        window.handleDoctorSelection = handleDoctorSelection;
        return () => {
            delete window.handleDoctorSelection;
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

        } catch (error) {
            let errorMessage = 'Sorry, something went wrong. Please try again.';
            if (error.message === 'Unauthorized') {
                errorMessage = 'Please log in to continue your request.';
            }
            setMessages((prevMessages) => [
                ...prevMessages,
                { id: uuidv4(), type: 'bot', message: errorMessage }
            ]);
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

    const handleFeedback = (index, feedback) => {
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
    
        const positiveFeedbacks = [
            'Thank you for your feedback!',
            'We appreciate your input!',
            'Glad you liked it!',
            'Thanks for the thumbs up!',
            'We are happy you found it helpful!',
        ];
    
        const negativeFeedbacks = [
            'Sorry to hear that. We will improve.',
            'Thanks for letting us know. We\'ll try harder!',
            'We apologize for the inconvenience.',
            'We are working on improving the experience.',
            'Your feedback helps us get better.',
        ];
    
        // 随机选择一条反馈语句
        const feedbackResponse = feedback
            ? positiveFeedbacks[Math.floor(Math.random() * positiveFeedbacks.length)]
            : negativeFeedbacks[Math.floor(Math.random() * negativeFeedbacks.length)];
    
        // 添加 isFeedback 标记
        setMessages((prevMessages) => [
            ...prevMessages,
            { id: uuidv4(), type: 'bot', message: feedbackResponse, isFeedback: true }
        ]);
    
        // 可选择性地将反馈发送到服务器
        sendFeedbackToServer(message.id, feedback).catch(error => {
            console.error('Failed to send feedback:', error);
        });
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

    const showChatHistoryForDate = (date) => {
        const messagesForDate = recentChatSessions[date] || [];

        const formattedMessages = messagesForDate.map(msg => ({
            ...msg,
            type: msg.sender === 'bot' ? 'bot' : 'user',
            isHtml: /<\/?[a-z][\s\S]*>/i.test(msg.message)
        }));

        setMessages(formattedMessages);
        setSelectedSessionId(date);
    };

    const handleSearchChange = (event) => {
        const searchTerm = event.target.value.trim();
        setSearchTerm(searchTerm);
        // Automatically clear filtered results when the search input is cleared
        setFilteredChatSessions([]);
        if (searchTerm === '') {
            setSearchSuggestion(null);

        } else {
            setSearchSuggestion(`Search for: "${searchTerm}"`);  // Create suggestion
        }
    };

    // Perform search on recentChatSessions
    const handleSearchClick = () => {
        const filteredSessions = {};

        if (searchTerm.trim() !== '') {
            Object.keys(recentChatSessions).forEach(date => {
                const filteredMessages = recentChatSessions[date].filter(message =>
                    message.message.toLowerCase().includes(searchTerm.toLowerCase())
                );
                if (filteredMessages.length > 0) {
                    filteredSessions[date] = filteredMessages;
                }
            });

            setFilteredChatSessions(filteredSessions);  // Store filtered results
        }
    };

    return (
        <>
            {drawerOpen && (
                <DrawerContainer>
                    <AppBar position="sticky" sx={{
                        backgroundColor: '#03035D',
                        boxShadow: 'none',
                        borderTopLeftRadius: '20px',
                        borderTopRightRadius: '20px',
                        height: '60px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: '0 16px',
                    }}>
                        <TextField
                            size="small"
                            variant="standard"
                            fullWidth
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search chat history..."
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
                        {searchTerm !== '' ? (
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
                        ) : (
                            Object.keys(recentChatSessions).map((date, index) => (
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
                            ))
                        )}
                    </List>

                    {Object.keys(filteredChatSessions).length > 0 && (
                        <List>
                            {Object.keys(filteredChatSessions).map((date, index) => (
                                filteredChatSessions[date].map((message, msgIndex) => (
                                    <ListItem key={`${date}-${msgIndex}`}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body1" sx={{ color: 'black' }}>
                                                {message.message}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'gray' }}>
                                                {new Date(message.timestamp).toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </ListItem>
                                ))
                            ))}
                        </List>
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

                                    {msg.type === 'bot' && !msg.isFeedback && index !== 0 && (
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
