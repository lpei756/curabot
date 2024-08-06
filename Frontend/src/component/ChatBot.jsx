import React, { useState } from 'react';
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
import "../App.css";

function ChatBot({ isOpen, toggleChatbot }) {
    const [messages, setMessage] = useState([
        { type: 'bot', message: 'Kia Ora! My name is Cura...' }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const nodeRef = React.useRef(null);

    const handleSend = (event) => {
        event.preventDefault();
        if (inputValue.trim() === '') return;
        setMessage((prevMessages) => [
            ...prevMessages,
            { type: 'user', message: inputValue }
        ]);
        setInputValue('');
    };

    return (
        <Paper elevation={6} className="chatbot-container" sx={{ width: '400px', height: '600px' }}>
            <Draggable nodeRef={nodeRef}>
                <Box className="chatbot-container" ref={nodeRef}>
                    <Box display="flex" flexDirection="column" height="100%">
                        <AppBar position="static" sx={{ 
                            backgroundColor: '#7AE0F2', 
                            boxShadow: 'none', 
                            borderTopLeftRadius: '20px', 
                            borderTopRightRadius: '20px',
                            height: '60px'
                        }}>
                            <Toolbar sx={{ justifyContent: 'space-between' }}>
                                <IconButton edge="start" color="inherit" sx={{ visibility: 'hidden' }}>
                                    <CloseIcon />
                                </IconButton>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                                    ChatBot
                                </Typography>
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
                                        <Avatar alt="Bot Avatar" src="/icon.png" sx={{ 
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
        </Paper>
    );
}

export default ChatBot;
