import Lottie from 'lottie-react';
import animationData from '../../assets/homepage.json';
import { useState } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import AdminLogin from '../auth/login/AdminLogin';
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
        <div style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            height: '100%'
        }}>
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '80%',
                transform: 'translate(-50%, -50%)',
                color: 'black',
                fontSize: '60px',
                fontFamily: '"Ubuntu", sans-serif',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                whiteSpace: 'nowrap'
            }}>
                <div>secure and smart.</div>
            </div>
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '20%',
                transform: 'translate(-50%, -50%)',
                color: 'black',
                fontSize: '60px',
                fontFamily: '"Ubuntu", sans-serif',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                whiteSpace: 'nowrap'
            }}>
                <div>Effortless booking</div>
            </div>

            <Lottie
                animationData={animationData}
                style={{
                    width: '700px',
                    height: '700px',
                    zIndex: 1,
                    justifyContent: 'center',
                    pointerEvents: 'auto'
                }}
            />
        </div>
    );
}

export default Homepage;
