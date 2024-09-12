import { generatePrescription as generatePrescriptionService, repeatPrescription as repeatPrescriptionService, getAllPrescriptions as getAllPrescriptionsService, getUserPrescriptions as getUserPrescriptionsService } from "../services/prescriptionService.js";
import { sendMessage as sendMessageService } from "../services/notificationService.js";

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

export const generatePrescription = async (req, res) => {
    try {
        console.log('Prescription request received:', req.body);
        const { doctorId, userId, medications, instructions } = req.body;
        if (!doctorId || !userId || !medications || !instructions) {
            return res.status(400).json({
                status: "failed",
                error: "Invalid request. Missing required fields.",
                fields: {
                    doctorId: doctorId ? undefined : "doctorId is required",
                    userId: userId ? undefined : "userId is required",
                    medications: medications ? undefined : "medications are required",
                    instructions: instructions ? undefined : "instructions are required"
                }
            });
        }
        const prescription = await generatePrescriptionService({ doctorId, userId, medications, instructions });
        const message = `Prescription created by Dr. ${prescription.doctorName}: Medications - ${medications}, Instructions - ${instructions}`;
        const notification = await sendMessageService({
            senderId: prescription.doctor,
            senderModel: 'Doctor',
            receiverId: prescription.patient,
            receiverModel: 'User',
            message,
            notificationType: 'prescription'
        });
        console.log('Prescription and notification sent successfully:', { prescription, notification });
        res.status(201).json({ message: 'Prescription generated successfully', prescription, notification });
    } catch (error) {
        console.error('Error generating prescription:', error.message);
        res.status(500).json({ error: `Error generating prescription: ${error.message}` });
    }
};

export const repeatPrescription = async (req, res) => {
    try {
        console.log('Repeat prescription request received:', req.body);
        const { doctorId, userId, prescriptionId } = req.body;
        if (!doctorId || !userId || !prescriptionId) {
            return res.status(400).json({
                status: "failed",
                error: "Invalid request. Missing required fields.",
                fields: {
                    doctorId: doctorId ? undefined : "doctorId is required",
                    userId: userId ? undefined : "userId is required",
                    prescriptionId: prescriptionId ? undefined : "prescriptionId is required"
                }
            });
        }
        const prescription = await repeatPrescriptionService({ doctorId, userId, prescriptionId });
        const message = `Repeat Prescription created by Dr. ${prescription.doctorName}: Medications - ${prescription.medications}, Instructions - ${prescription.instructions}`;
        const notification = await sendMessageService({
            senderId: prescription.doctor,
            senderModel: 'Doctor',
            receiverId: prescription.patient,
            receiverModel: 'User',
            message,
            notificationType: 'prescription'
        });
        console.log('Repeat prescription and notification sent successfully:', { prescription, notification });
        res.status(201).json({ message: 'Repeat prescription generated successfully', prescription, notification });
    } catch (error) {
        console.error('Error generating repeat prescription:', error.message);
        res.status(500).json({ error: `Error generating repeat prescription: ${error.message}` });
    }
};
