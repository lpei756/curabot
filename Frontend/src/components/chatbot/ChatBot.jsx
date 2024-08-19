import { useState, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import ImageUpload from '../image/ImageUpload';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { AuthContext } from '../../context/AuthContext';
import { sendChatMessage } from '../../services/chatService';
import "../../App.css";

function ChatBot({ toggleChatbot }) {
    const { authToken } = useContext(AuthContext);
    const [messages, setMessages] = useState([
        { type: 'bot', message: 'Kia Ora! My name is Cura. How can I assist you today?' }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const scrollContainerRef = useRef(null);

    const quickChats = [
        "How can I book a new appointment",
        "How do I cancel my appointment",
        "Change my appointment time",
        "When is my next appointment",
        "How do I check my insurance details",
        "How can I get my medical records",
    ];

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
                { type: 'bot', message: response.data.reply, isHtml: true }
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
        console.log('Uploaded Image:', uploadedImage); // 确认响应内容
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

    return (
        <>
            <Box
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
                    backgroundColor: '#f5f5f5',
                    zIndex: 9999,
                    flexDirection: 'column'
                }}
            >
                <AppBar position="static" sx={{
                    backgroundColor: '#03035D',
                    boxShadow: 'none',
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px',
                    height: '60px'
                }}>
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{
                            fontWeight: 'bold',
                            color: 'white',
                        }}>
                            Cura
                        </Typography>
                        <IconButton edge="end" color="inherit" onClick={toggleChatbot}>
                            <ClearRoundedIcon />
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
                            </Paper>
                            {msg.type === 'user' && (
                                <Avatar alt="User Avatar" sx={{ bgcolor: '#03035D', width: 40, height: 40 }} />
                            )}
                        </Box>
                    ))}
                    {isLoading && (
                        <Box display="flex" justifyContent="center" p={2}>
                            <Typography>Loading...</Typography>
                        </Box>
                    )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#CCCCDE', p: 1 }}>
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
                        <IconButton type="submit" color="primary" aria-label="send"
                                    sx={{
                                        bgcolor: inputValue.trim() !== '' ? '#03035D' : 'transparent',
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
