import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { transformPatientStatus, getLastVisit } from '../utils/transformers.js';

const createPatientSchema = z.object({
  name: z.string().min(2),
  age: z.number().int().min(0).max(150),
  gender: z.enum(['M', 'F', 'Outro']),
  bloodType: z.string(),
  status: z.enum(['ESTAVEL', 'CRITICO', 'EM_OBSERVACAO', 'ALTA', 'Estável', 'Crítico', 'Em Observação', 'Alta']).transform((val) => {
    // Si viene en formato frontend, transformar
    const map: Record<string, string> = {
      'Estável': 'ESTAVEL',
      'Crítico': 'CRITICO',
      'Em Observação': 'EM_OBSERVACAO',
      'Alta': 'ALTA',
    };
    return map[val] || val;
  }).default('ESTAVEL'),
  room: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const updatePatientSchema = createPatientSchema.partial();

export const getPatients = async (req: Request, res: Response) => {
  try {
    const { search, status, page = '1', limit = '10' } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { id: { contains: search as string } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          appointments: {
            orderBy: { date: 'desc' },
            take: 1,
          },
          medicalRecords: {
            orderBy: { date: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              appointments: true,
              medicalRecords: true,
            },
          },
        },
      }),
      prisma.patient.count({ where }),
    ]);

    // Transformar para formato del frontend
    const transformedPatients = patients.map((patient) => ({
      ...patient,
      status: transformPatientStatus.toFrontend(patient.status),
      lastVisit: getLastVisit(patient),
      history: [], // Se puede poblar después si es necesario
    }));

    res.json({
      patients: transformedPatients,
      pagination: {
        page: Number(page),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          take: 10,
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
        medicalRecords: {
          orderBy: { date: 'desc' },
          take: 10,
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    // Transformar para formato del frontend
    const transformedPatient = {
      ...patient,
      status: transformPatientStatus.toFrontend(patient.status),
      lastVisit: getLastVisit(patient),
      history: patient.medicalRecords.map((record) => ({
        id: record.id,
        date: record.date.toISOString().split('T')[0],
        diagnosis: record.diagnosis,
        doctorName: record.doctor.name,
        notes: record.notes,
        medication: record.medication,
      })),
    };

    res.json(transformedPatient);
  } catch (error) {
    throw error;
  }
};

export const createPatient = async (req: AuthRequest, res: Response) => {
  try {
    const inputData = createPatientSchema.parse(req.body);
    
    // Transformar status del frontend al backend
    const data = {
      ...inputData,
      status: inputData.status ? transformPatientStatus.toBackend(inputData.status) : undefined,
    };

    const patient = await prisma.patient.create({
      data,
      include: {
        appointments: { take: 0 },
        medicalRecords: { take: 0 },
      },
    });

    // Transformar respuesta al formato del frontend
    const transformedPatient = {
      ...patient,
      status: transformPatientStatus.toFrontend(patient.status),
      lastVisit: getLastVisit(patient),
      history: [],
    };

    res.status(201).json(transformedPatient);
  } catch (error) {
    throw error;
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inputData = updatePatientSchema.parse(req.body);

    // Transformar status del frontend al backend si viene
    const data: any = { ...inputData };
    if (inputData.status) {
      data.status = transformPatientStatus.toBackend(inputData.status);
    }

    const patient = await prisma.patient.update({
      where: { id },
      data,
      include: {
        appointments: { orderBy: { date: 'desc' }, take: 1 },
        medicalRecords: { orderBy: { date: 'desc' }, take: 1 },
      },
    });

    // Transformar respuesta al formato del frontend
    const transformedPatient = {
      ...patient,
      status: transformPatientStatus.toFrontend(patient.status),
      lastVisit: getLastVisit(patient),
      history: [],
    };

    res.json(transformedPatient);
  } catch (error) {
    throw error;
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.patient.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    throw error;
  }
};

