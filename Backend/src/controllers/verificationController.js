import { sendVerificationCode } from '../services/verificationService.js';

export const sendVerificationCodeController = async (req, res) => {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: 'Invalid email address' });
    }

    try {
        const response = await sendVerificationCode(email);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error sending verification code:', error.message);
        res.status(400).json({ message: error.message });
    }
};
