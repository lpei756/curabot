import OpenAI from 'openai';
import UserModel from '../models/User.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const generateAnalysis = async (pdfText, patientId) => {
    try {
        const patient = await UserModel.findOne({ patientID: patientId }).exec();

        if (!patient) {
            throw new Error('Patient not found');
        }

        const { medicalHistory } = patient;

        const analysisPrompt = `
        Analyze the following test result:
        ${pdfText}
  
        Patient's Medical History:
        - Chronic Diseases: ${medicalHistory.chronicDiseases}
        - Past Surgeries: ${medicalHistory.pastSurgeries}
        - Family Medical History: ${medicalHistory.familyMedicalHistory}
        - Medication List: ${medicalHistory.medicationList}
        - Allergies: ${medicalHistory.allergies}
  
        Provide a detailed analysis based on the test result and medical history.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'Generate a detailed analysis of the test result based on the patient’s medical history and the text extracted from the PDF. Please note that only analysis is required, no recommendations need to be made.'
                },
                {
                    role: 'user',
                    content: analysisPrompt
                }
            ]
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating analysis:', error);
        throw new Error('Failed to generate analysis');
    }
};
