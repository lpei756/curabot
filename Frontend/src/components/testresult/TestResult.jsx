import { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import PDFViewer from './PDFViewer';
import { fetchTestResults } from '../../services/testResultService';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
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

function TestResultsPage() {
    const [testResults, setTestResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedResult, setSelectedResult] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

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

    const handleOpenDialog = (result) => {
        setSelectedResult(result);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setSelectedResult(null);
        setOpenDialog(false);
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
            padding: 3,
            height: '100vh',
            overflow: 'auto'
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
                                border: '1px solid #03035d',
                                borderRadius: 2,
                                color: 'black',
                                maxWidth: '900px',
                                maxHeight: '350px',
                                display: 'flex',
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: '#f0f0f0'
                                }
                            }}
                            onClick={() => handleOpenDialog(result)}
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

            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="lg" sx={{ color: '#f8f6f6' }}>
                <DialogContent>
                    {selectedResult && (
                        <Box sx={{ display: 'flex', gap: 10 }}>
                            <Box sx={{ flex: 1, width: '400px', height: '700px' }}>
                                <PDFViewer pdfUrl={`${apiUrl}/uploads/${selectedResult.fileName}`} />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" gutterBottom >
                                    <strong style={{ color: '#03035d' }}>Test Name:</strong> {selectedResult.testName}
                                </Typography>
                                <Typography variant="body1">
                                    <strong style={{ color: '#03035d' }}>Date Uploaded:</strong> {new Date(selectedResult.dateUploaded).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body1" sx={{ marginTop: 2 }}>
                                    <strong style={{ color: '#03035d' }}>Summary:</strong>
                                    <br></br>
                                    {selectedResult.summary}
                                </Typography>
                                <Typography variant="body1" sx={{ marginTop: 2 }}>
                                    <strong style={{ color: '#03035d' }}>Analysis:</strong>
                                    {renderAnalysisText(selectedResult.analysis)}
                                    <br></br>
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center' }}>
                    <Button onClick={handleCloseDialog} sx={{ borderRadius: '20px', backgroundColor: '#03035d', color: '#f8f6f6' }} >Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default TestResultsPage;
