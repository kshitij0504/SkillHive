import express from 'express';
import {
  signup,
  login,
  logout,
  getMe,
  googleAuth,
  verifyOtp,
  getCurrentUser,
} from '../controllers/auth.controller.js';

import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify',verifyOtp)
router.get('/me', isAuthenticated, getMe);
router.post('/google', googleAuth);
router.get('/current', isAuthenticated,getCurrentUser)
export default router;
