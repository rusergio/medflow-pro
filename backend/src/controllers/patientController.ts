import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { transformUtenteStatus, getLastVisit } from '../utils/transformers.js';

const tipoDocSchema = z.enum(['Passaporte', 'Cartão de residência', 'Outro']);
const sexoSchema = z.enum(['M', 'F', 'Outro']);

const createPatientSchema = z.object({
  nome: z.string().min(2),
  possuiNumeroUtente: z.boolean(),
  numeroUtente: z.string().optional(),
  numeroCc: z.string().optional(),
  nif: z.string().optional(),
  dataNascimento: z.string(),
  sexo: sexoSchema,
  nacionalidade: z.string().optional(),
  // Provisório
  tipoDocumento: tipoDocSchema.optional(),
  numeroDocumento: z.string().optional(),
  paisOrigem: z.string().optional(),
  // Contacto
  telemovel: z.string().min(9),
  telefoneAlternativo: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  // Morada
  rua: z.string().optional(),
  codigoPostal: z.string().optional(),
  localidade: z.string().optional(),
  concelho: z.string().optional(),
  distrito: z.string().optional(),
  // Administrativo
  unidadeHospitalar: z.string().optional(),
  medicoFamilia: z.string().optional(),
  centroSaude: z.string().optional(),
  tipoAtendimento: z.enum(['CONSULTA_EXTERNA', 'URGENCIA', 'INTERNAMENTO', 'EXAME_COMPLEMENTAR']).optional(),
  // Clínico
  alergias: z.string().optional(),
  doencasCronicas: z.string().optional(),
  medicacaoHabitual: z.string().optional(),
  grupoSanguineo: z.string().optional(),
  observacoesClinicas: z.string().optional(),
  status: z.enum(['ESTAVEL', 'CRITICO', 'EM_OBSERVACAO', 'ALTA']).default('ESTAVEL'),
  quarto: z.string().optional(),
});

const updatePatientSchema = createPatientSchema.partial();

// Gera PROV-2026-000001
async function gerarNumeroProvisorio(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.patient.count({
    where: { registoProvisorio: true },
  });
  const seq = String(count + 1).padStart(6, '0');
  return `PROV-${year}-${seq}`;
}

// Gera número do processo clínico
async function gerarProcessoClinico(): Promise<string> {
  const count = await prisma.patient.count();
  const seq = String(count + 1).padStart(8, '0');
  return seq;
}

