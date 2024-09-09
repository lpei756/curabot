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
        Analyze the following test result and provide a clear, structured report using bullet points. Each section should be organized with bullet points for easy reading. 

        Test Result:
        ${pdfText}
  
        Patient's Medical History:
        - Chronic Diseases: ${medicalHistory.chronicDiseases || 'Not available'}
        - Past Surgeries: ${medicalHistory.pastSurgeries || 'Not available'}
        - Family Medical History: ${medicalHistory.familyMedicalHistory || 'Not available'}
        - Medication List: ${medicalHistory.medicationList || 'Not available'}
        - Allergies: ${medicalHistory.allergies || 'Not available'}

        NOTED only generate the analysis, don't need any other.
  
        Use simple language and avoid medical jargon where possible.`;
        
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'Generate a clear and structured analysis of the test result based on the patient’s medical history. Use bullet points for analysis. Ensure the language is simple and easy to understand. ONLY ANALYSIS, NO OTHER THINGS ARE NEEDED.'
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

export const generateSummary = async (analysis) => {
    try {
        const summaryPrompt = `
        Based on the following analysis, provide a brief summary indicating whether the test result is normal or if there are any concerns:
        ${analysis}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'Provide a brief summary indicating whether the test result is normal or if there are any issues.'
                },
                {
                    role: 'user',
                    content: summaryPrompt
                }
            ]
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating summary:', error);
        throw new Error('Failed to generate summary');
    }
};
