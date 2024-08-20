import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../../services/AdminService';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';

function AdminLogin({ onClose, onSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleAdminLogin = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        try {
            const data = await adminLogin(email, password);
            console.log('Admin login successful:', data);
            localStorage.setItem('adminToken', data.token);
            onSuccess();
            onClose();
        } catch (error) {
            setError('Admin login failed: ' + error.message);
        }
    };

    const handleRegisterRedirect = () => {
        onClose();
        navigate('/adminRegister');
    };

    return (
        <Box component="form" onSubmit={handleAdminLogin}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography id="admin-login-modal-title" variant="h6" component="h2" style={{ color: 'black', textAlign: 'center' }}>
                    Admin Login
                </Typography>
                <IconButton onClick={onClose}>
                    <ClearRoundedIcon />
                </IconButton>
            </Box>
            <TextField
                margin="normal"
                label="Admin Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin Email"
                required
            />
            <TextField
                margin="normal"
                label="Admin Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin Password"
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
                    cursor: 'pointer'
                }}
            >
                Admin Login
            </Button>
            <Box mt={2} textAlign="center">
                <Typography variant="body2">
                    Not registered?{' '}
                    <span onClick={handleRegisterRedirect} style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
                        Register here
                    </span>
                </Typography>
            </Box>
        </Box>
    );
}

AdminLogin.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
};

export default AdminLogin;
