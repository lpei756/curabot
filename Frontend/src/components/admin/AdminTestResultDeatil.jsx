import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, List, ListItem, TextField } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import PDFViewer from '../testresult/PDFViewer';
import { fetchTestResultById, editTestResult, approveTestResult } from '../../services/testResultService';
import { AdminContext } from '../../context/AdminContext';
import { fetchPatientbyID } from '../../services/AdminService';
import Button from '@mui/material/Button';
import '../../App.css';

const apiUrl = import.meta.env.VITE_API_URL;
const renderAnalysisText = (text) => {
    const sections = text.split('\n\n');
    return sections.map((section, index) => {
        const [title, ...contentLines] = section.split('\n');
        return (
            <Box key={index} sx={{ marginBottom: 1 }}>
                <Typography variant="body1">
                    {title}
                </Typography>
                <List>
                    {contentLines.map((line, i) => (
                        <ListItem key={i}>
                            <Typography variant="body1">{line}</Typography>
                        </ListItem>
                    ))}
                </List>
            </Box>
        );
    });
};

function AdminTestResultDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [testResult, setTestResult] = useState(null);
    const [patientData, setPatientData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalContent, setModalContent] = useState({ summary: '', analysis: '' });
    const [isEditing, setIsEditing] = useState(false);
    const { role } = useContext(AdminContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetchTestResultById(id);
                setTestResult(result);
                setModalContent({ summary: result.summary, analysis: result.analysis });

                const patientID = result.patientID;
                const patientData = await fetchPatientbyID(patientID);
                setPatientData(patientData);
            } catch (err) {
                setError('Failed to fetch data.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        try {
            await editTestResult(id, modalContent);
            setIsEditing(false);
            navigate(0);
        } catch (err) {
            console.error('Failed to edit test result', err);
        }
    };

    const handleApprove = async () => {
        try {
            await approveTestResult(id);
            navigate('/admin/panel/test-result')
        } catch (err) {
            console.error('Failed to approve test result', err);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography variant="h6" color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 4,
            height: '100vh',
            overflow: 'auto',
            marginLeft: '250px'
        }}>
            <Typography variant="h3" sx={{ color: 'black', fontWeight: 'bold', marginBottom: '30px' }}>
                Test Result Details
            </Typography>
            {testResult && (
                <Box sx={{ display: 'flex', gap: 5, width: '100%', maxWidth: '1200px' }}>
                    <Box sx={{ flex: 1, width: '100%', height: '700px' }}>
                        <PDFViewer pdfUrl={`${apiUrl}/uploads/${testResult.fileName}`} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: 'black' }} gutterBottom>
                            <strong style={{ color: '#03035d' }}>Test Name:</strong> {testResult.testName}
                        </Typography>
                        {patientData && (
                            <Box sx={{ marginTop: 4 }}>
                                <Typography variant="h6" sx={{ color: 'black' }}>
                                    <strong style={{ color: '#03035d' }}>Patient Medical History:</strong>
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'black' }}>
                                    <strong style={{ color: '#03035d' }}>Chronic Diseases:</strong> {patientData.medicalHistory.chronicDiseases}
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'black' }}>
                                    <strong style={{ color: '#03035d' }}>Past Surgeries:</strong> {patientData.medicalHistory.pastSurgeries}
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'black' }}>
                                    <strong style={{ color: '#03035d' }}>Family Medical History:</strong> {patientData.medicalHistory.familyMedicalHistory}
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'black' }}>
                                    <strong style={{ color: '#03035d' }}>Medication List:</strong> {patientData.medicalHistory.medicationList}
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'black' }}>
                                    <strong style={{ color: '#03035d' }}>Allergies:</strong> {patientData.medicalHistory.allergies}
                                </Typography>
                            </Box>
                        )}
                        <Typography variant="body1" sx={{ color: 'black', marginTop: '10px' }}>
                            <strong style={{ color: '#03035d' }}>Summary:</strong>
                            <br />
                            {isEditing ? (
                                <textarea
                                    value={modalContent.summary}
                                    onChange={(e) => setModalContent({ ...modalContent, summary: e.target.value })}
                                    rows={4}
                                    style={{ width: '100%', height: '200px' }}
                                />
                            ) : (
                                <span>{testResult.summary}</span>
                            )}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'black', marginTop: '10px' }}>
                            <strong style={{ color: '#03035d' }}>Analysis:</strong>
                            <br />
                            {isEditing ? (
                                <TextField
                                    value={modalContent.analysis}
                                    onChange={(e) => setModalContent({ ...modalContent, analysis: e.target.value })}
                                    multiline
                                    rows={10}
                                    fullWidth
                                    variant="outlined"
                                    sx={{ marginTop: 1 }}
                                />
                            ) : (
                                <Box sx={{ marginTop: 1 }}>
                                    {renderAnalysisText(testResult.analysis)}
                                </Box>
                            )}
                        </Typography>
                    </Box>
                </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 5 }}>
                {role === 'doctor' && (
                    <>
                        <Button
                            onClick={isEditing ? handleSave : handleEdit}
                            sx={{ borderRadius: '20px', backgroundColor: isEditing ? '#03035d' : '#03035d', color: '#f8f6f6', marginRight: 1 }}
                        >
                            {isEditing ? 'Save' : 'Edit'}
                        </Button>
                        {!isEditing && (
                            <Button
                                onClick={handleApprove}
                                sx={{ borderRadius: '20px', backgroundColor: '#03a65d', color: '#f8f6f6' }}
                            >
                                Approve
                            </Button>
                        )}
                    </>
                )}
                <Button
                    onClick={() => navigate('/admin/panel/test-result')}
                    sx={{ borderRadius: '20px', backgroundColor: '#03035d', color: '#f8f6f6', marginLeft: 1 }}
                >
                    Back to List
                </Button>
            </Box>
        </Box>
    );
}

export default AdminTestResultDetailPage;
