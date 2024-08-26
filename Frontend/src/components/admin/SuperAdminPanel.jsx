import { useState, useEffect, useContext } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { fetchAllAdminIDs, fetchAllPatients } from '../../services/AdminService';
import { AdminContext } from '../../context/AdminContext';
import EditPatients from './EditPatients';
import EditAdmins from './EditAdmins';

const SuperAdminPanel = () => {
    const [admins, setAdmins] = useState([]);
    const [patients, setPatients] = useState([]);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const { role } = useContext(AdminContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Fetching data started');
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

    const handleEditPatient = (patient) => {
        console.log('Selected Patient:', patient);
        if (patient && patient._id) {
            setSelectedItem(patient);
            setEditMode('patient');
        } else {
            console.error('Invalid patient selected:', patient);
        }
    };

    const handleEditAdmin = (admin) => {
        console.log('Selected Admin:', admin);
        if (admin && admin._id) {
            setSelectedItem(admin);
            setEditMode('admin');
        } else {
            console.error('Invalid admin selected:', admin);
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

            {editMode === 'patient' && selectedItem ? (
                <EditPatients
                    patientData={selectedItem}
                    setPatientData={(updatedPatient) => {
                        setPatients((prevPatients) =>
                            prevPatients.map((patient) =>
                                patient._id === updatedPatient._id ? updatedPatient : patient
                            )
                        );
                    }}
                    patientId={selectedItem._id}
                    setEditMode={setEditMode}
                />
            ) : editMode === 'admin' && selectedItem ? (
                <EditAdmins
                    adminData={selectedItem}
                    setAdminData={(updatedAdmin) => {
                        setAdmins((prevAdmins) =>
                            prevAdmins.map((admin) =>
                                admin._id === updatedAdmin._id ? updatedAdmin : admin
                            )
                        );
                    }}
                    adminId={selectedItem._id}
                    setEditMode={setEditMode}
                />
            ) : (
                <>
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
                                        <TableCell>Actions</TableCell>
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
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() => handleEditAdmin(admin)}
                                                        color="primary"
                                                        aria-label="edit admin"
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">No admins found</TableCell>
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
                                        <TableCell>Actions</TableCell>
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
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() => handleEditPatient(patient)}
                                                        color="primary"
                                                        aria-label="edit patient"
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">No patients found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default SuperAdminPanel;
