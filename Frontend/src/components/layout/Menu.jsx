import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { List, ListItem, ListItemText, Badge } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { fetchUserNotifications } from '../../services/notificationService';
import ReadUser from '../user/ReadUser';
import AppointmentList from '../appointment/AppointmentList';
import Notification from '../user/Notification';

const UserOptionsList = ({ options }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const { userId } = useContext(AuthContext);

    useEffect(() => {
        const fetchUnreadNotifications = async () => {
            try {
                const notifications = await fetchUserNotifications(userId);
                console.log('Fetched notifications:', notifications);
                const unreadNotifications = notifications.filter(notification => !notification.isRead);
                setUnreadCount(unreadNotifications.length);
            } catch (err) {
                console.error('Error fetching notifications:', err.message);
            }
        };
        if (userId) {
            fetchUnreadNotifications();
        }
    }, [userId]);

    const handleOptionClick = (option) => {
        if (option === 'Profile') {
            navigate('/user');
        } else if (option === 'Appointment') {
            navigate('/appointment');
        } else if (option === 'Notification') {
            navigate('/notification');
        } else {
            setSelectedOption(option);
        }
    };

    return (
        <>
            <List>
                {options.map((option, index) => (
                    <ListItem
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        sx={{
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: '#f0f0f0',
                                color: '#03035d',
                                transition: 'background-color 0.3s, color 0.3s',
                            },
                        }}
                    >
                        <ListItemText
                            primary={
                                option === 'Notification' ? (
                                    <Badge
                                        badgeContent={unreadCount}
                                        color="primary"
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                backgroundColor: '#03035d',
                                                color: 'white',
                                            },
                                        }}
                                    >
                                        {option}
                                    </Badge>
                                ) : (
                                    option
                                )
                            }
                        />
                    </ListItem>
                ))}
            </List>

            {selectedOption === 'Profile' && <ReadUser userId={userId} />}
            {selectedOption === 'Appointment' && <AppointmentList userId={userId} />}
            {selectedOption === 'Notification' && <Notification userId={userId} />}
        </>
    );
};

UserOptionsList.propTypes = {
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default UserOptionsList;
