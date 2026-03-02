import React, { useState, useMemo } from 'react';
import {
  ChevronLeftIcon, ChevronRightIcon, PlusIcon,
  UserIcon, ClockIcon, BuildingIcon, CalendarIcon,
  CheckCheckIcon, PlayIcon, AlertCircleIcon, XCircleIcon,
} from 'lucide-react';
import { format, addDays, subDays, isToday, isTomorrow, isYesterday } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/* ─────────────────────────────────────────────
   Mock data
───────────────────────────────────────────── */
interface Appointment {
  id: string;
  time: string;
  patientName: string;
  patientInitial: string;
  doctorName: string;
  especialidade: string;
  type: 'Consulta' | 'Exame' | 'Retorno' | 'Emergência' | 'Cirurgia';
  status: 'Agendado' | 'Em Atendimento' | 'Concluído' | 'Cancelado';
  sala: string;
  duration: number; // minutes
}

const BASE_DATE = new Date();
const fmt = (d: Date) => format(d, 'yyyy-MM-dd');

const MOCK: Record<string, Appointment[]> = {
  [fmt(BASE_DATE)]: [
    { id: '1', time: '08:00', patientName: 'Carlos Eduardo Mendes',  patientInitial: 'C', doctorName: 'Dr. Ramos',   especialidade: 'Cardiologia',   type: 'Consulta',   status: 'Concluído',      sala: 'Cons. 01', duration: 30 },
    { id: '2', time: '08:30', patientName: 'Ana Beatriz Souza',       patientInitial: 'A', doctorName: 'Dra. Silva',  especialidade: 'Neurologia',    type: 'Retorno',    status: 'Concluído',      sala: 'Cons. 02', duration: 20 },
    { id: '3', time: '09:15', patientName: 'Miguel Torres Ferreira',  patientInitial: 'M', doctorName: 'Dr. Costa',   especialidade: 'Ortopedia',     type: 'Exame',      status: 'Em Atendimento', sala: 'Sala Exam', duration: 45 },
    { id: '4', time: '10:00', patientName: 'Luciana Pires Oliveira',  patientInitial: 'L', doctorName: 'Dra. Matos',  especialidade: 'Pediatria',     type: 'Consulta',   status: 'Agendado',       sala: 'Cons. 03', duration: 30 },
    { id: '5', time: '11:00', patientName: 'Roberto Alves Lima',      patientInitial: 'R', doctorName: 'Dr. Nunes',   especialidade: 'Clínica Geral', type: 'Consulta',   status: 'Agendado',       sala: 'Cons. 01', duration: 30 },
    { id: '6', time: '14:00', patientName: 'Fernanda Castro Neto',    patientInitial: 'F', doctorName: 'Dra. Lima',   especialidade: 'Dermatologia',  type: 'Retorno',    status: 'Agendado',       sala: 'Cons. 02', duration: 20 },
    { id: '7', time: '15:30', patientName: 'João Pedro Martins',      patientInitial: 'J', doctorName: 'Dr. Ramos',   especialidade: 'Cardiologia',   type: 'Cirurgia',   status: 'Agendado',       sala: 'Bloco Cir', duration: 120 },
    { id: '8', time: '16:00', patientName: 'Isabela Rocha Vieira',    patientInitial: 'I', doctorName: 'Dra. Silva',  especialidade: 'Neurologia',    type: 'Exame',      status: 'Agendado',       sala: 'Sala Exam', duration: 60 },
  ],
  [fmt(addDays(BASE_DATE, 1))]: [
    { id: '9',  time: '09:00', patientName: 'Diego Lopes Carvalho',  patientInitial: 'D', doctorName: 'Dr. Costa',  especialidade: 'Ortopedia',     type: 'Consulta',  status: 'Agendado', sala: 'Cons. 01', duration: 30 },
    { id: '10', time: '10:30', patientName: 'Camila Dias Freitas',   patientInitial: 'C', doctorName: 'Dr. Nunes',  especialidade: 'Clínica Geral', type: 'Retorno',   status: 'Agendado', sala: 'Cons. 02', duration: 20 },
    { id: '11', time: '11:00', patientName: 'Thiago Barbosa Santos', patientInitial: 'T', doctorName: 'Dra. Matos', especialidade: 'Pediatria',     type: 'Emergência', status: 'Agendado', sala: 'Urgência',  duration: 45 },
    { id: '12', time: '14:30', patientName: 'Patricia Moura Gomes',  patientInitial: 'P', doctorName: 'Dr. Ramos',  especialidade: 'Cardiologia',   type: 'Exame',     status: 'Agendado', sala: 'Sala Exam', duration: 60 },
  ],
};

