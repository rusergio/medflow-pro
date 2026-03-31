import { randomInt } from 'crypto';
import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { sendPasswordResetCodeEmail } from '../utils/email.js';
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

const patientRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  telemovel: z.string().min(9),
  dataNascimento: z.string(),
  sexo: z.enum(['M', 'F']),
  nif: z.string().optional(),
  numeroCc: z.string().optional(),
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
        patient: { select: { id: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const { pinHash, patient, ...rest } = user as any;
    res.json({
      ...rest,
      role: transformUserRole.toFrontend(user.role),
      pinActive: !!pinHash,
      patientId: patient?.id ?? null,
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

const forgotPasswordProfilePinSchema = z.object({
  email: z.string().email(),
  pin: z.string().min(4).max(6).regex(/^\d+$/, 'PIN deve conter apenas dígitos'),
  newPassword: z.string().min(6),
});

const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

const passwordResetConfirmSchema = z.object({
  email: z.string().email(),
  pin: z.string().length(6).regex(/^\d+$/, 'Código deve ter 6 dígitos'),
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

/** Código de 6 dígitos enviado por email (ou logado em desenvolvimento). */
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = passwordResetRequestSchema.parse(req.body);
    const generic = {
      ok: true,
      message:
        'Se existir uma conta com este email, receberá um código de verificação em breve.',
    };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json(generic);
    }

    const code = randomInt(100000, 1000000).toString();
    const codeHash = await hashPassword(code);

    await prisma.passwordResetCode.deleteMany({ where: { email } });
    await prisma.passwordResetCode.create({
      data: {
        email,
        codeHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    try {
      await sendPasswordResetCodeEmail(email, code);
    } catch (mailErr) {
      await prisma.passwordResetCode.deleteMany({ where: { email } });
      console.error('[requestPasswordReset] Falha ao enviar email:', mailErr);
      return res.status(503).json({
        error:
          'Não foi possível enviar o email. Verifique a configuração SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS) ou tente mais tarde.',
      });
    }

    return res.json(generic);
  } catch (error) {
    throw error;
  }
};

export const confirmPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email, pin, newPassword } = passwordResetConfirmSchema.parse(req.body);

    const row = await prisma.passwordResetCode.findFirst({
      where: {
        email,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!row) {
      return res.status(400).json({ error: 'Código inválido ou expirado. Solicite um novo.' });
    }

    const ok = await comparePassword(pin, row.codeHash);
    if (!ok) {
      return res.status(400).json({ error: 'Código incorreto.' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetCode.deleteMany({ where: { email } }),
    ]);

    res.json({ success: true, message: 'Senha alterada com sucesso' });
  } catch (error) {
    throw error;
  }
};

/** Redefinição com o PIN de segurança definido em Meu Perfil (sem email). */
export const resetPasswordWithProfilePin = async (req: Request, res: Response) => {
  try {
    const { email, pin, newPassword } = forgotPasswordProfilePinSchema.parse(req.body);

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

export const registerPatient = async (req: Request, res: Response) => {
  try {
    const input = patientRegisterSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await hashPassword(input.password);
    const dataNascimento = new Date(input.dataNascimento);

    const [user, patient] = await prisma.$transaction([
      prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: 'PATIENT',
        },
      }),
      prisma.patient.create({
        data: {
          nome: input.name,
          email: input.email,
          telemovel: input.telemovel,
          dataNascimento,
          sexo: input.sexo,
          nif: input.nif,
          numeroCc: input.numeroCc,
        },
      }),
    ]);

    await prisma.patient.update({
      where: { id: patient.id },
      data: { userId: user.id },
    });

    const token = generateToken(user.id, user.role);
    const { password: _, pinHash, ...userWithoutPassword } = user as any;

    res.status(201).json({
      token,
      user: {
        ...userWithoutPassword,
        role: transformUserRole.toFrontend(user.role),
        pinActive: !!pinHash,
        patientId: patient.id,
      },
    });
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

