import express from 'express';
import {
    sendMessage,
    getUserNotifications,
    getAdminNotifications,
    markAsRead,
    deleteNotification
} from '../controllers/notificationController.js';
import schemaValidator from '../middlewares/schemaValidator.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { NOTIFICATION_PATHS, buildPathWithBase } from './path.js';
import { upload } from '../services/notificationService.js';

const router = express.Router();

const notificationPathBase = buildPathWithBase(NOTIFICATION_PATHS);
router.post(
    NOTIFICATION_PATHS.sendMessage,
    authenticate,
    upload,
    express.urlencoded({ extended: true }),
    express.json(),
    schemaValidator(notificationPathBase.sendMessage),
    sendMessage
);
router.get(NOTIFICATION_PATHS.getUserNotifications, authenticate, schemaValidator(notificationPathBase.getUserNotifications), getUserNotifications);
router.get(NOTIFICATION_PATHS.getAdminNotifications, authenticate, schemaValidator(notificationPathBase.getAdminNotifications), getAdminNotifications);
router.put(NOTIFICATION_PATHS.markAsRead, authenticate, schemaValidator(notificationPathBase.markAsRead), markAsRead);
router.delete(NOTIFICATION_PATHS.delete, authenticate, deleteNotification);
export default router;
