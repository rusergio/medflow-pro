const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Recuperar token del localStorage si existe
    const savedToken = localStorage.getItem('medflow_token');
    if (savedToken) {
      this.token = savedToken;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('medflow_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('medflow_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async register(userData: { name: string; email: string; password: string; role?: string }) {
    const data = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async getProfile() {
    return this.request<any>('/auth/me');
  }

  async getUsers() {
    return this.request<{ users: any[] }>('/auth/users');
  }

  // Patients
  async getPatients(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return this.request<{ patients: any[]; pagination: any }>(`/patients${query ? `?${query}` : ''}`);
  }

  async getPatientById(id: string) {
    return this.request<any>(`/patients/${id}`);
  }

  async createPatient(patientData: any) {
    return this.request<any>('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  async updatePatient(id: string, patientData: any) {
    return this.request<any>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    });
  }

  async deletePatient(id: string) {
    return this.request<void>(`/patients/${id}`, {
      method: 'DELETE',
    });
  }

  // Appointments
  async getAppointments(params?: {
    date?: string;
    status?: string;
    doctorId?: string;
    patientId?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.doctorId) queryParams.append('doctorId', params.doctorId);
    if (params?.patientId) queryParams.append('patientId', params.patientId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return this.request<{ appointments: any[]; pagination: any }>(`/appointments${query ? `?${query}` : ''}`);
  }

  async getAppointmentById(id: string) {
    return this.request<any>(`/appointments/${id}`);
  }

  async createAppointment(appointmentData: any) {
    return this.request<any>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointment(id: string, appointmentData: any) {
    return this.request<any>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
  }

  async deleteAppointment(id: string) {
    return this.request<void>(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request<any>('/dashboard/stats');
  }

  // AI Chat
  async sendChatMessage(message: string) {
    return this.request<{ response: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);

