import React, { useEffect, useState, useContext } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchAdminNotifications } from '../../services/NotificationService';
import { AdminContext } from '../../context/AdminContext';
import logo from '/logo.png';
import GroupsIcon from '@mui/icons-material/Groups';
import ArticleIcon from '@mui/icons-material/Article';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import { tokenStorage, adminTokenStorage, userDataStorage, adminDataStorage } from '../../utils/localStorage';

const AdminHeader = () => {
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const { adminId } = useContext(AdminContext);
    const port = window.location.port;

    useEffect(() => {
        const fetchUnreadNotifications = async () => {
            try {
                const notifications = await fetchAdminNotifications(adminId);
                const unreadNotifications = notifications.filter(notification => !notification.isRead);
                setUnreadCount(unreadNotifications.length);
            } catch (err) {
                console.error('Error fetching notifications:', err.message);
            }
        };

        if (adminId) {
            fetchUnreadNotifications();
        }
    }, [adminId]);

    const handleNavigation = (path) => {
        navigate(path);
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
        navigate('/');
    };

    return (
        <Box
            sx={{
                width: '250px',
                height: '100vh',
                backgroundColor: '#fff',
                color: 'black',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'fixed',
                top: 0,
                left: 0,
                paddingTop: '20px',
                paddingLeft: '10px',
                paddingBottom: '20px'
            }}
        >
            <Box>
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{
                        fontWeight: 'bold',
                        color: 'black',
                        textDecoration: 'none',
                        letterSpacing: '.2rem',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <img src={logo} alt="FRW Healthcare Logo" style={{ height: 20, marginRight: 10 }} />
                    FRW Healthcare
                </Typography>
                {port === '5174' ? (
                    <Box>
                        <Button
                            color="inherit"
                            onClick={() => handleNavigation('/admin/panel')}
                            sx={{ justifyContent: 'flex-start', color: 'black', display: 'block', marginBottom: '10px' }}
                        >
                            <GroupsIcon sx={{ marginRight: '8px' }} />
                            Patients
                        </Button>
                        <Button
                            color="inherit"
                            onClick={() => handleNavigation('/admin/panel/test-result')}
                            sx={{ justifyContent: 'flex-start', color: 'black', display: 'block', marginBottom: '10px' }}
                        >
                            <ArticleIcon sx={{ marginRight: '8px' }} />
                            Test Results
                        </Button>
                        <Button
                            color="inherit"
                            onClick={() => handleNavigation('/admin/panel/adminnotification')}
                            sx={{ justifyContent: 'flex-start', color: 'black', display: 'block', marginBottom: '10px' }}
                        >
                            <NotificationsIcon sx={{ marginRight: '8px' }} />
                            Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
                        </Button>
                    </Box>
                ) : port === '5175' ? (
                    <Box>
                        <Button
                            color="inherit"
                            onClick={() => handleNavigation('/admin/clinic-stuff')}
                            sx={{ justifyContent: 'flex-start', color: 'black', display: 'block', marginBottom: '10px' }}
                        >
                            Clinic Stuff
                        </Button>
                        <Button
                            color="inherit"
                            onClick={() => handleNavigation('/admin/ai-performance')}
                            sx={{ justifyContent: 'flex-start', color: 'black', display: 'block', marginBottom: '10px' }}
                        >
                            AI Performance
                        </Button>
                    </Box>
                ) : null}
            </Box>

            {/* Logout Button */}
            <Box sx={{ marginTop: 'auto', paddingBottom: '20px' }}>
                <Button
                    color="inherit"
                    onClick={handleLogout}
                    sx={{ justifyContent: 'flex-start', color: 'black', display: 'block' }}
                >
                    <LogoutIcon sx={{ marginRight: '8px' }} />
                    Logout
                </Button>
            </Box>
        </Box>
    );
};

export default AdminHeader;