export const getPatients = async (req: Request, res: Response) => {
  try {
    const { search, status, page = '1', limit = '10' } = req.query;

    const where: any = {};

    if (search) {
      const s = (search as string).trim();
      where.OR = [
        { nome: { contains: s, mode: 'insensitive' } },
        { numeroUtente: { contains: s, mode: 'insensitive' } },
        { numeroProvisorio: { contains: s, mode: 'insensitive' } },
        { processoClinicoNum: { contains: s } },
        { id: { contains: s } },
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

    const transformed = patients.map((p) => ({
      ...p,
      status: transformUtenteStatus.toFrontend(p.status),
      lastVisit: getLastVisit(p),
      history: [],
    }));

    res.json({
      patients: transformed,
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

export const getPatientByNumeroUtente = async (req: Request, res: Response) => {
  try {
    const { numero } = req.query;
    if (!numero || typeof numero !== 'string') {
      return res.status(400).json({ error: 'Número de utente obrigatório' });
    }
    const patient = await prisma.patient.findFirst({
      where: {
        OR: [
          { numeroUtente: { equals: numero, mode: 'insensitive' } },
          { numeroProvisorio: { equals: numero, mode: 'insensitive' } },
        ],
      },
      include: {
        appointments: { orderBy: { date: 'desc' }, take: 5 },
        medicalRecords: { orderBy: { date: 'desc' }, take: 5 },
      },
    });
    if (!patient) {
      return res.status(404).json({ error: 'Utente não encontrado' });
    }
    res.json({
      ...patient,
      status: transformUtenteStatus.toFrontend(patient.status),
      lastVisit: getLastVisit(patient),
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
            doctor: { select: { id: true, name: true, role: true } },
          },
        },
        medicalRecords: {
          orderBy: { date: 'desc' },
          take: 10,
          include: {
            doctor: { select: { id: true, name: true, role: true } },
          },
        },
      },
    });

    if (!patient) {
      return res.status(404).json({ error: 'Utente não encontrado' });
    }

    const transformed = {
      ...patient,
      status: transformUtenteStatus.toFrontend(patient.status),
      lastVisit: getLastVisit(patient),
      history: patient.medicalRecords.map((r) => ({
        id: r.id,
        date: r.date.toISOString().split('T')[0],
        diagnosis: r.diagnosis,
        doctorName: r.doctor.name,
        notes: r.notes,
        medication: r.medication,
      })),
    };

    res.json(transformed);
  } catch (error) {
    throw error;
  }
};

export const createPatient = async (req: AuthRequest, res: Response) => {
  try {
    const input = createPatientSchema.parse(req.body);

    const dataNascimento = new Date(input.dataNascimento);
    if (isNaN(dataNascimento.getTime())) {
      return res.status(400).json({ error: 'Data de nascimento inválida' });
    }

    const registoProvisorio = !input.possuiNumeroUtente;
    let numeroUtente: string | null = input.possuiNumeroUtente && input.numeroUtente ? input.numeroUtente.trim() : null;
    let numeroProvisorio: string | null = null;

    if (registoProvisorio) {
      numeroProvisorio = await gerarNumeroProvisorio();
      if (!input.tipoDocumento || !input.numeroDocumento) {
        return res.status(400).json({ error: 'Registo provisório: tipo e número do documento são obrigatórios' });
      }
    } else {
      if (!numeroUtente) {
        return res.status(400).json({ error: 'Número de Utente SNS é obrigatório' });
      }
      const existing = await prisma.patient.findUnique({
        where: { numeroUtente },
      });
      if (existing) {
        return res.status(400).json({ error: 'Já existe um utente com este número SNS' });
      }
    }

    const processoClinicoNum = await gerarProcessoClinico();

    const data = {
      nome: input.nome.trim(),
      numeroUtente,
      numeroProvisorio,
      registoProvisorio,
      numeroCc: input.numeroCc?.trim() || undefined,
      nif: input.nif?.trim() || undefined,
      dataNascimento,
      sexo: input.sexo,
      nacionalidade: input.nacionalidade?.trim() || undefined,
      tipoDocumento: input.tipoDocumento || undefined,
      numeroDocumento: input.numeroDocumento?.trim() || undefined,
      paisOrigem: input.paisOrigem?.trim() || undefined,
      telemovel: input.telemovel.trim(),
      telefoneAlternativo: input.telefoneAlternativo?.trim() || undefined,
      email: input.email?.trim() || undefined,
      rua: input.rua?.trim() || undefined,
      codigoPostal: input.codigoPostal?.trim() || undefined,
      localidade: input.localidade?.trim() || undefined,
      concelho: input.concelho?.trim() || undefined,
      distrito: input.distrito?.trim() || undefined,
      processoClinicoNum,
      unidadeHospitalar: input.unidadeHospitalar?.trim() || undefined,
      medicoFamilia: input.medicoFamilia?.trim() || undefined,
      centroSaude: input.centroSaude?.trim() || undefined,
      tipoAtendimento: input.tipoAtendimento as any,
      alergias: input.alergias?.trim() || undefined,
      doencasCronicas: input.doencasCronicas?.trim() || undefined,
      medicacaoHabitual: input.medicacaoHabitual?.trim() || undefined,
      grupoSanguineo: input.grupoSanguineo || undefined,
      observacoesClinicas: input.observacoesClinicas?.trim() || undefined,
      status: (input.status || 'ESTAVEL') as any,
      quarto: input.quarto?.trim() || undefined,
    };

    const patient = await prisma.patient.create({
      data,
      include: {
        appointments: { take: 0 },
        medicalRecords: { take: 0 },
      },
    });

    const transformed = {
      ...patient,
      status: transformUtenteStatus.toFrontend(patient.status),
      lastVisit: getLastVisit(patient),
      history: [],
    };

    res.status(201).json(transformed);
  } catch (error) {
    throw error;
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const input = updatePatientSchema.parse(req.body);

    const data: any = { ...input };
    if (input.dataNascimento) {
      data.dataNascimento = new Date(input.dataNascimento);
    }
    delete data.possuiNumeroUtente;

    const patient = await prisma.patient.update({
      where: { id },
      data,
      include: {
        appointments: { orderBy: { date: 'desc' }, take: 1 },
        medicalRecords: { orderBy: { date: 'desc' }, take: 1 },
      },
    });

    const transformed = {
      ...patient,
      status: transformUtenteStatus.toFrontend(patient.status),
      lastVisit: getLastVisit(patient),
      history: [],
    };

    res.json(transformed);
  } catch (error) {
    throw error;
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.patient.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    throw error;
  }
};
