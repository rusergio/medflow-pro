import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getAIResponse } from '../services/aiService.js';

const router = Router();

router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    let prompt = message;
    if (history && Array.isArray(history) && history.length > 0) {
      const context = history
        .map((m: { role?: string; content?: string }) => {
          const role = m.role === 'user' ? 'Utilizador' : 'Assistente';
          return `${role}: ${(m.content || '').trim()}`;
        })
        .join('\n\n');
      prompt = `Contexto da conversa:\n${context}\n\nUtilizador: ${message}`;
    }

    const response = await getAIResponse(prompt);
    res.json({ response });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
});

export default router;

