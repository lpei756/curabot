import TestResult from '../models/TestResult.js';
import { generateAnalysis, generateSummary } from '../utils/aiUtils.js';
import pdfExtract from 'pdf-text-extract';

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

        const isDoctor = user.role === 'doctor';
        const isPatient = user.patientID === testResult.patientID;
        const isReviewed = testResult.reviewed;

        if (isDoctor || isPatient || isReviewed) {
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
