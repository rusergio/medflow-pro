import React, { useState, useMemo } from 'react';
import {
  SearchIcon, XIcon, DownloadIcon,
  UserPlusIcon, CalendarIcon, LogInIcon, PencilIcon,
  TrashIcon, KeyIcon, AlertTriangleIcon,
  ChevronLeftIcon, ChevronRightIcon, MonitorIcon,
  ClockIcon, ActivityIcon, ShieldAlertIcon,
  ArrowUpDownIcon, FilterIcon,
} from 'lucide-react';

/* ─────────────────────────────────────────
   Mock data
───────────────────────────────────────── */
const MOCK_LOGS = [
  { id:'1',  user:'medflowpro@gmail.com',    role:'ADMIN',  action:'Login realizado',            category:'auth',     time:'2026-02-22 15:32:41', ip:'192.168.1.1',   device:'Chrome · Windows' },
  { id:'2',  user:'dr.silva@hospital.com',   role:'DOCTOR', action:'Criou novo paciente',         category:'create',   time:'2026-02-22 14:20:18', ip:'192.168.1.15',  device:'Safari · macOS'   },
  { id:'3',  user:'enf.costa@hospital.com',  role:'NURSE',  action:'Atualizou agendamento',       category:'update',   time:'2026-02-22 13:45:07', ip:'192.168.1.22',  device:'Firefox · Ubuntu' },
  { id:'4',  user:'medflowpro@gmail.com',    role:'ADMIN',  action:'Cadastrou novo utilizador',   category:'create',   time:'2026-02-22 12:10:33', ip:'192.168.1.1',   device:'Chrome · Windows' },
  { id:'5',  user:'dr.silva@hospital.com',   role:'DOCTOR', action:'Login realizado',             category:'auth',     time:'2026-02-22 09:00:55', ip:'192.168.1.15',  device:'Safari · macOS'   },
  { id:'6',  user:'dra.matos@hospital.com',  role:'DOCTOR', action:'Alta médica emitida',         category:'update',   time:'2026-02-22 08:47:12', ip:'192.168.1.30',  device:'Chrome · macOS'   },
  { id:'7',  user:'medflowpro@gmail.com',    role:'ADMIN',  action:'Exportou relatório PDF',      category:'export',   time:'2026-02-21 18:22:05', ip:'192.168.1.1',   device:'Chrome · Windows' },
  { id:'8',  user:'enf.lima@hospital.com',   role:'NURSE',  action:'Tentativa de login falhada',  category:'warning',  time:'2026-02-21 17:55:30', ip:'10.0.0.8',      device:'Edge · Windows'   },
  { id:'9',  user:'dr.ramos@hospital.com',   role:'DOCTOR', action:'Eliminou registo clínico',    category:'delete',   time:'2026-02-21 16:30:00', ip:'192.168.1.44',  device:'Chrome · Windows' },
  { id:'10', user:'medflowpro@gmail.com',    role:'ADMIN',  action:'Alterou permissões',          category:'security', time:'2026-02-21 15:10:22', ip:'192.168.1.1',   device:'Chrome · Windows' },
  { id:'11', user:'dr.costa@hospital.com',   role:'DOCTOR', action:'Registou consulta',           category:'create',   time:'2026-02-21 14:05:09', ip:'192.168.1.18',  device:'Firefox · macOS'  },
  { id:'12', user:'enf.costa@hospital.com',  role:'NURSE',  action:'Logout realizado',            category:'auth',     time:'2026-02-21 13:00:44', ip:'192.168.1.22',  device:'Firefox · Ubuntu' },
  { id:'13', user:'dra.silva@hospital.com',  role:'DOCTOR', action:'Atualizou dados do paciente', category:'update',   time:'2026-02-21 11:38:17', ip:'192.168.1.55',  device:'Chrome · macOS'   },
  { id:'14', user:'medflowpro@gmail.com',    role:'ADMIN',  action:'Configurações alteradas',     category:'security', time:'2026-02-21 10:20:01', ip:'192.168.1.1',   device:'Chrome · Windows' },
  { id:'15', user:'dr.nunes@hospital.com',   role:'DOCTOR', action:'Login realizado',             category:'auth',     time:'2026-02-21 09:15:33', ip:'192.168.1.9',   device:'Safari · iOS'     },
];

