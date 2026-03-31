import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  BedDouble,
  CalendarDays,
  ClipboardList,
  Hospital,
  LineChart,
  Monitor,
  RefreshCw,
  Settings,
  UserPlus,
  Users,
  Zap,
} from 'lucide-react';
import { api } from '../../services/api';

/* ─────────────────────────────────────────
   Mini sparkline SVG (purely visual mock)
───────────────────────────────────────── */
const Sparkline: React.FC<{ points: number[]; color: string; fill?: string }> = ({ points, color, fill }) => {
  const w = 80, h = 28;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const ys = points.map(p => h - ((p - min) / range) * (h - 4) - 2);
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      {fill && <path d={area} fill={fill} opacity={0.15} />}
      <path d={path} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ─────────────────────────────────────────
   Animated counter hook
───────────────────────────────────────── */
const useAnimCount = (target: number, duration = 1200) => {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return;
      started.current = true;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(ease * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return { val, ref };
};

const AnimNum: React.FC<{ n: number | string; className?: string }> = ({ n, className }) => {
  const num = typeof n === 'number' ? n : parseInt(String(n)) || 0;
  const { val, ref } = useAnimCount(num);
  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className={className}>
      {typeof n === 'string' && isNaN(parseInt(n)) ? n : val.toLocaleString()}
    </span>
  );
};

/* ─────────────────────────────────────────
   Circular progress ring
───────────────────────────────────────── */
const Ring: React.FC<{ pct: number; color: string; size?: number; stroke?: number }> = ({
  pct, color, size = 44, stroke = 4,
}) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);
  useEffect(() => { const t = setTimeout(() => setOffset(circ * (1 - pct)), 400); return () => clearTimeout(t); }, [circ, pct]);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)' }} />
    </svg>
  );
};

/* ─────────────────────────────────────────
   Activity timeline mock data
───────────────────────────────────────── */
const ACTIVITY = [
  { time: '09:14', user: 'Dr. Ramos',      action: 'Consulta registada',      tag: 'consulta',  avatar: 'DR' },
  { time: '09:02', user: 'Enf. Costa',     action: 'Novo paciente admitido',  tag: 'admissão',  avatar: 'EC' },
  { time: '08:51', user: 'Admin Silva',    action: 'Relatório gerado',        tag: 'relatório', avatar: 'AS' },
  { time: '08:33', user: 'Dra. Matos',     action: 'Alta médica emitida',     tag: 'alta',      avatar: 'DM' },
  { time: '08:20', user: 'Recepção',       action: 'Marcação confirmada',     tag: 'marcação',  avatar: 'RC' },
];

const TAG_STYLES: Record<string, { bg: string; text: string }> = {
  consulta:  { bg: 'rgba(59,130,246,0.1)',  text: '#2563eb' },
  admissão:  { bg: 'rgba(16,185,129,0.1)',  text: '#059669' },
  relatório: { bg: 'rgba(245,158,11,0.1)',  text: '#d97706' },
  alta:      { bg: 'rgba(139,92,246,0.1)',  text: '#7c3aed' },
  marcação:  { bg: 'rgba(236,72,153,0.1)',  text: '#db2777' },
};

const AVATAR_COLORS = [
  '#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#ef4444',
];

