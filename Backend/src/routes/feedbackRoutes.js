// feedbackRoutes.js
import express from 'express';
import schemaValidations from '../validations/schemaValidations.js';
import Feedback from '../models/feedback.js'; 


const router = express.Router();

router.post('/', async (req, res) => {
    const { error } = schemaValidations['/api/feedback'].validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { messageId, feedback } = req.body;

    try {
        // 将反馈存储到数据库
        const newFeedback = new Feedback({
            messageId,
            feedback,
        });

        await newFeedback.save();

        console.log(`Received feedback for message ${messageId}: ${feedback}`);

        res.status(200).send({ status: 'success', message: 'Feedback received' });
    } catch (err) {
        console.error('Error saving feedback:', err);
        res.status(500).send({ status: 'error', message: 'Failed to save feedback' });
    }
});



export default router;
