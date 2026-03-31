import nodemailer from 'nodemailer';

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendPasswordResetCodeEmail(to: string, code: string): Promise<void> {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@medflow.local';
  const appName = process.env.APP_NAME || 'MedFlow Pro';
  const transporter = createTransport();

  const text = [
    `${appName} — recuperação de senha`,
    '',
    `O seu código de verificação é: ${code}`,
    '',
    'Este código expira em 15 minutos.',
    'Se não pediu este código, ignore este email.',
  ].join('\n');

  if (!transporter) {
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
      console.error(
        '[medflow] SMTP não configurado (SMTP_HOST, SMTP_USER, SMTP_PASS). Não foi possível enviar o código por email.',
      );
      throw new Error('Serviço de email não disponível. Contacte o administrador.');
    }
    console.log(`\n[MedFlow dev] Código de recuperação para ${to}: ${code}\n`);
    return;
  }

  await transporter.sendMail({
    from: `"${appName}" <${from}>`,
    to,
    subject: `${appName} — código para redefinir senha`,
    text,
  });
}
