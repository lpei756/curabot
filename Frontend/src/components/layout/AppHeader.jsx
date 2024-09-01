import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import Container from '@mui/material/Container';
import { styled } from '@mui/material/styles';
import Login from '../auth/login/Login';
import AdminLogin from '../auth/login/AdminLogin';
import UserOptionsList from './Menu';
import Drawer from '@mui/material/Drawer';
import Modal from '@mui/material/Modal';
import '../../App.css';
import logo from '/logo.png';
import PropTypes from 'prop-types';
import { tokenStorage, userDataStorage } from '../../utils/localStorage';

const MenuIconButton = styled('button')(({ theme }) => ({
    backgroundColor: 'transparent',
    borderRadius: '50%',
    height: 30,
    width: 30,
    padding: 20,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const AnimatedButton = styled('button')(({ variant }) => ({
    background: variant === 'login' ? '#03035d' : 'transparent',
    border: '2px solid black',
    borderRadius: 20,
    boxShadow: 'none',
    color: variant === 'login' ? 'white' : 'black',
    height: 40,
    padding: '0 30px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
        background: variant === 'login' ? '#03035d' : 'rgba(0, 0, 0, 0.1)',
        transform: 'scale(1.05)',
        boxShadow: 'none',
        borderColor: 'black'
    },
}));

const LoginModal = ({ open, onClose, onSuccess }) => (
    <Modal open={open} onClose={onClose}>
        <Box
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
            }}
        >
            <Login onClose={onClose} onSuccess={onSuccess} />
        </Box>
    </Modal>
);

LoginModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
};

const AdminLoginModal = ({ open, onClose, onSuccess }) => (
    <Modal open={open} onClose={onClose}>
        <Box
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
            }}
        >
            <AdminLogin onClose={onClose} onSuccess={onSuccess} />
        </Box>
    </Modal>
);

AdminLoginModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
};

function AppHeader() {
    const [isUserLoginOpen, setIsUserLoginOpen] = useState(false);
    const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [userId, setUserId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');
        const userLoginStatus = localStorage.getItem('isUserLoggedIn');
        const adminLoginStatus = localStorage.getItem('isAdminLoggedIn');

        if (token) {
            setIsUserLoggedIn(true);
        }

        if (storedUserId) {
            setUserId(storedUserId);
        }
        if (userLoginStatus === 'true') {
            setIsUserLoggedIn(true);
        }
        if (adminLoginStatus === 'true') {
            setIsAdminLoggedIn(true);
        }
    }, []);

    const toggleUserLoginModal = () => setIsUserLoginOpen(!isUserLoginOpen);
    const toggleAdminLoginModal = () => setIsAdminLoginOpen(!isAdminLoginOpen);
    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

    const handleUserLoginSuccess = (id) => {
        setIsUserLoggedIn(true);
        setUserId(id);
        localStorage.setItem('userId', id);
        localStorage.setItem('isUserLoggedIn', 'true');
    };
    const handleAdminLoginSuccess = () => {
        setIsAdminLoggedIn(true);
        localStorage.setItem('isAdminLoggedIn', 'true');
    };

    const handleLogout = () => {
        tokenStorage.remove();
        userDataStorage.remove();

        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('isUserLoggedIn');
        localStorage.removeItem('isAdminLoggedIn');
        setIsUserLoggedIn(false);
        setIsAdminLoggedIn(false);
        setUserId('');
        navigate('/');
    };

    return (
        <>
            <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <MenuIconButton onClick={toggleDrawer}>
                                <MenuRoundedIcon sx={{ color: 'black' }} />
                            </MenuIconButton>
                            <Link to="/map">
                                <MenuIconButton>
                                    <MapRoundedIcon sx={{ color: 'black' }} />
                                </MenuIconButton>
                            </Link>
                            <Link to="/">
                                <Typography
                                    variant="h5"
                                    noWrap
                                    component="div"
                                    sx={{
                                        fontWeight: 'bold',
                                        color: 'black',
                                        textDecoration: 'none',
                                        letterSpacing: '.2rem',
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                                        position: 'absolute',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                    }}
                                >
                                    <img src={logo} alt="FRW Healthcare Logo" style={{ height: 20, marginRight: 10 }} />
                                    FRW Healthcare
                                </Typography>
                            </Link>
                        </Box>

                        {isUserLoggedIn || isAdminLoggedIn ? (
                            <AnimatedButton variant="login" onClick={handleLogout}>
                                <span>Logout</span>
                            </AnimatedButton>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Link to="/register">
                                    <AnimatedButton>
                                        <span>Register</span>
                                    </AnimatedButton>
                                </Link>
                                <AnimatedButton variant="login" onClick={toggleUserLoginModal}>
                                    <span>Login</span>
                                </AnimatedButton>
                            </Box>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>

            <LoginModal open={isUserLoginOpen} onClose={toggleUserLoginModal} onSuccess={handleUserLoginSuccess} />
            <AdminLoginModal open={isAdminLoginOpen} onClose={toggleAdminLoginModal} onSuccess={handleAdminLoginSuccess} />

            <Drawer anchor="left" open={isDrawerOpen} onClose={toggleDrawer}>
                <Box
                    sx={{ width: 250, padding: 2, height: '100%', position: 'relative' }}
                    role="presentation"
                    onClick={toggleDrawer}
                    onKeyDown={toggleDrawer}
                >
                    {isUserLoggedIn ? (
                        <UserOptionsList options={['Profile', 'Appointment', 'Notification']} userId={userId} />
                    ) : (
                        <Typography>Please login to see user information</Typography>
                    )}
                    {!isUserLoggedIn && !isAdminLoggedIn && (
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 16,
                                left: 16,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                cursor: 'pointer',
                            }}
                        >
                            <AnimatedButton variant="login" onClick={toggleAdminLoginModal}>
                                <span>Admin Login</span>
                            </AnimatedButton>
                        </Box>
                    )}
                </Box>
            </Drawer>
        </>
    );
}

export default AppHeader;
