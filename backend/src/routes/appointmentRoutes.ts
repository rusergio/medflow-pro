import { Router } from 'express';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getAppointments);
router.get('/:id', authenticate, getAppointmentById);
router.post('/', authenticate, requireRole('DOCTOR', 'ADMIN'), createAppointment);
router.put('/:id', authenticate, requireRole('DOCTOR', 'ADMIN'), updateAppointment);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteAppointment);

export default router;

