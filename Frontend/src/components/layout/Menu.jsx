import { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { List, ListItem, ListItemText } from '@mui/material';
import ReadUser from '../user/ReadUser.jsx';
import Notification from '../user/Notification.jsx';
import AppointmentList from '../appointment/AppointmentList.jsx';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const UserOptionsList = ({ options }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const navigate = useNavigate();
    const { userId } = useContext(AuthContext);

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
                    <ListItem key={index} onClick={() => handleOptionClick(option)}>
                        <ListItemText primary={option} />
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
