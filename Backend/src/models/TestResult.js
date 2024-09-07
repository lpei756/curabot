import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
    patientID: { type: String, required: true },
    doctorID: { type: String, required: true },
    fileName: { type: String, required: true },
    pdfText: { type: String, required: false },
    analysis: { type: String, required: false },
    summary: { type: String, required: false },
    reviewed: { type: Boolean, default: false },
    testName: { type: String, required: true },
    dateUploaded: { type: Date, default: Date.now }
});

export default mongoose.model('TestResult', testResultSchema);