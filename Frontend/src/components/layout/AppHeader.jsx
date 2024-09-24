import { useState, useEffect, useContext } from 'react';
import {
    AppBar,
    Container,
    Toolbar,
    Box,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Badge,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { styled } from '@mui/material/styles';
import Login from '../auth/login/Login';
import AdminLogin from '../auth/login/AdminLogin';
import Modal from '@mui/material/Modal';
import '../../App.css';
import logo from '/logo.png';
import PropTypes from 'prop-types';
import { AuthContext } from '../../context/AuthContext.jsx';
import { tokenStorage, adminTokenStorage, userDataStorage, adminDataStorage } from '../../utils/localStorage.js';
import { fetchUserNotifications } from '../../services/NotificationService.js';

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
    const [adminId, setAdminId] = useState('');
    const [userId, setUserId] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const { userId: contextUserId } = useContext(AuthContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [dropdownEl, setDropdownEl] = useState(null); 
    const navigate = useNavigate();
    const currentPort = window.location.port;
    const theme = useTheme();
    const isXsOrSm = useMediaQuery(theme.breakpoints.down('md'));

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

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDropdownClick = (event) => {
        setDropdownEl(event.currentTarget);
    };

    const handleDropdownClose = () => {
        setDropdownEl(null);
    };

    const toggleUserLoginModal = () => setIsUserLoginOpen(!isUserLoginOpen);
    const toggleAdminLoginModal = () => setIsAdminLoginOpen(!isAdminLoginOpen);
    
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
                        {isXsOrSm ? (
                            <>
                                <FRWIconButton onClick={handleDropdownClick}>
                                    <MenuIcon />
                                </FRWIconButton>
                                <Menu
                                    anchorEl={dropdownEl}
                                    open={Boolean(dropdownEl)}
                                    onClose={handleDropdownClose}
                                >
                                    <MenuItem onClick={handleDropdownClose}>
                                        <Link to="/map">
                                            <FRWIconButton>
                                                <MapRoundedIcon />
                                            </FRWIconButton>
                                            Map
                                        </Link>
                                    </MenuItem>
                                    <MenuItem onClick={handleDropdownClose}>
                                        <Link to="/notification">
                                            <BadgeStyled badgeContent={unreadCount} color="error">
                                                <FRWIconButton>
                                                    <NotificationsIcon />
                                                </FRWIconButton>
                                            </BadgeStyled>
                                            Notifications
                                        </Link>
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Link to="/map">
                                    <FRWIconButton>
                                        <MapRoundedIcon />
                                    </FRWIconButton>
                                </Link>
                                <Link to="/notification">
                                    <BadgeStyled badgeContent={unreadCount} color="error">
                                        <FRWIconButton>
                                            <NotificationsIcon />
                                        </FRWIconButton>
                                    </BadgeStyled>
                                </Link>
                            </Box>
                        )}
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
                                    fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.5rem', lg: '1.5rem' },
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
                        {isXsOrSm ? (
                            <Box sx={{ display: { xs: 'flex', sm: 'flex' } }}>
                                <FRWIconButton onClick={handleMenuClick}>
                                    <AccountCircleIcon />
                                </FRWIconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                >
                                    {isUserLoggedIn || isAdminLoggedIn ? (
                                        <MenuItem onClick={handleLogout}>
                                            Logout
                                        </MenuItem>
                                    ) : (
                                        <Box>
                                            <MenuItem onClick={handleMenuClose}>
                                                <Link to="/register">
                                                    Register
                                                </Link>
                                            </MenuItem>
                                            <MenuItem onClick={handleMenuClose}>
                                                <span onClick={currentPort === '5174' || currentPort === '5175' ? toggleAdminLoginModal : toggleUserLoginModal}>
                                                    {currentPort === '5174' || currentPort === '5175' ? 'Admin Login' : 'Login'}
                                                </span>
                                            </MenuItem>
                                        </Box>
                                    )}
                                </Menu>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                {isUserLoggedIn || isAdminLoggedIn ? (
                                    <AnimatedButton variant="login" onClick={handleLogout}>
                                        <span>Logout</span>
                                    </AnimatedButton>
                                ) : (
                                    <>
                                        {currentPort === '5174' || currentPort === '5175' ? null : (
                                            <Link to="/register">
                                                <AnimatedButton>
                                                    <span>Register</span>
                                                </AnimatedButton>
                                            </Link>
                                        )}
                                        <AnimatedButton
                                            variant="login"
                                            onClick={currentPort === '5174' || currentPort === '5175' ? toggleAdminLoginModal : toggleUserLoginModal}
                                        >
                                            <span>{currentPort === '5174' || currentPort === '5175' ? 'Admin Login' : 'Login'}</span>
                                        </AnimatedButton>
                                    </>
                                )}
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
