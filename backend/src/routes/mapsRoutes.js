import express from 'express';
import { placesSearch, routesCompute, mapsStatus } from '../controllers/mapsController.js';

const router = express.Router();

router.get('/status', mapsStatus);
router.post('/places', placesSearch);
router.post('/routes', routesCompute);

export default router;
