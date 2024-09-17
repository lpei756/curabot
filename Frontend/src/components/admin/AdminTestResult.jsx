import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import PDFViewer from '../testresult/PDFViewer';
import { fetchTestResults } from '../../services/testResultService';
import '../../App.css';

const apiUrl = import.meta.env.VITE_API_URL;
function AdminTestResultsPage() {
    const [testResults, setTestResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const results = await fetchTestResults();
                results.sort((a, b) => new Date(b.dateUploaded) - new Date(a.dateUploaded));
                setTestResults(results);
            } catch (err) {
                setError('Failed to fetch test results.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    const handleOpenDetailPage = (resultId) => {
        navigate(`/admin/panel/test-result/${resultId}`);
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
            height: '100vh',
            overflow: 'auto',
            padding: 4
        }}>
            <Typography variant="h3" sx={{ color: 'black', fontWeight: 'bold', marginBottom: '30px' }}>
                Test Results
            </Typography>
            {testResults.length > 0 ? (
                <Box>
                    {testResults.map(result => (
                        <Box
                            key={result._id}
                            sx={{
                                marginBottom: 3,
                                padding: 2,
                                border: '1px solid',
                                borderColor: result.reviewed ? '#03a65d' : '#f0ad4e', // Green for reviewed, orange for not reviewed
                                borderRadius: 2,
                                color: 'black',
                                maxWidth: '900px',
                                maxHeight: '350px',
                                display: 'flex',
                                cursor: 'pointer',
                                backgroundColor: result.reviewed ? '#d4edda' : '#f8d7da', // Light green for reviewed, light red for not reviewed
                                '&:hover': {
                                    backgroundColor: result.reviewed ? '#c3e6cb' : '#f5c6cb'
                                }
                            }}
                            onClick={() => handleOpenDetailPage(result._id)} // Navigate to the detail page on click
                        >
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ flex: 1, width: '150px', height: '350px', overflow: 'hidden' }}>
                                    <PDFViewer pdfUrl={`${apiUrl}/uploads/${result.fileName}`} />
                                </Box>
                                <Box sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <strong style={{ color: '#03035d' }}>Test Name:</strong>
                                        <span>{result.testName}</span>
                                    </Typography>
                                    <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <strong style={{ color: '#03035d' }}>Date Uploaded:</strong>
                                        <span>{new Date(result.dateUploaded).toLocaleDateString()}</span>
                                    </Typography>
                                    <Typography variant="body1" sx={{ marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <strong style={{ color: '#03035d' }}>Summary:</strong>
                                        <br />
                                        <span>{result.summary}</span>
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
            ) : (
                <Typography sx={{ color: 'black' }}>No test results available</Typography>
            )}
        </Box>
    );
}

export default AdminTestResultsPage;
