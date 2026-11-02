import express from 'express';
import {
  getDestinations,
  getDestinationById,
  getRecommendedDestinations,
  toggleSaveDestination
} from '../controllers/destinationController.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDestinations);
router.get('/recommended', optionalAuthenticate, getRecommendedDestinations);
router.get('/:id', getDestinationById);
router.post('/:id/save', authenticate, toggleSaveDestination);

export default router;
