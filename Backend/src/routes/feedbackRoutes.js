// feedbackRoutes.js
const express = require('express');
const router = express.Router();

router.post('/feedback', (req, res) => {
    const { messageId, feedback } = req.body;

    console.log(`Received feedback for message ${messageId}: ${feedback}`);

    res.status(200).send({ status: 'success', message: 'Feedback received' });
});

module.exports = router;
