import { useState, useEffect, useContext } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { fetchMe, fetchAllPatients } from '../../services/AdminService';
import { AdminContext } from '../../context/AdminContext';
import EditPatient from './EditPatient.jsx';
import Prescription from './Prescription.jsx';
import { Link, useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const [patients, setPatients] = useState([]);
    const [patientSearchQuery, setPatientSearchQuery] = useState('');
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPrescription, setShowPrescription] = useState(false);
    const navigate = useNavigate();
    const { adminId, adminToken } = useContext(AdminContext);
    const [doctorFirstName, setDoctorFirstName] = useState('');
    const [doctorLastName, setDoctorLastName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await fetchMe();
                const adminData = response.admin;
                console.log("Fetched admin data:", adminData);
                setDoctorFirstName(adminData.firstName);
                setDoctorLastName(adminData.lastName);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching admin data:', error);
                setIsLoading(false);
            }
        };
        fetchAdminData();
    }, [adminToken]);

    useEffect(() => {
        if (adminId) {
            const fetchData = async () => {
                try {
                    const patientsData = await fetchAllPatients();
                    if (Array.isArray(patientsData)) {
                        setPatients(patientsData);
                    } else {
                        setError('Invalid data format');
                    }
                } catch (err) {
                    console.error('Error fetching data:', err);
                    setError('Failed to fetch data.');
                }
            };

            fetchData();
        }
    }, [adminId]);

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
        setSelectedPatient(patient);
        setEditMode(true);
        setShowPrescription(false);
    };

    const handlePrescription = (patient) => {
        setSelectedPatient(patient);
        setShowPrescription(true);
        setEditMode(false);
        if (adminId) {
            navigate(`/prescriptions/admin/${adminId}`, { state: { patient } });
        } else {
            console.error('adminId is missing!');
        }
    };

    return (
        <Box sx={{ padding: 4, marginLeft: '250px' }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                }}
            >
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
            ) : showPrescription && selectedPatient ? (
                isLoading ? (
                    <Typography variant="body1">Loading doctor information...</Typography>
                ) : (
                    <Prescription
                        doctorFirstName={doctorFirstName}
                        doctorLastName={doctorLastName}
                        adminId={adminId}
                    />
                )
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
                                                <Button
                                                    onClick={() => handlePrescription(patient)}
                                                    variant="contained"
                                                    color="secondary"
                                                    sx={{ ml: 1 }}
                                                >
                                                    Generate Prescription
                                                </Button>
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
