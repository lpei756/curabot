import React from 'react';
import { Box, Typography, Modal, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledModal = styled(Modal)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'auto',
}));

const StyledBox = styled(Box)(({ theme }) => ({
    color: 'black',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[3],
    width: '80%',
    maxWidth: '600px',
    height: 'auto',
    maxHeight: '80vh',
    overflow: 'auto',
}));

const AppointmentDetail = ({ open, onClose, event }) => {
    if (!event) return null;

    return (
        <StyledModal open={open} onClose={onClose}>
            <StyledBox>
                <Typography variant="h6" gutterBottom>
                    Appointment Details
                </Typography>
                <Typography variant="body1">
                    <strong>Title:</strong> {event.title}
                </Typography>
                <Typography variant="body1">
                    <strong>Start:</strong> {event.start.toLocaleString()}
                </Typography>
                <Typography variant="body1">
                    <strong>End:</strong> {event.end.toLocaleString()}
                </Typography>
                <Typography variant="body1">
                    <strong>Description:</strong> {event.description || 'No description available'}
                </Typography>
                <Button variant="contained" color="primary" onClick={onClose}>
                    Close
                </Button>
            </StyledBox>
        </StyledModal>
    );
};

export default AppointmentDetail;