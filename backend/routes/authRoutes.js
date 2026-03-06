import express from 'express';
import { googleAuth, staffLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/google', googleAuth);
router.post('/staff-login', staffLogin);

export default router;
