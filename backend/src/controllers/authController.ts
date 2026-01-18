import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';
import { transformUserRole } from '../utils/transformers.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['DOCTOR', 'NURSE', 'ADMIN']).default('DOCTOR'),
});

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateToken(user.id, user.role);

    const { password: _, ...userWithoutPassword } = user;

    // Transformar role para el frontend
    res.json({
      token,
      user: {
        ...userWithoutPassword,
        role: transformUserRole.toFrontend(user.role),
      },
    });
  } catch (error) {
    throw error;
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const inputData = registerSchema.parse(req.body);
    
    // Transformar role del frontend al backend si viene
    const data = {
      ...inputData,
      role: inputData.role || 'DOCTOR', // Mantener como está si viene del frontend
    };

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    const token = generateToken(user.id, user.role);

    const { password: _, ...userWithoutPassword } = user;

    // Transformar role para el frontend
    res.status(201).json({
      token,
      user: {
        ...userWithoutPassword,
        role: transformUserRole.toFrontend(user.role),
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Transformar role para el frontend
    res.json({
      ...user,
      role: transformUserRole.toFrontend(user.role),
    });
  } catch (error) {
    throw error;
  }
};

