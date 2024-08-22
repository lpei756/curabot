import axios from 'axios';
import OpenAI from 'openai';

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