import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Lazy-initialize storage so env vars are guaranteed to be loaded
const getUploader = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'jalsahayak_complaints',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
      transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
    },
  });

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  });
};

router.post('/upload', protect, (req, res, next) => {
  const upload = getUploader();
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary error:', err);
      return res.status(500).json({ message: `Upload failed: ${err.message}` });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ imageUrl: req.file.path });
  });
});

export default router;
