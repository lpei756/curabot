import { useState, useContext } from 'react';
import axios from 'axios';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { AuthContext } from '../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';  // 引入 PropTypes

function ImageUpload({ open, onClose, onImageUploaded }) {
    const [selectedFile, setSelectedFile] = useState(null); // 确保 selectedFile 已定义
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false); // 添加上传状态
    const { authToken } = useContext(AuthContext);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // 检查文件类型和大小
            const fileType = file.type.split('/')[0];
            const fileSizeMB = file.size / 1024 / 1024; // 转换为MB
            if (fileType !== 'image') {
                setError('Please upload a valid image file.');
                return;
            }
            if (fileSizeMB > 5) {
                setError('File size exceeds the 5MB limit.');
                return;
            }
            setSelectedFile(file);
            setError(null); // 清除之前的错误信息
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return; // 如果没有选中文件，直接返回

        setUploading(true); // 设置上传状态为true

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('userId', '66b156c604e94197067c31a8'); // 确保这个是正确的

        try {
            const response = await axios.post('http://localhost:3001/api/images/uploadImage', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authToken}`
                }
            });
            onImageUploaded(response.data); // 成功上传后调用回调
            onClose(); // 关闭对话框
        } catch (error) {
            console.error('Image upload failed:', error);
            setError('Image upload failed. Please try again.');
        } finally {
            setUploading(false); // 恢复上传状态为false
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Upload Image</DialogTitle>
            <DialogContent>
                <input type="file" onChange={handleFileChange} /> {/* 文件选择器 */}
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

// 添加 PropTypes 验证
ImageUpload.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onImageUploaded: PropTypes.func.isRequired,
};

export default ImageUpload;
