import { Router } from 'express';
import {
  getPatients,
  getPatientById,
  getPatientByNumeroUtente,
  createPatient,
  updatePatient,
  deletePatient,
} from '../controllers/patientController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getPatients);
router.get('/by-numero', authenticate, getPatientByNumeroUtente);
router.get('/:id', authenticate, getPatientById);
router.post('/', authenticate, requireRole('DOCTOR', 'ADMIN'), createPatient);
router.put('/:id', authenticate, requireRole('DOCTOR', 'ADMIN'), updatePatient);
router.delete('/:id', authenticate, requireRole('ADMIN'), deletePatient);

export default router;

