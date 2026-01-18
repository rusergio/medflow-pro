import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAIResponse } from '../services/aiService.js';

const router = Router();

router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    const response = await getAIResponse(message);
    res.json({ response });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

export default router;

