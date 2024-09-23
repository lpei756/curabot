import { useState } from 'react';
import { Modal, Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import Lottie from 'lottie-react';
import animationData from '../../assets/homepage.json';
import AdminLogin from '../auth/login/AdminLogin.jsx';
import PropTypes from 'prop-types';

const AdminLoginModal = ({ open, onClose, onSuccess }) => (
    <Modal open={open} onClose={onClose}>
        <Box
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
            }}
        >
            <AdminLogin onClose={onClose} onSuccess={onSuccess} />
        </Box>
    </Modal>
);

AdminLoginModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
};

function Homepage() {
    const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(true);
    const currentPort = window.location.port;

    if (currentPort === '5174' || currentPort === '5175') {
        return (
            <AdminLoginModal
                open={isAdminLoginOpen}
                onClose={() => setIsAdminLoginOpen(false)}
                onSuccess={() => { /* Handle admin login success */ }}
            />
        );
    }

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
            }}
        >
            <Typography
                sx={{
                    position: 'absolute',
                    top: {xs: '75%', sm: '85%', md: '85%', lg: '50%'},
                    left: {xs: '50%', lg: '80%'},
                    transform: 'translate(-50%, -50%)',
                    color: 'black',
                    fontSize: {xs: '50px', lg: '60px'},
                    fontFamily: '"Ubuntu", sans-serif',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                }}
            >
                secure and smart.
            </Typography>

            <Typography
                sx={{
                    position: 'absolute',
                    top: {xs: '25%', sm: '15%', md: '15%', lg: '50%'},
                    left: {xs: '50%', lg: '20%'},
                    transform: 'translate(-50%, -50%)',
                    color: 'black',
                    fontSize: {xs: '50px', lg: '60px'},
                    fontFamily: '"Ubuntu", sans-serif',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                }}
            >
                Effortless booking
            </Typography>

            <Lottie
                animationData={animationData}
                style={{
                    width: '700px',
                    height: '700px',
                    zIndex: 1,
                    justifyContent: 'center',
                    pointerEvents: 'auto',
                }}
            />
        </Box>
    );
}

export default Homepage;