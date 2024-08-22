import { getAppointmentsForUser, processChatWithOpenAI } from '../services/chatService.js';
import { extractUserIdFromToken } from '../middlewares/authMiddleware.js';
import { getAllAvailableSlots, findNearestSlot } from '../services/doctorAvailabilityService.js';
import { getDoctorByIdService } from '../services/doctorService.js';

export const handleChat = async (req, res) => {
  try {
    const userMessage = req.body.message;
    const authToken = req.headers.authorization;

    const appointmentRequestKeywords = [
      'show my appointments',
      'list my appointments',
      'my appointments',
      'appointments',
    ];

    const autoAppointmentKeywords = [
      'schedule appointment',
      'book appointment',
      'find available slot',
      'auto appointment',
      'booking'
    ];

    if (appointmentRequestKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      if (!authToken) {
        return res.status(401).json({ error: 'Unauthorized: No token provided. Please log in to view your appointments.' });
      }

      try {
        const userId = extractUserIdFromToken(authToken);
        const appointmentsReply = await getAppointmentsForUser(userId, authToken);
        return res.json({ reply: appointmentsReply });
      } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
    }


    if (autoAppointmentKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      if (!authToken) {
        return res.status(401).json({ error: 'Unauthorized: No token provided. Please log in to schedule an appointment.' });
      }

      try {
        const availableSlots = await getAllAvailableSlots();
        const nearestSlot = findNearestSlot(availableSlots);

        if (!nearestSlot) {
          return res.json({
            reply: 'Sorry, there are no available slots at the moment. Please try again later.'
          });
        }

        const doctorResult = await getDoctorByIdService(nearestSlot.doctorID);

        if (doctorResult.error) {
          return res.status(doctorResult.status).json({ message: doctorResult.message });
        }

        const clinicId = doctorResult.doctor.clinic;

        return res.json({
          reply: `
            I found an available slot for you. Would you like to book it?
            <p><strong>Date:</strong> ${new Date(nearestSlot.startTime).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${new Date(nearestSlot.startTime).toLocaleTimeString()}</p>
            <button onclick="
              (async function() {
                try {
                  const response = await fetch('http://localhost:3001/api/appointments/create', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': '${authToken}' // Ensure authToken is properly injected
                    },
                    body: JSON.stringify({
                      dateTime: '${nearestSlot.startTime.toISOString()}', // Convert to ISO string
                      clinic: '${clinicId}', // Ensure clinicId is defined and available
                      assignedGP: '${nearestSlot.doctorID}'
                    })
                  });
                  const data = await response.json();
                  if (response.ok) {
                    alert('Your appointment has been successfully booked.');
                  } else {
                    alert('Error: ' + data.message);
                  }
                } catch (error) {
                  alert('Sorry, something went wrong. Please try again.');
                }
              })()
            ">Book Now</button>
          `
        });
      } catch (error) {
        console.error('Error fetching or processing available slots:', error);
        return res.status(500).json({ error: 'Error fetching available slots' });
      }
    }

    try {
      const aiResponse = await processChatWithOpenAI(userMessage);
      return res.json({ reply: aiResponse });
    } catch (error) {
      return res.status(500).json({ error: 'Error processing chat' });
    }
  } catch (error) {
    console.error('Error processing chat:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
