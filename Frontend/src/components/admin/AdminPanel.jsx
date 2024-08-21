import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getAllAdmins, getAllPatients, adminLogout } from '../../services/AdminService';
import { AuthContext } from '../../context/AuthContext';

const AdminPanel = () => {
    const [admins, setAdmins] = useState([]);
    const [patients, setPatients] = useState([]);
    const [error, setError] = useState(null);
    const { role } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (role === 'superadmin') {
            fetchAllAdmins();
        }
        fetchAllPatients();
    }, [role]);

    const fetchAllAdmins = async () => {
        try {
            const data = await getAllAdmins();
            setAdmins(data);
        } catch (err) {
            console.error('Error fetching admins:', err);
            setError('Failed to fetch admins.');
        }
    };

    const fetchAllPatients = async () => {
        try {
            const data = await getAllPatients();
            setPatients(data);
        } catch (err) {
            console.error('Error fetching patients:', err);
            setError('Failed to fetch patients.');
        }
    };

    const handleLogout = async () => {
        try {
            await adminLogout();
            navigate('/admin/login');
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

            {role === 'superadmin' && (
                <Box sx={{ marginBottom: 4 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Admins
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>First Name</TableCell>
                                    <TableCell>Last Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Role</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {admins.map((admin) => (
                                    <TableRow key={admin._id}>
                                        <TableCell>{admin.firstName}</TableCell>
                                        <TableCell>{admin.lastName}</TableCell>
                                        <TableCell>{admin.email}</TableCell>
                                        <TableCell>{admin.role}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
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
                            {patients.map((patient) => (
                                <TableRow key={patient._id}>
                                    <TableCell>{patient.firstName}</TableCell>
                                    <TableCell>{patient.lastName}</TableCell>
                                    <TableCell>{patient.email}</TableCell>
                                    <TableCell>{patient.phone}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Button variant="contained" color="secondary" onClick={handleLogout}>
                Logout
            </Button>
        </Box>
    );
};

export default AdminPanel;
