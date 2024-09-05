import { useState, useContext, useRef, useEffect, useCallback } from 'react';
import { useChatbot } from '../../context/ChatbotContext';
import { Box, IconButton, AppBar, Toolbar, Typography, TextField, Paper, Chip, Avatar, Menu, MenuItem, Drawer, List, ListItem, ListItemText } from '@mui/material';
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
    height: '800px',
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

function ChatBot({ }) {
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
    const [recentChatTimes, setRecentChatTimes] = useState([]);
    const [recentChatSessions, setRecentChatSessions] = useState([]);
    const [chatHistoriesFetched, setChatHistoriesFetched] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const scrollContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const { userId } = useContext(AuthContext);
    const [filteredChatSessions, setFilteredChatSessions] = useState([]);


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
                        const isHtml = /<\/?[a-z][\s\S]*>/i.test(msg.message); // Detect if message contains HTML tags
                        return {
                            ...msg,
                            type: msg.sender === 'bot' ? 'bot' : 'user',
                            isHtml: isHtml, // Mark if the message is HTML
                        };
                    });
                    setMessages(formattedMessages);
                } catch (error) {
                    console.error('Failed to fetch chat history:', error);
                    // Handle session expiration or error cases
                    if (error.response && error.response.status === 404) {
                        // Session not found or expired
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

                const userChatHistories = histories.map(history => ({
                    time: new Date(history.messages[0].timestamp).toLocaleString(),
                    id: history._id,
                }));

                setRecentChatTimes(userChatHistories.map(session => session.time));
                setRecentChatSessions(userChatHistories);

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

    const handleFeedback = async (index, feedback) => {
        const message = messages[index];
        if (!message.id) {
            console.error('Message ID is missing, cannot send feedback');
            return;
        }

        // 如果已经发送了反馈，则不再执行发送操作
        if (message.feedbackSent) {
            console.log('Feedback has already been sent for this message');
            return;  // 提前返回，阻止重复发送
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

    const showChatHistory = async (sessionId) => {
        try {
            // Fetch chat history by the selected sessionId
            const history = await fetchChatHistoryBySessionId(sessionId, authToken);
            const formattedMessages = history.messages.map((msg) => ({
                ...msg,
                type: msg.sender === 'bot' ? 'bot' : 'user',
                isHtml: /<\/?[a-z][\s\S]*>/i.test(msg.message),
            }));
            setMessages(formattedMessages);
            setSelectedSessionId(sessionId);
            setDrawerOpen(false);
        } catch (error) {
            console.error('Failed to fetch chat history:', error);
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredChatTimes = searchTerm
    ? recentChatTimes.filter(time =>
        time.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : recentChatTimes;

    return (
        <>
            {drawerOpen && (
                <DrawerContainer>
                    <AppBar position="static" sx={{
                        backgroundColor: '#03035D',
                        boxShadow: 'none',
                        borderTopLeftRadius: '20px',
                        borderTopRightRadius: '20px',
                        height: '60px',
                        zIndex: 9997,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: '0 16px',
                    }}>
                        <TextField
                            variant="standard"
                            placeholder="Search..."
                            fullWidth
                            value={searchTerm}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: <SearchRoundedIcon />,
                                disableUnderline: true,
                            }}
                            sx={{
                                bgcolor: 'white',
                                borderRadius: '5px',
                                marginLeft: '8px',
                                color: 'black',
                            }}
                        />
                    </AppBar>
                    <List>
                        {filteredChatTimes.map((time, index) => (
                            <ListItem key={index} onClick={() => showChatHistory(recentChatSessions[index].id)}>
                                <ListItemText primary={time} sx={{ color: 'black' }} />
                            </ListItem>
                        ))}
                    </List>
                </DrawerContainer>
            )}

            <Box
                className="chatbot-container"
                sx={{
                    width: '450px',
                    height: '800px',
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
                                <IconButton color="inherit" onClick={toggleDrawer}>
                                    <HistoryRoundedIcon />
                                </IconButton>
                            )}
                            <IconButton edge="end" color="inherit" onClick={toggleChatbot}>
                                <ClearRoundedIcon />
                            </IconButton>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Box flexGrow={1} p={2} overflow="auto" sx={{ backgroundColor: '#f5f5f5', zIndex: 9997 }}>
                    {messages.map((msg, index) => (
                        <Box
                            key={index}
                            display="flex"
                            mb={2}
                            alignItems="flex-start"
                            justifyContent={msg.type === 'bot' ? 'flex-start' : 'flex-end'}
                        >
                            {msg.type === 'bot' && (
                                <Avatar alt="Bot Avatar" src="icon.png" sx={{
                                    width: 45,
                                    height: 45
                                }} />
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
                    ))}
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
                    <div ref={messagesEndRef} />
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
