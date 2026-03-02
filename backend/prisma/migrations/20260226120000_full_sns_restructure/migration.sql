-- Drop tables in dependency order
DROP TABLE IF EXISTS "appointments";
DROP TABLE IF EXISTS "medical_records";
DROP TABLE IF EXISTS "triagens";
DROP TABLE IF EXISTS "patients";

-- Drop old enums (if they exist)
DROP TYPE IF EXISTS "PatientStatus" CASCADE;
DROP TYPE IF EXISTS "AppointmentType" CASCADE;
DROP TYPE IF EXISTS "AppointmentStatus" CASCADE;

-- Drop new enums (in case of partial run)
DROP TYPE IF EXISTS "OrigemMarcacao" CASCADE;
DROP TYPE IF EXISTS "PrioridadeTriagem" CASCADE;
DROP TYPE IF EXISTS "TipoAtendimento" CASCADE;
DROP TYPE IF EXISTS "UtenteStatus" CASCADE;
DROP TYPE IF EXISTS "AppointmentType" CASCADE;
DROP TYPE IF EXISTS "AppointmentStatus" CASCADE;

-- Create new enums
CREATE TYPE "UtenteStatus" AS ENUM ('ESTAVEL', 'CRITICO', 'EM_OBSERVACAO', 'ALTA');

CREATE TYPE "TipoAtendimento" AS ENUM ('CONSULTA_EXTERNA', 'URGENCIA', 'INTERNAMENTO', 'EXAME_COMPLEMENTAR');

CREATE TYPE "PrioridadeTriagem" AS ENUM ('VERMELHO', 'LARANJA', 'AMARELO', 'VERDE', 'AZUL');

CREATE TYPE "AppointmentType" AS ENUM ('PRIMEIRA_CONSULTA', 'SEGUIMENTO', 'CONSULTA', 'RETORNO', 'EXAME', 'EMERGENCIA');

CREATE TYPE "AppointmentStatus" AS ENUM ('AGENDADA', 'CONFIRMADA', 'CANCELADA', 'FALTA', 'REALIZADA');

CREATE TYPE "OrigemMarcacao" AS ENUM ('MEDICO_FAMILIA', 'INTERNO', 'REFERENCIADO');

-- CreateTable especialidades
CREATE TABLE "especialidades" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "especialidades_nome_key" ON "especialidades"("nome");

-- CreateTable patients
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "numeroUtente" TEXT,
    "numeroCc" TEXT,
    "nif" TEXT,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "sexo" TEXT NOT NULL,
    "nacionalidade" TEXT,
    "registoProvisorio" BOOLEAN NOT NULL DEFAULT false,
    "numeroProvisorio" TEXT,
    "tipoDocumento" TEXT,
    "numeroDocumento" TEXT,
    "paisOrigem" TEXT,
    "telemovel" TEXT NOT NULL,
    "telefoneAlternativo" TEXT,
    "email" TEXT,
    "rua" TEXT,
    "codigoPostal" TEXT,
    "localidade" TEXT,
    "concelho" TEXT,
    "distrito" TEXT,
    "processoClinicoNum" TEXT,
    "unidadeHospitalar" TEXT,
    "medicoFamilia" TEXT,
    "centroSaude" TEXT,
    "tipoAtendimento" "TipoAtendimento",
    "dataRegisto" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alergias" TEXT,
    "doencasCronicas" TEXT,
    "medicacaoHabitual" TEXT,
    "grupoSanguineo" TEXT,
    "observacoesClinicas" TEXT,
    "status" "UtenteStatus" NOT NULL DEFAULT 'ESTAVEL',
    "quarto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "patients_numeroUtente_key" ON "patients"("numeroUtente");
CREATE UNIQUE INDEX "patients_numeroProvisorio_key" ON "patients"("numeroProvisorio");
CREATE INDEX "patients_numeroUtente_idx" ON "patients"("numeroUtente");
CREATE INDEX "patients_numeroProvisorio_idx" ON "patients"("numeroProvisorio");
CREATE INDEX "patients_processoClinicoNum_idx" ON "patients"("processoClinicoNum");

-- CreateTable appointments
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "especialidadeId" TEXT,
    "doctorId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sala" TEXT,
    "tipo" "AppointmentType" NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'AGENDADA',
    "origem" "OrigemMarcacao",
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "appointments_patientId_idx" ON "appointments"("patientId");
CREATE INDEX "appointments_doctorId_idx" ON "appointments"("doctorId");
CREATE INDEX "appointments_date_idx" ON "appointments"("date");

-- CreateTable medical_records
CREATE TABLE "medical_records" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diagnosis" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "medication" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "medical_records_patientId_idx" ON "medical_records"("patientId");
CREATE INDEX "medical_records_doctorId_idx" ON "medical_records"("doctorId");

-- CreateTable triagens
CREATE TABLE "triagens" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "prioridade" "PrioridadeTriagem" NOT NULL,
    "sinaisVitais" TEXT,
    "dataHoraAdmissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profissionalId" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "triagens_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "triagens_patientId_idx" ON "triagens"("patientId");
CREATE INDEX "triagens_prioridade_idx" ON "triagens"("prioridade");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_especialidadeId_fkey" FOREIGN KEY ("especialidadeId") REFERENCES "especialidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "triagens" ADD CONSTRAINT "triagens_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
