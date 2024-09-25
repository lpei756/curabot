import { Box, Button } from '@mui/material';
import { Groups as GroupsIcon, Assessment as AssessmentIcon } from '@mui/icons-material';
import { Outlet, useNavigate } from 'react-router-dom';

const SuperAdminLayout = () => {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            {/* Sidebar */}
            <Box sx={{
                position: 'fixed',
                left: 0,
                top: 0,
                height: '100vh',
                width: '250px',
                backgroundColor: '#f5f5f5',
                padding: 2,
                boxShadow: '2px 0px 5px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
            }}>
                <Button
                    color="inherit"
                    onClick={() => handleNavigation('/superadmin/panel')}
                    sx={{ justifyContent: 'flex-start', color: 'black', display: 'block', marginBottom: '10px' }}
                >
                    <GroupsIcon sx={{ marginRight: '8px' }} />
                    Clinic Staff
                </Button>
                <Button
                    color="inherit"
                    onClick={() => handleNavigation('/superadmin/panel/feedback')}
                    sx={{ justifyContent: 'flex-start', color: 'black', display: 'block', marginBottom: '10px' }}
                >
                    <AssessmentIcon sx={{ marginRight: '8px' }} />
                    AI Performance
                </Button>
            </Box>

            <Box sx={{ padding: 4, marginLeft: '250px', flex: 1 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default SuperAdminLayout;
