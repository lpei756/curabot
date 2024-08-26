import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { fetchAllAdminIDs, fetchAllPatients, adminLogout } from '../../services/AdminService';
import { AdminContext } from '../../context/AdminContext';

const SuperAdminPanel = () => {
    const [admins, setAdmins] = useState([]);
    const [patients, setPatients] = useState([]);
    const [error, setError] = useState(null);
    const { role } = useContext(AdminContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Fetching data started');

                // 获取所有管理员信息
                const adminsData = await fetchAllAdminIDs();
                if (Array.isArray(adminsData)) {
                    setAdmins(adminsData);
                } else {
                    throw new Error('Failed to fetch admins data.');
                }

                console.log('Fetching all patients data');
                const patientsData = await fetchAllPatients();
                console.log('Fetched patients data:', patientsData);
                if (Array.isArray(patientsData)) {
                    setPatients(patientsData);
                } else {
                    throw new Error('Failed to fetch patients data.');
                }

                console.log('Data fetching completed successfully');
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
            navigate('/'); // 修改为返回主页
        } catch (err) {
            console.error('Error during logout:', err);
            setError('Logout failed.');
        }
    };

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Super Admin Panel
            </Typography>

            {error && (
                <Typography variant="body2" color="error" gutterBottom>
                    {error}
                </Typography>
            )}

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
                            {admins.length > 0 ? (
                                admins.map((admin) => (
                                    <TableRow key={admin._id}>
                                        <TableCell>{admin.firstName || '-'}</TableCell>
                                        <TableCell>{admin.lastName || '-'}</TableCell>
                                        <TableCell>{admin.email}</TableCell>
                                        <TableCell>{admin.role}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">No admins found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

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
                                    <TableCell colSpan={4} align="center">No patients found</TableCell>
                                </TableRow>
                            )}
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

export default SuperAdminPanel;
