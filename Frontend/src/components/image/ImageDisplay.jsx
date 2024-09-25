import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress } from '@mui/material';
import { AuthContext } from '../../context/AuthContext.jsx';
import { API_PATH } from '../../utils/urlRoutes.js';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

const ImageDisplay = ({ userId }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [zoomedImage, setZoomedImage] = useState(null);
    const { authToken } = useContext(AuthContext);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchUserImages = async () => {
            setLoading(true);
            try {
                const response = await axios.get(API_PATH.images.userImages.replace(':id', userId), {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                setImages(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserImages();
    }, [userId, authToken]);

    const handleImageClick = (imageId) => {
        setZoomedImage(zoomedImage === imageId ? null : imageId);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: '800px',
                margin: '20px auto',
                padding: '20px',
                boxSizing: 'border-box'
            }}
        >
            <Typography variant="h6" sx={{ color: '#03035d', marginBottom: '10px', textAlign: 'center' }}>
                User Images
            </Typography>

            {images.length > 0 ? (
                images.map((image, index) => (
                    <Box
                        key={`${image._id}-${index}`}
                        sx={{
                            position: 'relative',
                            my: 0.5,
                            mx: 0.5,
                            textAlign: 'center',
                            display: 'inline-block',
                            '&:hover .zoom-icon': {
                                opacity: 1,
                                transition: 'opacity 0.3s ease-in-out',
                            }
                        }}
                    >
                        <Box
                            sx={{
                                position: 'relative',
                                display: 'inline-block',
                                cursor: 'pointer',
                                '& img': {
                                    maxWidth: zoomedImage === image._id ? '100%' : '150px',
                                    height: zoomedImage === image._id ? 'auto' : '200px',
                                    objectFit: zoomedImage === image._id ? 'contain' : 'cover',
                                    borderRadius: '10px',
                                    border: '1px solid #03035d',
                                    transition: 'max-width 0.3s ease-in-out, height 0.3s ease-in-out',
                                }
                            }}
                            onClick={() => handleImageClick(image._id)}
                        >
                            <img
                                src={image.s3Url}
                                alt={`User uploaded ${image.filename} - ${index}`}
                            />

                            <ZoomInIcon
                                className="zoom-icon"
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: '30px',
                                    color: '#fff',
                                    opacity: 0,
                                }}
                            />
                        </Box>
                    </Box>
                ))
            ) : (
                <Typography>No images available.</Typography>
            )}
        </Box>
    );
};

const MemoizedImageDisplay = React.memo(ImageDisplay);

ImageDisplay.propTypes = {
    userId: PropTypes.string.isRequired,
};

export default MemoizedImageDisplay;
