import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { transformAppointmentType, transformAppointmentStatus, formatDateTime } from '../utils/transformers.js';

const tipoEnum = ['PRIMEIRA_CONSULTA', 'SEGUIMENTO', 'CONSULTA', 'RETORNO', 'EXAME', 'EMERGENCIA'] as const;
const statusEnum = ['AGENDADA', 'CONFIRMADA', 'CANCELADA', 'FALTA', 'REALIZADA'] as const;
const origemEnum = ['MEDICO_FAMILIA', 'INTERNO', 'REFERENCIADO'] as const;

const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  date: z.string(),
  time: z.string().optional(),
  especialidadeId: z.string().uuid().optional(),
  sala: z.string().optional(),
  tipo: z.enum(tipoEnum).or(z.enum(['Primeira consulta', 'Seguimento', 'Consulta', 'Retorno', 'Exame', 'Emergência'])).transform((val) => {
    const map: Record<string, string> = {
      'Primeira consulta': 'PRIMEIRA_CONSULTA',
      'Seguimento': 'SEGUIMENTO',
      'Consulta': 'CONSULTA',
      'Retorno': 'RETORNO',
      'Exame': 'EXAME',
      'Emergência': 'EMERGENCIA',
    };
    return map[val] || val;
  }),
  origem: z.enum(origemEnum).optional(),
  notes: z.string().optional(),
});

const updateAppointmentSchema = z.object({
  date: z.string().optional(),
  time: z.string().optional(),
  especialidadeId: z.string().uuid().optional().nullable(),
  sala: z.string().optional(),
  tipo: z.enum(tipoEnum).optional(),
  status: z.enum(statusEnum).or(z.enum(['Agendada', 'Confirmada', 'Cancelada', 'Falta', 'Realizada'])).transform((val) => {
    const map: Record<string, string> = {
      'Agendada': 'AGENDADA',
      'Confirmada': 'CONFIRMADA',
      'Cancelada': 'CANCELADA',
      'Falta': 'FALTA',
      'Realizada': 'REALIZADA',
    };
    return map[val] || val;
  }).optional(),
  origem: z.enum(origemEnum).optional().nullable(),
  notes: z.string().optional(),
});

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { date, status, doctorId, patientId, page = '1', limit = '10' } = req.query;

    const where: any = {};

    if (date) {
      const startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      where.date = { gte: startDate, lt: endDate };
    }

    if (status) where.status = status;
    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take,
        orderBy: { date: 'asc' },
        include: {
          patient: {
            select: {
              id: true,
              nome: true,
              numeroUtente: true,
              numeroProvisorio: true,
              status: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          especialidade: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    const transformed = appointments.map((a) => {
      const { date, time } = formatDateTime(a.date);
      return {
        id: a.id,
        patientId: a.patientId,
        patientName: a.patient.nome,
        numeroUtente: a.patient.numeroUtente || a.patient.numeroProvisorio,
        doctorName: a.doctor.name,
        especialidade: a.especialidade?.nome,
        date,
        time,
        type: transformAppointmentType.toFrontend(a.tipo),
        status: transformAppointmentStatus.toFrontend(a.status),
      };
    });

    res.json({
      appointments: transformed,
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

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: { select: { id: true, name: true, email: true, role: true } },
        especialidade: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const { date, time } = formatDateTime(appointment.date);
    res.json({
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patient.nome,
      doctorName: appointment.doctor.name,
      especialidade: appointment.especialidade,
      date,
      time,
      type: transformAppointmentType.toFrontend(appointment.tipo),
      status: transformAppointmentStatus.toFrontend(appointment.status),
    });
  } catch (error) {
    throw error;
  }
};

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const input = createAppointmentSchema.parse(req.body);
    const doctorId = req.userId!;

    let appointmentDate: Date;
    if (input.date.includes('T') || input.date.includes(' ')) {
      appointmentDate = new Date(input.date);
    } else {
      const time = input.time || (req.body as any).time || '09:00';
      appointmentDate = new Date(`${input.date}T${time}:00`);
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: input.patientId,
        doctorId,
        date: appointmentDate,
        tipo: input.tipo as any,
        especialidadeId: input.especialidadeId || undefined,
        sala: input.sala || undefined,
        origem: input.origem as any,
        notes: input.notes || undefined,
      },
      include: {
        patient: { select: { id: true, nome: true } },
        doctor: { select: { id: true, name: true, role: true } },
        especialidade: true,
      },
    });

    const { date, time } = formatDateTime(appointment.date);
    res.status(201).json({
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patient.nome,
      doctorName: appointment.doctor.name,
      especialidade: appointment.especialidade?.nome,
      date,
      time,
      type: transformAppointmentType.toFrontend(appointment.tipo),
      status: transformAppointmentStatus.toFrontend(appointment.status),
    });
  } catch (error) {
    throw error;
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const input = updateAppointmentSchema.parse(req.body);

    const updateData: any = {};
    if (input.date) {
      if (input.date.includes('T')) {
        updateData.date = new Date(input.date);
      } else {
        const time = (req.body as any).time || '09:00';
        updateData.date = new Date(`${input.date}T${time}:00`);
      }
    }
    if (input.tipo) updateData.tipo = input.tipo;
    if (input.status) updateData.status = input.status;
    if (input.especialidadeId !== undefined) updateData.especialidadeId = input.especialidadeId;
    if (input.sala !== undefined) updateData.sala = input.sala;
    if (input.origem !== undefined) updateData.origem = input.origem;
    if (input.notes !== undefined) updateData.notes = input.notes;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: { select: { id: true, nome: true } },
        doctor: { select: { id: true, name: true } },
        especialidade: true,
      },
    });

    const { date, time } = formatDateTime(appointment.date);
    res.json({
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patient.nome,
      doctorName: appointment.doctor.name,
      especialidade: appointment.especialidade?.nome,
      date,
      time,
      type: transformAppointmentType.toFrontend(appointment.tipo),
      status: transformAppointmentStatus.toFrontend(appointment.status),
    });
  } catch (error) {
    throw error;
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    throw error;
  }
};
