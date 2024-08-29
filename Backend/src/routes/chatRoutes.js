import express from 'express';
import { handleChat, fetchUserChatHistories, fetchChatHistoryBySessionId } from '../controllers/chatController.js';
import { CHAT_PATHS } from './path.js';

const router = express.Router();

router.post(CHAT_PATHS.chat, handleChat);
router.get(`${CHAT_PATHS.chat}/user/:userId/history`, fetchUserChatHistories);
router.get(`${CHAT_PATHS.chat}/history/:sessionId`, fetchChatHistoryBySessionId);

export default router;
