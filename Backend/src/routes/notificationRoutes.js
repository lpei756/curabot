import express from 'express';
import {
    sendMessage,
    getUserNotifications,
    markAsRead,
    deleteNotification
} from '../controllers/notificationController.js';
import schemaValidator from '../middlewares/schemaValidator.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { NOTIFICATION_PATHS, buildPathWithBase } from './path.js';

const router = express.Router();

const notificationPathBase = buildPathWithBase(NOTIFICATION_PATHS);

router.post(NOTIFICATION_PATHS.sendMessage, authenticate, schemaValidator(notificationPathBase.sendMessage), sendMessage);
router.get(NOTIFICATION_PATHS.getUserNotifications, authenticate, schemaValidator(notificationPathBase.getUserNotifications), getUserNotifications);
router.put(NOTIFICATION_PATHS.markAsRead, authenticate, schemaValidator(notificationPathBase.markAsRead), markAsRead);
router.delete(NOTIFICATION_PATHS.delete, deleteNotification);

export default router;
