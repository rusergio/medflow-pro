import { Router } from 'express';
import {
  login,
  register,
  registerPatient,
  getProfile,
  getUsers,
  updateProfile,
  activatePin,
  changePassword,
  requestPasswordReset,
  confirmPasswordReset,
  resetPasswordWithProfilePin,
} from '../controllers/authController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/register-patient', registerPatient);
router.post('/forgot-password/request', requestPasswordReset);
router.post('/forgot-password/confirm', confirmPasswordReset);
router.post('/forgot-password/profile-pin', resetPasswordWithProfilePin);
router.get('/me', authenticate, getProfile);
router.patch('/me', authenticate, updateProfile);
router.post('/activate-pin', authenticate, activatePin);
router.post('/change-password', authenticate, changePassword);
router.get('/users', authenticate, requireRole('ADMIN'), getUsers);

export default router;

