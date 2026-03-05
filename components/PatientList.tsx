import React, { useState, useMemo } from 'react';
import {
  SearchIcon, PlusIcon, Building2Icon,
  FileTextIcon, UserIcon, ChevronLeftIcon, ChevronRightIcon,
  DropletIcon, CalendarIcon, XIcon, ArrowUpDownIcon,
  CheckIcon, ChevronRightIcon as ChevRight,
  PhoneIcon, ShieldIcon, HeartPulseIcon, MapPinIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

/* ─────────────────────────────────────────────
   Types & Mock data  (não alterado)
───────────────────────────────────────────── */
interface Patient {
  id: string;
  nome: string;
  numeroProcesso: string;
  status: 'Crítico' | 'Em Observação' | 'Estável' | 'Alta';
  grupoSanguineo: string;
  dataNascimento: string;
  sexo: 'M' | 'F';
  quarto: string;
  especialidade: string;
  medico: string;
}

const MOCK_PATIENTS: Patient[] = [
  { id: '1',  nome: 'Carlos Eduardo Mendes',  numeroProcesso: 'P-00142', status: 'Estável',       grupoSanguineo: 'A+',  dataNascimento: '1978-03-14', sexo: 'M', quarto: '12A',   especialidade: 'Cardiologia',   medico: 'Dr. Ramos'  },
  { id: '2',  nome: 'Ana Beatriz Souza',       numeroProcesso: 'P-00143', status: 'Crítico',       grupoSanguineo: 'O-',  dataNascimento: '1945-07-22', sexo: 'F', quarto: 'UTI-3', especialidade: 'Neurologia',    medico: 'Dra. Silva' },
  { id: '3',  nome: 'Miguel Torres Ferreira',  numeroProcesso: 'P-00144', status: 'Em Observação', grupoSanguineo: 'B+',  dataNascimento: '1990-11-05', sexo: 'M', quarto: '08B',   especialidade: 'Ortopedia',     medico: 'Dr. Costa'  },
  { id: '4',  nome: 'Luciana Pires Oliveira',  numeroProcesso: 'P-00145', status: 'Estável',       grupoSanguineo: 'AB+', dataNascimento: '1983-01-30', sexo: 'F', quarto: '15C',   especialidade: 'Pediatria',     medico: 'Dra. Matos' },
  { id: '5',  nome: 'Roberto Alves Lima',      numeroProcesso: 'P-00146', status: 'Alta',          grupoSanguineo: 'A-',  dataNascimento: '1965-09-18', sexo: 'M', quarto: '-',     especialidade: 'Clínica Geral', medico: 'Dr. Nunes'  },
  { id: '6',  nome: 'Fernanda Castro Neto',    numeroProcesso: 'P-00147', status: 'Estável',       grupoSanguineo: 'O+',  dataNascimento: '2001-04-12', sexo: 'F', quarto: '20A',   especialidade: 'Dermatologia',  medico: 'Dra. Lima'  },
  { id: '7',  nome: 'João Pedro Martins',      numeroProcesso: 'P-00148', status: 'Crítico',       grupoSanguineo: 'B-',  dataNascimento: '1955-12-03', sexo: 'M', quarto: 'UTI-1', especialidade: 'Cardiologia',   medico: 'Dr. Ramos'  },
  { id: '8',  nome: 'Isabela Rocha Vieira',    numeroProcesso: 'P-00149', status: 'Em Observação', grupoSanguineo: 'A+',  dataNascimento: '1997-06-25', sexo: 'F', quarto: '11B',   especialidade: 'Neurologia',    medico: 'Dra. Silva' },
  { id: '9',  nome: 'Diego Lopes Carvalho',    numeroProcesso: 'P-00150', status: 'Estável',       grupoSanguineo: 'O+',  dataNascimento: '1988-08-09', sexo: 'M', quarto: '17D',   especialidade: 'Ortopedia',     medico: 'Dr. Costa'  },
  { id: '10', nome: 'Camila Dias Freitas',     numeroProcesso: 'P-00151', status: 'Estável',       grupoSanguineo: 'AB-', dataNascimento: '1972-02-14', sexo: 'F', quarto: '09A',   especialidade: 'Clínica Geral', medico: 'Dr. Nunes'  },
  { id: '11', nome: 'Thiago Barbosa Santos',   numeroProcesso: 'P-00152', status: 'Alta',          grupoSanguineo: 'A+',  dataNascimento: '1993-10-28', sexo: 'M', quarto: '-',     especialidade: 'Pediatria',     medico: 'Dra. Matos' },
  { id: '12', nome: 'Patricia Moura Gomes',    numeroProcesso: 'P-00153', status: 'Em Observação', grupoSanguineo: 'O-',  dataNascimento: '1960-05-17', sexo: 'F', quarto: '06C',   especialidade: 'Cardiologia',   medico: 'Dr. Ramos'  },
];

/* helpers (não alterado) */
const calcAge = (dob: string) =>
  Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  'Crítico':       { badge: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400',           dot: 'bg-red-500'   },
  'Em Observação': { badge: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400', dot: 'bg-amber-500' },
  'Alta':          { badge: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-300',   dot: 'bg-slate-400' },
  'Estável':       { badge: 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400', dot: 'bg-green-500' },
};

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-600', 'bg-violet-100 text-violet-600',
  'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600',
  'bg-rose-100 text-rose-600', 'bg-cyan-100 text-cyan-600',
];

const BLOOD_TYPES    = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ESPECIALIDADES = ['Cardiologia', 'Pediatria', 'Neurologia', 'Ortopedia', 'Dermatologia', 'Clínica Geral', 'Ginecologia', 'Psiquiatria'];
const MEDICOS        = ['Dr. Ramos', 'Dra. Silva', 'Dr. Costa', 'Dra. Matos', 'Dr. Nunes', 'Dra. Lima'];
const QUARTOS        = ['-', '12A', '15C', '20A', 'UTI-1', 'UTI-3', '08B', '11B', '06C', '09A', '17D'];
const STATUS_LIST    = ['Estável', 'Crítico', 'Em Observação', 'Alta'] as const;
const PAGE_SIZE      = 8;

/* ─────────────────────────────────────────────
   Filter chip  (não alterado)
───────────────────────────────────────────── */
const FilterChip: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={[
      'px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all duration-150',
      active
        ? 'bg-primary text-white border-primary shadow-sm shadow-primary/25'
        : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-white/10 hover:border-slate-200',
    ].join(' ')}
  >
    {label}
  </button>
);

/* ─────────────────────────────────────────────
   Patient Row  (não alterado)
───────────────────────────────────────────── */
const PatientRow: React.FC<{ patient: Patient; idx: number }> = ({ patient: p, idx }) => {
  const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  const style = STATUS_STYLES[p.status] ?? STATUS_STYLES['Estável'];
  return (
    <tr className="group hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors"
      style={{ animation: `fadeUp 0.3s ease ${idx * 0.04}s both` }}>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${avatarColor}`}>
            {p.nome.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{p.nome}</p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{p.numeroProcesso}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${style.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {p.status}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <DropletIcon className="w-3.5 h-3.5 text-red-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-200">{p.grupoSanguineo}</span>
          <span className="text-slate-300 dark:text-white/20 mx-1">·</span>
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>{calcAge(p.dataNascimento)} anos</span>
          <span className="text-slate-300 dark:text-white/20 mx-1">·</span>
          <span>{p.sexo === 'M' ? '♂' : '♀'}</span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{p.especialidade}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{p.medico}</p>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Building2Icon className="w-3.5 h-3.5" />
          <span className={p.quarto === '-' ? 'text-slate-300' : 'font-medium text-slate-700 dark:text-slate-200'}>
            {p.quarto === '-' ? 'Alta' : p.quarto}
          </span>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors" title="Ver ficha">
            <UserIcon className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors" title="Prontuário">
            <FileTextIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

/* ─────────────────────────────────────────────
   MODAL — Novo Paciente
   2 passos: Identificação + Clínico
───────────────────────────────────────────── */

/* Step header bar */
const StepHeader: React.FC<{ step: number }> = ({ step }) => {
  const steps = [
    { n: 1, label: 'Identificação', icon: <UserIcon className="w-3.5 h-3.5" /> },
    { n: 2, label: 'Clínico',       icon: <HeartPulseIcon className="w-3.5 h-3.5" /> },
  ];
  return (
    <div className="flex gap-2 mt-3">
      {steps.map((s) => {
        const done   = s.n < step;
        const active = s.n === step;
        return (
          <div key={s.n} className={[
            'flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200',
            active ? 'border-primary bg-primary/5'              :
            done   ? 'border-primary/30 bg-primary/5 opacity-70' :
                     'border-border bg-muted/30 opacity-40',
          ].join(' ')}>
            <div className={[
              'w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold border-2',
              active ? 'border-primary bg-primary text-primary-foreground' :
              done   ? 'border-primary/50 bg-primary/10 text-primary'       :
                       'border-border text-muted-foreground',
            ].join(' ')}>
              {done ? <CheckIcon className="w-3 h-3" /> : s.n}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={active ? 'text-primary' : 'text-muted-foreground'}>{s.icon}</span>
              <span className={`text-xs font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SectionHeader: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="text-primary">{icon}</span>
    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">
      {children}
    </p>
  </div>
);

/* Field label */
const FL: React.FC<{ htmlFor?: string; required?: boolean; children: React.ReactNode }> = ({ htmlFor, required, children }) => (
  <Label htmlFor={htmlFor} className="text-xs font-semibold text-muted-foreground mb-1.5 block">
    {children}{required && <span className="text-destructive ml-0.5">*</span>}
  </Label>
);

const FLIcon: React.FC<{ htmlFor?: string; required?: boolean; icon: React.ReactNode; children: React.ReactNode }> = ({ htmlFor, required, icon, children }) => (
  <Label htmlFor={htmlFor} className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
    <span className="text-muted-foreground">{icon}</span>
    <span>{children}</span>
    {required && <span className="text-destructive ml-0.5">*</span>}
  </Label>
);

const DAYS   = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const MONTHS = [
  { v: '01', l: 'Janeiro' }, { v: '02', l: 'Fevereiro' }, { v: '03', l: 'Março' },
  { v: '04', l: 'Abril' },   { v: '05', l: 'Maio' },      { v: '06', l: 'Junho' },
  { v: '07', l: 'Julho' },   { v: '08', l: 'Agosto' },    { v: '09', l: 'Setembro' },
  { v: '10', l: 'Outubro' }, { v: '11', l: 'Novembro' },  { v: '12', l: 'Dezembro' },
];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1919 }, (_, i) => String(currentYear - i));

interface ModalForm {
  nome: string; numeroProcesso: string; status: Patient['status'];
  nif: string; documentoTipo: string; documentoNumero: string;
  pais: string; nacionalidade: string;
  telefone: string; telefoneAlt: string;
  emergenciaNome: string; emergenciaTel: string;
  rua: string; codigoPostal: string; cidade: string;
  diaNasc: string; mesNasc: string; anoNasc: string;
  sexo: string;
  grupoSanguineo: string; especialidade: string; medico: string; quarto: string;
  alergias: string;
}

const MODAL_EMPTY: ModalForm = {
  nome: '', numeroProcesso: '', status: 'Estável',
  nif: '', documentoTipo: '', documentoNumero: '',
  pais: '', nacionalidade: '',
  telefone: '', telefoneAlt: '',
  emergenciaNome: '', emergenciaTel: '',
  rua: '', codigoPostal: '', cidade: '',
  diaNasc: '', mesNasc: '', anoNasc: '',
  sexo: 'M',
  grupoSanguineo: 'A+', especialidade: 'Clínica Geral', medico: 'Dr. Nunes', quarto: '-',
  alergias: '',
};

const NovoPacienteModal: React.FC<{
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (p: Patient) => void;
}> = ({ open, onOpenChange, onSave }) => {
  const [step,   setStep]   = useState<1 | 2>(1);
  const [form,   setForm]   = useState<ModalForm>(MODAL_EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof ModalForm, string>>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ModalForm>(k: K, v: ModalForm[K]) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validateStep1 = () => {
    const e: Partial<Record<keyof ModalForm, string>> = {};
    if (!form.nome.trim())     e.nome     = 'Campo obrigatório';
    if (!form.telefone.trim()) e.telefone = 'Campo obrigatório';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleNext = () => { if (validateStep1()) setStep(2); };
  const handleBack = () => setStep(1);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const isoDate = (form.anoNasc && form.mesNasc && form.diaNasc)
      ? `${form.anoNasc}-${form.mesNasc}-${form.diaNasc}`
      : '2000-01-01';
    onSave({
      id: Date.now().toString(),
      nome: form.nome,
      numeroProcesso: form.numeroProcesso.trim() || `P-${Math.floor(Math.random() * 90000 + 10000)}`,
      status: form.status,
      grupoSanguineo: form.grupoSanguineo,
      dataNascimento: isoDate,
      sexo: form.sexo as Patient['sexo'],
      quarto: form.quarto,
      especialidade: form.especialidade,
      medico: form.medico,
    });
    setSaving(false);
    onOpenChange(false);
    setTimeout(() => { setForm(MODAL_EMPTY); setStep(1); setErrors({}); }, 300);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => { setForm(MODAL_EMPTY); setStep(1); setErrors({}); }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">

        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25 shrink-0">
              <UserIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold leading-tight">Novo Paciente</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Passo {step} de 2 — {step === 1 ? 'Identificação e contato' : 'Dados clínicos'}
              </p>
            </div>
          </div>
          <StepHeader step={step} />
        </DialogHeader>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-4">

          {/* ═══════════ STEP 1 — Identificação ═══════════ */}
          {step === 1 && (
            <>
              {/* Card: Dados pessoais */}
              <Card className="border-2">
                <CardContent className="pt-4 pb-4">
                  <SectionHeader icon={<UserIcon className="w-3.5 h-3.5" />}>Dados pessoais</SectionHeader>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Nome */}
                    <div className="col-span-2">
                      <FL htmlFor="p-nome" required>Nome completo</FL>
                      <Input id="p-nome" value={form.nome}
                        onChange={e => set('nome', e.target.value)}
                        placeholder="Ex: Maria da Silva Costa"
                        className={errors.nome ? 'border-destructive focus-visible:ring-destructive/30' : ''} />
                      {errors.nome && <p className="text-[11px] text-destructive mt-1">{errors.nome}</p>}
                    </div>

                    {/* Nº Processo */}
                    <div>
                      <FL htmlFor="p-proc">Nº Processo</FL>
                      <Input id="p-proc" value={form.numeroProcesso}
                        onChange={e => set('numeroProcesso', e.target.value)}
                        placeholder="P-00000 (auto)" />
                    </div>

                    {/* Status */}
                    <div>
                      <FL>Status</FL>
                      <Select value={form.status} onValueChange={v => set('status', v as Patient['status'])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUS_LIST.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sexo — Select */}
                    <div>
                      <FL>Sexo</FL>
                      <Select value={form.sexo} onValueChange={v => set('sexo', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Feminino</SelectItem>
                          <SelectItem value="Outro">Outro / Não especificado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pais */}
                    <div>
                      <FL>País</FL>
                      <Select value={form.pais} onValueChange={v => set('pais', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecionar país" /></SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="PT">🇵🇹 Portugal</SelectItem>
                          <SelectItem value="BR">🇧🇷 Brasil</SelectItem>
                          <SelectItem value="AO">🇦🇴 Angola</SelectItem>
                          <SelectItem value="MZ">🇲🇿 Moçambique</SelectItem>
                          <SelectItem value="CV">🇨🇻 Cabo Verde</SelectItem>
                          <SelectItem value="ST">🇸🇹 São Tomé e Príncipe</SelectItem>
                          <SelectItem value="GW">🇬🇼 Guiné-Bissau</SelectItem>
                          <SelectItem value="TL">🇹🇱 Timor-Leste</SelectItem>
                          <SelectItem value="ES">🇪🇸 Espanha</SelectItem>
                          <SelectItem value="FR">🇫🇷 França</SelectItem>
                          <SelectItem value="DE">🇩🇪 Alemanha</SelectItem>
                          <SelectItem value="GB">🇬🇧 Reino Unido</SelectItem>
                          <SelectItem value="IT">🇮🇹 Itália</SelectItem>
                          <SelectItem value="NL">🇳🇱 Países Baixos</SelectItem>
                          <SelectItem value="BE">🇧🇪 Bélgica</SelectItem>
                          <SelectItem value="CH">🇨🇭 Suíça</SelectItem>
                          <SelectItem value="LU">🇱🇺 Luxemburgo</SelectItem>
                          <SelectItem value="US">🇺🇸 Estados Unidos</SelectItem>
                          <SelectItem value="CA">🇨🇦 Canadá</SelectItem>
                          <SelectItem value="MX">🇲🇽 México</SelectItem>
                          <SelectItem value="AR">🇦🇷 Argentina</SelectItem>
                          <SelectItem value="CO">🇨🇴 Colômbia</SelectItem>
                          <SelectItem value="VE">🇻🇪 Venezuela</SelectItem>
                          <SelectItem value="CN">🇨🇳 China</SelectItem>
                          <SelectItem value="IN">🇮🇳 Índia</SelectItem>
                          <SelectItem value="NG">🇳🇬 Nigéria</SelectItem>
                          <SelectItem value="ZA">🇿🇦 África do Sul</SelectItem>
                          <SelectItem value="MA">🇲🇦 Marrocos</SelectItem>
                          <SelectItem value="SN">🇸🇳 Senegal</SelectItem>
                          <SelectItem value="GH">🇬🇭 Gana</SelectItem>
                          <SelectItem value="OTHER">🌍 Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Nacionalidade — logo abaixo do país */}
                    <div>
                      <FL htmlFor="p-nac">Nacionalidade</FL>
                      <Input id="p-nac" value={form.nacionalidade}
                        onChange={e => set('nacionalidade', e.target.value)}
                        placeholder="Ex: Portuguesa" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card: Documento */}
              <Card className="border-2">
                <CardContent className="pt-4 pb-4">
                  <SectionHeader icon={<FileTextIcon className="w-3.5 h-3.5" />}>Documento de identificação</SectionHeader>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <FL>Tipo</FL>
                      <Select value={form.documentoTipo} onValueChange={v => set('documentoTipo', v)}>
                        <SelectTrigger><SelectValue placeholder="— Tipo —" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CC">Cartão de cidadão</SelectItem>
                          <SelectItem value="Passaporte">Passaporte</SelectItem>
                          <SelectItem value="Residencia">Residência</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <FL htmlFor="p-docnum">Nº documento</FL>
                      <Input id="p-docnum" value={form.documentoNumero}
                        onChange={e => set('documentoNumero', e.target.value)}
                        placeholder="Número" />
                    </div>
                    <div>
                      <FL htmlFor="p-nif">NIF</FL>
                      <Input id="p-nif" value={form.nif}
                        onChange={e => set('nif', e.target.value)}
                        placeholder="000 000 000" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card: Morada */}
              <Card className="border-2">
                <CardContent className="pt-4 pb-4">
                  <SectionHeader icon={<MapPinIcon className="w-3.5 h-3.5" />}>Morada</SectionHeader>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-3">
                      <FL htmlFor="p-rua">Rua / Endereço</FL>
                      <Input id="p-rua" value={form.rua}
                        onChange={e => set('rua', e.target.value)}
                        placeholder="Rua, número, andar..." />
                    </div>
                    <div>
                      <FL htmlFor="p-cp">Código postal</FL>
                      <Input id="p-cp" value={form.codigoPostal}
                        onChange={e => set('codigoPostal', e.target.value)}
                        placeholder="0000-000" />
                    </div>
                    <div className="col-span-2">
                      <FL htmlFor="p-cidade">Cidade</FL>
                      <Input id="p-cidade" value={form.cidade}
                        onChange={e => set('cidade', e.target.value)}
                        placeholder="Ex: Lisboa" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card: Contato */}
              <Card className="border-2">
                <CardContent className="pt-4 pb-4">
                  <SectionHeader icon={<PhoneIcon className="w-3.5 h-3.5" />}>Contato</SectionHeader>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FL htmlFor="p-tel" required>Telefone</FL>
                      <Input id="p-tel" type="tel" value={form.telefone}
                        onChange={e => set('telefone', e.target.value)}
                        placeholder="+351 900 000 000"
                        className={errors.telefone ? 'border-destructive' : ''} />
                      {errors.telefone && <p className="text-[11px] text-destructive mt-1">{errors.telefone}</p>}
                    </div>
                    <div>
                      <FL htmlFor="p-telalt">Telefone alternativo</FL>
                      <Input id="p-telalt" type="tel" value={form.telefoneAlt}
                        onChange={e => set('telefoneAlt', e.target.value)}
                        placeholder="+351 200 000 000" />
                    </div>
                  </div>

                  <Separator className="my-3" />

                  {/* Contacto de emergência */}
                  <SectionHeader icon={<ShieldIcon className="w-3.5 h-3.5 text-amber-500" />}>
                    Contato de emergência
                  </SectionHeader>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FL htmlFor="p-emnom">Nome do familiar</FL>
                      <Input id="p-emnom" value={form.emergenciaNome}
                        onChange={e => set('emergenciaNome', e.target.value)}
                        placeholder="Nome completo" />
                    </div>
                    <div>
                      <FL htmlFor="p-emtel">Telefone de emergência</FL>
                      <Input id="p-emtel" type="tel" value={form.emergenciaTel}
                        onChange={e => set('emergenciaTel', e.target.value)}
                        placeholder="+351 900 000 000" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* ═══════════ STEP 2 — Clínico ═══════════ */}
          {step === 2 && (
            <>
              {/* Card: Dados biográficos */}
              <Card className="border-2">
                <CardContent className="pt-4 pb-4">
                  <SectionHeader icon={<CalendarIcon className="w-3.5 h-3.5" />}>Dados biográficos</SectionHeader>
                  <div className="flex items-end gap-6">
                    {/* Data de nascimento — Dia, Mês, Ano */}
                    <div className="flex-1">
                      <FL>Data de nascimento</FL>
                      <div className="flex gap-1.5">
                        <Select value={form.diaNasc} onValueChange={v => set('diaNasc', v)}>
                          <SelectTrigger className="w-20"><SelectValue placeholder="Dia" /></SelectTrigger>
                          <SelectContent className="max-h-48">
                            {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={form.mesNasc} onValueChange={v => set('mesNasc', v)}>
                          <SelectTrigger className="w-28"><SelectValue placeholder="Mês" /></SelectTrigger>
                          <SelectContent className="max-h-48">
                            {MONTHS.map(m => <SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={form.anoNasc} onValueChange={v => set('anoNasc', v)}>
                          <SelectTrigger className="w-24"><SelectValue placeholder="Ano" /></SelectTrigger>
                          <SelectContent className="max-h-48">
                            {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {/* Grupo sanguíneo */}
                    <div className="w-36">
                      <FLIcon icon={<DropletIcon className="w-3.5 h-3.5 text-red-400" />}>Grupo sanguíneo</FLIcon>
                      <Select value={form.grupoSanguineo} onValueChange={v => set('grupoSanguineo', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {BLOOD_TYPES.map(g => (
                            <SelectItem key={g} value={g}>
                              <span className="flex items-center gap-2">
                                <DropletIcon className="w-3 h-3 text-red-400" /> {g}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card: Dados clínicos */}
              <Card className="border-2">
                <CardContent className="pt-4 pb-4">
                  <SectionHeader icon={<HeartPulseIcon className="w-3.5 h-3.5" />}>Atribuição clínica</SectionHeader>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FL>Especialidade</FL>
                      <Select value={form.especialidade} onValueChange={v => set('especialidade', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ESPECIALIDADES.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <FL>Médico responsável</FL>
                      <Select value={form.medico} onValueChange={v => set('medico', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {MEDICOS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <FL>Quarto / Localização</FL>
                      <Select value={form.quarto} onValueChange={v => set('quarto', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {QUARTOS.map(q => (
                            <SelectItem key={q} value={q}>
                              {q === '-' ? 'Sem quarto (Alta)' : q}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Alergias */}
                    <div>
                      <FL htmlFor="p-alergias">
                        <span className="flex items-center gap-1.5">
                          Alergias conhecidas
                          <Badge variant="secondary" className="text-[9px] py-0 px-1.5 font-semibold">Segurança</Badge>
                        </span>
                      </FL>
                      <Input id="p-alergias" value={form.alergias}
                        onChange={e => set('alergias', e.target.value)}
                        placeholder="Penicilina, AAS, látex..." />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="px-6 py-4 border-t shrink-0 flex-row items-center justify-between sm:justify-between gap-3 bg-muted/10">
          <Button variant="ghost" className="text-muted-foreground" onClick={handleClose}>
            Cancelar
          </Button>
          <div className="flex items-center gap-2">
            {step === 2 && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeftIcon className="w-4 h-4 mr-1" /> Anterior
              </Button>
            )}
            {step === 1 ? (
              <Button onClick={handleNext} className="gap-1.5 px-6">
                Próximo <ChevRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={saving} className="gap-2 px-6 min-w-[150px]">
                {saving
                  ? <><span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> A guardar...</>
                  : <><CheckIcon className="w-4 h-4" /> Guardar Paciente</>
                }
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ─────────────────────────────────────────────
   Main PatientList  (tabela não alterada)
───────────────────────────────────────────── */
const PatientList: React.FC = () => {
  const [search,           setSearch]           = useState('');
  const [statusFilter,     setStatusFilter]     = useState<string>('Todos');
  const [page,             setPage]             = useState(1);
  const [sortAsc,          setSortAsc]          = useState(true);
  const [showNovoPaciente, setShowNovoPaciente] = useState(false);
  const [patients,         setPatients]         = useState<Patient[]>(MOCK_PATIENTS);

  const STATUS_FILTERS = ['Todos', 'Estável', 'Crítico', 'Em Observação', 'Alta'];

  const filtered = useMemo(() => {
    let list = patients;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.nome.toLowerCase().includes(q) ||
        p.numeroProcesso.toLowerCase().includes(q) ||
        p.especialidade.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'Todos') list = list.filter(p => p.status === statusFilter);
    return [...list].sort((a, b) => sortAsc ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome));
  }, [patients, search, statusFilter, sortAsc]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleFilter = (f: string) => { setStatusFilter(f); setPage(1); };

  return (
    <>
      <NovoPacienteModal
        open={showNovoPaciente}
        onOpenChange={setShowNovoPaciente}
        onSave={p => { setPatients(prev => [p, ...prev]); setPage(1); }}
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Pacientes</h1>
            <p className="text-sm text-slate-400 mt-0.5">Lista de pacientes e histórico clínico</p>
          </div>
          <button
            onClick={() => setShowNovoPaciente(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-white text-sm font-semibold shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 self-start sm:self-auto"
          >
            <PlusIcon className="w-4 h-4" />
            Novo Paciente
          </button>
        </div>

        {/* Table card */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border-2 border-slate-100 dark:border-white/10 overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex flex-col sm:flex-row gap-3">
            <div className={[
              'flex items-center gap-2 h-9 rounded-xl border-2 px-3 transition-all duration-200 flex-1',
              'bg-slate-50 dark:bg-white/5',
              search ? 'border-primary shadow-sm shadow-primary/15' : 'border-transparent',
            ].join(' ')}>
              <SearchIcon className={`w-4 h-4 shrink-0 transition-colors ${search ? 'text-primary' : 'text-slate-400'}`} />
              <input
                type="text"
                value={search}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Pesquisar por nome, processo, especialidade..."
                className="flex-1 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
              />
              {search && (
                <button onClick={() => handleSearch('')} className="text-slate-400 hover:text-slate-600">
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {STATUS_FILTERS.map(f => (
                <FilterChip key={f} label={f} active={statusFilter === f} onClick={() => handleFilter(f)} />
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/10">
                  <th className="px-5 py-3">
                    <button onClick={() => setSortAsc(!sortAsc)}
                      className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      Paciente <ArrowUpDownIcon className="w-3 h-3" />
                    </button>
                  </th>
                  {['Status', 'Info', 'Especialidade', 'Localização', 'Ações'].map(h => (
                    <th key={h} className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-sm">
                      Nenhum paciente encontrado.
                    </td>
                  </tr>
                ) : (
                  paginated.map((p, i) => <PatientRow key={p.id} patient={p} idx={i} />)
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          <div className="px-5 py-3.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/60 dark:bg-white/[0.02]">
            <span className="text-xs text-slate-400">
              Mostrando <span className="font-semibold text-slate-600 dark:text-slate-300">{paginated.length}</span> de{' '}
              <span className="font-semibold text-slate-600 dark:text-slate-300">{filtered.length}</span> pacientes
            </span>
            <div className="flex items-center gap-1.5">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                className="w-8 h-8 rounded-lg border-2 border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={[
                    'w-8 h-8 rounded-lg text-xs font-bold transition-all',
                    p === page ? 'bg-primary text-white shadow-sm shadow-primary/25' : 'border-2 border-slate-100 dark:border-white/10 text-slate-400 hover:border-slate-200',
                  ].join(' ')}>
                  {p}
                </button>
              ))}
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
                className="w-8 h-8 rounded-lg border-2 border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientList;