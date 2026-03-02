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

    const { password: _, pinHash, ...userWithoutPassword } = user as any;

    res.json({
      token,
      user: {
        ...userWithoutPassword,
        role: transformUserRole.toFrontend(user.role),
        pinActive: !!pinHash,
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

    const { password: _, pinHash, ...userWithoutPassword } = user as any;

    res.status(201).json({
      token,
      user: {
        ...userWithoutPassword,
        role: transformUserRole.toFrontend(user.role),
        pinActive: !!pinHash,
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
        phone: true,
        role: true,
        avatar: true,
        pinHash: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const { pinHash, ...rest } = user;
    res.json({
      ...rest,
      role: transformUserRole.toFrontend(user.role),
      pinActive: !!pinHash,
    });
  } catch (error) {
    throw error;
  }
};

const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

const activatePinSchema = z.object({
  pin: z.string().min(4).max(6).regex(/^\d+$/, 'PIN deve conter apenas dígitos'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
  pin: z.string().min(4).max(6).regex(/^\d+$/, 'PIN deve conter apenas dígitos'),
  newPassword: z.string().min(6),
});

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.userId;
    const data = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { email: data.email, phone: data.phone },
      select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, pinHash: true, createdAt: true },
    });

    const { pinHash, ...rest } = user;
    res.json({ ...rest, role: transformUserRole.toFrontend(user.role), pinActive: !!pinHash });
  } catch (error) {
    throw error;
  }
};

export const activatePin = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.userId;
    const { pin } = activatePinSchema.parse(req.body);
    const pinHash = await hashPassword(pin);

    await prisma.user.update({
      where: { id: userId },
      data: { pinHash },
    });

    res.json({ success: true, message: 'PIN ativado com sucesso' });
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.userId;
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const valid = await comparePassword(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: 'Senha atual incorreta' });

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });

    res.json({ success: true, message: 'Senha alterada com sucesso' });
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, pin, newPassword } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.pinHash) {
      return res.status(400).json({ error: 'Email ou PIN inválido. Ative o PIN em Meu Perfil primeiro.' });
    }

    const pinValid = await comparePassword(pin, user.pinHash);
    if (!pinValid) {
      return res.status(400).json({ error: 'PIN incorreto.' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.json({ success: true, message: 'Senha alterada com sucesso' });
  } catch (error) {
    throw error;
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users });
  } catch (error) {
    throw error;
  }
};

