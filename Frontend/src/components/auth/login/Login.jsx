import { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { login } from '../../../services/authService';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { AuthContext } from "../../../context/AuthContext";

function Login({ onClose, onSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login: authLogin } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const data = await login(email, password);
            console.log('Login successful:', data);
            authLogin(data.token);
            onSuccess();
            onClose();
            navigate('/dashboard'); // Navigate to /dashboard after login
        } catch (error) {
            setError('Login failed: ' + error.message);
        }
    };

    return (
        <Box component="form" onSubmit={handleLogin}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography id="login-modal-title" variant="h6" component="h2" style={{ color: 'black', textAlign: 'center' }}>
                    Login
                </Typography>
                <IconButton onClick={onClose} sx={{
                    '&:focus': {
                        outline: 'none',
                    },
                }}>
                    <ClearRoundedIcon />
                </IconButton>
            </Box>
            <TextField
                margin="normal"
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />
            <TextField
                margin="normal"
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
            />
            {error && <Typography color="error">{error}</Typography>}
            <Button
                variant="contained"
                type="submit"
                style={{
                    backgroundColor: '#03035d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    '&:focus': {
                        outline: 'none',
                    },
                }}
            >
                Login
            </Button>
        </Box>
    );
}

Login.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
};

export default Login;
