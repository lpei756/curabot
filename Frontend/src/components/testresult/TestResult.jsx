import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { fetchTestResults } from '../../services/testResultService';
import '../../App.css';

function TestResultsPage() {
    const [testResults, setTestResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const results = await fetchTestResults();
                console.log('Fetched test results:', results);
                setTestResults(results);
            } catch (err) {
                setError('Failed to fetch test results.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

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
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" sx={{color: 'black'}} gutterBottom>
                Test Results
            </Typography>
            {testResults.length === 0 ? (
                <Typography variant="body1" sx={{color: 'black'}}>No test results available.</Typography>
            ) : (
                <Box>
                    {testResults.map(result => (
                        <Box key={result._id} sx={{ marginBottom: 2, padding: 2, border: '1px solid #ddd', borderRadius: 2, color: 'black' }}>
                            <Typography variant="h6">Test ID: {result._id}</Typography>
                            <Typography variant="body1">Date: {new Date(result.date).toLocaleDateString()}</Typography>
                            <Typography variant="body1">Summary: {result.summary}</Typography>
                            <Typography variant="body1">Analysis: {result.analysis}</Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}

export default TestResultsPage;
