// Transformadores para convertir entre formatos del backend (enums) y frontend (strings con acentos)

export const transformUserRole = {
  toFrontend: (role: string): string => {
    const map: Record<string, string> = {
      DOCTOR: 'Médico(a)',
      NURSE: 'Enfermeiro(a)',
      ADMIN: 'Administrador',
    };
    return map[role] || role;
  },
  toBackend: (role: string): string => {
    const map: Record<string, string> = {
      'Médico(a)': 'DOCTOR',
      'Enfermeiro(a)': 'NURSE',
      'Administrador': 'ADMIN',
    };
    return map[role] || role;
  },
};

export const transformPatientStatus = {
  toFrontend: (status: string): string => {
    const map: Record<string, string> = {
      ESTAVEL: 'Estável',
      CRITICO: 'Crítico',
      EM_OBSERVACAO: 'Em Observação',
      ALTA: 'Alta',
    };
    return map[status] || status;
  },
  toBackend: (status: string): string => {
    const map: Record<string, string> = {
      'Estável': 'ESTAVEL',
      'Crítico': 'CRITICO',
      'Em Observação': 'EM_OBSERVACAO',
      'Alta': 'ALTA',
    };
    return map[status] || status;
  },
};

export const transformAppointmentType = {
  toFrontend: (type: string): string => {
    const map: Record<string, string> = {
      CONSULTA: 'Consulta',
      RETORNO: 'Retorno',
      EXAME: 'Exame',
      EMERGENCIA: 'Emergência',
    };
    return map[type] || type;
  },
  toBackend: (type: string): string => {
    const map: Record<string, string> = {
      'Consulta': 'CONSULTA',
      'Retorno': 'RETORNO',
      'Exame': 'EXAME',
      'Emergência': 'EMERGENCIA',
    };
    return map[type] || type;
  },
};

export const transformAppointmentStatus = {
  toFrontend: (status: string): string => {
    const map: Record<string, string> = {
      AGENDADO: 'Agendado',
      CONCLUIDO: 'Concluído',
      CANCELADO: 'Cancelado',
    };
    return map[status] || status;
  },
  toBackend: (status: string): string => {
    const map: Record<string, string> = {
      'Agendado': 'AGENDADO',
      'Concluído': 'CONCLUIDO',
      'Cancelado': 'CANCELADO',
    };
    return map[status] || status;
  },
};

// Formatear fecha para extraer date y time
export const formatDateTime = (dateTime: Date | string) => {
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.toTimeString().slice(0, 5);
  return { date: dateStr, time: timeStr };
};

// Obtener última visita del paciente (última cita o registro médico)
export const getLastVisit = (patient: any): string => {
  if (patient.appointments && patient.appointments.length > 0) {
    const lastAppointment = patient.appointments[0];
    return lastAppointment.date ? formatDateTime(lastAppointment.date).date : new Date().toISOString().split('T')[0];
  }
  if (patient.medicalRecords && patient.medicalRecords.length > 0) {
    const lastRecord = patient.medicalRecords[0];
    return lastRecord.date ? formatDateTime(lastRecord.date).date : new Date().toISOString().split('T')[0];
  }
  return patient.createdAt ? formatDateTime(patient.createdAt).date : new Date().toISOString().split('T')[0];
};

