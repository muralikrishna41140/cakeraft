import express from 'express';
import {
  createCheckout,
  getBills,
  getBill,
  getSalesSummary,
  checkLoyaltyStatus
} from '../controllers/checkoutController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All checkout routes are protected
router.use(protect);

// Checkout routes
router.post('/', createCheckout);
router.get('/bills', getBills);
router.get('/bills/:id', getBill);
router.get('/summary', getSalesSummary);
router.post('/loyalty/check', checkLoyaltyStatus);

export default router;