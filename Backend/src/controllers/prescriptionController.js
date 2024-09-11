import { getAllPrescriptions as getAllPrescriptionsService, getUserPrescriptions as getUserPrescriptionsService } from "../services/prescriptionService.js";

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

export const getUserPrescriptions = async (req, res) => {
    const userId = req.params.userId;
    const requestorId = req.user._id;
    const requestorRole = req.user.role;
    try {
        if (requestorRole !== 'doctor' && requestorId !== userId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const prescriptions = await getUserPrescriptionsService(userId);
        if (!prescriptions || prescriptions.length === 0) {
            return res.status(404).json({ message: 'No prescriptions found for this user' });
        }
        return res.status(200).json(prescriptions);
    } catch (error) {
        console.error('Error fetching user prescriptions:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

