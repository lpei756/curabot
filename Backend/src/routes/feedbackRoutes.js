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

// GET 路由 - 获取反馈汇总数据
router.get('/summary', async (req, res) => {
    try {
        const feedbacks = await Feedback.find({});

        const weeklySummary = {}; 
        const monthlySummary = {}; 
        const quarterlySummary = {};
        const trendSummary = [];

        feedbacks.forEach(feedback => {
            const week = getWeek(feedback.createdAt);
            const month = feedback.createdAt.getMonth();
            const quarter = Math.floor((feedback.createdAt.getMonth() + 3) / 3);

            // 对 weeklySummary 进行处理
            weeklySummary[week] = weeklySummary[week] || { positive: 0, negative: 0 };
            if (feedback.feedback) {
                weeklySummary[week].positive++;
            } else {
                weeklySummary[week].negative++;
            }

            // 对 monthlySummary 进行处理
            monthlySummary[month] = monthlySummary[month] || { positive: 0, negative: 0 };
            if (feedback.feedback) {
                monthlySummary[month].positive++;
            } else {
                monthlySummary[month].negative++;
            }

            // 对 quarterlySummary 进行处理
            quarterlySummary[quarter] = quarterlySummary[quarter] || { positive: 0, negative: 0 };
            if (feedback.feedback) {
                quarterlySummary[quarter].positive++;
            } else {
                quarterlySummary[quarter].negative++;
            }

            // 对 trendSummary 进行处理
            trendSummary.push({
                _id: feedback._id,
                positive: feedback.feedback ? 1 : 0,
                negative: !feedback.feedback ? 1 : 0,
            });
        });

        res.json({ weekly: weeklySummary, monthly: monthlySummary, quarterly: quarterlySummary, trends: trendSummary });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

function getWeek(date) {
    const oneJan = new Date(date.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
    return Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
}


export default router;
