
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
  avatar?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Outro';
  bloodType: string;
  status: 'Estável' | 'Crítico' | 'Em Observação' | 'Alta';
  room?: string;
  lastVisit: string;
  history: MedicalRecord[];
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
  doctorName: string;
  date: string;
  time: string;
  type: 'Consulta' | 'Retorno' | 'Exame' | 'Emergência';
  status: 'Agendado' | 'Concluído' | 'Cancelado';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
