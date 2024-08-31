import { useState, useEffect, useContext } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { fetchAllPatients } from '../../services/AdminService';
import { fetchAdminNotifications } from '../../services/NotificationService';
import { AdminContext } from '../../context/AdminContext';
import EditPatient from './EditPatient.jsx';
import { Link, useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const [patients, setPatients] = useState([]);
    const [patientSearchQuery, setPatientSearchQuery] = useState('');
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const { role, adminId } = useContext(AdminContext);

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

        const fetchUnreadNotifications = async () => {
            try {
                if (!adminId) {
                    console.warn('Admin ID is not available');
                    return;
                }
                console.log("Using Admin ID:", adminId);
                const notifications = await fetchAdminNotifications(adminId);
                const unreadNotifications = notifications.filter(notification => !notification.isRead);
                setUnreadCount(unreadNotifications.length);
            } catch (err) {
                console.error('Error fetching notifications:', err.message);
            }
        };

        fetchData();
        fetchUnreadNotifications();
    }, [role, adminId]);


    useEffect(() => {
        const filtered = patients.filter((patient) => {
            return (
                patient.firstName.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
                patient.lastName.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
                patient.email.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
                patient.phone.toLowerCase().includes(patientSearchQuery.toLowerCase())
            );
        });
        setFilteredPatients(filtered);
    }, [patientSearchQuery, patients]);

    const handleEdit = (patient) => {
        console.log('Selected Patient:', patient);
        if (patient && patient._id) {
            setSelectedPatient(patient);
            setEditMode(true);
        } else {
            console.error('Invalid patient selected:', patient);
        }
    };

    const handleNavigateToNotifications = () => {
        navigate('/admin/panel/adminnotification');
    };

    return (
        <Box sx={{ padding: 4 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                }}
            >
                <Typography variant="h4" component="h1">
                    Admin Panel
                </Typography>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: '#03035d',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: '#03035d',
                        }
                    }}
                    onClick={handleNavigateToNotifications}
                >
                    Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
                </Button>
            </Box>

            {error && (
                <Typography variant="body2" color="error" gutterBottom>
                    {error}
                </Typography>
            )}

            {editMode && selectedPatient ? (
                <EditPatient
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
                    returnPath="/admin/panel"
                />
            ) : (
                <Box sx={{ marginBottom: 4 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Patients
                    </Typography>
                    <TextField
                        label="Search Patients"
                        variant="outlined"
                        fullWidth
                        value={patientSearchQuery}
                        onChange={(e) => setPatientSearchQuery(e.target.value)}
                        sx={{ marginBottom: 3 }}
                    />
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
                                {filteredPatients.length > 0 ? (
                                    filteredPatients.map((patient) => (
                                        <TableRow key={patient._id}>
                                            <TableCell>
                                                <Link to={`/admin/panel/patient/${patient._id}`}
                                                      style={{
                                                          textDecoration: 'none',
                                                          color: '#03035d',
                                                          fontWeight: 'bold',
                                                      }}
                                                      onMouseEnter={(e) => e.target.style.color = '#ff5733'}
                                                      onMouseLeave={(e) => e.target.style.color = '#03035d'}
                                                >
                                                    {patient.firstName}
                                                </Link>
                                            </TableCell>
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
