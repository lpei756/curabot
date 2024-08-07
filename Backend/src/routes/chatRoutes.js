// routes/chatRoutes.js
import express from 'express';
import { handleChat } from '../controllers/chatController.js';
import { CHAT_PATHS } from './path.js';

const router = express.Router();

router.post(CHAT_PATHS.chat, handleChat);

export default router;