import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Stepper, Step, StepLabel, LinearProgress } from '@mui/material';
import PropTypes from 'prop-types';
import { register } from '../../../services/authService';

const steps = ['Account Set Up', 'Personal Information'];

const Register = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        address: '',
        phone: '',
        email: '',
        password: '',
    });

    const [activeStep, setActiveStep] = useState(0);
    const [error, setError] = useState(null);
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        if (name === 'password') {
            if (value.length < 6) {
                setPasswordError('Password must be at least 6 characters long.');
            } else {
                setPasswordError('');
            }
        }
    };

    const handleNext = () => setActiveStep((prevActiveStep) => prevActiveStep + 1);

    const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);

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
            setError('Registration already exists. Please use another email address.');
        }
    };

    const renderFormFields = () => {
        switch (activeStep) {
            case 0:
                return (
                    <>
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
                            error={!!passwordError}
                            helperText={passwordError}
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
                    </>
                );
            case 1:
                return (
                    <>
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
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '600px', mx: 'auto', mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom style={{ color: 'black', textAlign: 'center' }}>
                Register
            </Typography>
            <LinearProgress
                variant="determinate"
                value={(activeStep / steps.length) * 100}
                sx={{
                    mb: 4,
                    backgroundColor: 'transparent',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: '#03035d',
                    },
                }}
            />
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel
                            StepIconProps={{
                                sx: {
                                    '&.Mui-completed': {
                                        color: '#03035d',
                                    },
                                    '&.Mui-active': {
                                        color: '#03035d',
                                    }
                                }
                            }}
                        >
                            {label}
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>
            {renderFormFields()}
            {error && (
                <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                    {error}
                </Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="outlined"
                    sx={{
                        borderColor: '#03035d',
                        color: '#03035d',
                        '&:hover': {
                            borderColor: '#03035d',
                            backgroundColor: 'rgba(3, 3, 93, 0.04)',
                        }
                    }}
                >
                    Back
                </Button>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: '#03035d',
                        color: '#fff',
                        '&:hover': {
                            backgroundColor: '#020246',
                        }
                    }}
                    onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                >
                    {activeStep === steps.length - 1 ? 'COMPLETE' : 'Next'}
                </Button>
            </Box>
        </Box>
    );
}

Register.propTypes = {
    onSuccess: PropTypes.func,
};

export default Register;
