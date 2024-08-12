import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import { createAppointment } from '../services/appointmentService';

const AppointmentForm = () => {
    const [formValues, setFormValues] = useState({
        dateTime: '',
        typeOfVisit: '',
        purposeOfVisit: '',
        clinic: '',
        assignedGP: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const createdAppointment = await createAppointment(formValues);
            console.log('Appointment created:', createdAppointment);
        } catch (error) {
            console.error('Error saving appointment:', error.message);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 300, margin: '0 auto' }}
        >
            <TextField
                label="Date & Time"
                type="datetime-local"
                name="dateTime"
                value={formValues.dateTime}
                onChange={handleInputChange}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            <TextField
                select
                label="Type of Visit"
                name="typeOfVisit"
                value={formValues.typeOfVisit}
                onChange={handleInputChange}
            >
                <MenuItem value="">Select Type of Visit</MenuItem>
                <MenuItem value="Consultation">Consultation</MenuItem>
                <MenuItem value="Follow-up">Follow-up</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
            </TextField>
            <TextField
                label="Purpose of Visit"
                type="text"
                name="purposeOfVisit"
                value={formValues.purposeOfVisit}
                onChange={handleInputChange}
            />
            <TextField
                label="Clinic ID"
                type="text"
                name="clinic"
                value={formValues.clinic}
                onChange={handleInputChange}
            />
            <TextField
                label="Assigned GP"
                type="text"
                name="assignedGP"
                value={formValues.assignedGP}
                onChange={handleInputChange}
            />
            <Button type="submit" variant="contained" color="primary">
                Create Appointment
            </Button>
        </Box>
    );
};

export default AppointmentForm;
