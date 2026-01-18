import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { transformAppointmentType, transformAppointmentStatus, formatDateTime } from '../utils/transformers.js';

const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  date: z.string(), // Acepta date o datetime
  time: z.string().optional(), // Para compatibilidad con frontend
  type: z.enum(['CONSULTA', 'RETORNO', 'EXAME', 'EMERGENCIA', 'Consulta', 'Retorno', 'Exame', 'Emergência']).transform((val) => {
    const map: Record<string, string> = {
      'Consulta': 'CONSULTA',
      'Retorno': 'RETORNO',
      'Exame': 'EXAME',
      'Emergência': 'EMERGENCIA',
    };
    return map[val] || val;
  }),
  notes: z.string().optional(),
});

const updateAppointmentSchema = z.object({
  date: z.string().optional(), // Acepta date o datetime
  time: z.string().optional(), // Para compatibilidad con frontend
  type: z.enum(['CONSULTA', 'RETORNO', 'EXAME', 'EMERGENCIA', 'Consulta', 'Retorno', 'Exame', 'Emergência']).transform((val) => {
    const map: Record<string, string> = {
      'Consulta': 'CONSULTA',
      'Retorno': 'RETORNO',
      'Exame': 'EXAME',
      'Emergência': 'EMERGENCIA',
    };
    return map[val] || val;
  }).optional(),
  status: z.enum(['AGENDADO', 'CONCLUIDO', 'CANCELADO', 'Agendado', 'Concluído', 'Cancelado']).transform((val) => {
    const map: Record<string, string> = {
      'Agendado': 'AGENDADO',
      'Concluído': 'CONCLUIDO',
      'Cancelado': 'CANCELADO',
    };
    return map[val] || val;
  }).optional(),
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

      where.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    if (status) {
      where.status = status;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (patientId) {
      where.patientId = patientId;
    }

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
              name: true,
              age: true,
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
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    // Transformar para formato del frontend
    const transformedAppointments = appointments.map((appointment) => {
      const { date, time } = formatDateTime(appointment.date);
      return {
        id: appointment.id,
        patientId: appointment.patientId,
        patientName: appointment.patient.name,
        doctorName: appointment.doctor.name,
        date,
        time,
        type: transformAppointmentType.toFrontend(appointment.type),
        status: transformAppointmentStatus.toFrontend(appointment.status),
      };
    });

    res.json({
      appointments: transformedAppointments,
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
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const { date, time } = formatDateTime(appointment.date);
    const transformedAppointment = {
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patient.name,
      doctorName: appointment.doctor.name,
      date,
      time,
      type: transformAppointmentType.toFrontend(appointment.type),
      status: transformAppointmentStatus.toFrontend(appointment.status),
    };

    res.json(transformedAppointment);
  } catch (error) {
    throw error;
  }
};

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const inputData = createAppointmentSchema.parse(req.body);
    const doctorId = req.userId!;

    // Si viene date y time separados, combinarlos
    let appointmentDate: Date;
    if (inputData.date.includes('T') || inputData.date.includes(' ')) {
      // Ya viene como datetime
      appointmentDate = new Date(inputData.date);
    } else {
      // Si solo viene date, usar time del body o default
      const time = inputData.time || (req.body as any).time || '09:00';
      appointmentDate = new Date(`${inputData.date}T${time}:00`);
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: inputData.patientId,
        date: appointmentDate,
        type: inputData.type,
        notes: inputData.notes,
        doctorId,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            age: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    const { date, time } = formatDateTime(appointment.date);
    const transformedAppointment = {
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patient.name,
      doctorName: appointment.doctor.name,
      date,
      time,
      type: transformAppointmentType.toFrontend(appointment.type),
      status: transformAppointmentStatus.toFrontend(appointment.status),
    };

    res.status(201).json(transformedAppointment);
  } catch (error) {
    throw error;
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const inputData = updateAppointmentSchema.parse(req.body);

    const updateData: any = {};
    
    if (inputData.date) {
      // Si viene date y time separados, combinarlos
      if (inputData.date.includes('T')) {
        updateData.date = new Date(inputData.date);
      } else {
        const time = (req.body as any).time || '09:00';
        updateData.date = new Date(`${inputData.date}T${time}`);
      }
    }
    
    if (inputData.type) {
      updateData.type = transformAppointmentType.toBackend(inputData.type);
    }
    
    if (inputData.status) {
      updateData.status = transformAppointmentStatus.toBackend(inputData.status);
    }
    
    if (inputData.notes !== undefined) {
      updateData.notes = inputData.notes;
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const { date, time } = formatDateTime(appointment.date);
    const transformedAppointment = {
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patient.name,
      doctorName: appointment.doctor.name,
      date,
      time,
      type: transformAppointmentType.toFrontend(appointment.type),
      status: transformAppointmentStatus.toFrontend(appointment.status),
    };

    res.json(transformedAppointment);
  } catch (error) {
    throw error;
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.appointment.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    throw error;
  }
};

