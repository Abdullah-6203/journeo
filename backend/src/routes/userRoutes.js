import express from 'express';
import { getProfile, updateProfile, updatePreferences } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/preferences', authenticate, updatePreferences);

export default router;
