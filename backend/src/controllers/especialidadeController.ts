import { Request, Response } from 'express';
import prisma from '../config/database.js';

export const getEspecialidades = async (_req: Request, res: Response) => {
  try {
    const especialidades = await prisma.especialidade.findMany({
      orderBy: { nome: 'asc' },
    });
    res.json(especialidades);
  } catch (error) {
    throw error;
  }
};
