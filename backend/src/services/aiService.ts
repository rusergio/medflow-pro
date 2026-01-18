import { GoogleGenAI } from "@google/genai";
import env from '../config/env.js';

const SYSTEM_INSTRUCTION = `
Você é o Assistente Clínico IA do MedFlow Pro. 
Seu papel é auxiliar médicos e enfermeiros com informações médicas, dosagens de medicamentos, protocolos hospitalares e análise rápida de sintomas baseada em evidências.

Diretrizes:
1. Seja sempre profissional, conciso e técnico.
2. Use termos médicos apropriados.
3. Se perguntado sobre diagnósticos, sempre inclua um aviso de que "Este é um auxílio de IA e a decisão final cabe ao profissional de saúde".
4. Responda sempre em Português do Brasil.
5. Se o usuário fornecer dados de um paciente (como idade, sintomas), analise de forma estruturada.
`;

export const getAIResponse = async (prompt: string): Promise<string> => {
  try {
    if (!env.AI_API_KEY) {
      throw new Error('AI_API_KEY não configurada');
    }

    const ai = new GoogleGenAI({ apiKey: env.AI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    return response.text || "Desculpe, não consegui processar sua solicitação.";
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
};

