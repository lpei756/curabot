import DoctorAvailability from '../models/DoctorAvailability.js';
import Clinic from '../models/Clinic.js';
import Doctor from '../models/Doctor.js';

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

export const getAvailabilityByAddress = async (address) => {
    // Find the clinic by address
    const clinic = await Clinic.findOne({ address });
    if (!clinic) throw new Error('Clinic not found');
  
    // Find doctors associated with the clinic
    const doctors = await Doctor.find({ clinic: clinic._id });
    if (doctors.length === 0) throw new Error('No doctors found for this clinic');
  
    // Get doctor IDs
    const doctorIDs = doctors.map((doctor) => doctor.doctorID);
  
    // Find availability slots for the doctors
    const availabilitySlots = await DoctorAvailability.find({
      doctorID: { $in: doctorIDs },
    });
  
    return availabilitySlots;
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
