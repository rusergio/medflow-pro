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
