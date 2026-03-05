import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeftIcon, ChevronRightIcon, PlusIcon, ChevronDownIcon,
  UserIcon, ClockIcon, BuildingIcon, CalendarIcon,
  CheckCheckIcon, PlayIcon, XCircleIcon, CreditCardIcon, FileTextIcon,
  ShieldCheckIcon, BanknoteIcon,
} from 'lucide-react';
import { format, addDays, subDays, isToday, isTomorrow, isYesterday, startOfDay, isBefore, parse } from 'date-fns';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';

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

const ESPECIALIDADES = ['Cardiologia', 'Pediatria', 'Neurologia', 'Ortopedia', 'Dermatologia', 'Clínica Geral', 'Ginecologia', 'Psiquiatria'];
const MEDICOS = ['Dr. Ramos', 'Dra. Silva', 'Dr. Costa', 'Dra. Matos', 'Dr. Nunes', 'Dra. Lima'];
const TIPOS: Appointment['type'][] = ['Consulta', 'Exame', 'Retorno', 'Emergência', 'Cirurgia'];
const DURATIONS = [15, 20, 30, 45, 60, 90, 120];
const SALAS_NAMES = SALAS.map((s) => s.name);
const PACIENTES = [...new Set(Object.values(MOCK).flat().map((a) => a.patientName))].sort();

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
   Nova Consulta Modal — helpers
───────────────────────────────────────────── */
const SectionHeader: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="text-primary">{icon}</span>
    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">
      {children}
    </p>
  </div>
);

const formatDatePT = (date: Date | undefined) => {
  if (!date) return '';
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: pt });
};

const isValidDate = (date: Date | undefined) => {
  if (!date) return false;
  return !isNaN(date.getTime());
};

const todayStart = () => startOfDay(new Date());

type PaymentType = 'seguro' | 'cartao' | 'dinheiro' | 'isento';

interface NovaConsultaForm {
  patientName: string;
  especialidade: string;
  doctorName: string;
  type: Appointment['type'];
  dateStr: string;
  time: string;
  sala: string;
  duration: number;
  status: Appointment['status'];
  paymentType: PaymentType;
  /* Seguro */
  seguradora: string;
  numeroCartaoSeguro: string;
  numeroApolice: string;
  validadeCartaoSeguro: string;
  /* Cartão */
  numeroCartao: string;
  nomeCartao: string;
  validadeCartao: string;
  cvv: string;
  /* Dinheiro */
  valorConsulta: string;
  montanteRecebido: string;
  observacoes: string;
}

const SEGURADORAS = ['ADSE', 'Multicare', 'Médis', 'AdvanceCare', 'Allianz', 'AXA', 'Generali', 'Outra'];
const TARIFA_CONSULTA = 50; // valor exemplo €

const FORM_EMPTY: NovaConsultaForm = {
  patientName: '',
  especialidade: 'Clínica Geral',
  doctorName: 'Dr. Nunes',
  type: 'Consulta',
  dateStr: format(new Date(), 'yyyy-MM-dd'),
  time: '09:00',
  sala: 'Cons. 01',
  duration: 30,
  status: 'Agendado',
  paymentType: 'seguro',
  seguradora: '',
  numeroCartaoSeguro: '',
  numeroApolice: '',
  validadeCartaoSeguro: '',
  numeroCartao: '',
  nomeCartao: '',
  validadeCartao: '',
  cvv: '',
  valorConsulta: String(TARIFA_CONSULTA),
  montanteRecebido: '',
  observacoes: '',
};

