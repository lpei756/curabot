import { useState, useContext } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { AuthContext } from '../../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { API_PATH } from '../../utils/urlRoutes';

function ImageUpload({ open, onClose, onImageUploaded }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const { authToken, userId } = useContext(AuthContext);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileType = file.type.split('/')[0];
            const fileSizeMB = file.size / 1024 / 1024;
            if (fileType !== 'image') {
                setError('Please upload a valid image file.');
                return;
            }
            if (fileSizeMB > 5) {
                setError('File size exceeds the 5MB limit.');
                return;
            }
            setSelectedFile(file);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('userId', userId);
        console.log([...formData]);

        try {
            const response = await axios.post(API_PATH.images.uploadImage, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authToken}`
                }
            });
            onImageUploaded(response.data);
            onClose();
        } catch (error) {
            console.error('Image upload failed:', error);
            setError('Image upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Upload Image</DialogTitle>
            <DialogContent>
                <input type="file" onChange={handleFileChange} />
                {error && <Typography color="error" variant="body2">{error}</Typography>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary" disabled={uploading}>Cancel</Button>
                <Button onClick={handleUpload} color="primary" disabled={uploading || !selectedFile}>
                    {uploading ? <CircularProgress size={24} /> : 'Upload'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ImageUpload.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onImageUploaded: PropTypes.func.isRequired,
};

export default ImageUpload;
