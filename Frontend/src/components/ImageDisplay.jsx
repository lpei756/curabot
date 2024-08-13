import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

function ImageDisplay({ userId }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { authToken } = useContext(AuthContext);

    useEffect(() => {
        const fetchUserImages = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/images/user/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                setImages(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchUserImages();
    }, [userId, authToken]);

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box>
            <Typography variant="h6">User Images</Typography>
            {images.length > 0 ? (
                images.map((image, index) => (
                    <Box key={image._id} sx={{ my: 2 }}>
                        <Typography><strong>Image {index + 1}:</strong> {image.filename}</Typography>
                        <img
                            src={`http://localhost:3001/uploads/${image.filename}`}
                            alt={`User uploaded ${image.filename}`}
                            style={{ maxWidth: '100%', height: 'auto' }}
                        />
                    </Box>
                ))
            ) : (
                <Typography>No images available.</Typography>
            )}
        </Box>
    );
}

ImageDisplay.propTypes = {
    userId: PropTypes.string.isRequired,
};

export default ImageDisplay;
