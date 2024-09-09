import { sendVerificationCode } from '../services/verificationService.js';

export const sendVerificationCodeController = async (req, res) => {
    const { email } = req.body;

    try {
        const response = await sendVerificationCode(email);
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
