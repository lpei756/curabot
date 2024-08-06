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
import "../App.css";

function ChatBot({ isOpen, toggleChatbot }) {
    const [messages, setMessage] = useState([
        { type: 'bot', message: 'Kia Ora! My name is Cura...' }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = (event) => {
        event.preventDefault();
        if (inputValue.trim() === '') return;
        setMessage((prevMessages) => [
            ...prevMessages,
            { type: 'user', message: inputValue }
        ]);
        setInputValue('');
    }

    return (
        <Box className="chatbot-container">
            <Box display="flex" flexDirection="column" height="100%">
                <AppBar position="static" color="primary">
                    <Toolbar>
                        <Typography variant="h6" style={{ flexGrow: 1 }}>
                            Cura
                        </Typography>
                        <IconButton edge="end" color="inherit" onClick={toggleChatbot} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Box flexGrow={1} p={2} overflow="auto">
                    {messages.map((msg, index) => (
                        <Box
                            key={index}
                            display="flex"
                            mb={2}
                            alignItems="flex-start"
                            justifyContent={msg.type === 'bot' ? 'flex-start' : 'flex-end'}
                        >
                            {msg.type === 'bot' && (
                                <Avatar alt="Bot Avatar" src="../assets/react.svg" />
                            )}
                            <Box
                                ml={msg.type === 'bot' ? 2 : 0}
                                mr={msg.type === 'user' ? 2 : 0}
                                bgcolor={msg.type === 'bot' ? 'grey.300' : 'grey.300'}
                                p={2}
                                borderRadius={4}
                                maxWidth="70%"
                            >
                                <Typography>{msg.message}</Typography>
                            </Box>
                            {msg.type === 'user' && (
                                <Avatar alt="User Avatar" src="../assets/user.svg" />
                            )}
                        </Box>
                    ))}
                </Box>
                <AppBar position="static" color="primary">
                    <Toolbar component="form" onSubmit={handleSend}>
                        <IconButton edge="start" color="inherit" aria-label="add">
                            <AttachFileRoundedIcon />
                        </IconButton>
                        <TextField
                            variant="outlined"
                            placeholder="Type a message..."
                            fullWidth
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            style={{ marginRight: 16, marginLeft: 16 }}
                        />
                        {inputValue.trim() !== '' && (
                            <IconButton type="submit" color="inherit" aria-label="send">
                                <SendRoundedIcon />
                            </IconButton>
                        )}
                    </Toolbar>
                </AppBar>
            </Box>
        </Box>
    );
}

export default ChatBot;