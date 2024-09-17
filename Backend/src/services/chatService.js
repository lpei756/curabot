import axios from 'axios';
import OpenAI from 'openai';
import ChatSession from '../models/ChatSession.js';
import DoctorsSpecialisations from '../models/DoctorsSpecialisations.js';
import ClinicModel from '../models/Clinic.js';
import { geocodeAddress, haversineDistance } from './doctorAvailabilityService.js';
import { getDoctorByIdService } from './doctorService.js';
import { getClinicByIdService } from './clinicService.js';
import dotenv from 'dotenv';

dotenv.config();
const BASE_URL = process.env.BASE_URL;
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getAppointmentsForUser = async (userId, authToken) => {
    try {
        const userResponse = await axios.get(`${BASE_URL}/api/auth/user/${userId}`, {
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
    <a href="${BASE_URL}/appointment" style="display:inline-block; padding:10px 20px; font-size:16px; color:white; background-color:#03035D; text-decoration:none; border-radius:5px; margin-bottom:10px;">View Details</a>
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
                    content: 'Extract symptoms from the following message and determine if they indicate an emergency. Return a JSON object with the symptoms and a flag indicating whether it is an emergency. If no symptoms are found, return "No symptoms detected."'
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ],
        });

        const messageContent = response.choices[0].message.content.trim();
        console.log('Message content:', messageContent);

        let symptoms = 'No symptoms detected.';
        let isEmergency = false;

        try {
            const parsedResult = JSON.parse(messageContent);
            if (Array.isArray(parsedResult.symptoms)) {
                symptoms = parsedResult.symptoms.join(', ');
            } else if (typeof parsedResult.symptoms === 'string') {
                symptoms = parsedResult.symptoms;
            }
            isEmergency = parsedResult.emergency || false;
        } catch (e) {
            console.error('Error parsing result:', e);
            console.error('Raw result:', messageContent);
        }

        if (isEmergency) {
            return {
                response: 'It sounds like an emergency. Please go to the hospital or call 111 immediately.',
                symptoms
            };
        } else {
            return { symptoms };
        }
    } catch (error) {
        console.error('Error detecting symptoms:', error);
        throw new Error('Error detecting symptoms');
    }
};

export const identifySpecialisation = async (symptoms, userLocation) => {
    try {
        if (symptoms === 'No symptoms detected.') {
            return { specialisation: 'Unknown', doctors: [] };
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'Identify the medical specialisation based on the symptoms described by the user. Return the specialisation type, and if none can be identified, return "Unknown specialisation".'
                },
                {
                    role: 'user', content: symptoms
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

export const findClinicDetailsUsingNLP = async (userMessage) => {
    try {
        const openAIResponse = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'Extract clinic-related information from the following message. Return a JSON object with the location, service type, and requested contact info. If any information is missing or unclear, return null for that field.'
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ],
        });

        const messageContent = openAIResponse.choices[0].message.content.trim();

        let location = null;
        try {
            const parsedResult = JSON.parse(messageContent);
            location = parsedResult.location || null;
        } catch (e) {
            console.error('Error parsing result:', e);
            console.error('Raw result:', messageContent);
        }

        if (!location) {
            return { response: 'Could not detect the location from your query. Please try again.' };
        }

        const query = { address: new RegExp(location, 'i') };
        let clinics = [];
        try {
            clinics = await ClinicModel.find(query);
        } catch (error) {
            console.error('Error querying clinic database:', error);
            return { response: 'Error retrieving clinic details from the database.' };
        }

        if (!clinics.length) {
            return { response: `No clinics found in ${location}.` };
        }

        let clinicResponses = `The clinics in ${location} are listed below:<br/><br/>`;
        clinics.forEach(clinic => {
            clinicResponses += `Name: ${clinic.name}<br/>Address: ${clinic.address}<br/><br/>`;
        });

        return { responses: [clinicResponses] };
    } catch (error) {
        console.error('Error processing clinic details:', error);
        throw new Error('Error processing clinic details');
    }
};
