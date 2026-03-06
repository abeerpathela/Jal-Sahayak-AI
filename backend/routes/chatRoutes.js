import express from 'express';
import { sendMessage, getAIChatResponse } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/message', protect, sendMessage);
router.post('/ai', getAIChatResponse);

export default router;
