import prisma from '../config/database.js';
import env from '../config/env.js';
import { hashPassword } from './hash.js';

const DEFAULT_ADMIN_EMAIL = 'medflowpro@gmail.com';
const DEFAULT_ADMIN_PASSWORD = 'MedFlow-pro2026*';

export const ensureAdminUser = async () => {
  const adminEmail = env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const adminPassword = env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  const existingAdmin = await prisma.user.findFirst({
    where: {
      email: adminEmail,
    },
  });

  if (existingAdmin) {
    return;
  }

  const hashedPassword = await hashPassword(adminPassword);

  await prisma.user.create({
    data: {
      name: 'Administrador MedFlow',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
};

const ESPECIALIDADES_SNS = [
  'Medicina Geral',
  'Cardiologia',
  'Dermatologia',
  'Ginecologia/Obstetrícia',
  'Oftalmologia',
  'Ortopedia',
  'Pediatria',
  'Psiquiatria',
  'Radiologia',
  'Urgência Geral',
];

export const ensureEspecialidades = async () => {
  for (const nome of ESPECIALIDADES_SNS) {
    await prisma.especialidade.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }
};

const TEST_PATIENT_EMAIL = 'paciente@medflowpro.pt';
const TEST_PATIENT_PASSWORD = 'Paciente123!';

export const ensureTestPatient = async () => {
  const existing = await prisma.user.findFirst({
    where: { email: TEST_PATIENT_EMAIL },
  });
  if (existing) return;

  const hashedPassword = await hashPassword(TEST_PATIENT_PASSWORD);
  const user = await prisma.user.create({
    data: {
      name: 'Paciente Teste',
      email: TEST_PATIENT_EMAIL,
      password: hashedPassword,
      role: 'PATIENT',
    },
  });

  await prisma.patient.create({
    data: {
      nome: 'Paciente Teste',
      email: TEST_PATIENT_EMAIL,
      telemovel: '912345678',
      dataNascimento: new Date('1990-01-15'),
      sexo: 'M',
      userId: user.id,
    },
  });
};
