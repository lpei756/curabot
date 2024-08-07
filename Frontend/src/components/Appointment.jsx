// components/Appointment.jsx

import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { useParams } from 'react-router-dom';
import { createAppointment, getAppointmentById, updateAppointment } from '../services/appointmentService';

const Appointment = () => {
    const { id: appointmentId } = useParams(); // Get appointment ID from route params if available
    const isUpdateMode = Boolean(appointmentId);

    const [formData, setFormData] = useState({
        dateTime: '',
        typeOfVisit: '',
        purposeOfVisit: '',
        clinic: '',
        assignedGP: '',
        notes: '',
        prescriptionsIssued: '',
    });

    useEffect(() => {
        if (isUpdateMode) {
            const fetchAppointment = async () => {
                try {
                    const appointment = await getAppointmentById(appointmentId);
                    setFormData(appointment);
                } catch (error) {
                    console.error('Failed to fetch appointment:', error);
                }
            };

            fetchAppointment();
        }
    }, [appointmentId, isUpdateMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isUpdateMode) {
                await updateAppointment(appointmentId, formData);
                alert('Appointment successfully updated!');
            } else {
                await createAppointment(formData);
                alert('Appointment successfully created!');
            }
            // Optionally, redirect to a different page after updating or creating
        } catch (error) {
            alert('Failed to save appointment');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <TextField
                name="dateTime"
                label="Date & Time"
                type="datetime-local"
                value={formData.dateTime}
                onChange={handleChange}
                InputLabelProps={{
                    shrink: true,
                }}
                fullWidth
                margin="normal"
            />
            <TextField
                name="typeOfVisit"
                label="Type of Visit"
                select
                value={formData.typeOfVisit}
                onChange={handleChange}
                fullWidth
                margin="normal"
            >
                <MenuItem value="Consultation">Consultation</MenuItem>
                <MenuItem value="Follow-up">Follow-up</MenuItem>
                <MenuItem value="Urgent">Urgent</MenuItem>
            </TextField>
            <TextField
                name="purposeOfVisit"
                label="Purpose of Visit"
                value={formData.purposeOfVisit}
                onChange={handleChange}
                fullWidth
                margin="normal"
            />
            <TextField
                name="clinic"
                label="Clinic"
                value={formData.clinic}
                onChange={handleChange}
                fullWidth
                margin="normal"
            />
            <TextField
                name="assignedGP"
                label="Assigned GP"
                value={formData.assignedGP}
                onChange={handleChange}
                fullWidth
                margin="normal"
            />
            <TextField
                name="notes"
                label="Notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
                margin="normal"
            />
            <TextField
                name="prescriptionsIssued"
                label="Prescriptions Issued"
                value={formData.prescriptionsIssued}
                onChange={handleChange}
                fullWidth
                margin="normal"
            />
            <Button type="submit" variant="contained" color="primary">
                {isUpdateMode ? 'Update Appointment' : 'Create Appointment'}
            </Button>
        </form>
    );
};

export default Appointment;