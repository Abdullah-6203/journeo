import express from 'express';
import {
  generateItinerary,
  replanItinerary,
  applyAdaptiveStrategy,
  updateStopStatus
} from '../controllers/itineraryController.js';
import { optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', optionalAuthenticate, generateItinerary);
router.post('/:tripId/replan', optionalAuthenticate, replanItinerary);
router.put('/:tripId/apply-strategy', optionalAuthenticate, applyAdaptiveStrategy);
router.put('/stops/:stopId/status', optionalAuthenticate, updateStopStatus);

export default router;
