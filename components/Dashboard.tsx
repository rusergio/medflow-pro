import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  UsersIcon, CalendarCheckIcon, BedIcon, ScissorsIcon,
  TrendingUpIcon, TrendingDownIcon, MinusIcon,
  DownloadIcon, ActivityIcon, RefreshCwIcon,
  ArrowRightIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const flowData = [
  { time: '08h', patients: 12 },
  { time: '10h', patients: 25 },
  { time: '12h', patients: 18 },
  { time: '14h', patients: 35 },
  { time: '16h', patients: 42 },
  { time: '18h', patients: 30 },
  { time: '20h', patients: 15 },
];

const specialtyData = [
  { name: 'Cardio',   value: 45, color: '#3b82f6' },
  { name: 'Pediatr',  value: 62, color: '#06b6d4' },
  { name: 'Geral',    value: 89, color: '#8b5cf6' },
  { name: 'Ortop',    value: 34, color: '#f59e0b' },
  { name: 'Dermato',  value: 21, color: '#10b981' },
];

const recentActivity = [
  { time: '16:42', text: 'Paciente João Silva — Internação aprovada',    type: 'success' },
  { time: '16:31', text: 'Leito 14B liberado — Higienização em curso',   type: 'info'    },
  { time: '15:58', text: 'Cirurgia agendada — Dr. Ramos · 18h30',        type: 'warning' },
  { time: '15:20', text: 'Alta médica — Maria Oliveira · Cardiologia',   type: 'success' },
  { time: '14:47', text: 'Emergência admitida — Pronto-socorro',         type: 'error'   },
];

/* ─────────────────────────────────────────────
   Stat card
───────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  accent: string;       // tailwind bg class for icon bg
  accentText: string;   // tailwind text class for icon
  delay: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, icon, accent, accentText, delay }) => {
  const isUp   = change.startsWith('+');
  const isDown = change.startsWith('-');
  const isFlat = change === '0' || change === '—';

  return (
    <div
      className="group relative bg-white dark:bg-white/5 rounded-2xl border-2 border-slate-100 dark:border-white/10 p-5 flex flex-col gap-4 overflow-hidden transition-all duration-300 hover:border-slate-200 dark:hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5"
      style={{ animation: `fadeUp 0.4s ease ${delay} both` }}
    >
      {/* subtle bg shape */}
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-[0.07] ${accent}`} />

      <div className="flex items-start justify-between">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent} ${accentText}`}>
          {icon}
        </span>
        <span className={[
          'flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full',
          isUp   ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
          isDown ? 'bg-red-50 text-red-500 dark:bg-red-900/30 dark:text-red-400' :
                   'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400',
        ].join(' ')}>
          {isUp   && <TrendingUpIcon className="w-3 h-3" />}
          {isDown && <TrendingDownIcon className="w-3 h-3" />}
          {isFlat && <MinusIcon className="w-3 h-3" />}
          {change}
        </span>
      </div>

      <div>
        <p className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Custom Tooltip
───────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 text-white px-3 py-2 rounded-xl text-xs shadow-xl">
      <p className="text-slate-400 mb-0.5">{label}</p>
      <p className="font-bold text-base">{payload[0].value} <span className="text-slate-400 text-xs font-normal">pacientes</span></p>
    </div>
  );
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 text-white px-3 py-2 rounded-xl text-xs shadow-xl">
      <p className="text-slate-400 mb-0.5">{label}</p>
      <p className="font-bold text-base">{payload[0].value} <span className="text-slate-400 text-xs font-normal">atend.</span></p>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Activity dot
───────────────────────────────────────────── */
const activityColors: Record<string, string> = {
  success: 'bg-green-400',
  info:    'bg-blue-400',
  warning: 'bg-amber-400',
  error:   'bg-red-400',
};

