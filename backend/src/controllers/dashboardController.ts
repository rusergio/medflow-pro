import { Request, Response } from 'express';
import prisma from '../config/database.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPatients,
      patientsToday,
      availableBeds,
      scheduledSurgeries,
      patientsByStatus,
      appointmentsToday,
      usersTotal,
    ] = await Promise.all([
      prisma.patient.count({
        where: {
          status: {
            not: 'ALTA',
          },
        },
      }),
      prisma.patient.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.patient.count({
        where: {
          status: 'ALTA',
        },
      }),
      prisma.appointment.count({
        where: {
          type: 'EMERGENCIA',
          date: {
            gte: today,
          },
        },
      }),
      prisma.patient.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.appointment.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.user.count(),
    ]);

    // Estatísticas de fluxo de pacientes (últimas 24h por hora)
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hourStart = new Date(today);
      hourStart.setHours(i, 0, 0, 0);
      const hourEnd = new Date(hourStart);
      hourEnd.setHours(i + 1, 0, 0, 0);

      return { hourStart, hourEnd, hour: i };
    });

    const patientFlow = await Promise.all(
      hours.map(async ({ hourStart, hourEnd, hour }) => {
        const count = await prisma.patient.count({
          where: {
            createdAt: {
              gte: hourStart,
              lt: hourEnd,
            },
          },
        });

        return {
          name: `${hour.toString().padStart(2, '0')}:00`,
          patients: count,
        };
      })
    );

    // Atendimentos por especialidade (simulado - você pode adicionar especialidade aos médicos)
    const appointmentsByType = await prisma.appointment.groupBy({
      by: ['type'],
      _count: true,
      where: {
        date: {
          gte: today,
        },
      },
    });

    res.json({
      usersTotal,
      stats: {
        totalPatients,
        patientsToday,
        availableBeds: 200 - totalPatients, // Assumindo 200 leitos totais
        scheduledSurgeries,
        appointmentsToday,
      },
      patientFlow,
      appointmentsByType: appointmentsByType.map((item) => ({
        name: item.type,
        value: item._count,
      })),
      patientsByStatus: patientsByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
    });
  } catch (error) {
    throw error;
  }
};

