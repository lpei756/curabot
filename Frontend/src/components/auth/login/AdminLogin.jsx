import {useContext, useState} from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../../services/AdminService';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import {AdminContext} from "../../../context/AdminContext";

function AdminLogin({ onClose, onSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { login: authLogin } = useContext(AdminContext);

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        try {
            const data = await adminLogin(email, password);
            console.log('Admin login successful:', data);
            authLogin(data.token);
            onSuccess();
            onClose();

            if (data.admin.role === 'superadmin') {
                navigate('/superadmin/panel');
            } else {
                navigate('/admin/panel');
            }
            window.location.reload();
        } catch (error) {
            setError('Admin login failed: ' + error.message);
        }
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
                Login
            </Button>
        </Box>
    );
}

AdminLogin.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
};

export default AdminLogin;
