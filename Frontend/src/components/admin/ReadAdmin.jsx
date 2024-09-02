import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Typography, Box, Collapse, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAdminData } from '../../services/adminService';
import Lottie from 'lottie-react';
import animationData from '../../assets/loading.json';

function ReadAdmin() {
    const { adminId } = useParams();
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedBlock, setExpandedBlock] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Admin ID from useParams:", adminId);

        if (!adminId) {
            setError("Admin ID is undefined");
            setLoading(false);
            return;
        }

        const loadAdminData = async () => {
            try {
                const response = await fetchAdminData(adminId);
                console.log("API response:", response);

                if (response) {
                    console.log("Admin data found:", response);
                    setAdminData(response);
                } else {
                    setError("Admin data is undefined or not returned from the API.");
                }
            } catch (err) {
                console.error("Error fetching admin data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadAdminData();
    }, [adminId]);

    const toggleBlock = (block) => {
        setExpandedBlock(expandedBlock === block ? null : block);
    };

    const handleBackToSuperAdminPanel = () => {
        navigate('/superadmin/panel');
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <Lottie
                    animationData={animationData}
                    style={{
                        width: '100px',
                        height: '100px',
                        zIndex: 1,
                        pointerEvents: 'none'
                    }}
                />
            </Box>
        );
    }

    if (error) return <Typography>Error: {error}</Typography>;

    if (!adminData) {
        console.log("Admin data is not available:", adminData);
        return <Typography>No admin data available</Typography>;
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '800px',
                margin: 'auto',
                padding: '20px',
                backgroundColor: '#f8f6f6',
                boxSizing: 'border-box'
            }}
        >
            <>
                <Block
                    title="Personal Information"
                    isOpen={expandedBlock === 'personalInfo'}
                    onClick={() => toggleBlock('personalInfo')}
                >
                    <Typography><strong>Admin ID:</strong> {adminData._id || 'N/A'}</Typography>
                    <Typography><strong>First Name:</strong> {adminData.firstName || 'N/A'}</Typography>
                    <Typography><strong>Last Name:</strong> {adminData.lastName || 'N/A'}</Typography>
                    <Typography><strong>Email:</strong> {adminData.email || 'N/A'}</Typography>
                    <Typography><strong>Role:</strong> {adminData.role || 'N/A'}</Typography>
                </Block>

                <Button
                    variant="contained"
                    sx={{
                        mt: 4,
                        backgroundColor: '#03035d',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: '#03035d',
                        }
                    }}
                    onClick={handleBackToSuperAdminPanel}
                >
                    Back to Super Admin Panel
                </Button>
            </>
        </Box>
    );
}

function Block({ title, isOpen, onClick, children }) {
    return (
        <Box
            onClick={onClick}
            sx={{
                width: '100%',
                padding: '15px',
                marginBottom: '15px',
                border: '2px solid #03035d',
                borderRadius: '10px',
                cursor: 'pointer',
                backgroundColor: '#f8f6f6',
                boxShadow: isOpen ? '0 0 10px rgba(0, 0, 0, 0.1)' : 'none'
            }}
        >
            <Typography variant="h6" sx={{ color: '#03035d', marginBottom: '10px' }}>{title}</Typography>
            <Collapse in={isOpen}>
                <Box sx={{ paddingLeft: '10px' }}>
                    {children}
                </Box>
            </Collapse>
        </Box>
    );
}

ReadAdmin.propTypes = {
    adminId: PropTypes.string,
};

Block.propTypes = {
    title: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

export default ReadAdmin;