/* ─────────────────────────────────────────
   Main component
───────────────────────────────────────── */
const AdminDashboard: React.FC = () => {
  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime]       = useState(new Date());
  const [hovCard, setHovCard] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try { const d = await api.getDashboardStats(); setStats(d); }
      catch { setStats(null); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fmtDate = (d: Date) =>
    d.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });

  /* stat cards */
  const cards = [
    {
      label: 'Utilizadores',      value: stats?.usersTotal ?? 0,
      icon: <Users className="w-6 h-6" style={{ color: '#3b82f6' }} />,
      color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe',
      ring: 0.72, sub: '+3 esta semana',
      spark: [12,15,11,18,14,20,17,22,19,24],
    },
    {
      label: 'Pacientes Totais',   value: stats?.stats?.totalPatients ?? 0,
      icon: <Hospital className="w-6 h-6" style={{ color: '#10b981' }} />,
      color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0',
      ring: 0.88, sub: '+12 este mês',
      spark: [30,34,28,40,36,42,38,50,45,53],
    },
    {
      label: 'Consultas Hoje',     value: stats?.stats?.appointmentsToday ?? 0,
      icon: <CalendarDays className="w-6 h-6" style={{ color: '#f59e0b' }} />,
      color: '#f59e0b', bg: '#fffbeb', border: '#fde68a',
      ring: 0.55, sub: '4 por confirmar',
      spark: [5,8,6,10,9,12,8,14,11,15],
    },
    {
      label: 'Leitos Disponíveis', value: stats?.stats?.availableBeds ?? 0,
      icon: <BedDouble className="w-6 h-6" style={{ color: '#8b5cf6' }} />,
      color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe',
      ring: 0.40, sub: '60% ocupação',
      spark: [8,7,9,6,8,5,7,6,8,7],
    },
  ];

  const systemServices = [
    { name: 'Backend API',     status: 'online', latency: '12ms' },
    { name: 'Base de Dados',   status: 'online', latency: '4ms'  },
    { name: 'Assistente IA',   status: 'online', latency: '88ms' },
    { name: 'Serviço de Email',status: 'online', latency: '31ms' },
  ];

  /* ── loading ── */
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', flexDirection: 'column', gap: '16px' }}>
      <div className="ad-spin" style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid #fde68a', borderTopColor: '#f59e0b' }} />
      <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500, fontFamily: 'Figtree,sans-serif' }}>A carregar dados…</span>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');

        .ad-root { font-family:'Figtree',sans-serif; }
        .ad-mono { font-family:'JetBrains Mono',monospace; }

        @keyframes ad-rise  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes ad-fade  { from{opacity:0} to{opacity:1} }
        @keyframes ad-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ad-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        @keyframes ad-bar   { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes ad-shimmer {
          0%   { background-position: -200% center }
          100% { background-position:  200% center }
        }

        .ad-spin  { animation: ad-spin  .8s linear infinite; }
        .ad-pulse { animation: ad-pulse 2s ease-in-out infinite; }

        .ad-r1 { animation: ad-rise .45s cubic-bezier(.22,1,.36,1) .00s both }
        .ad-r2 { animation: ad-rise .45s cubic-bezier(.22,1,.36,1) .06s both }
        .ad-r3 { animation: ad-rise .45s cubic-bezier(.22,1,.36,1) .12s both }
        .ad-r4 { animation: ad-rise .45s cubic-bezier(.22,1,.36,1) .18s both }
        .ad-r5 { animation: ad-rise .45s cubic-bezier(.22,1,.36,1) .24s both }
        .ad-r6 { animation: ad-rise .45s cubic-bezier(.22,1,.36,1) .30s both }

        .ad-card {
          background: #fff;
          border-radius: 20px;
          border: 1.5px solid #f1f5f9;
          transition: transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s ease, border-color .2s;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .ad-card:hover {
          transform: translateY(-4px) scale(1.015);
          box-shadow: 0 20px 56px rgba(0,0,0,0.1);
        }
        .ad-card::before {
          content:'';
          position:absolute; top:0; left:-120%; width:60%; height:100%;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent);
          transition: left .5s ease;
        }
        .ad-card:hover::before { left: 150%; }

        .ad-action-btn {
          width:100%; padding:13px 16px;
          border-radius:14px; border:1.5px solid transparent;
          font-family:'Figtree',sans-serif; font-size:13px; font-weight:600;
          cursor:pointer; text-align:left;
          display:flex; align-items:center; gap:12px;
          transition: all .2s cubic-bezier(.34,1.56,.64,1);
        }
        .ad-action-btn:hover {
          transform: translateX(4px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
        }

        .ad-bar-track {
          height:4px; border-radius:999px; overflow:hidden; background:rgba(0,0,0,.07);
        }
        .ad-bar-fill {
          height:100%; border-radius:999px;
          transform-origin:left;
          animation: ad-bar .9s cubic-bezier(.34,1.56,.64,1) both;
        }

        .ad-status-dot {
          width:8px; height:8px; border-radius:50%;
        }
        .ad-online  { background:#10b981; box-shadow:0 0 0 3px rgba(16,185,129,0.2); }
        .ad-warning { background:#f59e0b; box-shadow:0 0 0 3px rgba(245,158,11,0.2); }
        .ad-offline { background:#ef4444; box-shadow:0 0 0 3px rgba(239,68,68,0.2); }

        .ad-tag {
          font-size:10px; font-weight:700; letter-spacing:.06em; text-transform:uppercase;
          padding:3px 8px; border-radius:6px;
        }

        .ad-timeline-row {
          display:flex; align-items:center; gap:12px;
          padding:10px 12px; border-radius:12px;
          transition: background .18s;
          cursor:default;
        }
        .ad-timeline-row:hover { background: rgba(0,0,0,.025); }

        .ad-gradient-header {
          background: linear-gradient(135deg,#1e293b 0%,#0f172a 100%);
          border-radius: 24px;
          padding: 28px 32px;
          position: relative;
          overflow: hidden;
        }
      `}</style>

      <div className="ad-root" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '32px' }}>

        {/* ═══ HEADER ═══ */}
        <div className="ad-r1 ad-gradient-header" style={{ color: 'white' }}>
          {/* decorative circles */}
          <div style={{ position:'absolute',top:'-60px',right:'-40px',width:'220px',height:'220px',
            background:'radial-gradient(circle,rgba(245,158,11,0.18) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none' }} />
          <div style={{ position:'absolute',bottom:'-40px',left:'160px',width:'140px',height:'140px',
            background:'radial-gradient(circle,rgba(59,130,246,0.15) 0%,transparent 70%)',borderRadius:'50%',pointerEvents:'none' }} />

          <div style={{ position:'relative',zIndex:2,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'16px' }}>
            <div>
              <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px' }}>
                <div style={{ width:'10px',height:'10px',borderRadius:'50%',background:'#f59e0b',
                  boxShadow:'0 0 0 3px rgba(245,158,11,0.3)' }} className="ad-pulse" />
                <span style={{ fontSize:'11px',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,.5)' }}>
                  Sistema Ativo
                </span>
              </div>
              <h1 style={{ fontWeight:900,fontSize:'clamp(20px,2.5vw,28px)',letterSpacing:'-.025em',lineHeight:1.1,margin:'0 0 6px' }}>
                Painel Administrativo
              </h1>
              <p style={{ fontSize:'13px',color:'rgba(255,255,255,.5)',fontWeight:400,margin:0 }}>
                {fmtDate(time)} — visão geral do sistema hospitalar
              </p>
            </div>
            <div style={{ display:'flex',alignItems:'center',gap:'10px' }}>
              <div style={{ background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',
                borderRadius:'12px',padding:'10px 18px',backdropFilter:'blur(8px)' }}>
                <div style={{ fontSize:'10px',fontWeight:600,color:'rgba(255,255,255,.4)',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:'3px' }}>
                  Hora atual
                </div>
                <div className="ad-mono" style={{ fontSize:'17px',fontWeight:600,color:'#fbbf24',letterSpacing:'.04em' }}>
                  {fmtTime(time)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ STAT CARDS ═══ */}
        <div className="ad-r2" style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px' }}>
          {cards.map((c, i) => (
            <div key={i} className="ad-card"
              style={{ padding:'22px', borderColor: hovCard === i ? c.border : '#f1f5f9' }}
              onMouseEnter={() => setHovCard(i)}
              onMouseLeave={() => setHovCard(null)}>
              {/* top row */}
              <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'14px' }}>
                <div style={{ width:'42px',height:'42px',borderRadius:'13px',background:c.bg,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',
                  border:`1.5px solid ${c.border}` }}>
                  {c.icon}
                </div>
                <Ring pct={c.ring} color={c.color} size={40} stroke={4} />
              </div>
              {/* value */}
              <div style={{ fontWeight:900,fontSize:'30px',letterSpacing:'-.04em',lineHeight:1,color:'#0f172a',marginBottom:'4px' }}>
                <AnimNum n={c.value} />
              </div>
              <div style={{ fontSize:'12px',fontWeight:600,color:'#64748b',marginBottom:'12px' }}>{c.label}</div>
              {/* sparkline + sub */}
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                <span style={{ fontSize:'11px',fontWeight:600,color:c.color }}>↑ {c.sub}</span>
                <Sparkline points={c.spark} color={c.color} fill={c.color} />
              </div>
            </div>
          ))}
        </div>

        {/* ═══ MIDDLE ROW: ACTIONS + SYSTEM ═══ */}
        <div className="ad-r3" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px' }}>

          {/* Quick Actions */}
          <div className="ad-card" style={{ padding:'26px' }}>
            <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'20px' }}>
              <div style={{ width:'32px',height:'32px',borderRadius:'10px',background:'#fffbeb',
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',border:'1.5px solid #fde68a' }}>
                <Zap className="w-5 h-5" style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <p style={{ fontWeight:800,fontSize:'15px',color:'#0f172a',margin:0,lineHeight:1.1 }}>Ações Rápidas</p>
                <p style={{ fontSize:'11px',color:'#94a3b8',margin:0,fontWeight:500 }}>Operações frequentes</p>
              </div>
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:'8px' }}>
              {[
                { icon:<UserPlus className="w-5 h-5" />, label:'Cadastrar novo utilizador', bg:'#fffbeb', hover:'#fef3c7', text:'#92400e', border:'#fde68a', hint:'Gestão de acessos' },
                { icon:<BarChart3 className="w-5 h-5" />, label:'Gerar relatório',           bg:'#f8fafc', hover:'#f1f5f9', text:'#1e293b', border:'#e2e8f0', hint:'PDF ou Excel'     },
                { icon:<Settings className="w-5 h-5" />, label:'Configurações do sistema',  bg:'#f8fafc', hover:'#f1f5f9', text:'#1e293b', border:'#e2e8f0', hint:'Parâmetros gerais' },
                { icon:<RefreshCw className="w-5 h-5" />, label:'Sincronizar base de dados',  bg:'#f8fafc', hover:'#f1f5f9', text:'#1e293b', border:'#e2e8f0', hint:'Última sync: 2m'  },
              ].map((a, i) => (
                <button key={i} className="ad-action-btn"
                  style={{ background: a.bg, borderColor: a.border, color: a.text }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = a.hover; (e.currentTarget as HTMLElement).style.borderColor = a.hover; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = a.bg;    (e.currentTarget as HTMLElement).style.borderColor = a.border; }}>
                  <span style={{ lineHeight:1,flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {a.icon}
                  </span>
                  <span style={{ flex:1 }}>{a.label}</span>
                  <span style={{ fontSize:'10px',fontWeight:600,color:'#94a3b8' }}>{a.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="ad-card" style={{ padding:'26px' }}>
            <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'20px' }}>
              <div style={{ width:'32px',height:'32px',borderRadius:'10px',background:'#ecfdf5',
                display:'flex',alignItems:'center',justifyContent:'center',border:'1.5px solid #a7f3d0', color:'#059669' }}>
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <p style={{ fontWeight:800,fontSize:'15px',color:'#0f172a',margin:0,lineHeight:1.1 }}>Status do Sistema</p>
                <p style={{ fontSize:'11px',color:'#94a3b8',margin:0,fontWeight:500 }}>Todos os serviços operacionais</p>
              </div>
              <div style={{ marginLeft:'auto',padding:'4px 10px',borderRadius:'999px',
                background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.25)',
                fontSize:'10px',fontWeight:700,color:'#059669',letterSpacing:'.06em',textTransform:'uppercase' }}>
                100% uptime
              </div>
            </div>

            <div style={{ display:'flex',flexDirection:'column',gap:'8px',marginBottom:'20px' }}>
              {systemServices.map((s, i) => (
                <div key={i} style={{ display:'flex',alignItems:'center',gap:'12px',padding:'12px 14px',
                  borderRadius:'13px',background:'#f8fafc',border:'1.5px solid #f1f5f9',transition:'border-color .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#f1f5f9')}>
                  <div className={`ad-status-dot ad-${s.status}`} />
                  <span style={{ flex:1,fontSize:'13px',fontWeight:600,color:'#1e293b' }}>{s.name}</span>
                  <span className="ad-mono" style={{ fontSize:'11px',color:'#64748b' }}>{s.latency}</span>
                  <span style={{ fontSize:'10px',fontWeight:700,color:'#10b981',background:'rgba(16,185,129,.1)',
                    padding:'2px 7px',borderRadius:'6px' }}>Online</span>
                </div>
              ))}
            </div>

            {/* load bars */}
            <p style={{ fontSize:'11px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'#94a3b8',marginBottom:'10px' }}>
              Carga do sistema
            </p>
            <div style={{ display:'flex',flexDirection:'column',gap:'8px' }}>
              {[
                { label:'CPU',    pct:28, color:'#3b82f6' },
                { label:'RAM',    pct:54, color:'#10b981' },
                { label:'Disco',  pct:41, color:'#f59e0b' },
              ].map((b, i) => (
                <div key={i}>
                  <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'4px' }}>
                    <span style={{ fontSize:'11px',fontWeight:600,color:'#64748b' }}>{b.label}</span>
                    <span className="ad-mono" style={{ fontSize:'11px',fontWeight:600,color:'#1e293b' }}>{b.pct}%</span>
                  </div>
                  <div className="ad-bar-track">
                    <div className="ad-bar-fill" style={{ width:`${b.pct}%`, background:b.color, animationDelay:`${i*.15+.4}s` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ BOTTOM ROW: ACTIVITY + CHART ═══ */}
        <div className="ad-r4" style={{ display:'grid',gridTemplateColumns:'1.2fr 0.8fr',gap:'14px' }}>

          {/* Activity feed */}
          <div className="ad-card" style={{ padding:'26px' }}>
            <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'18px' }}>
              <div style={{ width:'32px',height:'32px',borderRadius:'10px',background:'#eff6ff',
                display:'flex',alignItems:'center',justifyContent:'center',border:'1.5px solid #bfdbfe', color:'#3b82f6' }}>
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <p style={{ fontWeight:800,fontSize:'15px',color:'#0f172a',margin:0,lineHeight:1.1 }}>Atividade Recente</p>
                <p style={{ fontSize:'11px',color:'#94a3b8',margin:0,fontWeight:500 }}>Últimas ações do sistema</p>
              </div>
              <div style={{ marginLeft:'auto',display:'flex',alignItems:'center',gap:'5px',
                fontSize:'11px',fontWeight:600,color:'#3b82f6',cursor:'pointer' }}>
                Ver tudo <span style={{ fontSize:'14px' }}>→</span>
              </div>
            </div>

            <div style={{ display:'flex',flexDirection:'column',gap:'2px' }}>
              {ACTIVITY.map((a, i) => (
                <div key={i} className="ad-timeline-row" style={{ animationDelay:`${i*.06}s` }}>
                  {/* avatar */}
                  <div style={{ width:'34px',height:'34px',borderRadius:'10px',
                    background:AVATAR_COLORS[i % AVATAR_COLORS.length],
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:'11px',fontWeight:800,color:'white',flexShrink:0,letterSpacing:'.02em' }}>
                    {a.avatar}
                  </div>
                  {/* text */}
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
                      <span style={{ fontSize:'13px',fontWeight:700,color:'#1e293b' }}>{a.user}</span>
                      <span className="ad-tag"
                        style={{ background:TAG_STYLES[a.tag]?.bg, color:TAG_STYLES[a.tag]?.text }}>
                        {a.tag}
                      </span>
                    </div>
                    <p style={{ fontSize:'12px',color:'#64748b',margin:0,fontWeight:400,
                      whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>
                      {a.action}
                    </p>
                  </div>
                  {/* time */}
                  <span className="ad-mono" style={{ fontSize:'11px',color:'#94a3b8',flexShrink:0 }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Occupation chart mock */}
          <div className="ad-card" style={{ padding:'26px' }}>
            <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'18px' }}>
              <div style={{ width:'32px',height:'32px',borderRadius:'10px',background:'#f5f3ff',
                display:'flex',alignItems:'center',justifyContent:'center',border:'1.5px solid #ddd6fe', color:'#7c3aed' }}>
                <LineChart className="w-5 h-5" />
              </div>
              <div>
                <p style={{ fontWeight:800,fontSize:'15px',color:'#0f172a',margin:0,lineHeight:1.1 }}>Ocupação Semanal</p>
                <p style={{ fontSize:'11px',color:'#94a3b8',margin:0,fontWeight:500 }}>Leitos por dia</p>
              </div>
            </div>

            {/* bar chart */}
            {[
              { day:'Seg', val:68 }, { day:'Ter', val:74 }, { day:'Qua', val:55 },
              { day:'Qui', val:82 }, { day:'Sex', val:76 }, { day:'Sáb', val:48 }, { day:'Dom', val:30 },
            ].map((d, i) => (
              <div key={i} style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px' }}>
                <span style={{ fontSize:'11px',fontWeight:700,color:'#64748b',width:'28px',flexShrink:0 }}>{d.day}</span>
                <div style={{ flex:1,height:'8px',borderRadius:'999px',background:'#f1f5f9',overflow:'hidden' }}>
                  <div style={{
                    height:'100%',borderRadius:'999px',
                    background: d.val > 75
                      ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                      : d.val > 60
                        ? 'linear-gradient(90deg,#3b82f6,#2563eb)'
                        : 'linear-gradient(90deg,#10b981,#059669)',
                    width:`${d.val}%`,
                    transform:'scaleX(0)',transformOrigin:'left',
                    animation:`ad-bar .8s cubic-bezier(.34,1.56,.64,1) ${i*.09+.3}s both`,
                  }} />
                </div>
                <span className="ad-mono" style={{ fontSize:'11px',fontWeight:600,color:'#1e293b',width:'30px',textAlign:'right' }}>{d.val}%</span>
              </div>
            ))}

            {/* legend */}
            <div style={{ display:'flex',gap:'12px',marginTop:'14px',paddingTop:'14px',borderTop:'1.5px solid #f1f5f9' }}>
              {[
                { color:'#10b981', label:'Baixo'  },
                { color:'#3b82f6', label:'Normal' },
                { color:'#f59e0b', label:'Alto'   },
              ].map(l => (
                <div key={l.label} style={{ display:'flex',alignItems:'center',gap:'5px' }}>
                  <div style={{ width:'8px',height:'8px',borderRadius:'2px',background:l.color }} />
                  <span style={{ fontSize:'11px',fontWeight:600,color:'#64748b' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default AdminDashboard;