import { useState, useEffect, useContext } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteAdmin, fetchAllAdminIDs } from '../../services/AdminService.js';
import { AdminContext } from '../../context/AdminContext.jsx';
import EditAdmin from './EditAdmin.jsx';
import { Link, useNavigate } from 'react-router-dom';

const SuperAdminPanel = () => {
    const [admins, setAdmins] = useState([]);
    const [adminSearchQuery, setAdminSearchQuery] = useState('');
    const [filteredAdmins, setFilteredAdmins] = useState([]);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const navigate = useNavigate();
    const { role } = useContext(AdminContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const adminsData = await fetchAllAdminIDs();
                if (Array.isArray(adminsData)) {
                    setAdmins(adminsData);
                } else {
                    throw new Error('Failed to fetch admins data.');
                }
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

    const handleEditAdmin = (admin) => {
        if (admin && admin._id) {
            setSelectedItem(admin);
            setEditMode('admin');
        } else {
            console.error('Invalid admin selected:', admin);
        }
    };

    const handleDelete = async (adminId) => {

        if (window.confirm('Are you sure you want to delete this account?')) {

            try {
                await deleteAdmin(adminId);
                setAdmins(admins.filter((admin) => admin._id !== adminId));
            } catch (err) {
                console.error('Error deleting patient:', err);
                setError('Failed to delete admin.');
            }
        }
    }

    const handleAddAdminClick = () => {
        navigate('/admin/register');
    }

    return (
        <Box sx={{ padding: 4, marginLeft: '50px' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Super Admin Panel
            </Typography>

            {error && (
                <Typography variant="body2" color="error" gutterBottom>
                    {error}
                </Typography>
            )}
            {editMode === 'admin' && selectedItem ? (
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
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 4,
                        }}
                    >
                        <Typography variant="h5" component="h2" gutterBottom>
                            Doctors
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{ backgroundColor: '#03035d', color: '#fff' }}
                            onClick={handleAddAdminClick}
                        >
                            Add Doctor
                        </Button>
                    </Box>

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
                                    <TableCell>Delete</TableCell>
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
                                                ></Link>
                                                {admin.firstName || '-'}
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
                                            <TableCell>
                                                <IconButton
                                                    onClick={() => handleDelete(admin._id)}
                                                    color="secondary"
                                                    aria-label="delete admin"
                                                    sx={{ color: '#03035d' }}
                                                >
                                                    <DeleteIcon />
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
                </>
            )}
        </Box>
    );
};

export default SuperAdminPanel;
