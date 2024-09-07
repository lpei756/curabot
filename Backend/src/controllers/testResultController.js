import multer from 'multer';
import path from 'path';
import { uploadTestResultService, getTestResult, editTestResultService, approveTestResultService, getAllTestResultsService } from '../services/testResultService.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('file');

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

    const { patientID, doctorID, testName } = req.body;
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
      fileName: file.filename,
      testName
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

export const readTestResult = async (req, res) => {
  const { testResultId } = req.params;
  const user = req.user;

  try {
    const result = await getTestResult(testResultId, user);
    if (result.error) {
      console.error(result.message);
      return res.status(result.status || 500).json({ message: result.message });
    }
    res.status(200).json(result.testResult);
  } catch (error) {
    console.error('Error reading test result:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const editTestResult = async (req, res) => {
  const { testResultId } = req.params;
  const user = req.user;
  const updatedFields = req.body;

  try {
    const result = await editTestResultService(testResultId, user, updatedFields);
    if (result.error) {
      console.error(result.message);
      return res.status(result.status || 500).json({ message: result.message });
    }
    res.status(200).json(result.testResult);
  } catch (error) {
    console.error('Error editing test result:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const approveTestResult = async (req, res) => {
  const { testResultId } = req.params;
  const user = req.user;

  try {
    if (user.role !== 'doctor') {
      console.error('User is not authorized to approve this test result');
      return res.status(403).json({ message: 'You are not authorized to approve this test result' });
    }

    const result = await approveTestResultService(testResultId, user);
    if (result.error) {
      console.error(result.message);
      return res.status(result.status || 500).json({ message: result.message });
    }
    res.status(200).json(result.testResult);
  } catch (error) {
    console.error('Error approving test result:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllTestResults = async (req, res) => {
  const user = req.user;

  try {
    const { error, testResults, message, status } = await getAllTestResultsService(user);

    if (error) {
      console.error('Error fetching test results:', message);
      return res.status(status || 500).json({ message });
    }

    if (testResults.length === 0) {
      return res.status(200).json({ message: 'No test results found' });
    }

    res.status(200).json({ testResults });
  } catch (error) {
    console.error('Error retrieving test results:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
