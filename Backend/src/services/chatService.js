import axios from 'axios';
import OpenAI from 'openai';
import ChatSession from '../models/ChatSession.js';
import DoctorsSpecialisations from '../models/DoctorsSpecialisations.js';
import { geocodeAddress, haversineDistance } from '../services/doctorAvailabilityService.js';
import { getDoctorByIdService } from '../services/doctorService.js';
import { getClinicByIdService } from '../services/clinicService.js';

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
            model: 'gpt-4',
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
                    content: 'Extract symptoms from the following message and return them as a comma-separated list. If no symptoms are found, return "No symptoms detected."'
                },
                {
                    role: 'user', content: userMessage
                }
            ],
        });

        const symptoms = response.choices[0].message.content.trim();
        console.log('Detected Symptoms:', symptoms);
        return symptoms !== '' ? symptoms : 'No symptoms detected.';
    } catch (error) {
        console.error('Error detecting symptoms:', error);
        throw new Error('Error detecting symptoms');
    }
};

export const identifySpecialisation = async (symptoms, userLocation) => {
    try {
        const detectedSymptoms = symptoms;

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'Identify the medical specialisation based on the symptoms described by the user. Return the specialisation type, and if none can be identified, return "Unknown specialisation".'
                },
                {
                    role: 'user', content: detectedSymptoms
                }
            ],
        });

        const specialisation = response.choices[0].message.content.trim();
        console.log('Identified Specialisation:', specialisation);

        if (specialisation === 'Unknown specialisation') {
            return { specialisation: 'Unknown', doctors: [] };
        }

        const specialisationData = await DoctorsSpecialisations.findOne({ specialisation }).exec();

        if (specialisationData && Array.isArray(specialisationData.doctorIDs)) {
            const doctorIDs = specialisationData.doctorIDs;
            const doctors = [];

            for (const doctorID of doctorIDs) {
                const doctorResult = await getDoctorByIdService(doctorID);
                if (doctorResult.error) {
                    console.error(`Error fetching doctor data for ID ${doctorID}:`, doctorResult.error);
                    continue;
                }

                const doctorData = doctorResult.doctor;
                if (!doctorData || !doctorData.clinic) {
                    console.error(`Doctor or clinic information is missing for doctor ID ${doctorID}`);
                    continue;
                }

                const clinicResult = await getClinicByIdService(doctorData.clinic);
                if (clinicResult.error) {
                    console.error(`Error fetching clinic data for doctor ID ${doctorID}:`, clinicResult.error);
                    continue;
                }

                const clinicData = clinicResult.clinic;
                if (!clinicData || !clinicData.address) {
                    console.error(`Clinic address is missing for doctor ID ${doctorID}`);
                    continue;
                }

                const clinicLocation = await geocodeAddress(clinicData.address);
                if (!clinicLocation || !clinicLocation.lat || !clinicLocation.lng) {
                    console.error(`Unable to geocode address ${clinicData.address} or missing location data`);
                    continue;
                }

                if (!userLocation || !userLocation.lat || !userLocation.lng) {
                    throw new Error('User location data is missing');
                }

                const distance = haversineDistance(userLocation.lat, userLocation.lng, clinicLocation.lat, clinicLocation.lng);
                console.log(`Distance for Doctor ${doctorID}: ${distance} km`);

                doctors.push({
                    doctorName: `${doctorData.firstName} ${doctorData.lastName}`,
                    clinicName: clinicData.name,
                    distance: distance,
                    doctorID: doctorData.doctorID
                });
            }

            return { specialisation, doctors };
        } else {
            return { specialisation: 'Unknown', doctors: [] };
        }
    } catch (error) {
        console.error('Error identifying specialisation:', error);
        throw new Error('Error identifying specialisation');
    }
};