/* ─────────────────────────────────────────────
   Main Dashboard
───────────────────────────────────────────── */
const Dashboard: React.FC = () => {
  const [chartRange, setChartRange] = useState<'hoje' | 'ontem'>('hoje');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .refreshing { animation: spin 0.8s linear infinite; }
      `}</style>

      <div className="space-y-6">

        {/* ── Header ── */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ animation: 'fadeUp 0.35s ease both' }}
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
              Visão Geral
            </h1>
            <p className="text-sm text-slate-400 mt-0.5 capitalize">
              {dateStr} · {timeStr}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <button
              onClick={handleRefresh}
              className="w-9 h-9 rounded-xl border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 transition-all duration-200"
            >
              <RefreshCwIcon className={`w-4 h-4 ${refreshing ? 'refreshing' : ''}`} />
            </button>
            <button className="flex items-center gap-2 h-9 px-4 rounded-xl border-2 border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-slate-200 dark:hover:border-white/20 transition-all duration-200">
              <DownloadIcon className="w-3.5 h-3.5" />
              Exportar
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Pacientes Internados"
            value="142"
            change="+5%"
            icon={<UsersIcon className="w-5 h-5" />}
            accent="bg-blue-100 dark:bg-blue-900/30"
            accentText="text-blue-600 dark:text-blue-400"
            delay="0.05s"
          />
          <StatCard
            label="Consultas Hoje"
            value="48"
            change="+12%"
            icon={<CalendarCheckIcon className="w-5 h-5" />}
            accent="bg-emerald-100 dark:bg-emerald-900/30"
            accentText="text-emerald-600 dark:text-emerald-400"
            delay="0.1s"
          />
          <StatCard
            label="Leitos Disponíveis"
            value="18"
            change="-2"
            icon={<BedIcon className="w-5 h-5" />}
            accent="bg-violet-100 dark:bg-violet-900/30"
            accentText="text-violet-600 dark:text-violet-400"
            delay="0.15s"
          />
          <StatCard
            label="Cirurgias Agendadas"
            value="7"
            change="—"
            icon={<ScissorsIcon className="w-5 h-5" />}
            accent="bg-amber-100 dark:bg-amber-900/30"
            accentText="text-amber-600 dark:text-amber-400"
            delay="0.2s"
          />
        </div>

        {/* ── Charts row ── */}
        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-4"
          style={{ animation: 'fadeUp 0.4s ease 0.25s both' }}
        >
          {/* Area chart — 3 cols */}
          <div className="lg:col-span-3 bg-white dark:bg-white/5 rounded-2xl border-2 border-slate-100 dark:border-white/10 p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <ActivityIcon className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Fluxo de Pacientes</h3>
              </div>
              <div className="flex rounded-lg border border-slate-100 dark:border-white/10 overflow-hidden text-xs">
                {(['hoje', 'ontem'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setChartRange(v)}
                    className={[
                      'px-3 py-1.5 font-medium capitalize transition-colors',
                      chartRange === v
                        ? 'bg-primary text-white'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200',
                    ].join(' ')}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={flowData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="patients"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#areaGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar chart — 2 cols */}
          <div className="lg:col-span-2 bg-white dark:bg-white/5 rounded-2xl border-2 border-slate-100 dark:border-white/10 p-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-sm bg-primary" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Por Especialidade</h3>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={specialtyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Bottom row: activity + occupancy ── */}
        <div
          className="grid grid-cols-1 lg:grid-cols-5 gap-4"
          style={{ animation: 'fadeUp 0.4s ease 0.3s both' }}
        >
          {/* Recent activity — 3 cols */}
          <div className="lg:col-span-3 bg-white dark:bg-white/5 rounded-2xl border-2 border-slate-100 dark:border-white/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Atividade Recente</h3>
              <button className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                Ver tudo <ArrowRightIcon className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-0 divide-y divide-slate-50 dark:divide-white/5">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-3">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${activityColors[item.type]}`} />
                  <p className="flex-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.text}</p>
                  <span className="text-[11px] text-slate-400 shrink-0 font-mono">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Occupancy — 2 cols */}
          <div className="lg:col-span-2 bg-white dark:bg-white/5 rounded-2xl border-2 border-slate-100 dark:border-white/10 p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Ocupação de Leitos</h3>

            {[
              { label: 'UTI',          used: 18, total: 20, color: '#ef4444' },
              { label: 'Clínica Geral', used: 42, total: 60, color: '#3b82f6' },
              { label: 'Pediatria',    used: 15, total: 25, color: '#10b981' },
              { label: 'Maternidade',  used: 8,  total: 15, color: '#f59e0b' },
            ].map((ward) => {
              const pct = Math.round((ward.used / ward.total) * 100);
              return (
                <div key={ward.label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{ward.label}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{ward.used}/{ward.total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: ward.color }}
                    />
                  </div>
                  <p className="text-[11px] text-right font-semibold" style={{ color: ward.color }}>
                    {pct}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;