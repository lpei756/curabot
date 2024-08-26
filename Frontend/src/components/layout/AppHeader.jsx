import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PropTypes from 'prop-types';

const MenuIconButton = styled('button')(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    border: `2px solid ${theme.palette.primary.main}`,
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
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');
        const adminLoginStatus = localStorage.getItem('isAdminLoggedIn');  // 从 localStorage 中读取管理员登录状态

        if (token) {
            setIsUserLoggedIn(true);
        }

        if (storedUserId) {
            setUserId(storedUserId);
        }

        if (adminLoginStatus === 'true') {
            setIsAdminLoggedIn(true);  // 如果管理员已登录，设置 isAdminLoggedIn 为 true
        }
    }, []);

    const toggleUserLoginModal = () => setIsUserLoginOpen(!isUserLoginOpen);
    const toggleAdminLoginModal = () => setIsAdminLoginOpen(!isAdminLoginOpen);
    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

    const handleUserLoginSuccess = () => setIsUserLoggedIn(true);
    const handleAdminLoginSuccess = () => {
        setIsAdminLoggedIn(true);
        localStorage.setItem('isAdminLoggedIn', 'true');  // 将管理员登录状态存储到 localStorage
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdminLoggedIn');  // 删除管理员登录状态
        setIsUserLoggedIn(false);
        setIsAdminLoggedIn(false);
    };

    // 如果admin已登录，不显示header内容
    if (isAdminLoggedIn) {
        return null;
    }

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

                        {isUserLoggedIn ? (
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
                        <UserOptionsList options={['Profile', 'Appointment']} userId={userId} />
                    ) : (
                        <Typography>Please login to see user information</Typography>
                    )}
                    {!isAdminLoggedIn && (
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
                            onClick={toggleAdminLoginModal}
                        >
                            <AdminPanelSettingsIcon sx={{ color: '#03035d' }} />
                            <Typography variant="body2" sx={{ color: '#03035d', textDecoration: 'underline' }}>
                                Admin Login
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Drawer>
        </>
    );
}

export default AppHeader;
