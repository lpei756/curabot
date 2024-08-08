import { useState } from 'react';
import PropTypes from 'prop-types';
import { List, ListItem, ListItemText } from '@mui/material';
import ReadUser from './ReadUser.jsx';
import UpdateUser from './UpdateUser.jsx';
import Appointment from './Appointment';

const UserOptionsList = ({ options, userId }) => {
    const [selectedOption, setSelectedOption] = useState(null);

    const handleOptionClick = (option) => {
        setSelectedOption(option);
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
            {selectedOption === 'Setting' && <UpdateUser userId={userId} />}
            {selectedOption === 'Appointment' && <Appointment userId={userId} />}
        </>
    );
};

UserOptionsList.propTypes = {
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    userId: PropTypes.string.isRequired,
};

export default UserOptionsList;
