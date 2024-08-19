import DoctorAvailability from '../models/DoctorAvailability.js';

export const setDoctorAvailability = async (req, res) => {
  try {
    const doctorID = req.params.doctorID;
    const { slots } = req.body;
    
    await DoctorAvailability.updateOne({ doctorID }, { $set: { slots } }, { upsert: true });

    res.status(200).json({ message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Error setting doctor availability:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDoctorAvailability = async (req, res) => {
  try {
    const doctorID = req.params.doctorID;

    const availability = await DoctorAvailability.findOne({ doctorID });

    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }

    res.status(200).json(availability);
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
