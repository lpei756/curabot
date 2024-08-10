import { useState } from 'react';
import { TextField, Select, MenuItem, Button, InputLabel, FormControl, Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const Register = ({ onClose }) => {
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
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelationship: '',
        chronicDiseases: '',
        pastSurgeries: '',
        familyMedicalHistory: '',
        medicationList: '',
        allergies: '',
        gp: '',
        insuranceProvider: '',
        policyNumber: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Data:', formData);
        onClose();
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
            />
            <TextField
                label="Emergency Contact Name"
                variant="standard"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Emergency Contact Phone"
                variant="standard"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <TextField
                label="Emergency Contact Relationship"
                variant="standard"
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
            />
            <FormControl variant="standard" fullWidth margin="normal" required>
                <InputLabel>Chronic Diseases</InputLabel>
                <Select
                    name="chronicDiseases"
                    value={formData.chronicDiseases}
                    onChange={handleChange}
                >
                    <MenuItem value="No">No</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                </Select>
            </FormControl>
            <FormControl variant="standard" fullWidth margin="normal" required>
                <InputLabel>Past Surgeries</InputLabel>
                <Select
                    name="pastSurgeries"
                    value={formData.pastSurgeries}
                    onChange={handleChange}
                >
                    <MenuItem value="No">No</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                </Select>
            </FormControl>
            <FormControl variant="standard" fullWidth margin="normal" required>
                <InputLabel>Family Medical History</InputLabel>
                <Select
                    name="familyMedicalHistory"
                    value={formData.familyMedicalHistory}
                    onChange={handleChange}
                >
                    <MenuItem value="No">No</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                </Select>
            </FormControl>
            <FormControl variant="standard" fullWidth margin="normal" required>
                <InputLabel>Medication List</InputLabel>
                <Select
                    name="medicationList"
                    value={formData.medicationList}
                    onChange={handleChange}
                >
                    <MenuItem value="No">No</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                </Select>
            </FormControl>
            <FormControl variant="standard" fullWidth margin="normal" required>
                <InputLabel>Allergies</InputLabel>
                <Select
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                >
                    <MenuItem value="No">No</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                </Select>
            </FormControl>
            <TextField
                label="GP"
                variant="standard"
                name="gp"
                value={formData.gp}
                onChange={handleChange}
                fullWidth
                margin="normal"
            />
            <FormControl variant="standard" fullWidth margin="normal" required>
                <InputLabel>Insurance Provider</InputLabel>
                <Select
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleChange}
                >
                    <MenuItem value="No">No</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                </Select>
            </FormControl>
            <TextField
                label="Policy Number"
                variant="standard"
                name="policyNumber"
                value={formData.policyNumber}
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
    onClose: PropTypes.func.isRequired,
};

export default Register;
