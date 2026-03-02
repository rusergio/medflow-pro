
export enum UserRole {
  DOCTOR = 'Médico(a)',
  NURSE = 'Enfermeiro(a)',
  ADMIN = 'Administrador'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  avatar?: string;
  pinActive?: boolean;
}

export interface Patient {
  id: string;
  nome: string;
  numeroUtente?: string | null;
  numeroProvisorio?: string | null;
  processoClinicoNum?: string | null;
  dataNascimento?: string;
  sexo: 'M' | 'F' | 'Outro';
  grupoSanguineo?: string;
  status: 'Estável' | 'Crítico' | 'Em Observação' | 'Alta';
  quarto?: string;
  lastVisit?: string;
  history?: MedicalRecord[];
}

export interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  doctorName: string;
  notes: string;
  medication?: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  numeroUtente?: string;
  doctorName: string;
  especialidade?: string;
  date: string;
  time: string;
  type: string;
  status: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
