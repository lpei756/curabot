import React, { useState, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Draggable from 'react-draggable';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import ImageUpload from './ImageUpload';
import { AuthContext } from '../context/AuthContext';
import { sendChatMessage } from '../services/chatService';
import "../App.css";

function ChatBot({ toggleChatbot }) {  // 删除 isOpen 参数，如果不需要的话
    const { authToken } = useContext(AuthContext);
    const [messages, setMessages] = useState([
        { type: 'bot', message: 'Kia Ora! My name is Cura. How can I assist you today?' }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
    const nodeRef = React.useRef(null);

    const quickChats = [
        "How to deposit",
        "How to open an account",
        "Agent service",
        "Trading hours",
        "Fee structure",
        "Account security"
    ];

    const scrollContainerRef = useRef(null);

    const scroll = (scrollOffset) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: scrollOffset,
                behavior: 'smooth'
            });
        }
    };

    const handleSend = async (event, quickMessage = null) => {
        if (event) event.preventDefault();
        const messageToSend = quickMessage || inputValue;
        if (messageToSend.trim() === '') return;

        setMessages((prevMessages) => [
            ...prevMessages,
            { type: 'user', message: messageToSend }
        ]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await sendChatMessage(messageToSend, authToken);
            setMessages((prevMessages) => [
                ...prevMessages,
                { type: 'bot', message: response.data.reply }
            ]);
        } catch (error) {
            console.error('Error:', error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { type: 'bot', message: 'Sorry, something went wrong. Please try again.' }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickChat = (message) => {
        handleSend(null, message);
    };

    const handleImageUpload = (uploadedImage) => {
        // 处理上传的图片，例如在消息中显示图片链接或更新UI
        console.log('Uploaded image:', uploadedImage);
    };

    return (
        <>
            <Draggable nodeRef={nodeRef}>
                <Box
                    ref={nodeRef}
                    className="chatbot-container"
                    sx={{
                        width: '400px',
                        height: '600px',
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                        backgroundColor: '#f5f5f5'
                    }}
                >
                    <Box display="flex" flexDirection="column" height="100%">
                        <AppBar position="static" sx={{
                            backgroundColor: '#7AE0F2',
                            boxShadow: 'none',
                            borderTopLeftRadius: '20px',
                            borderTopRightRadius: '20px',
                            height: '60px'
                        }}>
                            <Toolbar sx={{ justifyContent: 'space-between', position: 'relative' }}>
                                <Box sx={{ flex: 1 }} />
                                <Typography variant="h6" sx={{
                                    fontWeight: 'bold',
                                    color: 'white',
                                    position: 'absolute',
                                    left: '50%',
                                    transform: 'translateX(-50%)'
                                }}>
                                    Cura
                                </Typography>
                                <IconButton edge="end" color="inherit" onClick={toggleChatbot} sx={{ zIndex: 1 }}>
                                    <CloseIcon />
                                </IconButton>
                            </Toolbar>
                        </AppBar>

                        <Box flexGrow={1} p={2} overflow="auto" sx={{ backgroundColor: '#f5f5f5' }}>
                            {messages.map((msg, index) => (
                                <Box
                                    key={index}
                                    display="flex"
                                    mb={2}
                                    alignItems="flex-start"
                                    justifyContent={msg.type === 'bot' ? 'flex-start' : 'flex-end'}
                                >
                                    {msg.type === 'bot' && (
                                        <Avatar alt="Bot Avatar" src="/public/icon.png" sx={{
                                            width: 40,
                                            height: 40,
                                            bgcolor: '#5BC0DE',
                                            '& .MuiAvatar-img': {
                                                objectFit: 'cover',
                                                width: '100%',
                                                height: '100%',
                                                p: 0.5,
                                            }
                                        }} />
                                    )}
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            ml: msg.type === 'bot' ? 2 : 0,
                                            mr: msg.type === 'user' ? 2 : 0,
                                            bgcolor: msg.type === 'bot' ? '#f0f0f0' : '#5BC0DE',
                                            color: msg.type === 'bot' ? '#333' : 'white',
                                            p: 2,
                                            borderRadius: 3,
                                            maxWidth: "75%",
                                        }}
                                    >
                                        <Typography>{msg.message}</Typography>
                                    </Paper>
                                    {msg.type === 'user' && (
                                        <Avatar alt="User Avatar" sx={{ bgcolor: '#7AE0F2', width: 40, height: 40 }} />
                                    )}
                                </Box>
                            ))}
                            {isLoading && (
                                <Box display="flex" justifyContent="center" p={2}>
                                    <Typography>Loading...</Typography>
                                </Box>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#e0f7fa', p: 1 }}>
                            <IconButton onClick={() => scroll(-100)} size="small">
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
                                            bgcolor: '#7AE0F2',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: '#5BC0DE',
                                            },
                                            transition: 'all 0.3s ease',
                                        }}
                                    />
                                ))}
                            </Box>
                            <IconButton onClick={() => scroll(100)} size="small">
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
                                <IconButton type="submit" color="primary" aria-label="send" disabled={inputValue.trim() === ''}
                                            sx={{
                                                bgcolor: inputValue.trim() !== '' ? '#7AE0F2' : 'transparent',
                                                color: inputValue.trim() !== '' ? 'white' : 'inherit',
                                                '&:hover': {
                                                    bgcolor: inputValue.trim() !== '' ? '#5BC0DE' : 'transparent',
                                                },
                                                transition: 'all 0.3s ease',
                                            }}>
                                    <SendRoundedIcon />
                                </IconButton>
                            )}
                        </Paper>
                    </Box>
                </Box>
            </Draggable>

            <ImageUpload
                open={isImageUploadOpen}
                onClose={() => setIsImageUploadOpen(false)}
                onImageUploaded={handleImageUpload}
            />
        </>
    );
}

ChatBot.propTypes = {
    toggleChatbot: PropTypes.func.isRequired,
};

export default ChatBot;
