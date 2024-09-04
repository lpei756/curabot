import TestResult from '../models/TestResult.js';
import { generateAnalysis, generateSummary } from '../utils/aiUtils.js';
import pdfExtract from 'pdf-text-extract';
import UserModel from '../models/User.js';
import Doctor from '../models/Doctor.js'

export const uploadTestResultService = async (testResultData) => {
    try {
        const testResult = new TestResult(testResultData);
        await testResult.save();

        const pdfText = await extractTextFromPDF(`uploads/${testResult.fileName}`);
        console.log('Extracted text:', pdfText);

        const analysis = await generateAnalysis(pdfText, testResultData.patientID);
        console.log('Generated analysis:', analysis);

        const summary = await generateSummary(analysis);
        console.log('Generated summary:', summary);

        testResult.pdfText = pdfText;
        testResult.analysis = analysis;
        testResult.summary = summary;
        await testResult.save();

        return { error: false, testResult };
    } catch (error) {
        console.error('Error uploading test result service:', error);
        return { error: true, status: 500, message: 'Internal server error' };
    }
};

const extractTextFromPDF = async (filePath) => {
    return new Promise((resolve, reject) => {
        pdfExtract(filePath, (err, pages) => {
            if (err) {
                console.error('Error extracting text from PDF:', err);
                return reject(err);
            }
            resolve(pages.join(' '));
        });
    });
};

export const getTestResult = async (testResultId, user) => {
    try {
        const testResult = await TestResult.findById(testResultId).exec();
        if (!testResult) {
            console.error('TestResult not found');
            return { error: true, status: 404, message: 'Test result not found' };
        }

        let isAuthorized = false;

        if (user.role === 'doctor') {
            const doctor = await Doctor.findById(user._id).exec();

            if (doctor) {
                if (doctor.doctorID === testResult.doctorID) {
                    isAuthorized = true;
                }
            } else {
                console.error('Doctor not found with given _id');
            }
        } else {
            const userDetails = await UserModel.findById(user._id).exec();

            if (userDetails && userDetails.patientID === testResult.patientID) {
                if (testResult.reviewed) {
                    isAuthorized = true;
                }
            }
        }

        if (isAuthorized) {
            return { error: false, testResult };
        } else {
            console.error('User is not authorized');
            return { error: true, status: 403, message: 'You are not authorized to view this test result' };
        }
    } catch (error) {
        console.error('Error getting test result:', error);
        return { error: true, status: 500, message: 'Internal server error' };
    }
};

export const editTestResultService = async (testResultId, user, updatedFields) => {
    try {
        if (user.role !== 'doctor') {
            return { error: true, status: 403, message: 'Only doctors can edit the test result' };
        }

        const testResult = await TestResult.findById(testResultId).exec();
        if (!testResult) {
            console.error('TestResult not found');
            return { error: true, status: 404, message: 'Test result not found' };
        }

        const doctor = await Doctor.findById(user._id).exec();
        if (!doctor) {
            console.error('Doctor not found with given _id');
            return { error: true, status: 404, message: 'Doctor not found' };
        }

        if (doctor.doctorID !== testResult.doctorID) {
            return { error: true, status: 403, message: 'You are not authorized to edit this test result' };
        }

        const allowedFields = ['summary', 'analysis'];
        const filteredFields = Object.keys(updatedFields)
            .filter(field => allowedFields.includes(field))
            .reduce((obj, key) => {
                obj[key] = updatedFields[key];
                return obj;
            }, {});

        const updatedTestResult = await TestResult.findByIdAndUpdate(
            testResultId,
            { $set: filteredFields },
            { new: true, runValidators: true }
        ).exec();

        return { error: false, testResult: updatedTestResult };
    } catch (error) {
        console.error('Error editing test result service:', error);
        return { error: true, status: 500, message: 'Internal server error' };
    }
};

export const approveTestResultService = async (testResultId, user) => {
    try {
        const testResult = await TestResult.findById(testResultId).exec();

        if (!testResult) {
            console.error('TestResult not found');
            return { error: true, status: 404, message: 'Test result not found' };
        }

        const doctor = await Doctor.findById(user._id).exec();

        if (!doctor) {
            console.error('Doctor not found with given _id');
            return { error: true, status: 404, message: 'Doctor not found' };
        }

        if (doctor.doctorID !== testResult.doctorID) {
            console.error('Doctor is not authorized to approve this test result');
            return { error: true, status: 403, message: 'You are not authorized to approve this test result' };
        }

        testResult.reviewed = true;
        await testResult.save();

        return { error: false, testResult };
    } catch (error) {
        console.error('Error approving test result service:', error);
        return { error: true, status: 500, message: 'Internal server error' };
    }
};
