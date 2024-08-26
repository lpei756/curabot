import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { fetchAllPatients, adminLogout } from '../../services/AdminService';
import { AdminContext } from '../../context/AdminContext';

const AdminPanel = () => {
    const [patients, setPatients] = useState([]);
    const [error, setError] = useState(null);
    const { role } = useContext(AdminContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const patientsData = await fetchAllPatients();
                if (Array.isArray(patientsData)) {
                    setPatients(patientsData);
                } else {
                    throw new Error('Invalid data format');
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch data.');
            }
        };

        fetchData();
    }, [role]);

    const handleLogout = async () => {
        try {
            await adminLogout();
            localStorage.removeItem('isAdminLoggedIn');  // 删除管理员登录状态
            navigate('/');
            window.location.reload();
        } catch (err) {
            console.error('Error during logout:', err);
            setError('Logout failed.');
        }
    };


    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Admin Panel
            </Typography>

            {error && (
                <Typography variant="body2" color="error" gutterBottom>
                    {error}
                </Typography>
            )}

            <Box sx={{ marginBottom: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Patients
                </Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>First Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {patients.length > 0 ? (
                                patients.map((patient) => (
                                    <TableRow key={patient._id}>
                                        <TableCell>{patient.firstName}</TableCell>
                                        <TableCell>{patient.lastName}</TableCell>
                                        <TableCell>{patient.email}</TableCell>
                                        <TableCell>{patient.phone || '-'}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        No patients found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Button
                variant="contained"
                style={{ backgroundColor: '#03035d', color: '#fff' }}
                onClick={handleLogout}
            >
                Logout
            </Button>

        </Box>
    );
};

export default AdminPanel;
