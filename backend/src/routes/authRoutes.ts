import { Router } from 'express';
import { login, register, getProfile, getUsers, updateProfile, activatePin, changePassword, forgotPassword } from '../controllers/authController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.get('/me', authenticate, getProfile);
router.patch('/me', authenticate, updateProfile);
router.post('/activate-pin', authenticate, activatePin);
router.post('/change-password', authenticate, changePassword);
router.get('/users', authenticate, requireRole('ADMIN'), getUsers);

export default router;

