import {
    setAvailability,
    getAvailabilityByDoctorID,
    updateAvailability,
    deleteAvailability
} from '../services/doctorAvailabilityService.js';

export const setDoctorAvailability = async (req, res) => {
    try {
        const { doctorID } = req.params;
        const { date, startTime, endTime, isBooked, bookedBy } = req.body;

        const availability = await setAvailability(doctorID, date, startTime, endTime, isBooked, bookedBy);
        res.status(201).json({ message: 'Availability set successfully', availability });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getDoctorAvailability = async (req, res) => {
    try {
        const doctorID = req.params.doctorID;

        const availability = await getAvailabilityByDoctorID(doctorID);

        if (!availability) {
            return res.status(404).json({ message: 'Availability not found' });
        }

        res.status(200).json(availability);
    } catch (error) {
        console.error('Error fetching doctor availability:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

export const updateDoctorAvailability = async (req, res) => {
    try {
        const { doctorID, slotId } = req.params;
        const { startTime, endTime, isBooked, bookedBy } = req.body;

        console.log('Received data:', req.body);

        if (!startTime || !endTime) {
            return res.status(400).json({ message: 'Missing required fields: startTime or endTime' });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        const updatedAvailability = await updateAvailability(doctorID, slotId, {
            startTime: start,
            endTime: end,
            isBooked,
            bookedBy
        });

        res.status(200).json({ message: 'Slot updated successfully', updatedAvailability });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deleteDoctorAvailability = async (req, res) => {
    try {
        const { doctorID, slotId } = req.params;

        const result = await deleteAvailability(doctorID, slotId);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
