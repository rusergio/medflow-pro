import { Router } from 'express';
import { getEspecialidades } from '../controllers/especialidadeController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getEspecialidades);

export default router;
