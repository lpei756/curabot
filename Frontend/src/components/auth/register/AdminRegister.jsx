import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, MenuItem, Select, InputLabel, FormControl, Chip, OutlinedInput } from '@mui/material';
import PropTypes from 'prop-types';
import { adminRegister } from '../../../services/AdminService';

const clinicOptions = [
    { _id: "66ac6360d1864aef73c64a69", name: "Urgent Care Auckland" },
    { _id: "66ac6360d1864aef73c64a6a", name: "Urgent Care Clinic Wellington" },
    { _id: "66ac6360d1864aef73c64a6b", name: "Urgent Care Clinic Christchurch" },
    { _id: "66ac6360d1864aef73c64a6c", name: "General Practice Clinic Auckland Central" },
    { _id: "66ac6360d1864aef73c64a6d", name: "General Practice Clinic Mount Eden" },
    { _id: "66ac6360d1864aef73c64a6e", name: "General Practice Clinic Hamilton" },
    { _id: "66ac6360d1864aef73c64a6f", name: "General Practice Clinic Tauranga" },
    { _id: "66ac6360d1864aef73c64a70", name: "General Practice Clinic Wellington East" },
    { _id: "66ac6360d1864aef73c64a71", name: "General Practice Clinic Dunedin" },
    { _id: "66ac6360d1864aef73c64a72", name: "General Practice Clinic Invercargill" },
    { _id: "66ac6360d1864aef73c64a73", name: "Specialist Clinic Auckland" },
    { _id: "66ac6360d1864aef73c64a74", name: "Specialist Clinic Wellington" },
    { _id: "66ac6360d1864aef73c64a75", name: "Specialist Clinic Christchurch" },
    { _id: "66ac6360d1864aef73c64a76", name: "Specialist Clinic Tauranga" },
    { _id: "66ac6360d1864aef73c64a77", name: "Specialist Clinic Dunedin" }
];

const languageOptions = ["English", "Japanese", "Chinese", "French", "German", "Spanish"];

const AdminRegister = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: '',
        clinic: '',
        languagesSpoken: [],
        specialty: '',
    });

    const [error, setError] = useState(null);
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Special handling for clinic to store its ObjectId
        if (name === 'clinic') {
            setFormData({
                ...formData,
                clinic: value,  // This will store the ObjectId
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }

        if (name === 'password' && value.length < 6) {
            setPasswordError('Password must be at least 6 characters long.');
        } else {
            setPasswordError('');
        }
    };

    const handleLanguagesChange = (event) => {
        const {
            target: { value },
        } = event;
        setFormData({
            ...formData,
            languagesSpoken: typeof value === 'string' ? value.split(',') : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwordError) {
            return;
        }

        console.log('Submitting form data:', formData);

        try {
            const data = await adminRegister(formData);
            console.log('Registered admin:', data.admin.firstName, data.admin.lastName, data.admin.email);
            navigate('/');
            if (onSuccess) {
                onSuccess(data.admin);
            }
        } catch (err) {
            console.error('Error during admin registration:', err);
            setError('Registration failed. Please use another email address.');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: '600px', mx: 'auto', mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom style={{ color: 'black', textAlign: 'center' }}>Admin Register</Typography>

            {error && (
                <Typography variant="body2" color="error" gutterBottom>
                    {error}
                </Typography>
            )}

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
            <FormControl variant="standard" fullWidth margin="normal" required>
                <InputLabel>Role</InputLabel>
                <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label="Role"
                >
                    <MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="nurse">Nurse</MenuItem>
                    <MenuItem value="superadmin">Super Admin</MenuItem>
                </Select>
            </FormControl>

            {formData.role === 'doctor' && (
                <>
                    <FormControl variant="standard" fullWidth margin="normal" required>
                        <InputLabel>Clinic</InputLabel>
                        <Select
                            name="clinic"
                            value={formData.clinic}
                            onChange={handleChange}
                            label="Clinic"
                        >
                            {clinicOptions.map((clinic) => (
                                <MenuItem key={clinic._id} value={clinic._id}>
                                    {clinic.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl variant="outlined" fullWidth margin="normal" required>
                        <InputLabel>Languages Spoken</InputLabel>
                        <Select
                            multiple
                            value={formData.languagesSpoken}
                            onChange={handleLanguagesChange}
                            input={<OutlinedInput id="select-multiple-chip" label="Languages Spoken" />}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip key={value} label={value} />
                                    ))}
                                </Box>
                            )}
                        >
                            {languageOptions.map((language) => (
                                <MenuItem key={language} value={language}>
                                    {language}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Specialty"
                        variant="standard"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                </>
            )}

            <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }} style={{
                backgroundColor: '#03035d',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
            }}>
                Register
            </Button>
        </Box>
    );
};

AdminRegister.propTypes = {
    onSuccess: PropTypes.func,
};

export default AdminRegister;
