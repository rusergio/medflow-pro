import React, { useState, useEffect, useRef } from 'react';
import {
  Building2, Stethoscope, Pill, Euro,
  Clock, MapPin, Sparkles, Calendar,
  ShieldPlus, Phone, Activity,
  ArrowRight, CheckCircle,
  Zap, Heart, Flower2, Eye, Bone, Baby, Brain,
  Microscope, AlertCircle, Trophy, Users, Star,
} from 'lucide-react';

const iconSize = 20;

/* ─────────── data ─────────── */
const ESPECIALIDADES = [
  { nome: 'Medicina Geral',  Icon: Stethoscope, g1: '#3b82f6', g2: '#1d4ed8' },
  { nome: 'Cardiologia',     Icon: Heart, g1: '#ef4444', g2: '#be123c' },
  { nome: 'Dermatologia',    Icon: Sparkles, g1: '#f59e0b', g2: '#d97706' },
  { nome: 'Ginecologia',     Icon: Flower2, g1: '#ec4899', g2: '#be185d' },
  { nome: 'Oftalmologia',    Icon: Eye, g1: '#06b6d4', g2: '#0e7490' },
  { nome: 'Ortopedia',       Icon: Bone, g1: '#64748b', g2: '#334155' },
  { nome: 'Pediatria',       Icon: Baby, g1: '#10b981', g2: '#047857' },
  { nome: 'Psiquiatria',     Icon: Brain, g1: '#8b5cf6', g2: '#6d28d9' },
  { nome: 'Radiologia',      Icon: Microscope, g1: '#6366f1', g2: '#4338ca' },
  { nome: 'Urgência Geral',  Icon: AlertCircle, g1: '#f97316', g2: '#c2410c' },
];

const PRECOS = [
  { tipo: 'Consulta Geral',       valor: '50',  unit: '€', desc: 'Sem marcação prévia',  Icon: Stethoscope, popular: true  },
  { tipo: 'Especialidade',        valor: '75',  unit: '€', desc: 'Com marcação prévia',  Icon: Stethoscope, popular: false },
  { tipo: 'Exames Complementares', valor: '—',   unit: '',  desc: 'Laboratório próprio',  Icon: Microscope, popular: false },
  { tipo: 'Urgência 24h',         valor: '90',  unit: '€', desc: 'Atendimento imediato', Icon: AlertCircle, popular: false },
];

const STATS = [
  { label: 'Anos de experiência',    val: '25+',  Icon: Trophy, color: '#f59e0b' },
  { label: 'Pacientes atendidos',    val: '50k+', Icon: Users, color: '#3b82f6' },
  { label: 'Especialidades',         val: '10',   Icon: Stethoscope, color: '#10b981' },
  { label: 'Satisfação dos utentes', val: '98%',  Icon: Star, color: '#8b5cf6' },
];

const VITALS = [
  { label: 'Utentes hoje', val: 48, max: 80,  color: '#3b82f6' },
  { label: 'Médicos',      val: 12, max: 15,  color: '#10b981' },
  { label: 'Urgências',    val: 3,  max: 20,  color: '#f97316' },
  { label: 'Ocupação',     val: 73, max: 100, color: '#8b5cf6', unit: '%' },
];

/* ─────────── animated counter ─────────── */
const AnimCount: React.FC<{ target: string }> = ({ target }) => {
  const [val, setVal] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const num = parseFloat(target.replace(/[^0-9.]/g, ''));
    const suf = target.replace(/[0-9.]/g, '');
    if (isNaN(num)) { setVal(target); return; }
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return;
      done.current = true;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / 1400, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        const cur = ease * num;
        setVal(`${cur >= 10 ? Math.round(cur) : Math.round(cur * 10) / 10}${suf}`);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{val}</span>;
};

