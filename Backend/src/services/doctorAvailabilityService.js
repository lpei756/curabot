import DoctorAvailability from '../models/DoctorAvailability.js';

export const setAvailability = async (doctorID, date, slots) => {
  let availability = await DoctorAvailability.findOne({ doctorID, date });

  if (availability) {
    availability.slots = slots;
    availability.updatedAt = Date.now();
  } else {
    availability = new DoctorAvailability({
      doctorID,
      date,
      slots
    });
  }

  await availability.save();

  return availability;
};
