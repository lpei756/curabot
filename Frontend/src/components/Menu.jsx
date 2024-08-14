import { useState } from 'react';
import PropTypes from 'prop-types';
import { List, ListItem, ListItemText } from '@mui/material';
import ReadUser from './ReadUser.jsx';
import Appointment from './createAppointment';

const UserOptionsList = ({ options, userId }) => {
    const [selectedOption, setSelectedOption] = useState(null);

    const handleOptionClick = (option) => {
        if (option === 'Profile') {
            window.location.href = 'http://localhost:5173/user';
        } else if (option === 'Appointment') {
            window.location.href = 'http://localhost:5173/appointment';
        } else {
            setSelectedOption(option);
        }
    };

    return (
        <>
            <List>
                {options.map((option, index) => (
                    <ListItem button key={index} onClick={() => handleOptionClick(option)}>
                        <ListItemText primary={option} />
                    </ListItem>
                ))}
            </List>

            {selectedOption === 'Profile' && <ReadUser userId={userId} />}
            {selectedOption === 'Appointment' && <Appointment userId={userId} />}
        </>
    );
};

UserOptionsList.propTypes = {
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    userId: PropTypes.string.isRequired,
};

export default UserOptionsList;
