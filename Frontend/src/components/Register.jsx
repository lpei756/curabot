import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Select, MenuItem, Button, InputLabel, FormControl, Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { register } from '../services/authService';

const Register = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        ethnicity: '',
        address: '',
        phone: '',
        email: '',
        password: '',
        emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
        },
        medicalHistory: {
            chronicDiseases: '',
            pastSurgeries: '',
            familyMedicalHistory: '',
            medicationList: '',
            allergies: ''
        },
        insurance: {
            provider: '',
            policyNumber: ''
        },
    });

    const [error, setError] = useState(null);
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Handle nested fields
        const nameParts = name.split('.');
        if (nameParts.length > 1) {
            setFormData((prevData) => ({
                ...prevData,
                [nameParts[0]]: {
                    ...prevData[nameParts[0]],
                    [nameParts[1]]: value,
                },
            }));
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }

        // Password length check
        if (name === 'password') {
            if (value.length < 6) {
                setPasswordError('Password must be at least 6 characters long.');
            } else {
                setPasswordError('');
            }
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwordError) {
            return;
        }

        const convertedFormData = {
            ...formData,
            dateOfBirth: new Date(formData.dateOfBirth),
        };
        try {
            const data = await register(convertedFormData);
            console.log('Registered user:', data.user.firstName, data.user.lastName, data.user.email);
            navigate('/');
            if (onSuccess) {
                onSuccess(data.user);
            }
        } catch (err) {
            console.error('Error during registration:', err);
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: '600px', mx: 'auto', mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>Register</Typography>
            <TextField
                label="First Name"
                variant="standard"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Middle Name"
                variant="standard"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Last Name"
                variant="standard"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Date of Birth"
                variant="standard"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
            />
            <FormControl variant="standard" fullWidth margin="normal" required>
                <InputLabel>Gender</InputLabel>
                <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Non-binary">Non-binary</MenuItem>
                    <MenuItem value="FTM">FTM</MenuItem>
                    <MenuItem value="MTF">MTF</MenuItem>
                    <MenuItem value="Genderqueer">Genderqueer</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                    <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                </Select>
            </FormControl>
            <FormControl variant="standard" fullWidth margin="normal" required>
                <InputLabel>Blood Group</InputLabel>
                <Select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                >
                    <MenuItem value="A">A</MenuItem>
                    <MenuItem value="B">B</MenuItem>
                    <MenuItem value="AB">AB</MenuItem>
                    <MenuItem value="O">O</MenuItem>
                    <MenuItem value="N">N</MenuItem>
                </Select>
            </FormControl>
            <FormControl variant="standard" fullWidth margin="normal" required>
                <InputLabel>Ethnicity</InputLabel>
                <Select
                    name="ethnicity"
                    value={formData.ethnicity}
                    onChange={handleChange}
                >
                    <MenuItem value="European">European</MenuItem>
                    <MenuItem value="Māori">Māori</MenuItem>
                    <MenuItem value="Pacific Peoples">Pacific Peoples</MenuItem>
                    <MenuItem value="Asian">Asian</MenuItem>
                    <MenuItem value="MELAA">MELAA</MenuItem>
                    <MenuItem value="Other ethnicity">Other ethnicity</MenuItem>
                </Select>
            </FormControl>
            <TextField
                label="Address"
                variant="standard"
                name="address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Phone"
                variant="standard"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Email"
                variant="standard"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Password"
                variant="standard"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                error={!!passwordError}
                helperText={passwordError}
            />
            <TextField
                label="Emergency Contact Name"
                variant="standard"
                name="emergencyContact.name"
                value={formData.emergencyContact.name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Emergency Contact Phone"
                variant="standard"
                name="emergencyContact.phone"
                value={formData.emergencyContact.phone}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Emergency Contact Relationship"
                variant="standard"
                name="emergencyContact.relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Chronic Diseases"
                variant="standard"
                name="medicalHistory.chronicDiseases"
                placeholder="Enter details or type 'No'"
                value={formData.medicalHistory.chronicDiseases}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            /><TextField
                label="Past Surgeries"
                variant="standard"
                name="medicalHistory.pastSurgeries"
                placeholder="Enter details or type 'No'"
                value={formData.medicalHistory.pastSurgeries}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Family Medical History"
                variant="standard"
                name="medicalHistory.familyMedicalHistory"
                placeholder="Enter details or type 'No'"
                value={formData.medicalHistory.familyMedicalHistory}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            /><TextField
                label="Medication List"
                variant="standard"
                name="medicalHistory.medicationList"
                placeholder="Enter details or type 'No'"
                value={formData.medicalHistory.medicationList}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            /><TextField
                label="Allergies"
                variant="standard"
                name="medicalHistory.allergies"
                placeholder="Enter details or type 'No'"
                value={formData.medicalHistory.allergies}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            /><TextField
                label="Insurance Provider"
                variant="standard"
                name="insurance.provider"
                placeholder="Enter details or type 'No'"
                value={formData.insurance.provider}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Policy Number"
                variant="standard"
                name="insurance.policyNumber"
                value={formData.insurance.policyNumber}
                onChange={handleChange}
                fullWidth
                margin="normal"
            />
            <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
                Register
            </Button>
        </Box>
    );
};

Register.propTypes = {
    onSuccess: PropTypes.func,
};

export default Register;
