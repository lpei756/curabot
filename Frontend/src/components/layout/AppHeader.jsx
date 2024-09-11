import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Badge from '@mui/material/Badge';
import Typography from '@mui/material/Typography';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import NotificationsIcon from '@mui/icons-material/Notifications';
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
import { AuthContext } from '../../context/AuthContext';
import { tokenStorage, adminTokenStorage, userDataStorage, adminDataStorage } from '../../utils/localStorage';
import { fetchUserNotifications } from '../../services/notificationService';

const BadgeStyled = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        borderRadius: '50%',
        top: 15,
        right: 15,
    },
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
    '&:focus': {
        outline: 'none',
    },
}));

const FRWIconButton = styled(IconButton)(({ theme }) => ({
    color: 'black',
    backgroundColor: 'transparent',
    transition: 'color 0.3s ease',
    outline: 'none',
    boxShadow: 'none',
    '&:hover': {
        color: '#03035d',
        backgroundColor: 'transparent',
        transform: 'scale(1.05)',
    },
    '&:focus': {
        outline: 'none',
        boxShadow: 'none',
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
    const [adminId, setAdminId] = useState('');
    const [userId, setUserId] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const { userId: contextUserId } = useContext(AuthContext);
    const navigate = useNavigate();
    const currentPort = window.location.port;

    useEffect(() => {
        const token = localStorage.getItem('token');
        const adminToken = localStorage.getItem('adminToken');
        const storedUserId = localStorage.getItem('userId');
        const storedAdminId = localStorage.getItem('adminId');
        const userLoginStatus = localStorage.getItem('isUserLoggedIn');
        const adminLoginStatus = localStorage.getItem('isAdminLoggedIn');

        if (token) {
            setIsUserLoggedIn(true);
        }
        if (adminToken) {
            setIsAdminLoggedIn(true);
        }
        if (storedUserId) {
            setUserId(storedUserId);
        }
        if (storedAdminId) {
            setAdminId(storedAdminId);
        }
        if (userLoginStatus === 'true') {
            setIsUserLoggedIn(true);
        }
        if (adminLoginStatus === 'true') {
            setIsAdminLoggedIn(true);
        }

    }, []);

    useEffect(() => {
        const fetchUnreadNotifications = async () => {
            try {
                const notifications = await fetchUserNotifications(contextUserId || userId);
                console.log('Fetched notifications:', notifications);
                const unreadNotifications = notifications.filter(notification => !notification.isRead);
                setUnreadCount(unreadNotifications.length);
            } catch (err) {
                console.error('Error fetching notifications:', err.message);
            }
        };
        if (contextUserId || userId) {
            fetchUnreadNotifications();
        }
    }, [contextUserId, userId]);

    const toggleUserLoginModal = () => setIsUserLoginOpen(!isUserLoginOpen);
    const toggleAdminLoginModal = () => setIsAdminLoginOpen(!isAdminLoginOpen);
    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

    const handleUserLoginSuccess = (id) => {
        setIsUserLoggedIn(true);
        setUserId(id);
        localStorage.setItem('userId', id);
        localStorage.setItem('isUserLoggedIn', 'true');
    };
    const handleAdminLoginSuccess = (id) => {
        setIsAdminLoggedIn(true);
        setAdminId(id);
        localStorage.setItem('adminId', id);
        console.log('Admin ID:', adminId);
        localStorage.setItem('isAdminLoggedIn', 'true');
    };

    const handleLogout = () => {
        tokenStorage.remove();
        userDataStorage.remove();
        adminTokenStorage.remove();
        adminDataStorage.remove();
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('adminId');
        localStorage.removeItem('isUserLoggedIn');
        localStorage.removeItem('isAdminLoggedIn');
        setIsUserLoggedIn(false);
        setIsAdminLoggedIn(false);
        setUserId('');
        setAdminId('');
        navigate('/');
    };

    const handleLogoClick = () => {
        if (isUserLoggedIn) {
            navigate('/dashboard');
        }
    };

    return (
        <>
            <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <FRWIconButton onClick={toggleDrawer}>
                            </FRWIconButton>
                            <Link to="/map">
                                <FRWIconButton>
                                    <MapRoundedIcon />
                                </FRWIconButton>
                            </Link>
                            <Link to="/notification">
                                <BadgeStyled badgeContent={unreadCount} color="error">
                                    <IconButton color="inherit">
                                        <FRWIconButton>
                                            <NotificationsIcon />
                                        </FRWIconButton>
                                    </IconButton>
                                </BadgeStyled>
                            </Link>
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
                                    cursor: 'pointer',
                                    '&:hover': {
                                        color: '#03035d',
                                        backgroundColor: 'transparent',
                                    },
                                }}
                                onClick={handleLogoClick}
                            >
                                <img src={logo} alt="FRW Healthcare Logo" style={{ height: 20, marginRight: 10 }} />
                                FRW Healthcare
                            </Typography>
                        </Box>
                        {isUserLoggedIn || isAdminLoggedIn ? (
                            <AnimatedButton variant="login" onClick={handleLogout}>
                                <span>Logout</span>
                            </AnimatedButton>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                {currentPort === '5174' || currentPort === '5175' ? null : (
                                    <Link to="/register">
                                        <AnimatedButton>
                                            <span>Register</span>
                                        </AnimatedButton>
                                    </Link>
                                )}
                                <AnimatedButton variant="login" onClick={currentPort === '5174' || currentPort === '5175' ? toggleAdminLoginModal : toggleUserLoginModal}>
                                    <span>{currentPort === '5174' || currentPort === '5175' ? 'Admin Login' : 'Login'}</span>
                                </AnimatedButton>
                            </Box>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>

            <LoginModal open={isUserLoginOpen} onClose={toggleUserLoginModal} onSuccess={handleUserLoginSuccess} />
            <AdminLoginModal open={isAdminLoginOpen} onClose={toggleAdminLoginModal} onSuccess={handleAdminLoginSuccess} />


        </>
    );
}

export default AppHeader;