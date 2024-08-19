import DoctorAvailability from '../models/DoctorAvailability.js';
import Clinic from '../models/Clinic.js';

export const setAvailability = async (doctorID, date, startTime, endTime, isBooked, bookedBy) => {
    const availability = new DoctorAvailability({
        doctorID,
        date,
        startTime,
        endTime,
        isBooked,
        bookedBy
    });

    return await availability.save();
};

export const getAvailabilityByDoctorID = async (doctorID) => {
    return await DoctorAvailability.findOne({ doctorID });
};

export const getAllAvailabilityByDate = async (date) => {
    return await DoctorAvailability.find({ date });
};

export const getAvailabilityByAddress = async (partialAddress) => {
    try {
        console.log('Searching for clinics with partial address:', partialAddress);
        const clinic = await Clinic.findOne({
            address: { $regex: partialAddress, $options: 'i' }
        }).exec();

        if (!clinic) {
            console.error('Clinic not found for partial address:', partialAddress);
            throw new Error('Clinic not found');
        }

        console.log('Clinic found:', clinic);
        const doctorIDs = clinic.doctors.map(doctor => doctor.doctorID);

        console.log('Doctor IDs from clinic:', doctorIDs);
        const availability = await DoctorAvailability.find({ doctorID: { $in: doctorIDs } }).exec();

        console.log('Availability found:', availability);
        return availability;
    } catch (error) {
        console.error('Error fetching availability by address:', error);
        throw error;
    }
};

export const getAllAvailableSlots = async () => {
    try {
        return await DoctorAvailability.find({ isBooked: false }).exec();
    } catch (error) {
        console.error('Error fetching all available slots:', error);
        throw new Error('Failed to fetch available slots');
    }
};

export const updateAvailability = async (doctorID, slotId, updates) => {
    try {
        const doctorAvailability = await DoctorAvailability.findOne({
            doctorID,
            _id: slotId
        });

        if (!doctorAvailability) {
            throw new Error('Doctor availability not found');
        }

        const startTime = new Date(updates.startTime);
        const endTime = new Date(updates.endTime);

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            throw new Error('Invalid date format');
        }

        doctorAvailability.startTime = startTime;
        doctorAvailability.endTime = endTime;
        doctorAvailability.isBooked = updates.isBooked;
        doctorAvailability.bookedBy = updates.bookedBy;

        await doctorAvailability.save();
        return doctorAvailability;
    } catch (error) {
        console.error('Error updating slot:', error);
        throw error;
    }
};

export const deleteAvailability = async (doctorID, slotId) => {
    try {
        const result = await DoctorAvailability.deleteOne({
            doctorID,
            _id: slotId
        });

        if (result.deletedCount === 0) {
            throw new Error('Doctor availability not found');
        }

        return { message: 'Slot deleted successfully' };
    } catch (error) {
        console.error('Error deleting slot:', error);
        throw error;
    }
};
