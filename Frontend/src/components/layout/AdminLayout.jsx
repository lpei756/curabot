import { Box, Button } from '@mui/material';
import { Groups as GroupsIcon, Article as ArticleIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import { Outlet, useNavigate } from 'react-router-dom';
import {useContext, useEffect, useState} from 'react';
import {fetchAdminNotifications} from "../../services/NotificationService.js";
import {AdminContext} from "../../context/AdminContext.jsx";

const AdminLayout = () => {
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const { adminId } = useContext(AdminContext);

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

    return (
        <Box sx={{ display: 'flex' }}>
            {/* Sidebar */}
            <Box sx={{
                position: 'fixed',
                left: 0,
                top: 0,
                height: '100vh',
                width: '250px',
                backgroundColor: '#f5f5f5',
                padding: 2,
                boxShadow: '2px 0px 5px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
            }}>
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

            <Box sx={{ padding: 4, marginLeft: '250px', flex: 1 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout;
