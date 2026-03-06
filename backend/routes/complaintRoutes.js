import express from 'express';
import {
  createComplaint,
  getUserComplaints,
  getAllComplaints,
  getComplaintById,
  resolveComplaint,
  reopenComplaint,
  searchComplaint
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createComplaint);
router.get('/user/:userId', protect, getUserComplaints);
router.get('/respondent', protect, authorize('respondent'), getAllComplaints);
router.get('/search/:complaintNumber', protect, searchComplaint);
router.get('/:complaintId', protect, getComplaintById);
router.patch('/resolve', protect, resolveComplaint);
router.patch('/reopen', protect, reopenComplaint);

export default router;
