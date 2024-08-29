import { useState, useEffect, useContext } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { fetchAllAdminIDs, fetchAllPatients } from '../../services/AdminService';
import { AdminContext } from '../../context/AdminContext';
import EditPatient from './EditPatient.jsx';
import EditAdmin from './EditAdmin.jsx';
import { Link } from 'react-router-dom';

const SuperAdminPanel = () => {
    const [admins, setAdmins] = useState([]);
    const [patients, setPatients] = useState([]);
    const [adminSearchQuery, setAdminSearchQuery] = useState('');
    const [patientSearchQuery, setPatientSearchQuery] = useState('');
    const [filteredAdmins, setFilteredAdmins] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
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

    useEffect(() => {
        const filtered = admins.filter((admin) => {
            return (
                admin.firstName.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                admin.lastName.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                admin.email.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
                admin.role.toLowerCase().includes(adminSearchQuery.toLowerCase())
            );
        });
        setFilteredAdmins(filtered);
    }, [adminSearchQuery, admins]);


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

    const handleEditAdmin = (admin) => {
        console.log('Selected Admin:', admin);
        if (admin && admin._id) {
            setSelectedItem(admin);
            setEditMode('admin');
        } else {
            console.error('Invalid admin selected:', admin);
        }
    };
    const handleEdit = (patient) => {
        console.log('Selected Patient:', patient);
        if (patient && patient._id) {
            setSelectedItem(patient);
            setEditMode('patient');
        } else {
            console.error('Invalid patient selected:', patient);
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
                <EditPatient
                    patientData={selectedItem}
                    setPatientData={(updatedPatient) => {
                        setPatients((prevPatients) =>
                            prevPatients.map((patient) =>
                                patient._id === updatedPatient._id ? updatedPatient : patient
                            )
                        );
                        setEditMode(null);
                        setSelectedItem(null);
                    }}
                    patientId={selectedItem._id}
                    setEditMode={setEditMode}
                    returnPath="/superadmin/panel"
                />
            ) : editMode === 'admin' && selectedItem ? (
                <EditAdmin
                    adminData={selectedItem}
                    setAdminData={(updatedAdmin) => {
                        setAdmins((prevAdmins) =>
                            prevAdmins.map((admin) =>
                                admin._id === updatedAdmin._id ? updatedAdmin : admin
                            )
                        );
                        setEditMode(null);
                        setSelectedItem(null);
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
                        <TextField
                            label="Search Admins"
                            variant="outlined"
                            fullWidth
                            value={adminSearchQuery}
                            onChange={(e) => setAdminSearchQuery(e.target.value)}
                            sx={{ marginBottom: 3 }}
                        />
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
                                    {filteredAdmins.length > 0 ? (
                                        filteredAdmins.map((admin) => (
                                            <TableRow key={admin._id}>
                                                <TableCell>
                                                    <Link
                                                        to={`/admin/${admin._id}`}
                                                        style={{
                                                            textDecoration: 'none',
                                                            color: '#03035d',
                                                            fontWeight: 'bold',
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.color = '#ff5733'}
                                                        onMouseLeave={(e) => e.target.style.color = '#03035d'}
                                                    >
                                                        {admin.firstName || '-'}
                                                    </Link>
                                                </TableCell>
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
                                                    <Link to={`/superadmin/panel/patient/${patient._id}`}
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
