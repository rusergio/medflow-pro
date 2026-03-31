import React, { useState, useEffect } from 'react';
import { CalendarIcon, PlusIcon, Loader2Icon } from 'lucide-react';
import { api } from '../../services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User } from '../../types';

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  especialidade?: string;
  date: string;
  time: string;
  type: string;
  status: string;
}

interface PatientAppointmentsProps {
  isLoggedIn: boolean;
  onLoginSuccess: (user: User, token: string) => void;
}

const PatientAppointments: React.FC<PatientAppointmentsProps> = ({ isLoggedIn, onLoginSuccess }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookError, setBookError] = useState('');
  const [especialidades, setEspecialidades] = useState<{ id: string; nome: string }[]>([]);
  const [form, setForm] = useState({ date: '', time: '09:00', especialidadeId: '', notes: '' });

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authTelemovel, setAuthTelemovel] = useState('');
  const [authDataNasc, setAuthDataNasc] = useState('');
  const [authSexo, setAuthSexo] = useState<'M' | 'F'>('M');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.getAppointments({ limit: 20 });
      setAppointments(res.appointments || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEspecialidades = async () => {
    try {
      const list = await api.getEspecialidades();
      setEspecialidades(Array.isArray(list) ? list : []);
    } catch {
      setEspecialidades([]);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadAppointments();
      loadEspecialidades();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const openBookModal = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setShowBookModal(true);
    setBookError('');
  };

  const handleAuthLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const { user, token } = await api.login(authEmail, authPassword);
      onLoginSuccess(user, token);
      setShowAuthModal(false);
    } catch (err: any) {
      setAuthError(err.message || 'Credenciais inválidas.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authName.trim() || !authEmail.trim() || !authPassword || !authTelemovel.trim() || !authDataNasc) {
      setAuthError('Preencha todos os campos.');
      return;
    }
    setAuthLoading(true);
    try {
      const { user, token } = await api.registerPatient({
        name: authName.trim(),
        email: authEmail.trim(),
        password: authPassword,
        telemovel: authTelemovel.trim(),
        dataNascimento: authDataNasc,
        sexo: authSexo,
      });
      onLoginSuccess(user, token);
      setShowAuthModal(false);
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao criar conta.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookError('');
    if (!form.date.trim()) {
      setBookError('Selecione a data.');
      return;
    }
    setBookingLoading(true);
    try {
      await api.createPatientSelfAppointment({
        date: form.date,
        time: form.time,
        especialidadeId: form.especialidadeId || undefined,
        notes: form.notes || undefined,
      });
      setShowBookModal(false);
      setForm({ date: '', time: '09:00', especialidadeId: '', notes: '' });
      loadAppointments();
    } catch (err: any) {
      setBookError(err.message || 'Erro ao marcar consulta.');
    } finally {
      setBookingLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    Agendada: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    Confirmada: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Realizada: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
    Cancelada: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    Falta: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Consultas</h1>
        <Card>
          <CardContent className="py-16 text-center">
            <CalendarIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              Para ver as suas consultas e marcar novas, inicie sessão ou crie uma conta.
            </p>
            <div className="flex gap-3 justify-center mt-4">
              <Button onClick={() => { setAuthMode('login'); setShowAuthModal(true); setAuthError(''); }}>
                Iniciar sessão
              </Button>
              <Button variant="outline" onClick={() => { setAuthMode('register'); setShowAuthModal(true); setAuthError(''); }}>
                Criar conta
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modal login/registo */}
        <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{authMode === 'login' ? 'Iniciar sessão' : 'Criar conta de paciente'}</DialogTitle>
            </DialogHeader>
            {authError && <p className="text-sm text-red-500">{authError}</p>}
            {authMode === 'login' ? (
              <form onSubmit={handleAuthLogin} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required />
                </div>
                <div>
                  <Label>Senha</Label>
                  <Input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAuthModal(false)}>Cancelar</Button>
                  <Button type="submit" disabled={authLoading}>{authLoading ? 'A carregar...' : 'Entrar'}</Button>
                </DialogFooter>
              </form>
            ) : (
              <form onSubmit={handleAuthRegister} className="space-y-4">
                <div><Label>Nome</Label><Input value={authName} onChange={(e) => setAuthName(e.target.value)} required /></div>
                <div><Label>Email</Label><Input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required /></div>
                <div><Label>Senha (mín. 6)</Label><Input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required minLength={6} /></div>
                <div><Label>Telemóvel</Label><Input type="tel" value={authTelemovel} onChange={(e) => setAuthTelemovel(e.target.value)} required /></div>
                <div><Label>Data nascimento</Label><Input type="date" value={authDataNasc} onChange={(e) => setAuthDataNasc(e.target.value)} required /></div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2"><input type="radio" checked={authSexo === 'M'} onChange={() => setAuthSexo('M')} /> M</label>
                  <label className="flex items-center gap-2"><input type="radio" checked={authSexo === 'F'} onChange={() => setAuthSexo('F')} /> F</label>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAuthModal(false)}>Cancelar</Button>
                  <Button type="submit" disabled={authLoading}>{authLoading ? 'A criar...' : 'Criar conta'}</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Minhas Consultas</h1>
        <Button onClick={openBookModal} className="gap-2">
          <PlusIcon className="w-4 h-4" />
          Marcar Consulta
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : appointments.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CalendarIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Ainda não tem consultas agendadas.</p>
            <Button onClick={openBookModal} className="mt-4">
              Marcar primeira consulta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <Card key={apt.id}>
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">{apt.doctorName}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {apt.especialidade || apt.type} · {apt.date} às {apt.time}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusColors[apt.status] || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal marcar consulta */}
      <Dialog open={showBookModal} onOpenChange={setShowBookModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar Nova Consulta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBook} className="space-y-4">
            {bookError && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {bookError}
              </p>
            )}
            <div>
              <Label>Data</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label>Hora</Label>
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              />
            </div>
            {especialidades.length > 0 && (
              <div>
                <Label>Especialidade (opcional)</Label>
                <select
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-white/20 bg-white dark:bg-slate-900 px-3"
                  value={form.especialidadeId}
                  onChange={(e) => setForm((f) => ({ ...f, especialidadeId: e.target.value }))}
                >
                  <option value="">— Selecionar —</option>
                  {especialidades.map((e) => (
                    <option key={e.id} value={e.id}>{e.nome}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <Label>Observações (opcional)</Label>
              <textarea
                className="w-full min-h-[80px] rounded-lg border border-slate-200 dark:border-white/20 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Ex: primeira consulta, retorno..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowBookModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={bookingLoading}>
                {bookingLoading ? (
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                ) : (
                  'Confirmar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientAppointments;
