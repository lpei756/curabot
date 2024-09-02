import axios from 'axios';
import OpenAI from 'openai';
import ChatSession from '../models/ChatSession.js';
import DoctorsSpecialisations from '../models/DoctorsSpecialisations.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getAppointmentsForUser = async (userId, authToken) => {
    try {
        const userResponse = await axios.get(`http://localhost:3001/api/auth/user/${userId}`, {
            headers: {
                'Authorization': authToken,
            },
        });

        const user = userResponse.data.user;
        const appointments = user.appointments || [];

        if (appointments.length === 0) {
            return 'You have no appointments scheduled.';
        }

        const lastThreeAppointments = appointments.slice(-3);

        const appointmentList = lastThreeAppointments.map(appt => {
            const dateStr = appt.date.$date || appt.date;
            const date = new Date(dateStr);
            const formattedDate = !isNaN(date.getTime()) ? date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }) : "Invalid Date";
            return `<div style="margin-bottom: 10px; padding: 10px; border: 1px solid #03035d; border-radius: 5px;">
                        <p><strong>ID:</strong> ${appt.appointmentID}</p>
                        <p><strong>Date:</strong> ${formattedDate}</p>
                        <p><strong>Status:</strong> ${appt.status}</p>
                    </div>`;
        }).join('');

        return `
    Here are your appointments:
    <div>${appointmentList}</div>
    <a href="http://localhost:5173/appointment" style="display:inline-block; padding:10px 20px; font-size:16px; color:white; background-color:#03035D; text-decoration:none; border-radius:5px; margin-bottom:10px;">View Details</a>
    <br>
    Let me know if you would like to make an appointment, update an appointment, or delete an appointment.
`;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw new Error('Error fetching user data');
    }
};

export const processChatWithOpenAI = async (userMessage) => {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful healthcare assistant named Cura. Your role is to assist patients with booking appointments, provide information about clinic services, and help with other healthcare-related inquiries. Always ensure that you provide accurate and supportive responses in the context of healthcare.'
                },
                {
                    role: 'user', content: userMessage
                }],
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error with OpenAI API:', error);
        throw new Error('Error processing chat with OpenAI');
    }
};

export const sendFeedbackToServer = async (messageId, feedback) => {
    console.log('Sending feedback:', { messageId, feedback });

    try {
        const response = await axios.post('http://localhost:3001/api/feedback', {
            messageId,
            feedback
        });
        console.log('Server response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending feedback:', error);
        throw new Error('Error sending feedback');
    }
};

export const getHistoryBySessionId = async (sessionId) => {
    try {
        const chatSession = await ChatSession.findById(sessionId).exec();
        return chatSession;
    } catch (error) {
        console.error('Error fetching chat session from the database:', error);
        throw new Error('Error fetching chat session');
    }
};

export const detectSymptomsUsingNLP = async (userMessage) => {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'Extract symptoms from the following message and return them as a comma-separated list.'
                },
                {
                    role: 'user', content: userMessage
                }
            ],
        });

        const symptoms = response.choices[0].message.content.trim();
        console.log('Detected Symptoms:', symptoms);
        return symptoms;
    } catch (error) {
        console.error('Error detecting symptoms:', error);
        throw new Error('Error detecting symptoms');
    }
};

export const identifySpecialisation = async (userMessage) => {
    try {
        const detectedSymptoms = await detectSymptomsUsingNLP(userMessage);

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'Identify the medical specialisation based on the symptoms described by the user.'
                },
                {
                    role: 'user', content: detectedSymptoms
                }
            ],
        });

        const specialisation = response.choices[0].message.content.trim();
        console.log('Identified Specialisation:', specialisation);

        const specialisationData = await DoctorsSpecialisations.findOne({ specialisation: specialisation }).exec();

        if (specialisationData && Array.isArray(specialisationData.doctorIDs)) {
            return specialisationData.doctorIDs;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error identifying specialisation:', error);
        throw new Error('Error identifying specialisation');
    }
};