const NovaConsultaModal: React.FC<{
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (app: Appointment, dateStr: string) => void;
  initialDate?: Date;
  occupiedDateStrings?: string[];
}> = ({ open, onOpenChange, onSave, initialDate, occupiedDateStrings = [] }) => {
  const initialDateStr = initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
  const [form, setForm] = useState<NovaConsultaForm>(() => ({
    ...FORM_EMPTY,
    dateStr: initialDateStr,
  }));
  const [dateOpen, setDateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(() =>
    initialDate ? new Date(initialDate) : new Date()
  );

  useEffect(() => {
    if (open && form.dateStr) {
      setCalendarMonth(new Date(form.dateStr + 'T12:00:00'));
    }
  }, [open, form.dateStr]);

  const set = <K extends keyof NovaConsultaForm>(k: K, v: NovaConsultaForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const selectedDate = form.dateStr ? new Date(form.dateStr + 'T12:00:00') : undefined;
  const dateDisplayValue = formatDatePT(selectedDate);
  const occupiedDates = useMemo(
    () => occupiedDateStrings.map((s) => new Date(s + 'T12:00:00')),
    [occupiedDateStrings]
  );

  const handleSave = () => {
    setSaving(true);
    const patientInitial = form.patientName ? form.patientName.charAt(0) : '?';
    const newApp: Appointment = {
      id: Date.now().toString(),
      time: form.time,
      patientName: form.patientName || 'Paciente a definir',
      patientInitial,
      doctorName: form.doctorName,
      especialidade: form.especialidade,
      type: form.type,
      status: form.status,
      sala: form.sala,
      duration: form.duration,
    };
    onSave(newApp, form.dateStr);
    setSaving(false);
    onOpenChange(false);
    setForm({ ...FORM_EMPTY, dateStr: format(new Date(), 'yyyy-MM-dd') });
  };

  const handleClose = () => {
    onOpenChange(false);
    setForm({ ...FORM_EMPTY, dateStr: format(new Date(), 'yyyy-MM-dd') });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25 shrink-0">
              <CalendarIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold leading-tight">Nova Consulta</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Agendar consulta, exame ou cirurgia</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4">
          {/* ═══ Secção: Atendimento ═══ */}
          <Card className="border-2">
            <CardContent className="pt-4 pb-4">
              <SectionHeader icon={<UserIcon className="w-3.5 h-3.5" />}>Atendimento</SectionHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldLabel htmlFor="consulta-paciente">Paciente *</FieldLabel>
                  <Select value={form.patientName || '__none__'} onValueChange={(v) => set('patientName', v === '__none__' ? '' : v)}>
                    <SelectTrigger id="consulta-paciente" className="w-full">
                      <SelectValue placeholder="Selecionar paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Selecionar —</SelectItem>
                      {PACIENTES.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="consulta-especialidade">Especialidade *</FieldLabel>
                  <Select value={form.especialidade} onValueChange={(v) => set('especialidade', v)}>
                    <SelectTrigger id="consulta-especialidade" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESPECIALIDADES.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="consulta-medico">Médico responsável *</FieldLabel>
                  <Select value={form.doctorName} onValueChange={(v) => set('doctorName', v)}>
                    <SelectTrigger id="consulta-medico" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDICOS.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="consulta-tipo">Tipo de atendimento *</FieldLabel>
                  <Select value={form.type} onValueChange={(v) => set('type', v as Appointment['type'])}>
                    <SelectTrigger id="consulta-tipo" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ═══ Secção: Data e Hora ═══ */}
          <Card className="border-2">
            <CardContent className="pt-4 pb-4">
              <SectionHeader icon={<ClockIcon className="w-3.5 h-3.5" />}>Data e Hora</SectionHeader>
              <FieldGroup className="flex-row flex-wrap gap-4">
                <Field className="flex-1 min-w-[200px]">
                  <FieldLabel htmlFor="consulta-data-input">Data *</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="consulta-data-input"
                      value={dateDisplayValue}
                      placeholder="Ex: 22 de Fevereiro de 2026"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val.trim()) return;
                        try {
                          const parsed = parse(val, "d 'de' MMMM 'de' yyyy", new Date(), { locale: pt });
                          if (isValidDate(parsed) && !isBefore(parsed, todayStart())) {
                            set('dateStr', format(parsed, 'yyyy-MM-dd'));
                            setCalendarMonth(parsed);
                          }
                        } catch {
                          /* formato inválido */
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setDateOpen(true);
                        }
                      }}
                    />
                    <InputGroupAddon align="inline-end">
                      <Popover open={dateOpen} onOpenChange={setDateOpen}>
                        <PopoverTrigger asChild>
                          <InputGroupButton variant="ghost" size="icon-xs" aria-label="Selecionar data">
                            <CalendarIcon className="w-4 h-4" />
                          </InputGroupButton>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="end" alignOffset={-8} sideOffset={10}>
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            month={calendarMonth}
                            onMonthChange={setCalendarMonth}
                            locale={pt}
                            disabled={{ before: todayStart() }}
                            modifiers={occupiedDates.length > 0 ? { ocupado: occupiedDates } : undefined}
                            modifiersClassNames={occupiedDates.length > 0 ? { ocupado: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-semibold' } : undefined}
                            onSelect={(date) => {
                              if (date) {
                                set('dateStr', format(date, 'yyyy-MM-dd'));
                                setDateOpen(false);
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
                <Field className="w-32">
                  <FieldLabel htmlFor="consulta-hora">Hora *</FieldLabel>
                  <Input
                    id="consulta-hora"
                    type="time"
                    step="60"
                    value={form.time}
                    onChange={(e) => set('time', e.target.value)}
                    className="h-9 appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* ═══ Secção: Local ═══ */}
          <Card className="border-2">
            <CardContent className="pt-4 pb-4">
              <SectionHeader icon={<BuildingIcon className="w-3.5 h-3.5" />}>Local e duração</SectionHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <FieldLabel htmlFor="consulta-sala">Sala *</FieldLabel>
                  <Select value={form.sala} onValueChange={(v) => set('sala', v)}>
                    <SelectTrigger id="consulta-sala" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SALAS_NAMES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <FieldLabel htmlFor="consulta-duracao">Duração (min) *</FieldLabel>
                  <Select value={String(form.duration)} onValueChange={(v) => set('duration', Number(v))}>
                    <SelectTrigger id="consulta-duracao" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATIONS.map((d) => (
                        <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ═══ Secção: Pagamento ═══ */}
          <Card className="border-2">
            <CardContent className="pt-4 pb-4">
              <SectionHeader icon={<CreditCardIcon className="w-3.5 h-3.5" />}>Pagamento</SectionHeader>

              <div className="space-y-2 mb-4">
                <FieldLabel>Método de pagamento</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {(['seguro', 'cartao', 'dinheiro', 'isento'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => set('paymentType', v)}
                      className={[
                        'px-3 py-2 rounded-lg text-xs font-semibold border-2 transition-all',
                        form.paymentType === v
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-muted/30 text-muted-foreground hover:border-muted-foreground/50',
                      ].join(' ')}
                    >
                      {v === 'seguro' && <><ShieldCheckIcon className="w-3.5 h-3.5 inline mr-1.5" />Seguro</>}
                      {v === 'cartao' && <><CreditCardIcon className="w-3.5 h-3.5 inline mr-1.5" />Cartão</>}
                      {v === 'dinheiro' && <><BanknoteIcon className="w-3.5 h-3.5 inline mr-1.5" />Dinheiro</>}
                      {v === 'isento' && 'Isento'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seguro médico */}
              {form.paymentType === 'seguro' && (
                <div className="space-y-4 pt-2 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FieldLabel htmlFor="p-seguradora">Seguradora *</FieldLabel>
                      <Select value={form.seguradora || '__none__'} onValueChange={(v) => set('seguradora', v === '__none__' ? '' : v)}>
                        <SelectTrigger id="p-seguradora" className="w-full">
                          <SelectValue placeholder="Selecionar seguradora" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— Selecionar —</SelectItem>
                          {SEGURADORAS.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <FieldLabel htmlFor="p-num-cartao-seguro">Nº cartão de seguro *</FieldLabel>
                      <Input
                        id="p-num-cartao-seguro"
                        value={form.numeroCartaoSeguro}
                        onChange={(e) => set('numeroCartaoSeguro', e.target.value)}
                        placeholder="Ex: 123456789012"
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel htmlFor="p-apolice">Nº apólice</FieldLabel>
                      <Input
                        id="p-apolice"
                        value={form.numeroApolice}
                        onChange={(e) => set('numeroApolice', e.target.value)}
                        placeholder="Opcional"
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel htmlFor="p-validade-seguro">Validade cartão</FieldLabel>
                      <Input
                        id="p-validade-seguro"
                        type="month"
                        value={form.validadeCartaoSeguro}
                        onChange={(e) => set('validadeCartaoSeguro', e.target.value)}
                        placeholder="MM/AAAA"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pagamento por cartão */}
              {form.paymentType === 'cartao' && (
                <div className="space-y-4 pt-2 border-t">
                  <div className="space-y-2">
                    <FieldLabel htmlFor="p-num-cartao">Número do cartão *</FieldLabel>
                    <Input
                      id="p-num-cartao"
                      value={form.numeroCartao}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                        set('numeroCartao', v.replace(/(.{4})/g, '$1 ').trim());
                      }}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel htmlFor="p-nome-cartao">Nome no cartão *</FieldLabel>
                    <Input
                      id="p-nome-cartao"
                      value={form.nomeCartao}
                      onChange={(e) => set('nomeCartao', e.target.value.toUpperCase())}
                      placeholder="Como impresso no cartão"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FieldLabel htmlFor="p-validade-cartao">Validade (MM/AA) *</FieldLabel>
                      <Input
                        id="p-validade-cartao"
                        value={form.validadeCartao}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                          if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                          set('validadeCartao', v);
                        }}
                        placeholder="MM/AA"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel htmlFor="p-cvv">CVV *</FieldLabel>
                      <Input
                        id="p-cvv"
                        type="password"
                        value={form.cvv}
                        onChange={(e) => set('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        maxLength={4}
                      />
                      <p className="text-[10px] text-muted-foreground">3 ou 4 dígitos no verso</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pagamento em dinheiro */}
              {form.paymentType === 'dinheiro' && (
                <div className="space-y-4 pt-2 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FieldLabel htmlFor="p-valor-consulta">Valor da consulta (€) *</FieldLabel>
                      <Input
                        id="p-valor-consulta"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.valorConsulta}
                        onChange={(e) => set('valorConsulta', e.target.value)}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel htmlFor="p-montante">Montante recebido (€) *</FieldLabel>
                      <Input
                        id="p-montante"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.montanteRecebido}
                        onChange={(e) => set('montanteRecebido', e.target.value)}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  {form.valorConsulta && form.montanteRecebido && (
                    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/50">
                      <BanknoteIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">
                        Troco: {Math.max(0, (parseFloat(form.montanteRecebido) || 0) - (parseFloat(form.valorConsulta) || 0)).toFixed(2)} €
                      </span>
                    </div>
                  )}
                </div>
              )}

              {form.paymentType === 'isento' && (
                <p className="text-sm text-muted-foreground pt-2">Consulta isenta de pagamento.</p>
              )}
            </CardContent>
          </Card>

          {/* ═══ Secção: Observações ═══ */}
          <Card className="border-2">
            <CardContent className="pt-4 pb-4">
              <SectionHeader icon={<FileTextIcon className="w-3.5 h-3.5" />}>Observações</SectionHeader>
              <Textarea
                id="consulta-obs"
                rows={3}
                value={form.observacoes}
                onChange={(e) => set('observacoes', e.target.value)}
                placeholder="Notas adicionais..."
                className="resize-none"
              />
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0 bg-muted/10">
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'A guardar...' : 'Guardar consulta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ─────────────────────────────────────────────
   Main
───────────────────────────────────────────── */
const Appointments: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNovaConsulta, setShowNovaConsulta] = useState(false);
  const [apps, setApps] = useState<Record<string, Appointment[]>>(MOCK);

  const dateStr    = fmt(selectedDate);
  const label      = dateLabel(selectedDate);
  const dayApps    = apps[dateStr] ?? [];

  const stats = useMemo(() => ({
    total:     dayApps.length,
    concluido: dayApps.filter((a) => a.status === 'Concluído').length,
    ativo:     dayApps.filter((a) => a.status === 'Em Atendimento').length,
    pendente:  dayApps.filter((a) => a.status === 'Agendado').length,
  }), [dayApps]);

  const handleSaveConsulta = (app: Appointment, dateStr: string) => {
    setApps((prev) => {
      const list = prev[dateStr] ?? [];
      return { ...prev, [dateStr]: [app, ...list] };
    });
  };

  return (
    <>
      <NovaConsultaModal
        open={showNovaConsulta}
        onOpenChange={setShowNovaConsulta}
        onSave={handleSaveConsulta}
        initialDate={selectedDate}
        occupiedDateStrings={Object.keys(apps)}
      />

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