import React, { useState, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from '@/components/ui/select';
import {
  FileTextIcon, CalendarIcon, EuroIcon, BedIcon,
  DownloadIcon, FileSpreadsheetIcon, TrendingUpIcon,
  TrendingDownIcon, PrinterIcon, RefreshCwIcon,
  UsersIcon, ActivityIcon, CheckCircleIcon,
} from 'lucide-react';

/* ─────────────────────────────────────────
   Mock data
───────────────────────────────────────── */
const MONTHLY_PATIENTS = [
  { mes:'Jan', total:38, altas:22, criticos:4  },
  { mes:'Fev', total:45, altas:28, criticos:6  },
  { mes:'Mar', total:52, altas:31, criticos:5  },
  { mes:'Abr', total:49, altas:30, criticos:7  },
  { mes:'Mai', total:61, altas:40, criticos:3  },
  { mes:'Jun', total:58, altas:37, criticos:5  },
  { mes:'Jul', total:66, altas:45, criticos:4  },
  { mes:'Ago', total:71, altas:48, criticos:6  },
  { mes:'Set', total:63, altas:41, criticos:5  },
  { mes:'Out', total:74, altas:50, criticos:7  },
  { mes:'Nov', total:68, altas:44, criticos:4  },
  { mes:'Dez', total:55, altas:35, criticos:3  },
];

const CONSULTATIONS = [
  { mes:'Jan', consultas:120, canceladas:8  },
  { mes:'Fev', consultas:138, canceladas:12 },
  { mes:'Mar', consultas:155, canceladas:9  },
  { mes:'Abr', consultas:142, canceladas:14 },
  { mes:'Mai', consultas:168, canceladas:7  },
  { mes:'Jun', consultas:175, canceladas:10 },
  { mes:'Jul', consultas:190, canceladas:11 },
  { mes:'Ago', consultas:182, canceladas:8  },
  { mes:'Set', consultas:171, canceladas:13 },
  { mes:'Out', consultas:195, canceladas:9  },
  { mes:'Nov', consultas:178, canceladas:6  },
  { mes:'Dez', consultas:145, canceladas:15 },
];

const FINANCIAL = [
  { mes:'Jan', receita:42000, custo:28000 },
  { mes:'Fev', receita:51000, custo:31000 },
  { mes:'Mar', receita:58000, custo:34000 },
  { mes:'Abr', receita:53000, custo:32000 },
  { mes:'Mai', receita:67000, custo:38000 },
  { mes:'Jun', receita:72000, custo:40000 },
  { mes:'Jul', receita:80000, custo:44000 },
  { mes:'Ago', receita:76000, custo:42000 },
  { mes:'Set', receita:69000, custo:39000 },
  { mes:'Out', receita:84000, custo:46000 },
  { mes:'Nov', receita:78000, custo:43000 },
  { mes:'Dez', receita:62000, custo:36000 },
];

const OCCUPANCY_BY_SECTOR = [
  { name:'Cardiologia',  value:82, color:'#ef4444' },
  { name:'Neurologia',   value:67, color:'#8b5cf6' },
  { name:'Ortopedia',    value:74, color:'#3b82f6' },
  { name:'Pediatria',    value:55, color:'#10b981' },
  { name:'UTI',          value:91, color:'#f59e0b' },
  { name:'Clínica Geral',value:48, color:'#ec4899' },
];

const SPECIALTY_DIST = [
  { name:'Cardiologia',   value:24, fill:'#ef4444' },
  { name:'Neurologia',    value:18, fill:'#8b5cf6' },
  { name:'Ortopedia',     value:21, fill:'#3b82f6' },
  { name:'Pediatria',     value:15, fill:'#10b981' },
  { name:'Dermatologia',  value:12, fill:'#f59e0b' },
  { name:'Outros',        value:10, fill:'#94a3b8' },
];

const PERIOD_OPTIONS = [
  { value:'7d',  label:'Últimos 7 dias'  },
  { value:'30d', label:'Últimos 30 dias' },
  { value:'3m',  label:'Últimos 3 meses' },
  { value:'6m',  label:'Últimos 6 meses' },
  { value:'1y',  label:'Este ano'        },
];

/* ─────────────────────────────────────────
   Custom tooltip
───────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'rgba(15,23,42,0.95)', border:'1px solid rgba(255,255,255,0.1)',
      borderRadius:'12px', padding:'10px 14px', boxShadow:'0 12px 32px rgba(0,0,0,0.4)',
      backdropFilter:'blur(8px)',
    }}>
      <p style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.5)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.08em' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize:'13px', fontWeight:700, color:p.color, margin:'2px 0' }}>
          {p.name}: {typeof p.value === 'number' && p.value > 999
            ? `€${(p.value/1000).toFixed(1)}k` : p.value}
        </p>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   KPI card
───────────────────────────────────────── */
const KpiCard: React.FC<{
  label: string; value: string; delta: string; positive: boolean;
  icon: React.ReactNode; color: string; bg: string; border: string;
  delay?: number;
}> = ({ label, value, delta, positive, icon, color, bg, border, delay = 0 }) => (
  <div className="ar-card" style={{ animationDelay:`${delay}s`,
    background:'#fff', borderRadius:'20px', padding:'22px',
    border:`1.5px solid ${border}`, position:'relative', overflow:'hidden' }}>
    <div style={{ position:'absolute', top:0, right:0, width:'80px', height:'80px',
      background:`radial-gradient(circle,${bg} 0%,transparent 70%)`, borderRadius:'0 20px 0 0', pointerEvents:'none' }} />
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'16px' }}>
      <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:bg, display:'flex',
        alignItems:'center', justifyContent:'center', color, border:`1.5px solid ${border}` }}>
        {icon}
      </div>
      <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', fontSize:'11px', fontWeight:700,
        padding:'3px 8px', borderRadius:'999px',
        background: positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
        color: positive ? '#059669' : '#dc2626',
        border: `1px solid ${positive ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
        {positive ? <TrendingUpIcon style={{width:'10px',height:'10px'}}/> : <TrendingDownIcon style={{width:'10px',height:'10px'}}/>}
        {delta}
      </span>
    </div>
    <div style={{ fontWeight:900, fontSize:'28px', letterSpacing:'-.04em', color:'#0f172a', lineHeight:1 }}>{value}</div>
    <div style={{ fontSize:'12px', fontWeight:600, color:'#64748b', marginTop:'4px' }}>{label}</div>
  </div>
);

/* ─────────────────────────────────────────
   Section header
───────────────────────────────────────── */
const SectionHead: React.FC<{
  icon: React.ReactNode; title: string; sub?: string;
  color?: string; bg?: string; border?: string;
  action?: React.ReactNode;
}> = ({ icon, title, sub, color = '#f59e0b', bg = '#fffbeb', border = '#fde68a', action }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', marginBottom:'18px' }}>
    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
      <div style={{ width:'36px', height:'36px', borderRadius:'11px', background:bg,
        display:'flex', alignItems:'center', justifyContent:'center', color, border:`1.5px solid ${border}` }}>
        {icon}
      </div>
      <div>
        <p style={{ fontWeight:800, fontSize:'15px', color:'#0f172a', margin:0, lineHeight:1.1 }}>{title}</p>
        {sub && <p style={{ fontSize:'11px', color:'#94a3b8', margin:0, fontWeight:500 }}>{sub}</p>}
      </div>
    </div>
    {action}
  </div>
);

/* ─────────────────────────────────────────
   Export buttons (mock)
───────────────────────────────────────── */
const ExportButtons: React.FC<{ reportName: string }> = ({ reportName }) => {
  const [exporting, setExporting] = useState<'pdf'|'excel'|null>(null);

  const handle = (type: 'pdf'|'excel') => {
    setExporting(type);
    // mock delay — in real app call your export API here
    setTimeout(() => setExporting(null), 1500);
  };

  return (
    <div style={{ display:'flex', gap:'8px' }}>
      <button
        onClick={() => handle('pdf')}
        disabled={!!exporting}
        style={{ display:'inline-flex', alignItems:'center', gap:'6px',
          padding:'7px 14px', borderRadius:'10px', fontSize:'12px', fontWeight:700,
          background: exporting==='pdf' ? '#fee2e2' : '#fef2f2',
          color:'#dc2626', border:'1.5px solid #fecaca', cursor:'pointer',
          transition:'all .2s', opacity: exporting ? .7 : 1 }}>
        {exporting === 'pdf'
          ? <><span style={{ width:'12px', height:'12px', border:'2px solid #fca5a5', borderTopColor:'#dc2626', borderRadius:'50%', display:'inline-block', animation:'ar-spin .7s linear infinite' }} />Exportando…</>
          : <><DownloadIcon style={{width:'13px',height:'13px'}}/>PDF</>
        }
      </button>
      <button
        onClick={() => handle('excel')}
        disabled={!!exporting}
        style={{ display:'inline-flex', alignItems:'center', gap:'6px',
          padding:'7px 14px', borderRadius:'10px', fontSize:'12px', fontWeight:700,
          background: exporting==='excel' ? '#dcfce7' : '#f0fdf4',
          color:'#16a34a', border:'1.5px solid #bbf7d0', cursor:'pointer',
          transition:'all .2s', opacity: exporting ? .7 : 1 }}>
        {exporting === 'excel'
          ? <><span style={{ width:'12px', height:'12px', border:'2px solid #86efac', borderTopColor:'#16a34a', borderRadius:'50%', display:'inline-block', animation:'ar-spin .7s linear infinite' }} />Exportando…</>
          : <><FileSpreadsheetIcon style={{width:'13px',height:'13px'}}/>Excel</>
        }
      </button>
    </div>
  );
};

/* ─────────────────────────────────────────
   Chart wrapper
───────────────────────────────────────── */
const ChartBox: React.FC<{ children: React.ReactNode; title: string; sub?: string; reportName: string;
  icon: React.ReactNode; color?: string; bg?: string; border?: string }> =
  ({ children, title, sub, reportName, icon, color, bg, border }) => (
  <div style={{ background:'#fff', borderRadius:'20px', padding:'26px',
    border:'1.5px solid #f1f5f9', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'10px' }}>
      <SectionHead icon={icon} title={title} sub={sub} color={color} bg={bg} border={border} />
      <ExportButtons reportName={reportName} />
    </div>
    {children}
  </div>
);

/* ─────────────────────────────────────────
   Main component
───────────────────────────────────────── */
const AdminReports: React.FC = () => {
  const [period, setPeriod]   = useState('1y');
  const [activeTab, setActiveTab] = useState<string>('todos');

  const REPORT_TABS = [
    { id:'todos',       label:'Visão Geral',   icon:'📊' },
    { id:'patients',    label:'Pacientes',     icon:'📋' },
    { id:'appointments',label:'Consultas',     icon:'📅' },
    { id:'financial',   label:'Financeiro',    icon:'💰' },
    { id:'occupancy',   label:'Ocupação',      icon:'🛏️' },
  ];

  return (
    <>
      <style>{`
        @keyframes ar-rise { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes ar-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ar-bar   { from{transform:scaleX(0)} to{transform:scaleX(1)} }

        .ar-r1{animation:ar-rise .45s cubic-bezier(.22,1,.36,1) .00s both}
        .ar-r2{animation:ar-rise .45s cubic-bezier(.22,1,.36,1) .06s both}
        .ar-r3{animation:ar-rise .45s cubic-bezier(.22,1,.36,1) .12s both}
        .ar-r4{animation:ar-rise .45s cubic-bezier(.22,1,.36,1) .18s both}
        .ar-r5{animation:ar-rise .45s cubic-bezier(.22,1,.36,1) .24s both}
        .ar-r6{animation:ar-rise .45s cubic-bezier(.22,1,.36,1) .30s both}

        .ar-card {
          animation: ar-rise .4s cubic-bezier(.22,1,.36,1) both;
          transition: transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .ar-card::before {
          content:'';
          position:absolute; top:0; left:-120%; width:60%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent);
          transition:left .5s;
        }
        .ar-card:hover {
          transform:translateY(-3px) scale(1.01);
          box-shadow:0 16px 48px rgba(0,0,0,.09);
        }
        .ar-card:hover::before { left:150%; }

        .ar-tab {
          padding:8px 16px; border-radius:12px; font-size:13px; font-weight:600;
          border:1.5px solid transparent; cursor:pointer; transition:all .18s;
          display:flex; align-items:center; gap:7px; white-space:nowrap;
          font-family:inherit;
        }
        .ar-tab:hover { background:rgba(0,0,0,.04); }
        .ar-tab.active {
          background:#fffbeb; border-color:#fde68a; color:#92400e;
          box-shadow:0 2px 8px rgba(245,158,11,.15);
        }

        .ar-occ-bar {
          height:8px; border-radius:999px; overflow:hidden; background:#f1f5f9;
        }
        .ar-occ-fill {
          height:100%; border-radius:999px; transform-origin:left;
          animation:ar-bar .9s cubic-bezier(.34,1.56,.64,1) both;
        }
      `}</style>

      <div style={{ maxWidth:'1100px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'18px', paddingBottom:'40px', fontFamily:'Figtree,system-ui,sans-serif' }}>

        {/* ── Header ── */}
        <div className="ar-r1" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'14px' }}>
          <div>
            <h1 style={{ fontWeight:900, fontSize:'clamp(20px,2.5vw,26px)', letterSpacing:'-.025em', color:'#0f172a', margin:0, lineHeight:1.1 }}>
              Relatórios & Análises
            </h1>
            <p style={{ fontSize:'13px', color:'#64748b', margin:'4px 0 0', fontWeight:500 }}>
              Dados hospitalares — visão integrada e exportável
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
            {/* Period selector */}
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger style={{ width:'168px', height:'36px', fontSize:'13px', fontWeight:600, borderRadius:'11px', borderColor:'#e2e8f0' }}>
                <CalendarIcon style={{ width:'14px', height:'14px', color:'#94a3b8', marginRight:'4px' }} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {/* Refresh */}
            <button style={{ display:'inline-flex', alignItems:'center', justifyContent:'center',
              width:'36px', height:'36px', borderRadius:'11px', background:'#f8fafc',
              border:'1.5px solid #e2e8f0', cursor:'pointer', color:'#64748b',
              transition:'all .2s' }}
              onMouseEnter={e=>(e.currentTarget.style.background='#f1f5f9')}
              onMouseLeave={e=>(e.currentTarget.style.background='#f8fafc')}>
              <RefreshCwIcon style={{ width:'14px', height:'14px' }} />
            </button>
            {/* Print */}
            <button style={{ display:'inline-flex', alignItems:'center', gap:'6px',
              padding:'7px 16px', borderRadius:'11px', fontSize:'13px', fontWeight:700,
              background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'white',
              border:'none', cursor:'pointer', boxShadow:'0 4px 14px rgba(245,158,11,.35)',
              transition:'all .2s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 8px 24px rgba(245,158,11,.4)';}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow='0 4px 14px rgba(245,158,11,.35)';}}>
              <PrinterIcon style={{ width:'14px', height:'14px' }} /> Imprimir
            </button>
          </div>
        </div>

        {/* ── Tab navigation ── */}
        <div className="ar-r2" style={{ display:'flex', gap:'6px', overflowX:'auto', paddingBottom:'4px' }}>
          {REPORT_TABS.map(t => (
            <button key={t.id}
              className={`ar-tab ${activeTab === t.id ? 'active' : ''}`}
              style={{ color: activeTab === t.id ? '#92400e' : '#64748b', background: activeTab !== t.id ? 'transparent' : undefined }}
              onClick={() => setActiveTab(t.id)}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* ── KPI cards ── */}
        <div className="ar-r3" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
          <KpiCard label="Total Pacientes"   value="702"    delta="+12%" positive  icon={<UsersIcon style={{width:'18px',height:'18px'}}/>}        color="#3b82f6" bg="#eff6ff" border="#bfdbfe" delay={.00} />
          <KpiCard label="Consultas no Ano"  value="1.859"  delta="+8%"  positive  icon={<CalendarIcon style={{width:'18px',height:'18px'}}/>}      color="#8b5cf6" bg="#f5f3ff" border="#ddd6fe" delay={.06} />
          <KpiCard label="Receita Total"     value="€792k"  delta="+15%" positive  icon={<EuroIcon style={{width:'18px',height:'18px'}}/>}          color="#10b981" bg="#ecfdf5" border="#a7f3d0" delay={.12} />
          <KpiCard label="Taxa de Ocupação"  value="68%"    delta="-3%"  positive={false} icon={<BedIcon style={{width:'18px',height:'18px'}}/>}    color="#f59e0b" bg="#fffbeb" border="#fde68a" delay={.18} />
        </div>

        {/* ── Charts row 1: Patients + Consultations ── */}
        {(activeTab === 'todos' || activeTab === 'patients') && (
          <div className="ar-r4" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            <ChartBox title="Pacientes por Mês" sub="Admissões, altas e críticos"
              reportName="pacientes" icon={<FileTextIcon style={{width:'16px',height:'16px'}}/>}
              color="#3b82f6" bg="#eff6ff" border="#bfdbfe">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={MONTHLY_PATIENTS} margin={{ top:5, right:5, left:-20, bottom:0 }}>
                  <defs>
                    <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gAltas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" vertical={false}/>
                  <XAxis dataKey="mes" tick={{ fontSize:11, fill:'#94a3b8', fontWeight:600 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:'11px', fontWeight:600, paddingTop:'12px' }}/>
                  <Area type="monotone" dataKey="total"   name="Total"    stroke="#3b82f6" strokeWidth={2.5} fill="url(#gTotal)" dot={false} activeDot={{ r:5 }}/>
                  <Area type="monotone" dataKey="altas"   name="Altas"    stroke="#10b981" strokeWidth={2}   fill="url(#gAltas)" dot={false} activeDot={{ r:4 }}/>
                  <Area type="monotone" dataKey="criticos" name="Críticos" stroke="#ef4444" strokeWidth={2}   fill="none"        dot={false} strokeDasharray="4 3" activeDot={{ r:4 }}/>
                </AreaChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Distribuição por Especialidade" sub="Percentagem anual"
              reportName="especialidades" icon={<ActivityIcon style={{width:'16px',height:'16px'}}/>}
              color="#8b5cf6" bg="#f5f3ff" border="#ddd6fe">
              <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie data={SPECIALTY_DIST} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                      {SPECIALTY_DIST.map((e, i) => (
                        <Cell key={i} fill={e.fill} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v}%`, '']} contentStyle={{ borderRadius:'10px', fontSize:'12px' }}/>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'7px' }}>
                  {SPECIALTY_DIST.map((s, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ width:'8px', height:'8px', borderRadius:'2px', background:s.fill, flexShrink:0 }} />
                      <span style={{ fontSize:'11px', fontWeight:600, color:'#475569', flex:1 }}>{s.name}</span>
                      <span style={{ fontSize:'12px', fontWeight:800, color:'#0f172a' }}>{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartBox>
          </div>
        )}

        {/* ── Charts row 2: Consultations + Financial ── */}
        {(activeTab === 'todos' || activeTab === 'appointments' || activeTab === 'financial') && (
          <div className="ar-r5" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>

            {(activeTab === 'todos' || activeTab === 'appointments') && (
              <ChartBox title="Consultas Mensais" sub="Realizadas vs. canceladas"
                reportName="consultas" icon={<CalendarIcon style={{width:'16px',height:'16px'}}/>}
                color="#ec4899" bg="#fdf2f8" border="#fbcfe8">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={CONSULTATIONS} margin={{ top:5, right:5, left:-20, bottom:0 }} barSize={12}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" vertical={false}/>
                    <XAxis dataKey="mes" tick={{ fontSize:11, fill:'#94a3b8', fontWeight:600 }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:'11px', fontWeight:600, paddingTop:'12px' }}/>
                    <Bar dataKey="consultas"  name="Realizadas" fill="#ec4899" radius={[4,4,0,0]}/>
                    <Bar dataKey="canceladas" name="Canceladas" fill="#fda4af" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </ChartBox>
            )}

            {(activeTab === 'todos' || activeTab === 'financial') && (
              <ChartBox title="Receitas vs. Custos" sub="Evolução financeira mensal (€)"
                reportName="financeiro" icon={<EuroIcon style={{width:'16px',height:'16px'}}/>}
                color="#10b981" bg="#ecfdf5" border="#a7f3d0">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={FINANCIAL} margin={{ top:5, right:5, left:-10, bottom:0 }}>
                    <defs>
                      <linearGradient id="gReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.15}/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" vertical={false}/>
                    <XAxis dataKey="mes" tick={{ fontSize:11, fill:'#94a3b8', fontWeight:600 }} axisLine={false} tickLine={false}/>
                    <YAxis tickFormatter={v => `€${v/1000}k`} tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:'11px', fontWeight:600, paddingTop:'12px' }}/>
                    <Line type="monotone" dataKey="receita" name="Receita" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r:5, fill:'#10b981' }}/>
                    <Line type="monotone" dataKey="custo"   name="Custo"   stroke="#f59e0b" strokeWidth={2}   dot={false} activeDot={{ r:4, fill:'#f59e0b' }} strokeDasharray="5 3"/>
                  </LineChart>
                </ResponsiveContainer>
              </ChartBox>
            )}
          </div>
        )}

        {/* ── Occupancy by sector ── */}
        {(activeTab === 'todos' || activeTab === 'occupancy') && (
          <div className="ar-r6" style={{ background:'#fff', borderRadius:'20px', padding:'26px',
            border:'1.5px solid #f1f5f9', boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'22px', flexWrap:'wrap', gap:'12px' }}>
              <SectionHead icon={<BedIcon style={{width:'16px',height:'16px'}}/>}
                title="Ocupação por Setor" sub="Taxa de ocupação de leitos em tempo real"
                color="#f59e0b" bg="#fffbeb" border="#fde68a" />
              <ExportButtons reportName="ocupacao" />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'14px' }}>
              {OCCUPANCY_BY_SECTOR.map((s, i) => (
                <div key={i} style={{ padding:'16px', borderRadius:'14px', background:'#f8fafc', border:'1.5px solid #f1f5f9' }}
                  onMouseEnter={e=>(e.currentTarget.style.borderColor='#e2e8f0')}
                  onMouseLeave={e=>(e.currentTarget.style.borderColor='#f1f5f9')}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ width:'10px', height:'10px', borderRadius:'3px', background:s.color, flexShrink:0 }} />
                      <span style={{ fontSize:'13px', fontWeight:700, color:'#1e293b' }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize:'14px', fontWeight:900, color: s.value > 80 ? '#dc2626' : s.value > 65 ? '#d97706' : '#16a34a' }}>
                      {s.value}%
                    </span>
                  </div>
                  <div className="ar-occ-bar">
                    <div className="ar-occ-fill"
                      style={{ width:`${s.value}%`, background:s.color, animationDelay:`${i*.1+.3}s` }} />
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:'6px' }}>
                    <span style={{ fontSize:'10px', fontWeight:600, color:'#94a3b8' }}>
                      {s.value > 80 ? '🔴 Alta ocupação' : s.value > 65 ? '🟡 Ocupação moderada' : '🟢 Disponível'}
                    </span>
                    <span style={{ fontSize:'10px', fontWeight:600, color:'#94a3b8' }}>
                      {Math.round(s.value/100*20)}/20 leitos
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* legend */}
            <div style={{ display:'flex', gap:'18px', marginTop:'16px', paddingTop:'16px',
              borderTop:'1.5px solid #f1f5f9', flexWrap:'wrap' }}>
              {[
                { color:'#16a34a', label:'Disponível  (< 65%)'  },
                { color:'#d97706', label:'Moderado  (65–80%)'   },
                { color:'#dc2626', label:'Alta ocupação (> 80%)'},
              ].map(l => (
                <div key={l.label} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                  <div style={{ width:'8px', height:'8px', borderRadius:'2px', background:l.color }} />
                  <span style={{ fontSize:'11px', fontWeight:600, color:'#64748b' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Summary table ── */}
        {(activeTab === 'todos' || activeTab === 'financial') && (
          <div className="ar-r6" style={{ background:'#fff', borderRadius:'20px', padding:'26px',
            border:'1.5px solid #f1f5f9', boxShadow:'0 1px 4px rgba(0,0,0,.04)', overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'18px', flexWrap:'wrap', gap:'12px' }}>
              <SectionHead icon={<CheckCircleIcon style={{width:'16px',height:'16px'}}/>}
                title="Resumo Financeiro Anual" sub="Receitas, custos e margem por mês"
                color="#10b981" bg="#ecfdf5" border="#a7f3d0" />
              <ExportButtons reportName="financeiro-tabela" />
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                <thead>
                  <tr style={{ borderBottom:'2px solid #f1f5f9' }}>
                    {['Mês','Receita','Custo','Lucro','Margem'].map(h => (
                      <th key={h} style={{ padding:'10px 16px', textAlign: h === 'Mês' ? 'left' : 'right',
                        fontSize:'10px', fontWeight:800, letterSpacing:'.08em', textTransform:'uppercase',
                        color:'#94a3b8' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FINANCIAL.map((r, i) => {
                    const lucro = r.receita - r.custo;
                    const margem = Math.round((lucro / r.receita) * 100);
                    return (
                      <tr key={i} style={{ borderBottom:'1px solid #f8fafc', transition:'background .15s' }}
                        onMouseEnter={e=>(e.currentTarget.style.background='#fafafa')}
                        onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                        <td style={{ padding:'11px 16px', fontWeight:700, color:'#1e293b' }}>{r.mes}</td>
                        <td style={{ padding:'11px 16px', textAlign:'right', fontWeight:600, color:'#1e293b', fontVariantNumeric:'tabular-nums' }}>
                          €{r.receita.toLocaleString('pt-PT')}
                        </td>
                        <td style={{ padding:'11px 16px', textAlign:'right', fontWeight:600, color:'#64748b', fontVariantNumeric:'tabular-nums' }}>
                          €{r.custo.toLocaleString('pt-PT')}
                        </td>
                        <td style={{ padding:'11px 16px', textAlign:'right', fontWeight:700, color:'#16a34a', fontVariantNumeric:'tabular-nums' }}>
                          €{lucro.toLocaleString('pt-PT')}
                        </td>
                        <td style={{ padding:'11px 16px', textAlign:'right' }}>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', fontSize:'11px', fontWeight:800,
                            padding:'3px 8px', borderRadius:'999px',
                            background: margem >= 35 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                            color: margem >= 35 ? '#059669' : '#d97706' }}>
                            {margem}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default AdminReports;