const PAGE_SIZE = 10;

/* ─────────────────────────────────────────
   Category config — light palette
───────────────────────────────────────── */
const CAT: Record<string, {
  label: string; color: string; bg: string; border: string;
  lightBg: string; icon: React.ReactNode; dot: string;
}> = {
  auth:     { label:'Autenticação', color:'#2563eb', bg:'#eff6ff',   border:'#bfdbfe', lightBg:'#f0f7ff', dot:'#3b82f6', icon:<LogInIcon      className="w-3 h-3"/> },
  create:   { label:'Criação',      color:'#059669', bg:'#ecfdf5',   border:'#a7f3d0', lightBg:'#f0fdf8', dot:'#10b981', icon:<UserPlusIcon    className="w-3 h-3"/> },
  update:   { label:'Atualização',  color:'#b45309', bg:'#fffbeb',   border:'#fde68a', lightBg:'#fefce8', dot:'#f59e0b', icon:<PencilIcon      className="w-3 h-3"/> },
  delete:   { label:'Eliminação',   color:'#dc2626', bg:'#fef2f2',   border:'#fecaca', lightBg:'#fff5f5', dot:'#ef4444', icon:<TrashIcon       className="w-3 h-3"/> },
  export:   { label:'Exportação',   color:'#7c3aed', bg:'#f5f3ff',   border:'#ddd6fe', lightBg:'#f8f6ff', dot:'#8b5cf6', icon:<DownloadIcon    className="w-3 h-3"/> },
  security: { label:'Segurança',    color:'#be185d', bg:'#fdf2f8',   border:'#fbcfe8', lightBg:'#fef6fb', dot:'#ec4899', icon:<KeyIcon         className="w-3 h-3"/> },
  warning:  { label:'Aviso',        color:'#c2410c', bg:'#fff7ed',   border:'#fed7aa', lightBg:'#fffaf5', dot:'#f97316', icon:<AlertTriangleIcon className="w-3 h-3"/> },
};

const ROLE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  ADMIN:  { label:'Admin',      color:'#92400e', bg:'#fffbeb', border:'#fde68a' },
  DOCTOR: { label:'Médico',     color:'#1d4ed8', bg:'#eff6ff', border:'#bfdbfe' },
  NURSE:  { label:'Enfermeiro', color:'#065f46', bg:'#ecfdf5', border:'#a7f3d0' },
};

const AVATAR_PAL = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#ef4444','#06b6d4','#6366f1'];
const avatarColor = (email: string) => AVATAR_PAL[email.charCodeAt(0) % AVATAR_PAL.length];

/* ─────────────────────────────────────────
   Stats strip
───────────────────────────────────────── */
const STAT_ITEMS = [
  { key:'auth',     label:'Autenticações', icon: KeyIcon },
  { key:'create',   label:'Criações',      icon: UserPlusIcon },
  { key:'update',   label:'Atualizações',  icon: PencilIcon },
  { key:'warning',  label:'Avisos',        icon: AlertTriangleIcon },
  { key:'security', label:'Segurança',     icon: ShieldAlertIcon },
  { key:'delete',   label:'Eliminações',   icon: TrashIcon },
];

