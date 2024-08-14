import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createAppointment } from '../../services/appointmentService';
import { getClinics } from '../../services/clinicService';
import { getDoctorsByClinic } from '../../services/doctorService';

const AppointmentForm = () => {
    const [formValues, setFormValues] = useState({
        dateTime: '',
        typeOfVisit: '',
        purposeOfVisit: '',
        clinic: '',
        assignedGP: '',
    });

    const [clinics, setClinics] = useState([]);
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        const fetchClinics = async () => {
            try {
                const clinicsData = await getClinics();
                setClinics(clinicsData);
            } catch (error) {
                console.error('Error fetching clinics:', error.message);
            }
        };

        fetchClinics();
    }, []);

    useEffect(() => {
        if (formValues.clinic) {
            const fetchDoctors = async () => {
                try {
                    const doctorsData = await getDoctorsByClinic(formValues.clinic);
                    console.log('Doctors data:', doctorsData);
                    setDoctors(doctorsData);
                } catch (error) {
                    console.error('Error fetching doctors:', error.message);
                    setDoctors([]);
                }
            };

            fetchDoctors();
        } else {
            setDoctors([]);
        }
    }, [formValues.clinic]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { dateTime, typeOfVisit, purposeOfVisit, clinic, assignedGP } = formValues;

        if (!dateTime || !typeOfVisit || !purposeOfVisit || !clinic || !assignedGP) {
            console.error('All fields are required');
            return;
        }

        if (!clinics.some(c => c._id === clinic)) {
            console.error('Selected clinic is not valid');
            return;
        }

        if (!doctors.some(d => d.doctorID === assignedGP)) {
            console.error('Selected GP is not valid');
            return;
        }

        const appointmentData = {
            dateTime,
            typeOfVisit,
            purposeOfVisit,
            clinic,
            assignedGP,
        };

        console.log('Submitting Appointment Data:', appointmentData);

        try {
            const result = await createAppointment(appointmentData);
            console.log('Appointment Created:', result);
        } catch (error) {
            console.error('Error saving appointment:', error.response ? error.response.data : error.message);
        }
    };

    const handleCreateClick = () => {
        window.location.href = 'http://localhost:5173/appointment';
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 600, margin: '0 auto', marginTop: 10 }}>
            <Typography variant="h4" align="center" gutterBottom>
            Make an Appointment
        </Typography>
        <Typography variant="h5" align="center" gutterBottom>
            It's Quick an Easy.
        </Typography>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 400, margin: '0 auto' }}
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
                    select
                    label="Choose Clinic"
                    name="clinic"
                    value={formValues.clinic}
                    onChange={handleInputChange}
                >
                    <MenuItem value="">Select Clinic</MenuItem>
                    {clinics.map((clinic) => (
                        <MenuItem key={clinic._id} value={clinic._id}>
                            {clinic.name}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    label="Choose GP"
                    name="assignedGP"
                    value={formValues.assignedGP}
                    onChange={handleInputChange}
                >
                    <MenuItem value="">Select GP</MenuItem>
                    {doctors.map((doctor) => (
                        <MenuItem key={doctor.doctorID} value={doctor.doctorID}>
                            {doctor.firstName} {doctor.lastName}
                        </MenuItem>
                    ))}
                </TextField>
                <Button type="submit" variant="contained" onClick={handleCreateClick} style={{ backgroundColor: '#03035d' }}>
                    Create Appointment
                </Button>
            </Box>
        </Box>
    );
};

export default AppointmentForm;
