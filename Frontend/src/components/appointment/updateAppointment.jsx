import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import { useParams, useNavigate } from 'react-router-dom';
import { readAppointment, updateAppointment } from '../../services/appointmentService';
import { getClinics } from '../../services/clinicService';
import { getDoctorsByClinic } from '../../services/doctorService';

const UpdateAppointment = () => {
    const { appointmentID } = useParams();
    const [formValues, setFormValues] = useState({
        dateTime: '',
        clinic: '',
        assignedGP: '',
    });

    const [clinics, setClinics] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAppointment = async () => {
            try {
                const appointment = await readAppointment(appointmentID);
                setFormValues({
                    dateTime: appointment.dateTime,
                    clinic: appointment.clinic,
                    assignedGP: appointment.assignedGP,
                });
            } catch (err) {
                setError('Failed to load appointment details.');
            }
        };

        fetchAppointment();
    }, [appointmentID]);

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

        const { dateTime, clinic, assignedGP } = formValues;

        if (!dateTime || !clinic || !assignedGP) {
            setError('All fields are required');
            return;
        }

        if (!clinics.some(c => c._id === clinic)) {
            setError('Selected clinic is not valid');
            return;
        }

        if (!doctors.some(d => d.doctorID === assignedGP)) {
            setError('Selected GP is not valid');
            return;
        }

        const appointmentData = {
            dateTime,
            clinic,
            assignedGP,
        };

        try {
            const result = await updateAppointment(appointmentID, appointmentData);
            console.log('Appointment Updated:', result);
            navigate('/appointment');
        } catch (error) {
            setError('Failed to update appointment.');
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 300, margin: '0 auto', marginTop: 10 }}
        >
            {error && <p style={{ color: 'red' }}>{error}</p>}
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
            <Button type="submit" variant="contained" style={{ backgroundColor: '#03035d' }}>
                Update Appointment
            </Button>
        </Box>
    );
};

export default UpdateAppointment;
