import { getAllPrescriptions as getAllPrescriptionsService } from "../services/prescriptionService.js";

export const getAllPrescriptions = async (req, res) => {
    const userId = req.user._id;
    const userRole = req.user.role;
    try {
        const prescriptions = await getAllPrescriptionsService(userId, userRole);

        if (!prescriptions || prescriptions.length === 0) {
            return res.status(404).json({ message: 'No prescriptions found' });
        }

        return res.status(200).json(prescriptions);

    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