/* ─────────── canvas particles (light mode) ─────────── */
const Particles: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    const pts = Array.from({ length: 28 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.6 + 0.4, o: Math.random() * 0.15 + 0.05,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0;
        if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,130,246,${p.o})`; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 90) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(59,130,246,${0.06 * (1 - d / 90)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
};

/* ─────────── main ─────────── */
interface PatientDashboardProps {
  onNavigateToConsultas?: () => void;
  onOpenAIChat?: () => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ onNavigateToConsultas, onOpenAIChat }) => {
  const [hovEsp, setHovEsp] = useState<number | null>(null);
  const [activePrice, setActivePrice] = useState(0);
  const [clock, setClock] = useState(new Date());
  const [barsReady, setBarsReady] = useState(false);

  useEffect(() => { const id = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(id); }, []);
  useEffect(() => { const t = setTimeout(() => setBarsReady(true), 600); return () => clearTimeout(t); }, []);

  const fmtTime = (d: Date) => d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .pd { font-family: 'Outfit', sans-serif; }
        .pd .mono { font-family: 'JetBrains Mono', monospace; }

        @keyframes pd-rise {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pd-blink {
          0%, 100% { opacity: 1 } 50% { opacity: 0.4 }
        }
        @keyframes pd-shimmer {
          0% { background-position: 200% center }
          100% { background-position: -200% center }
        }
        @keyframes pd-float {
          0%, 100% { transform: translateY(0) }
          50% { transform: translateY(-8px) }
        }
        @keyframes pd-spin {
          from { transform: rotate(0deg) }
          to { transform: rotate(360deg) }
        }
        @keyframes pd-scan {
          0% { transform: translateY(-100%) }
          100% { transform: translateY(600%) }
        }

        .pd-r1 { animation: pd-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.04s both }
        .pd-r2 { animation: pd-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.10s both }
        .pd-r3 { animation: pd-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.16s both }
        .pd-r4 { animation: pd-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.22s both }
        .pd-r5 { animation: pd-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.28s both }
        .pd-r6 { animation: pd-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.34s both }
        .pd-r7 { animation: pd-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.40s both }

        .pd-glass {
          background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%);
          border: 1px solid rgba(148,163,184,0.25);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }

        .pd-lift {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s, box-shadow 0.2s;
        }
        .pd-lift:hover {
          transform: translateY(-4px) scale(1.015);
          border-color: rgba(59,130,246,0.35) !important;
          box-shadow: 0 20px 40px rgba(59,130,246,0.12), 0 0 0 1px rgba(59,130,246,0.08);
        }

        .pd-esp {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s, background 0.2s;
          cursor: pointer;
        }
        .pd-esp:hover { transform: translateY(-6px) scale(1.05); }
        .pd-esp-icon { transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); display: block; }
        .pd-esp:hover .pd-esp-icon { transform: scale(1.25) rotate(-10deg); }

        .pd-price {
          transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .pd-price.on { transform: translateY(-7px) scale(1.02); }
        .pd-price::before {
          content: '';
          position: absolute; top: 0; left: -120%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          transition: left 0.5s ease;
        }
        .pd-price:hover::before { left: 150%; }

        .pd-action {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s, box-shadow 0.2s;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .pd-action:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.08);
        }
        .pd-action-icon { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .pd-action:hover .pd-action-icon { transform: scale(1.18) rotate(-6deg); }

        .pd-tag {
          transition: all 0.2s;
          cursor: default;
        }
        .pd-tag:hover {
          background: rgba(59,130,246,0.12) !important;
          border-color: rgba(59,130,246,0.4) !important;
          color: #2563eb !important;
          transform: translateY(-1px);
        }

        .pd-scan-line {
          position: absolute; left: 0; width: 100%; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent);
          animation: pd-scan 5s linear infinite;
          pointer-events: none;
        }
        .pd-blink { animation: pd-blink 2.5s ease-in-out infinite; }
        .pd-float { animation: pd-float 5s ease-in-out infinite; }
        .pd-spin { animation: pd-spin 22s linear infinite; }

        .pd-gradient-text {
          background: linear-gradient(90deg, #2563eb 0%, #059669 50%, #7c3aed 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: pd-shimmer 5s linear infinite;
        }

        @media (max-width: 768px) {
          .pd-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .pd-actions { grid-template-columns: repeat(2, 1fr) !important; }
          .pd-especialidades { grid-template-columns: repeat(2, 1fr) !important; }
          .pd-sobre { grid-template-columns: 1fr !important; }
          .pd-precos { grid-template-columns: repeat(2, 1fr) !important; }
          .pd-farmacia { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="pd" style={{ background: '#f8fafc', minHeight: '100%', color: '#1e293b' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* ══ TOP BAR ══ */}
          

          {/* ══ HERO ══ */}
          <div className="pd-r1" style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #eff6ff 100%)', border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 4px 24px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.8)', padding: '36px 40px' }}>
            <Particles />
            <div className="pd-scan-line" />
            <div style={{ position: 'absolute', top: '-80px', right: '60px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-60px', left: '100px', width: '220px', height: '220px', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <h2 style={{ fontWeight: 900, fontSize: 'clamp(22px,3.5vw,34px)', letterSpacing: '-.03em', lineHeight: 1.1, marginBottom: '14px', color: '#0f172a' }}>
                  Bem-vindo ao seu{' '}
                  <span className="pd-gradient-text">Portal de Saúde</span>
                </h2>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.75, maxWidth: '460px', marginBottom: '22px' }}>
                  Gerencie consultas, aceda a resultados e converse com o assistente de IA médico para apoio personalizado 24h.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['Consultas Online', 'Receitas Digitais', 'Resultados de Exames', 'IA Médica 24h'].map(t => (
                    <span key={t} className="pd-tag" style={{ padding: '5px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(148,163,184,0.4)', fontSize: '12px', fontWeight: 500, color: '#475569' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* vitals card */}
              <div style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(148,163,184,0.25)', borderRadius: '18px', padding: '20px 22px', minWidth: '210px', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#64748b', marginBottom: '14px' }}>Métricas ao vivo</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {VITALS.map((v, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>{v.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{v.val}{v.unit || ''}</span>
                      </div>
                      <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '999px', background: `linear-gradient(90deg,${v.color}99,${v.color})`, width: barsReady ? `${(v.val / v.max) * 100}%` : '0%', transition: `width 1.3s cubic-bezier(.34,1.56,.64,1) ${i * 0.12}s` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══ STATS ══ */}
          <div className="pd-r2 pd-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
            {STATS.map((s, i) => (
              <div key={i} className="pd-glass pd-lift" style={{ borderRadius: '18px', padding: '20px', textAlign: 'center', cursor: 'default' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: `${s.color}20`, color: s.color, marginBottom: '10px' }}>
                  <s.Icon size={iconSize} />
                </div>
                <div style={{ fontWeight: 900, fontSize: '28px', letterSpacing: '-.04em', lineHeight: 1, color: s.color }}>
                  <AnimCount target={s.val} />
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, marginTop: '5px', lineHeight: 1.3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ══ QUICK ACTIONS ══ */}
          <div className="pd-r3 pd-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
            {[
              { icon: <Calendar style={{ width: 22, height: 22 }} />, label: 'Farmácia Online', sub: 'Medicamentos e produtos', c: '#3b82f6', bg: 'rgba(59,130,246,0.12)', onClick: onNavigateToConsultas },
              { icon: <Activity style={{ width: 22, height: 22 }} />, label: 'Resultados', sub: '2 novos', c: '#10b981', bg: 'rgba(16,185,129,0.12)', onClick: undefined },
              { icon: <Pill style={{ width: 22, height: 22 }} />, label: 'Receitas', sub: 'Ver histórico', c: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', onClick: undefined },
              { icon: <Sparkles style={{ width: 22, height: 22 }} />, label: 'Assistente IA', sub: 'Sempre disponível', c: '#f59e0b', bg: 'rgba(245,158,11,0.12)', onClick: onOpenAIChat },
            ].map((a, i) => (
              <button
                key={i}
                type="button"
                onClick={a.onClick}
                className="pd-glass pd-action"
                style={{ borderRadius: '18px', padding: '22px', border: '1px solid rgba(148,163,184,0.2)', textAlign: 'left', width: '100%', cursor: a.onClick ? 'pointer' : 'default' }}
              >
                <div className="pd-action-icon" style={{ width: '44px', height: '44px', borderRadius: '13px', background: a.bg, color: a.c, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  {a.icon}
                </div>
                <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '3px', color: '#0f172a' }}>{a.label}</p>
                <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>{a.sub}</p>
                {a.onClick && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '14px', fontSize: '11px', fontWeight: 700, color: a.c, opacity: 0.9 }}>
                    Aceder <ArrowRight style={{ width: 12, height: 12 }} />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* ══ SOBRE + HORÁRIOS ══ */}
          <div className="pd-r4" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
            <div className="pd-glass pd-lift" style={{ borderRadius: '20px', padding: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <Building2 style={{ width: 17, height: 17 }} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '16px', lineHeight: 1.1, color: '#0f172a' }}>Sobre o Hospital</p>
                  <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>Centro de excelência médica</p>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '999px', background: 'rgba(16,185,129,0.12)', color: '#047857', border: '1px solid rgba(52,211,153,0.3)' }}>
                  Acreditado
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.8, marginBottom: '20px' }}>
                O MedFlow Pro é um centro de saúde moderno dedicado a oferecer cuidados de excelência. Equipas multidisciplinares, tecnologia de ponta e um compromisso inabalável com o bem-estar dos utentes.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { icon: <Clock style={{ width: 15, height: 15 }} />, label: 'Horário', val: '8h–20h (seg–sex)', c: '#3b82f6' },
                  { icon: <MapPin style={{ width: 15, height: 15 }} />, label: 'Morada', val: 'Av. da Saúde, Lisboa', c: '#10b981' },
                  { icon: <Phone style={{ width: 15, height: 15 }} />, label: 'Contacto', val: '+351 210 000 000', c: '#f59e0b' },
                  { icon: <ShieldPlus style={{ width: 15, height: 15 }} />, label: 'Seguros', val: 'Todos os subsistemas', c: '#8b5cf6' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderRadius: '12px', background: 'rgba(248,250,252,0.9)', border: '1px solid rgba(226,232,240,0.8)' }}>
                    <span style={{ color: item.c, flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#64748b' }}>{item.label}</p>
                      <p style={{ fontSize: '12px', fontWeight: 600, marginTop: '1px', color: '#1e293b' }}>{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pd-glass pd-lift" style={{ borderRadius: '20px', padding: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                  <Clock style={{ width: 17, height: 17 }} />
                </div>
                <p style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Horários</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                {[
                  { dia: 'Segunda – Sexta', hora: '08:00 – 20:00', on: true },
                  { dia: 'Sábado', hora: '09:00 – 14:00', on: false },
                  { dia: 'Domingo', hora: 'Urgências 24h', on: false },
                ].map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '11px', background: h.on ? 'rgba(59,130,246,0.08)' : 'rgba(248,250,252,0.9)', border: `1px solid ${h.on ? 'rgba(59,130,246,0.25)' : 'rgba(226,232,240,0.8)'}` }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: h.on ? '#1d4ed8' : '#64748b' }}>{h.dia}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: h.on ? '#2563eb' : '#94a3b8' }}>{h.hora}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="pd-blink" style={{ width: '7px', height: '7px', background: '#ef4444', borderRadius: '50%', flexShrink: 0 }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#dc2626' }}>Urgência 24h</span>
                </div>
                <p className="mono" style={{ fontSize: '17px', fontWeight: 700, color: '#b91c1c', letterSpacing: '.02em' }}>+351 210 000 911</p>
              </div>
            </div>
          </div>

          {/* ══ PREÇOS ══ */}
          <div className="pd-r5">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#047857' }}>
                  <Euro style={{ width: 16, height: 16 }} />
                </div>
                <p style={{ fontWeight: 700, fontSize: '17px', color: '#0f172a' }}>Preços das Consultas</p>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>IVA incluído</span>
            </div>
            <div className="pd-precos" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
              {PRECOS.map((p, i) => (
                <div
                  key={i}
                  className={`pd-price pd-glass ${activePrice === i ? 'on' : ''}`}
                  style={{ borderRadius: '18px', padding: '22px', border: activePrice === i ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(148,163,184,0.25)', background: activePrice === i ? 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.05))' : undefined, boxShadow: activePrice === i ? '0 12px 40px rgba(59,130,246,0.15)' : undefined }}
                  onClick={() => setActivePrice(i)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: activePrice === i ? 'rgba(59,130,246,0.15)' : 'rgba(148,163,184,0.12)', color: activePrice === i ? '#2563eb' : '#64748b' }}>
                      <p.Icon size={22} />
                    </span>
                    {p.popular && (
                      <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '999px', background: activePrice === i ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.1)', color: activePrice === i ? '#1d4ed8' : '#2563eb', border: '1px solid rgba(59,130,246,0.3)' }}>Popular</span>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: activePrice === i ? '#1d4ed8' : '#64748b', marginBottom: '6px' }}>{p.tipo}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 900, fontSize: '34px', letterSpacing: '-.04em', lineHeight: 1, color: activePrice === i ? '#2563eb' : '#1e293b' }}>{p.valor}</span>
                    {p.unit && <span style={{ fontWeight: 600, fontSize: '16px', color: '#64748b' }}>{p.unit}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: activePrice === i ? '#3b82f6' : '#64748b' }}>
                    <CheckCircle style={{ width: 13, height: 13, flexShrink: 0 }} />
                    {p.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ ESPECIALIDADES ══ */}
          <div className="pd-r6">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6d28d9' }}>
                  <Stethoscope style={{ width: 16, height: 16 }} />
                </div>
                <p style={{ fontWeight: 700, fontSize: '17px', color: '#0f172a' }}>Especialidades Disponíveis</p>
              </div>
            </div>
            <div className="pd-especialidades" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '10px' }}>
              {ESPECIALIDADES.map((e, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={onNavigateToConsultas}
                  className="pd-esp"
                  style={{ borderRadius: '16px', padding: '18px 14px', textAlign: 'center', background: hovEsp === i ? `linear-gradient(135deg,${e.g1}18,${e.g2}0a)` : 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.95))', border: `1px solid ${hovEsp === i ? `${e.g1}55` : 'rgba(148,163,184,0.25)'}`, boxShadow: hovEsp === i ? `0 12px 32px rgba(0,0,0,0.06), 0 0 0 1px ${e.g1}22` : '0 1px 3px rgba(0,0,0,0.04)', cursor: 'pointer', appearance: 'none', font: 'inherit' }}
                  onMouseEnter={() => setHovEsp(i)}
                  onMouseLeave={() => setHovEsp(null)}
                >
                  <span className="pd-esp-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', color: e.g1 }}>
                    <e.Icon size={28} />
                  </span>
                  <p style={{ fontSize: '11px', fontWeight: 700, lineHeight: 1.3, color: hovEsp === i ? '#0f172a' : '#475569' }}>{e.nome}</p>
                  {hovEsp === i && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginTop: '8px', fontSize: '10px', fontWeight: 700, color: e.g1 }}>
                      Marcar <ArrowRight style={{ width: 10, height: 10 }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ══ FARMÁCIA + IA ══ */}
          <div className="pd-r7 pd-farmacia" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="pd-glass pd-lift" style={{ borderRadius: '20px', padding: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#047857' }}>
                  <Pill style={{ width: 17, height: 17 }} />
                </div>
                <p style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Farmácia</p>
              </div>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.8, marginBottom: '18px' }}>
                Farmácia interna disponível. Receitas digitais com levantamento direto ou em farmácias aderentes de todo o país.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
                {['Receitas digitais', 'Medicamentos genéricos', 'Ortopedia e apoios', 'Dermofarmácia'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', fontWeight: 500, color: '#475569' }}>
                    <CheckCircle style={{ width: 14, height: 14, color: '#10b981', flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenAIChat}
              className="pd-lift"
              style={{ position: 'relative', overflow: 'hidden', borderRadius: '20px', padding: '26px', textAlign: 'left', width: '100%', cursor: 'pointer', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 60%, #eff6ff 100%)', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 4px 24px rgba(139,92,246,0.12)' }}
            >
              <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} className="pd-float" />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6d28d9' }}>
                    <Sparkles style={{ width: 17, height: 17 }} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Assistente IA Médico</p>
                  <span style={{ marginLeft: 'auto', fontSize: '9px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: '999px', background: 'rgba(139,92,246,0.2)', color: '#6d28d9', border: '1px solid rgba(139,92,246,0.35)' }}>Beta</span>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.8, marginBottom: '18px' }}>
                  Esclareça dúvidas sobre saúde, sintomas, medicamentos e nutrição com o assistente especializado.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '22px' }}>
                  {['Sintomas', 'Medicamentos', 'Nutrição', 'Bem-estar'].map(t => (
                    <span key={t} className="pd-tag" style={{ padding: '5px 12px', borderRadius: '999px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', fontSize: '11px', fontWeight: 600, color: '#6d28d9' }}>
                      {t}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', boxShadow: '0 8px 24px rgba(109,40,217,0.35)' }}>
                  <Zap style={{ width: 15, height: 15 }} /> Iniciar conversa
                </div>
              </div>
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default PatientDashboard;