/* ─────────────────────────────────────────────
   Config maps
───────────────────────────────────────────── */
const TYPE_STYLES: Record<string, string> = {
  'Consulta':   'bg-blue-50 text-blue-600 dark:bg-blue-900/25 dark:text-blue-400',
  'Exame':      'bg-violet-50 text-violet-600 dark:bg-violet-900/25 dark:text-violet-400',
  'Retorno':    'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/25 dark:text-cyan-400',
  'Emergência': 'bg-red-50 text-red-600 dark:bg-red-900/25 dark:text-red-400',
  'Cirurgia':   'bg-amber-50 text-amber-600 dark:bg-amber-900/25 dark:text-amber-400',
};

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; style: string }> = {
  'Agendado':       { icon: <ClockIcon className="w-3 h-3" />,       label: 'Agendado',        style: 'text-slate-500 bg-slate-100 dark:bg-white/10 dark:text-slate-400'         },
  'Em Atendimento': { icon: <PlayIcon className="w-3 h-3" />,        label: 'Em Atendimento',  style: 'text-blue-600 bg-blue-50 dark:bg-blue-900/25 dark:text-blue-400'           },
  'Concluído':      { icon: <CheckCheckIcon className="w-3 h-3" />,  label: 'Concluído',       style: 'text-green-600 bg-green-50 dark:bg-green-900/25 dark:text-green-400'       },
  'Cancelado':      { icon: <XCircleIcon className="w-3 h-3" />,     label: 'Cancelado',       style: 'text-red-500 bg-red-50 dark:bg-red-900/25 dark:text-red-400'               },
};

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-600', 'bg-violet-100 text-violet-600',
  'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600',
  'bg-rose-100 text-rose-600', 'bg-cyan-100 text-cyan-600',
];

const SALAS = [
  { name: 'Cons. 01',  status: 'Ocupado'  },
  { name: 'Cons. 02',  status: 'Ocupado'  },
  { name: 'Cons. 03',  status: 'Livre'    },
  { name: 'Sala Exam', status: 'Ocupado'  },
  { name: 'Bloco Cir', status: 'Reservado'},
  { name: 'Urgência',  status: 'Livre'    },
];

/* ─────────────────────────────────────────────
   Date label helper
───────────────────────────────────────────── */
const dateLabel = (d: Date) => {
  if (isToday(d))     return 'Hoje';
  if (isTomorrow(d))  return 'Amanhã';
  if (isYesterday(d)) return 'Ontem';
  return null;
};

