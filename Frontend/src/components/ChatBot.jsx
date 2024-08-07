import React, { useState, useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Draggable from 'react-draggable';
import Paper from '@mui/material/Paper';
import { AuthContext } from '../context/AuthContext';
import { sendChatMessage } from '../services/chatService';
import "../App.css";

function ChatBot({ isOpen, toggleChatbot }) {
    const { authToken } = useContext(AuthContext);
    const [messages, setMessages] = useState([
        { type: 'bot', message: 'Kia Ora! My name is Cura. How can I assist you today?' }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const nodeRef = React.useRef(null);

    const handleSend = async (event) => {
        event.preventDefault();
        if (inputValue.trim() === '') return;

        setMessages((prevMessages) => [
            ...prevMessages,
            { type: 'user', message: inputValue }
        ]);
        setInputValue('');
        setIsLoading(true);

        try {
            console.log('Auth Token:', authToken); // Debugging
            const response = await sendChatMessage(inputValue, authToken);

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

    return (
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
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
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
                                {msg.type === 'bot' ? (
                                    <Typography component="div" dangerouslySetInnerHTML={{ __html: msg.message }} />
                                ) : (
                                    <Typography>{msg.message}</Typography>
                                )}
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
                    <Paper component="form" onSubmit={handleSend} elevation={3} sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
                        <IconButton color="primary" aria-label="add">
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
                            <IconButton type="submit" color="primary" aria-label="send">
                                <SendRoundedIcon />
                            </IconButton>
                        )}
                    </Paper>
                </Box>
            </Box>
        </Draggable>
    );
}

export default ChatBot;
