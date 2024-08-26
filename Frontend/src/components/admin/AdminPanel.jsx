import { useState, useEffect, useContext } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { fetchAllPatients } from '../../services/AdminService';
import { AdminContext } from '../../context/AdminContext';
import EditPatients from './EditPatients';

const AdminPanel = () => {
    const [patients, setPatients] = useState([]);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const { role } = useContext(AdminContext);

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

    const handleEdit = (patient) => {
        console.log('Selected Patient:', patient);  // 调试检查 selectedPatient 的内容
        if (patient && patient._id) {
            setSelectedPatient(patient);
            setEditMode(true);
        } else {
            console.error('Invalid patient selected:', patient);
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

            {editMode && selectedPatient ? (
                <EditPatients
                    patientData={selectedPatient}
                    setPatientData={(updatedPatient) => {
                        setPatients((prevPatients) =>
                            prevPatients.map((patient) =>
                                patient._id === updatedPatient._id ? updatedPatient : patient
                            )
                        );
                    }}
                    patientId={selectedPatient._id}
                    setEditMode={setEditMode}
                />
            ) : (
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
                                                    onClick={() => handleEdit(patient)}
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
                                        <TableCell colSpan={5} align="center">
                                            No patients found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Box>
    );
};

export default AdminPanel;