const StatsStrip: React.FC<{ logs: typeof MOCK_LOGS }> = ({ logs }) => {
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    logs.forEach(l => { c[l.category] = (c[l.category] || 0) + 1; });
    return c;
  }, [logs]);

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'10px' }}>
      {STAT_ITEMS.map(s => {
        const conf = CAT[s.key];
        const Icon = s.icon as React.ComponentType<{ className?: string }>;
        return (
          <div key={s.key} className="al-stat" style={{
            background:'#fff', borderRadius:'18px', padding:'16px',
            border:`1.5px solid ${conf.border}`,
            boxShadow:`0 2px 12px ${conf.bg}, 0 1px 3px rgba(0,0,0,.06)`,
          }}>
            <div style={{ marginBottom:'8px', lineHeight:1 }}>
              <Icon className="w-6 h-6" style={{ color: conf.color }} />
            </div>
            <div style={{ fontWeight:900, fontSize:'26px', letterSpacing:'-.04em', color:conf.color, lineHeight:1 }}>
              {counts[s.key] || 0}
            </div>
            <div style={{ fontSize:'10px', fontWeight:700, color:'#94a3b8', marginTop:'4px',
              textTransform:'uppercase', letterSpacing:'.07em' }}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────
   Main
───────────────────────────────────────── */
const AdminLogs: React.FC = () => {
  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [page,      setPage]      = useState(1);
  const [sortDesc,  setSortDesc]  = useState(true);
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(() => {
    let list = MOCK_LOGS;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.user.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.ip.includes(q)
      );
    }
    if (catFilter !== 'all') list = list.filter(l => l.category === catFilter);
    return [...list].sort((a, b) =>
      sortDesc ? b.time.localeCompare(a.time) : a.time.localeCompare(b.time)
    );
  }, [search, catFilter, sortDesc]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 1500);
  };

  const CAT_FILTERS = [
    { key:'all',      label:'Todos'       },
    { key:'auth',     label:'Auth'        },
    { key:'create',   label:'Criação'     },
    { key:'update',   label:'Atualização' },
    { key:'warning',  label:'Avisos'      },
    { key:'security', label:'Segurança'   },
    { key:'delete',   label:'Eliminação'  },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .al-root { font-family:'Figtree',sans-serif; }
        .al-mono { font-family:'JetBrains Mono',monospace !important; }

        @keyframes al-rise { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes al-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes al-pulse{ 0%,100%{opacity:1} 50%{opacity:.3} }

        .al-r1{animation:al-rise .45s cubic-bezier(.22,1,.36,1) .00s both}
        .al-r2{animation:al-rise .45s cubic-bezier(.22,1,.36,1) .07s both}
        .al-r3{animation:al-rise .45s cubic-bezier(.22,1,.36,1) .14s both}
        .al-r4{animation:al-rise .45s cubic-bezier(.22,1,.36,1) .21s both}

        .al-stat {
          transition:transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
          cursor:default; position:relative; overflow:hidden;
        }
        .al-stat::after {
          content:''; position:absolute; top:0; left:-120%; width:60%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.7),transparent);
          transition:left .45s;
        }
        .al-stat:hover { transform:translateY(-3px) scale(1.02); }
        .al-stat:hover::after { left:150%; }

        .al-row {
          animation:al-rise .3s cubic-bezier(.22,1,.36,1) both;
          transition:background .15s;
          position:relative;
        }
        .al-row:hover { background:#fafbff !important; }
        .al-row:hover .al-accent { opacity:1 !important; }

        .al-accent {
          position:absolute; left:0; top:0; bottom:0; width:3px;
          border-radius:0 2px 2px 0; opacity:0;
          transition:opacity .18s;
        }

        .al-filter {
          padding:6px 14px; border-radius:10px; font-size:12px; font-weight:700;
          border:1.5px solid transparent; cursor:pointer; transition:all .18s;
          font-family:'Figtree',sans-serif; white-space:nowrap; background:none;
        }
        .al-filter:hover { transform:translateY(-1px); }

        .al-pg-btn {
          width:32px; height:32px; border-radius:9px; display:flex;
          align-items:center; justify-content:center; cursor:pointer;
          font-size:12px; font-weight:800; transition:all .18s; border:1.5px solid #e2e8f0;
          background:#fff; color:#64748b; font-family:'Figtree',sans-serif;
        }
        .al-pg-btn:hover:not(:disabled) {
          border-color:#fde68a; background:#fffbeb; color:#92400e;
        }
        .al-pg-btn:disabled { opacity:.3; cursor:not-allowed; }

        .al-spin-icon { animation:al-spin .8s linear infinite; }
        .al-pulse     { animation:al-pulse 2.5s ease-in-out infinite; }
      `}</style>

      <div className="al-root" style={{ maxWidth:'1100px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'16px', paddingBottom:'40px' }}>

        {/* ══ HEADER ══ */}
        <div className="al-r1" style={{ borderRadius:'22px', overflow:'hidden', position:'relative',
          background:'linear-gradient(135deg,#fffbf0 0%,#fff8e8 50%,#fef3c7 100%)',
          border:'1.5px solid #fde68a',
          boxShadow:'0 4px 24px rgba(245,158,11,0.12), 0 1px 3px rgba(0,0,0,0.05)',
          padding:'28px 32px' }}>

          {/* decorative orbs */}
          <div style={{ position:'absolute', top:'-50px', right:'60px', width:'220px', height:'220px',
            background:'radial-gradient(circle,rgba(245,158,11,0.15) 0%,transparent 70%)',
            borderRadius:'50%', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-40px', left:'100px', width:'160px', height:'160px',
            background:'radial-gradient(circle,rgba(251,191,36,0.12) 0%,transparent 70%)',
            borderRadius:'50%', pointerEvents:'none' }} />

          <div style={{ position:'relative', zIndex:2, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
            <div>
              {/* live badge */}
              <div style={{ display:'inline-flex', alignItems:'center', gap:'7px', marginBottom:'12px',
                background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.35)',
                borderRadius:'999px', padding:'4px 12px' }}>
                <span className="al-pulse" style={{ width:'7px', height:'7px', background:'#f59e0b', borderRadius:'50%', flexShrink:0 }} />
                <span style={{ fontSize:'10px', fontWeight:800, letterSpacing:'.1em', textTransform:'uppercase', color:'#92400e' }}>
                  Registo em tempo real
                </span>
              </div>
              <h1 style={{ fontWeight:900, fontSize:'clamp(20px,2.5vw,26px)', letterSpacing:'-.03em',
                color:'#0f172a', margin:'0 0 5px', lineHeight:1.1 }}>
                Logs de Atividade
              </h1>
              <p style={{ fontSize:'13px', color:'#78716c', fontWeight:500, margin:0 }}>
                {MOCK_LOGS.length} eventos registados · histórico de ações no sistema
              </p>
            </div>

            <button onClick={handleExport} disabled={exporting}
              style={{ display:'inline-flex', alignItems:'center', gap:'8px',
                padding:'11px 22px', borderRadius:'13px', fontSize:'13px', fontWeight:700,
                background:'linear-gradient(135deg,#f59e0b,#d97706)',
                color:'white', border:'none', cursor: exporting ? 'not-allowed' : 'pointer',
                boxShadow:'0 6px 20px rgba(245,158,11,0.4)', transition:'all .2s',
                fontFamily:'Figtree,sans-serif', opacity: exporting ? .8 : 1 }}
              onMouseEnter={e => { if (!exporting) { (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 10px 28px rgba(245,158,11,0.5)'; }}}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow='0 6px 20px rgba(245,158,11,0.4)'; }}>
              {exporting
                ? <><span className="al-spin-icon" style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block' }} /> Exportando…</>
                : <><DownloadIcon style={{ width:'15px', height:'15px' }} /> Exportar CSV</>
              }
            </button>
          </div>
        </div>

        {/* ══ STATS ══ */}
        <div className="al-r2">
          <StatsStrip logs={MOCK_LOGS} />
        </div>

        {/* ══ TABLE CARD ══ */}
        <div className="al-r3" style={{ background:'#fff', borderRadius:'22px',
          border:'1.5px solid #f1f5f9',
          boxShadow:'0 4px 24px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.04)',
          overflow:'hidden' }}>

          {/* Toolbar */}
          <div style={{ padding:'18px 22px', borderBottom:'1.5px solid #f1f5f9',
            display:'flex', flexDirection:'column', gap:'12px',
            background:'linear-gradient(180deg,#fafbff,#fff)' }}>

            {/* Row 1 */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
              {/* Search */}
              <div style={{ flex:1, minWidth:'220px', position:'relative' }}>
                <SearchIcon style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)',
                  width:'15px', height:'15px',
                  color: search ? '#f59e0b' : '#94a3b8', pointerEvents:'none' }} />
                <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Pesquisar utilizador, ação ou IP…"
                  style={{ width:'100%', height:'38px', borderRadius:'11px', padding:'0 36px 0 38px',
                    background: search ? '#fffbeb' : '#f8fafc',
                    border:`1.5px solid ${search ? '#fde68a' : '#e2e8f0'}`,
                    color:'#1e293b', fontSize:'13px', fontWeight:500, outline:'none',
                    fontFamily:'Figtree,sans-serif', transition:'all .2s',
                    boxShadow: search ? '0 0 0 3px rgba(245,158,11,0.12)' : 'none' }} />
                {search && (
                  <button onClick={() => { setSearch(''); setPage(1); }}
                    style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)',
                      background:'none', border:'none', cursor:'pointer', color:'#94a3b8', padding:'2px' }}>
                    <XIcon style={{ width:'13px', height:'13px' }} />
                  </button>
                )}
              </div>

              {/* Sort */}
              <button onClick={() => setSortDesc(!sortDesc)}
                style={{ display:'inline-flex', alignItems:'center', gap:'6px',
                  padding:'8px 14px', borderRadius:'10px', fontSize:'12px', fontWeight:700,
                  background:'#f8fafc', border:'1.5px solid #e2e8f0', color:'#475569',
                  cursor:'pointer', transition:'all .18s', fontFamily:'Figtree,sans-serif' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='#fde68a'; (e.currentTarget as HTMLElement).style.background='#fffbeb'; (e.currentTarget as HTMLElement).style.color='#92400e'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='#e2e8f0'; (e.currentTarget as HTMLElement).style.background='#f8fafc'; (e.currentTarget as HTMLElement).style.color='#475569'; }}>
                <ClockIcon style={{ width:'13px', height:'13px' }} />
                {sortDesc ? 'Mais recente' : 'Mais antigo'}
              </button>

              {/* Result count */}
              <div style={{ padding:'7px 14px', borderRadius:'10px', background:'#f1f5f9',
                fontSize:'12px', fontWeight:700, color:'#64748b' }}>
                <span style={{ color:'#0f172a', fontWeight:800 }}>{filtered.length}</span> resultado{filtered.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Row 2: category pills */}
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
              {CAT_FILTERS.map(f => {
                const conf = f.key !== 'all' ? CAT[f.key] : null;
                const active = catFilter === f.key;
                return (
                  <button key={f.key} className="al-filter"
                    onClick={() => { setCatFilter(f.key); setPage(1); }}
                    style={{
                      background: active
                        ? (f.key === 'all' ? '#fffbeb' : conf!.bg)
                        : '#f8fafc',
                      borderColor: active
                        ? (f.key === 'all' ? '#fde68a' : conf!.border)
                        : '#e2e8f0',
                      color: active
                        ? (f.key === 'all' ? '#92400e' : conf!.color)
                        : '#64748b',
                      boxShadow: active ? '0 2px 8px rgba(0,0,0,.06)' : 'none',
                    }}>
                    {conf && (
                      <span style={{ display:'inline-block', width:'6px', height:'6px', borderRadius:'50%',
                        background: active ? conf.color : '#cbd5e1', marginRight:'6px', verticalAlign:'middle' }} />
                    )}
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f8fafc', borderBottom:'1.5px solid #f1f5f9' }}>
                  {['Data & Hora','Utilizador','Ação','Categoria','IP · Dispositivo'].map(h => (
                    <th key={h} style={{ padding:'11px 18px', textAlign:'left',
                      fontSize:'10px', fontWeight:800, letterSpacing:'.1em',
                      textTransform:'uppercase', color:'#94a3b8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding:'60px', textAlign:'center',
                      color:'#94a3b8', fontSize:'14px', fontWeight:500 }}>
                      Nenhum log encontrado.
                    </td>
                  </tr>
                ) : paginated.map((log, i) => {
                  const cat  = CAT[log.category]  ?? CAT.auth;
                  const role = ROLE[log.role]      ?? ROLE.DOCTOR;
                  const ac   = avatarColor(log.user);
                  const isAlert = log.category === 'warning' || log.category === 'delete';

                  return (
                    <tr key={log.id} className="al-row"
                      style={{ borderBottom:'1px solid #f8fafc', animationDelay:`${i*.04}s`,
                        background: isAlert ? `${cat.lightBg}` : '#fff' }}>

                      {/* accent bar */}
                      <td style={{ padding:'14px 18px', position:'relative' }}>
                        <div className="al-accent" style={{ background:cat.color }} />
                        <div className="al-mono" style={{ fontSize:'11px', fontWeight:500, color:'#94a3b8' }}>
                          {log.time.split(' ')[0]}
                        </div>
                        <div className="al-mono" style={{ fontSize:'13px', fontWeight:700, color:'#334155', marginTop:'1px' }}>
                          {log.time.split(' ')[1]}
                        </div>
                      </td>

                      {/* User */}
                      <td style={{ padding:'14px 18px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <div style={{ width:'34px', height:'34px', borderRadius:'10px', flexShrink:0,
                            background:ac, display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:'13px', fontWeight:800, color:'white', letterSpacing:'.01em' }}>
                            {log.user.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize:'12px', fontWeight:700, color:'#1e293b',
                              maxWidth:'170px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {log.user}
                            </div>
                            <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 7px', borderRadius:'6px',
                              background:role.bg, color:role.color, border:`1px solid ${role.border}`, display:'inline-block', marginTop:'2px' }}>
                              {role.label}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td style={{ padding:'14px 18px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                          {isAlert && <AlertTriangleIcon style={{ width:'14px', height:'14px', color:cat.color, flexShrink:0 }} />}
                          <span style={{ fontSize:'13px', fontWeight:600,
                            color: isAlert ? cat.color : '#334155' }}>
                            {log.action}
                          </span>
                        </div>
                      </td>

                      {/* Category badge */}
                      <td style={{ padding:'14px 18px' }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:'5px',
                          padding:'4px 10px', borderRadius:'8px', fontSize:'11px', fontWeight:700,
                          background:cat.bg, color:cat.color, border:`1.5px solid ${cat.border}` }}>
                          {cat.icon} {cat.label}
                        </span>
                      </td>

                      {/* IP + device */}
                      <td style={{ padding:'14px 18px' }}>
                        <div className="al-mono" style={{ fontSize:'12px', fontWeight:600, color:'#475569' }}>
                          {log.ip}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'4px', marginTop:'2px' }}>
                          <MonitorIcon style={{ width:'11px', height:'11px', color:'#94a3b8' }} />
                          <span style={{ fontSize:'11px', fontWeight:500, color:'#94a3b8' }}>
                            {log.device}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ padding:'14px 22px', borderTop:'1.5px solid #f1f5f9',
            display:'flex', alignItems:'center', justifyContent:'space-between',
            background:'linear-gradient(180deg,#fff,#fafbff)' }}>
            <span style={{ fontSize:'12px', color:'#94a3b8', fontWeight:500 }}>
              Mostrando <span style={{ color:'#334155', fontWeight:800 }}>{paginated.length}</span> de{' '}
              <span style={{ color:'#334155', fontWeight:800 }}>{filtered.length}</span> logs
            </span>
            <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="al-pg-btn">
                <ChevronLeftIcon style={{ width:'15px', height:'15px' }} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className="al-pg-btn"
                  style={{
                    background: p === page ? 'linear-gradient(135deg,#f59e0b,#d97706)' : '#fff',
                    borderColor: p === page ? '#f59e0b' : '#e2e8f0',
                    color: p === page ? 'white' : '#64748b',
                    boxShadow: p === page ? '0 4px 12px rgba(245,158,11,0.35)' : 'none',
                  }}>
                  {p}
                </button>
              ))}
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="al-pg-btn">
                <ChevronRightIcon style={{ width:'15px', height:'15px' }} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default AdminLogs;