/* ─────────────────────────────────────────────
   Appointment card
───────────────────────────────────────────── */
const AppCard: React.FC<{ app: Appointment; idx: number }> = ({ app, idx }) => {
  const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  const typeStyle   = TYPE_STYLES[app.type]   ?? TYPE_STYLES['Consulta'];
  const statusCfg   = STATUS_CONFIG[app.status] ?? STATUS_CONFIG['Agendado'];
  const isPast      = app.status === 'Concluído' || app.status === 'Cancelado';

  return (
    <div
      className={[
        'group flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-200',
        'bg-white dark:bg-white/5',
        isPast
          ? 'border-slate-100 dark:border-white/5 opacity-60'
          : app.status === 'Em Atendimento'
            ? 'border-blue-200 dark:border-blue-700 shadow-md shadow-blue-500/10'
            : 'border-slate-100 dark:border-white/10 hover:border-slate-200 dark:hover:border-white/20 hover:shadow-sm',
      ].join(' ')}
      style={{ animation: `fadeUp 0.3s ease ${idx * 0.05}s both` }}
    >
      {/* Time */}
      <div className="w-14 shrink-0 text-center border-r-2 border-slate-100 dark:border-white/10 pr-4">
        <p className="text-base font-bold text-slate-800 dark:text-white leading-none">{app.time}</p>
        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{app.duration}min</p>
      </div>

      {/* Avatar */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${avatarColor}`}>
        {app.patientInitial}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{app.patientName}</p>
          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${typeStyle}`}>{app.type}</span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
          <span className="flex items-center gap-1">
            <UserIcon className="w-3 h-3" />{app.doctorName}
          </span>
          <span className="text-slate-200 dark:text-white/10">·</span>
          <span>{app.especialidade}</span>
          <span className="text-slate-200 dark:text-white/10">·</span>
          <span className="flex items-center gap-1">
            <BuildingIcon className="w-3 h-3" />{app.sala}
          </span>
        </div>
      </div>

      {/* Status + actions */}
      <div className="flex items-center gap-2 shrink-0">
        <span className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${statusCfg.style}`}>
          {statusCfg.icon}{statusCfg.label}
        </span>
        {!isPast && (
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="h-8 px-3 rounded-lg border-2 border-slate-100 dark:border-white/10 text-xs font-semibold text-slate-500 hover:border-slate-200 dark:hover:border-white/20 hover:text-slate-700 dark:hover:text-white transition-all">
              Reagendar
            </button>
            <button className="h-8 px-3 rounded-lg bg-primary text-white text-xs font-semibold shadow-sm shadow-primary/25 hover:shadow-md hover:shadow-primary/30 transition-all">
              Atender
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main
───────────────────────────────────────────── */
const Appointments: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNovaConsulta, setShowNovaConsulta] = useState(false);

  const dateStr    = fmt(selectedDate);
  const label      = dateLabel(selectedDate);
  const dayApps    = MOCK[dateStr] ?? [];

  const stats = useMemo(() => ({
    total:     dayApps.length,
    concluido: dayApps.filter((a) => a.status === 'Concluído').length,
    ativo:     dayApps.filter((a) => a.status === 'Em Atendimento').length,
    pendente:  dayApps.filter((a) => a.status === 'Agendado').length,
  }), [dayApps]);

  return (
    <>
      <Dialog open={showNovaConsulta} onOpenChange={(open) => setShowNovaConsulta(open)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Consulta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="consulta-paciente">Paciente *</Label>
                <Input id="consulta-paciente" placeholder="Nome do paciente" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consulta-especialidade">Especialidade *</Label>
                <Input id="consulta-especialidade" placeholder="Especialidade" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="consulta-data">Data *</Label>
                <Input id="consulta-data" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consulta-hora">Hora *</Label>
                <Input id="consulta-hora" type="time" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="consulta-notas">Observações</Label>
              <Textarea id="consulta-notas" rows={3} placeholder="Notas adicionais" className="resize-none" />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setShowNovaConsulta(false)}>Cancelar</Button>
              <Button onClick={() => setShowNovaConsulta(false)}>Guardar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="space-y-5" style={{ animation: 'fadeUp 0.35s ease both' }}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Agendamentos</h1>
            <p className="text-sm text-slate-400 mt-0.5">Consultas, exames e cirurgias</p>
          </div>
          <button
            onClick={() => setShowNovaConsulta(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-white text-sm font-semibold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 self-start sm:self-auto"
          >
            <PlusIcon className="w-4 h-4" />
            Nova Consulta
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left: schedule ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Date navigator */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border-2 border-slate-100 dark:border-white/10 px-5 py-3.5 flex items-center justify-between">
              <button
                onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                className="w-8 h-8 rounded-xl border-2 border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-200 dark:hover:border-white/25 transition-all"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  <p className="text-sm font-bold text-slate-800 dark:text-white capitalize">
                    {format(selectedDate, "EEEE, d 'de' MMMM", { locale: pt })}
                  </p>
                  {label && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-bold rounded-full">
                      {label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {stats.total} agendamentos · {stats.concluido} concluídos · {stats.pendente} pendentes
                </p>
              </div>

              <button
                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                className="w-8 h-8 rounded-xl border-2 border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-200 dark:hover:border-white/25 transition-all"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Appointment list */}
            {dayApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-400">
                <CalendarIcon className="w-8 h-8 mb-3 opacity-40" />
                <p className="text-sm font-medium">Sem agendamentos para este dia</p>
                <button onClick={() => setShowNovaConsulta(true)} className="mt-3 text-xs text-primary hover:underline font-semibold">
                  + Adicionar agendamento
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dayApps.map((app, i) => <AppCard key={app.id} app={app} idx={i} />)}
              </div>
            )}
          </div>

          {/* ── Right: sidebar ── */}
          <div className="space-y-4">

            {/* Mini stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total',        value: stats.total,     color: 'text-slate-800 dark:text-white',   bg: 'bg-slate-50 dark:bg-white/5'          },
                { label: 'Em andamento', value: stats.ativo,     color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20'       },
                { label: 'Concluídos',   value: stats.concluido, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20'   },
                { label: 'Pendentes',    value: stats.pendente,  color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20'   },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-xl p-3 border-2 border-transparent`}>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Room availability */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border-2 border-slate-100 dark:border-white/10 p-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <BuildingIcon className="w-4 h-4 text-slate-400" />
                Disponibilidade de Salas
              </h3>
              <div className="space-y-2">
                {SALAS.map((sala, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-white/5">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{sala.name}</p>
                    <span className={[
                      'flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full',
                      sala.status === 'Ocupado'   ? 'bg-red-50 text-red-500 dark:bg-red-900/25 dark:text-red-400'       :
                      sala.status === 'Livre'     ? 'bg-green-50 text-green-600 dark:bg-green-900/25 dark:text-green-400' :
                                                   'bg-amber-50 text-amber-600 dark:bg-amber-900/25 dark:text-amber-400',
                    ].join(' ')}>
                      <span className={[
                        'w-1.5 h-1.5 rounded-full',
                        sala.status === 'Ocupado'   ? 'bg-red-500'   :
                        sala.status === 'Livre'     ? 'bg-green-500' : 'bg-amber-500',
                      ].join(' ')} />
                      {sala.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Type legend */}
            <div className="bg-white dark:bg-white/5 rounded-2xl border-2 border-slate-100 dark:border-white/10 p-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Tipos de Atendimento</h3>
              <div className="space-y-2">
                {Object.entries(TYPE_STYLES).map(([type, style]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${style}`}>{type}</span>
                    <span className="text-xs text-slate-400 font-mono">
                      {dayApps.filter((a) => a.type === type).length} hoje
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Appointments;