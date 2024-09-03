import multer from 'multer';
import path from 'path';
import { uploadTestResultService } from '../services/testResultService.js';

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1662339203945.pdf
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
}).single('file'); // Use single if only one file is expected

export const uploadTestResult = async (req, res) => {
  console.log('Validating request body:', req.body);

  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ message: err.message });
    } else if (err) {
      console.error('Unknown error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    console.log('Request body after upload:', req.body);
    console.log('Uploaded file:', req.file);

    const { patientID, doctorID } = req.body;
    const file = req.file;

    if (!file) {
      console.error('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!patientID || !doctorID) {
      console.error('Missing patientID or doctorID');
      return res.status(400).json({ message: 'Patient ID and Doctor ID are required' });
    }

    const testResultData = {
      patientID,
      doctorID,
      fileName: file.filename, // Store the file path in the database
    };

    try {
      const result = await uploadTestResultService(testResultData);
      if (result.error) {
        console.error('Service error:', result.message);
        return res.status(result.status || 500).json({ message: result.message });
      }
      res.status(201).json(result.testResult);
    } catch (error) {
      console.error('Error uploading test result:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
};