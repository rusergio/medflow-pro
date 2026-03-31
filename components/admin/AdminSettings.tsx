import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  BuildingIcon, ClockIcon, ShieldIcon, BellIcon,
  DatabaseIcon, GlobeIcon, PaletteIcon, UserCogIcon,
  CheckIcon, SaveIcon, MailIcon, PhoneIcon,
  MapPinIcon, HashIcon, AlertTriangleIcon,
  LockIcon, EyeOffIcon, RefreshCwIcon,
  MonitorIcon, SmartphoneIcon, SunIcon,
  ToggleLeftIcon, ToggleRightIcon, ChevronRightIcon,
  ActivityIcon, CalendarIcon, HeartPulseIcon,
} from 'lucide-react';

/* ─────────────────────────────────────────
   Toggle switch
───────────────────────────────────────── */
const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; color?: string }> = ({
  checked, onChange, color = '#f59e0b',
}) => (
  <button type="button" onClick={() => onChange(!checked)}
    style={{
      width:'44px', height:'24px', borderRadius:'999px', border:'none', cursor:'pointer',
      background: checked ? color : '#e2e8f0',
      position:'relative', flexShrink:0,
      transition:'background .25s cubic-bezier(.34,1.56,.64,1)',
      boxShadow: checked ? `0 2px 8px ${color}55` : 'inset 0 1px 3px rgba(0,0,0,.12)',
    }}>
    <span style={{
      position:'absolute', top:'3px',
      left: checked ? '23px' : '3px',
      width:'18px', height:'18px', borderRadius:'50%',
      background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,.2)',
      transition:'left .25s cubic-bezier(.34,1.56,.64,1)',
    }} />
  </button>
);

/* ─────────────────────────────────────────
   Section card
───────────────────────────────────────── */
const Section: React.FC<{
  icon: React.ReactNode; title: string; sub: string;
  color?: string; bg?: string; border?: string;
  children: React.ReactNode; delay?: number;
}> = ({ icon, title, sub, color = '#f59e0b', bg = '#fffbeb', border = '#fde68a', children, delay = 0 }) => (
  <div className="as-card" style={{ animationDelay:`${delay}s`,
    background:'#fff', borderRadius:'20px', border:'1.5px solid #f1f5f9',
    boxShadow:'0 2px 12px rgba(0,0,0,.05)', overflow:'hidden' }}>
    {/* card header */}
    <div style={{ padding:'20px 24px 16px', borderBottom:'1.5px solid #f8fafc',
      background:'linear-gradient(180deg,#fafbff,#fff)', display:'flex', alignItems:'center', gap:'12px' }}>
      <div style={{ width:'38px', height:'38px', borderRadius:'12px', background:bg,
        display:'flex', alignItems:'center', justifyContent:'center', color, border:`1.5px solid ${border}`, flexShrink:0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontWeight:800, fontSize:'15px', color:'#0f172a', margin:0, lineHeight:1.1 }}>{title}</p>
        <p style={{ fontSize:'12px', color:'#94a3b8', margin:0, fontWeight:500 }}>{sub}</p>
      </div>
    </div>
    <div style={{ padding:'22px 24px' }}>{children}</div>
  </div>
);

/* ─────────────────────────────────────────
   Setting row (toggle)
───────────────────────────────────────── */
const SettingRow: React.FC<{
  icon: React.ReactNode; label: string; sub: string;
  checked: boolean; onChange: (v: boolean) => void;
  color?: string; tag?: string; tagColor?: string;
}> = ({ icon, label, sub, checked, onChange, color, tag, tagColor = '#059669' }) => (
  <div style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 0',
    borderBottom:'1px solid #f8fafc' }}
    className="as-row">
    <div style={{ width:'34px', height:'34px', borderRadius:'10px', flexShrink:0,
      background: checked ? (color ? `${color}18` : '#fffbeb') : '#f8fafc',
      display:'flex', alignItems:'center', justifyContent:'center',
      color: checked ? (color || '#f59e0b') : '#94a3b8',
      border:`1.5px solid ${checked ? (color ? `${color}35` : '#fde68a') : '#f1f5f9'}`,
      transition:'all .2s' }}>
      {icon}
    </div>
    <div style={{ flex:1 }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        <span style={{ fontSize:'13px', fontWeight:700, color:'#1e293b' }}>{label}</span>
        {tag && (
          <span style={{ fontSize:'10px', fontWeight:700, padding:'2px 7px', borderRadius:'6px',
            background:`${tagColor}18`, color:tagColor, border:`1px solid ${tagColor}35` }}>
            {tag}
          </span>
        )}
      </div>
      <span style={{ fontSize:'12px', color:'#94a3b8', fontWeight:500 }}>{sub}</span>
    </div>
    <Toggle checked={checked} onChange={onChange} color={color} />
  </div>
);

/* ─────────────────────────────────────────
   Field
───────────────────────────────────────── */
const Field: React.FC<{
  label: string; icon?: React.ReactNode; children: React.ReactNode; required?: boolean;
}> = ({ label, icon, children, required }) => (
  <div>
    <label style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'12px',
      fontWeight:700, color:'#64748b', marginBottom:'7px' }}>
      {icon && <span style={{ color:'#94a3b8' }}>{icon}</span>}
      {label}{required && <span style={{ color:'#ef4444' }}>*</span>}
    </label>
    {children}
  </div>
);

const StyledInput: React.FC<{
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; icon?: React.ReactNode;
}> = ({ value, onChange, placeholder, type = 'text', icon }) => (
  <div style={{ position:'relative' }}>
    {icon && (
      <span style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)',
        color:'#94a3b8', pointerEvents:'none', display:'flex' }}>
        {icon}
      </span>
    )}
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width:'100%', height:'38px',
        padding:`0 12px 0 ${icon ? '34px' : '12px'}`,
        borderRadius:'11px', border:'1.5px solid #e2e8f0',
        fontSize:'13px', fontWeight:500, color:'#1e293b',
        background:'#f8fafc', outline:'none', fontFamily:'Figtree,sans-serif',
        transition:'all .18s', boxSizing:'border-box' }}
      onFocus={e => { e.currentTarget.style.borderColor='#fde68a'; e.currentTarget.style.background='#fffbeb'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(245,158,11,0.12)'; }}
      onBlur={e  => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.boxShadow='none'; }}
    />
  </div>
);

/* ─────────────────────────────────────────
   Main
───────────────────────────────────────── */
const AdminSettings: React.FC = () => {
  /* Hospital info */
  const [hospitalName, setHospitalName] = useState('Hospital MedFlow');
  const [hospitalEmail, setHospitalEmail] = useState('geral@medflowpro.pt');
  const [hospitalPhone, setHospitalPhone] = useState('+351 210 000 000');
  const [hospitalAddress, setHospitalAddress] = useState('Av. da Liberdade, 110, Lisboa');
  const [taxId, setTaxId] = useState('500 123 456');
  const [timezone, setTimezone] = useState('Europe/Lisbon');
  const [language, setLanguage] = useState('pt-PT');

  /* Horários */
  const [workStart, setWorkStart] = useState('08:00');
  const [workEnd,   setWorkEnd]   = useState('18:00');
  const [weekend,   setWeekend]   = useState(false);
  const [apptDuration, setApptDuration] = useState('30');

  /* Segurança */
  const [strongPass,   setStrongPass]   = useState(true);
  const [twoFactor,    setTwoFactor]    = useState(false);
  const [sessionLimit, setSessionLimit] = useState(true);
  const [logMandatory, setLogMandatory] = useState(true);
  const [ipWhitelist,  setIpWhitelist]  = useState(false);
  const [autoLogout,   setAutoLogout]   = useState(true);

  /* Notificações */
  const [emailNotif,   setEmailNotif]   = useState(true);
  const [smsNotif,     setSmsNotif]     = useState(false);
  const [pushNotif,    setPushNotif]    = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);

  /* Sistema */
  const [autoBackup,   setAutoBackup]   = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [betaFeatures, setBetaFeatures] = useState(false);
  const [darkMode,     setDarkMode]     = useState(false);
  const [compactView,  setCompactView]  = useState(false);

  /* Save state */
  const [saved,   setSaved]   = useState(false);
  const [saving,  setSaving]  = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }, 1000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap');
        .as-root { font-family:'Figtree',sans-serif; }
        @keyframes as-rise  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes as-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes as-pop   { 0%{transform:scale(.8);opacity:0} 60%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        .as-r1{animation:as-rise .44s cubic-bezier(.22,1,.36,1) .00s both}
        .as-r2{animation:as-rise .44s cubic-bezier(.22,1,.36,1) .06s both}
        .as-r3{animation:as-rise .44s cubic-bezier(.22,1,.36,1) .12s both}
        .as-r4{animation:as-rise .44s cubic-bezier(.22,1,.36,1) .18s both}
        .as-r5{animation:as-rise .44s cubic-bezier(.22,1,.36,1) .24s both}
        .as-r6{animation:as-rise .44s cubic-bezier(.22,1,.36,1) .30s both}
        .as-r7{animation:as-rise .44s cubic-bezier(.22,1,.36,1) .36s both}
        .as-card {
          animation:as-rise .44s cubic-bezier(.22,1,.36,1) both;
          transition:box-shadow .2s;
        }
        .as-card:hover { box-shadow:0 8px 32px rgba(0,0,0,.08) !important; }
        .as-row { transition:background .15s; border-radius:10px; margin:0 -8px; padding-left:8px !important; padding-right:8px !important; }
        .as-row:hover { background:#f8fafc !important; }
        .as-row:last-child { border-bottom:none !important; }
        .as-spin-icon { animation:as-spin .8s linear infinite; }
        .as-pop { animation:as-pop .3s cubic-bezier(.34,1.56,.64,1) both; }
        select.as-select {
          height:38px; border-radius:11px; border:1.5px solid #e2e8f0;
          padding:0 12px; font-size:13px; font-weight:500; color:#1e293b;
          background:#f8fafc; outline:none; font-family:'Figtree',sans-serif;
          appearance:none; width:100%; cursor:pointer; transition:all .18s;
        }
        select.as-select:focus {
          border-color:#fde68a; background:#fffbeb; box-shadow:0 0 0 3px rgba(245,158,11,0.12);
        }
      `}</style>

      <div className="as-root" style={{ maxWidth:'820px', display:'flex', flexDirection:'column', gap:'16px', paddingBottom:'48px' }}>

        {/* ── Header ── */}
        <div className="as-r1" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'14px' }}>
          <div>
            <h1 style={{ fontWeight:900, fontSize:'clamp(20px,2.5vw,26px)', letterSpacing:'-.03em', color:'#0f172a', margin:0, lineHeight:1.1 }}>
              Configurações do Sistema
            </h1>
            <p style={{ fontSize:'13px', color:'#64748b', margin:'4px 0 0', fontWeight:500 }}>
              Ajustes gerais, segurança e preferências do hospital
            </p>
          </div>
          {/* Save button */}
          <button onClick={handleSave} disabled={saving}
            style={{ display:'inline-flex', alignItems:'center', gap:'8px',
              padding:'11px 24px', borderRadius:'13px', fontSize:'13px', fontWeight:800,
              background: saved
                ? 'linear-gradient(135deg,#10b981,#059669)'
                : 'linear-gradient(135deg,#f59e0b,#d97706)',
              color:'white', border:'none', cursor: saving ? 'wait' : 'pointer',
              boxShadow: saved ? '0 6px 20px rgba(16,185,129,0.4)' : '0 6px 20px rgba(245,158,11,0.4)',
              transition:'all .3s', fontFamily:'Figtree,sans-serif', minWidth:'170px',
              justifyContent:'center' }}
            onMouseEnter={e => { if (!saving && !saved) { (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; }}}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='translateY(0)'; }}>
            {saving
              ? <><span className="as-spin-icon" style={{ width:'15px', height:'15px', border:'2px solid rgba(255,255,255,.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block' }} /> A guardar…</>
              : saved
                ? <><CheckIcon style={{ width:'16px', height:'16px' }} className="as-pop" /> Guardado!</>
                : <><SaveIcon style={{ width:'15px', height:'15px' }} /> Guardar Alterações</>
            }
          </button>
        </div>

        {/* ── 1. Hospital info ── */}
        <Section icon={<BuildingIcon style={{width:'18px',height:'18px'}}/>}
          title="Informações do Hospital" sub="Nome, contactos e identificação fiscal"
          color="#f59e0b" bg="#fffbeb" border="#fde68a" delay={.04}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
            <div style={{ gridColumn:'1 / -1' }}>
              <Field label="Nome do Hospital" required icon={<BuildingIcon style={{width:'12px',height:'12px'}}/>}>
                <StyledInput value={hospitalName} onChange={setHospitalName}
                  placeholder="Ex: Hospital MedFlow" icon={<BuildingIcon style={{width:'14px',height:'14px'}}/>} />
              </Field>
            </div>
            <Field label="Email de Contacto" icon={<MailIcon style={{width:'12px',height:'12px'}}/>}>
              <StyledInput value={hospitalEmail} onChange={setHospitalEmail}
                type="email" placeholder="geral@hospital.pt"
                icon={<MailIcon style={{width:'14px',height:'14px'}}/>} />
            </Field>
            <Field label="Telefone" icon={<PhoneIcon style={{width:'12px',height:'12px'}}/>}>
              <StyledInput value={hospitalPhone} onChange={setHospitalPhone}
                placeholder="+351 210 000 000"
                icon={<PhoneIcon style={{width:'14px',height:'14px'}}/>} />
            </Field>
            <div style={{ gridColumn:'1 / -1' }}>
              <Field label="Morada" icon={<MapPinIcon style={{width:'12px',height:'12px'}}/>}>
                <StyledInput value={hospitalAddress} onChange={setHospitalAddress}
                  placeholder="Av. da Liberdade, 110, Lisboa"
                  icon={<MapPinIcon style={{width:'14px',height:'14px'}}/>} />
              </Field>
            </div>
            <Field label="NIF / NIPC" icon={<HashIcon style={{width:'12px',height:'12px'}}/>}>
              <StyledInput value={taxId} onChange={setTaxId}
                placeholder="500 123 456"
                icon={<HashIcon style={{width:'14px',height:'14px'}}/>} />
            </Field>
            <Field label="Fuso Horário">
              <div style={{ position:'relative' }}>
                <select className="as-select" value={timezone} onChange={e => setTimezone(e.target.value)}>
                  <option value="Europe/Lisbon">Europe/Lisbon (UTC+0/+1)</option>
                  <option value="Europe/Madrid">Europe/Madrid (UTC+1/+2)</option>
                  <option value="America/Sao_Paulo">America/São Paulo (UTC-3)</option>
                  <option value="UTC">UTC</option>
                </select>
                <GlobeIcon style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)',
                  width:'14px', height:'14px', color:'#94a3b8', pointerEvents:'none' }} />
              </div>
            </Field>
            <Field label="Idioma do Sistema">
              <div style={{ position:'relative' }}>
                <select className="as-select" value={language} onChange={e => setLanguage(e.target.value)}>
                  <option value="pt-PT">Português (Portugal)</option>
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>
                <GlobeIcon style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)',
                  width:'14px', height:'14px', color:'#94a3b8', pointerEvents:'none' }} />
              </div>
            </Field>
          </div>
        </Section>

        {/* ── 2. Horários ── */}
        <Section icon={<ClockIcon style={{width:'18px',height:'18px'}}/>}
          title="Horário de Funcionamento" sub="Turnos, disponibilidade e duração de consultas"
          color="#3b82f6" bg="#eff6ff" border="#bfdbfe" delay={.10}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px', marginBottom:'16px' }}>
            <Field label="Abertura">
              <input type="time" value={workStart} onChange={e => setWorkStart(e.target.value)}
                style={{ width:'100%', height:'38px', borderRadius:'11px', border:'1.5px solid #e2e8f0',
                  padding:'0 12px', fontSize:'13px', fontWeight:600, color:'#1e293b',
                  background:'#f8fafc', outline:'none', fontFamily:'Figtree,sans-serif', boxSizing:'border-box' }}
                onFocus={e => { e.currentTarget.style.borderColor='#bfdbfe'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)'; }}
                onBlur={e  => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.boxShadow='none'; }} />
            </Field>
            <Field label="Encerramento">
              <input type="time" value={workEnd} onChange={e => setWorkEnd(e.target.value)}
                style={{ width:'100%', height:'38px', borderRadius:'11px', border:'1.5px solid #e2e8f0',
                  padding:'0 12px', fontSize:'13px', fontWeight:600, color:'#1e293b',
                  background:'#f8fafc', outline:'none', fontFamily:'Figtree,sans-serif', boxSizing:'border-box' }}
                onFocus={e => { e.currentTarget.style.borderColor='#bfdbfe'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)'; }}
                onBlur={e  => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.boxShadow='none'; }} />
            </Field>
            <Field label="Duração Consulta (min)">
              <div style={{ position:'relative' }}>
                <select className="as-select" value={apptDuration} onChange={e => setApptDuration(e.target.value)}>
                  {['15','20','30','45','60'].map(v => <option key={v} value={v}>{v} minutos</option>)}
                </select>
                <CalendarIcon style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)',
                  width:'14px', height:'14px', color:'#94a3b8', pointerEvents:'none' }} />
              </div>
            </Field>
          </div>
          <SettingRow
            icon={<CalendarIcon style={{width:'15px',height:'15px'}}/>}
            label="Funcionamento ao Fim de Semana"
            sub="Sábado e domingo com horário reduzido"
            checked={weekend} onChange={setWeekend} color="#3b82f6" />
        </Section>

        {/* ── 3. Segurança ── */}
        <Section icon={<ShieldIcon style={{width:'18px',height:'18px'}}/>}
          title="Segurança & Autenticação" sub="Políticas de acesso, senha e sessões"
          color="#dc2626" bg="#fef2f2" border="#fecaca" delay={.16}>
          <SettingRow icon={<LockIcon style={{width:'15px',height:'15px'}}/>}
            label="Exigir senha forte" sub="Mínimo 8 caracteres, maiúsculas e símbolos"
            checked={strongPass} onChange={setStrongPass} color="#dc2626" tag="Recomendado" />
          <SettingRow icon={<ShieldIcon style={{width:'15px',height:'15px'}}/>}
            label="Autenticação de 2 fatores" sub="OTP por email ao fazer login"
            checked={twoFactor} onChange={setTwoFactor} color="#dc2626" tag="2FA" />
          <SettingRow icon={<MonitorIcon style={{width:'15px',height:'15px'}}/>}
            label="Limite de sessões simultâneas" sub="Máximo de 1 sessão ativa por utilizador"
            checked={sessionLimit} onChange={setSessionLimit} color="#dc2626" />
          <SettingRow icon={<ActivityIcon style={{width:'15px',height:'15px'}}/>}
            label="Log de atividades obrigatório" sub="Regista todas as ações no sistema"
            checked={logMandatory} onChange={setLogMandatory} color="#dc2626" />
          <SettingRow icon={<GlobeIcon style={{width:'15px',height:'15px'}}/>}
            label="Whitelist de IPs" sub="Restringir acesso a endereços IP autorizados"
            checked={ipWhitelist} onChange={setIpWhitelist} color="#dc2626" />
          <SettingRow icon={<ClockIcon style={{width:'15px',height:'15px'}}/>}
            label="Logout automático por inatividade" sub="Encerrar sessão após 30 min sem atividade"
            checked={autoLogout} onChange={setAutoLogout} color="#dc2626" />
        </Section>

        {/* ── 4. Notificações ── */}
        <Section icon={<BellIcon style={{width:'18px',height:'18px'}}/>}
          title="Notificações & Alertas" sub="Canais de comunicação e preferências de envio"
          color="#8b5cf6" bg="#f5f3ff" border="#ddd6fe" delay={.22}>
          <SettingRow icon={<MailIcon style={{width:'15px',height:'15px'}}/>}
            label="Notificações por email" sub="Alertas e relatórios para o email do admin"
            checked={emailNotif} onChange={setEmailNotif} color="#8b5cf6" />
          <SettingRow icon={<SmartphoneIcon style={{width:'15px',height:'15px'}}/>}
            label="Notificações por SMS" sub="Envio de SMS para eventos críticos"
            checked={smsNotif} onChange={setSmsNotif} color="#8b5cf6" tag="Pago" tagColor="#f59e0b" />
          <SettingRow icon={<BellIcon style={{width:'15px',height:'15px'}}/>}
            label="Notificações push" sub="Alertas no browser e app móvel"
            checked={pushNotif} onChange={setPushNotif} color="#8b5cf6" />
          <SettingRow icon={<AlertTriangleIcon style={{width:'15px',height:'15px'}}/>}
            label="Apenas alertas críticos" sub="Suprimir notificações de baixa prioridade"
            checked={criticalOnly} onChange={setCriticalOnly} color="#8b5cf6" />
          <SettingRow icon={<CalendarIcon style={{width:'15px',height:'15px'}}/>}
            label="Relatório semanal automático" sub="Envio de sumário toda segunda-feira às 08h"
            checked={weeklyReport} onChange={setWeeklyReport} color="#8b5cf6" />
        </Section>

        {/* ── 5. Sistema ── */}
        <Section icon={<DatabaseIcon style={{width:'18px',height:'18px'}}/>}
          title="Sistema & Dados" sub="Backups, manutenção e funcionalidades experimentais"
          color="#10b981" bg="#ecfdf5" border="#a7f3d0" delay={.28}>
          <SettingRow icon={<DatabaseIcon style={{width:'15px',height:'15px'}}/>}
            label="Backup automático diário" sub="Cópia de segurança às 03h00 todos os dias"
            checked={autoBackup} onChange={setAutoBackup} color="#10b981" tag="Ativo" />
          <SettingRow icon={<RefreshCwIcon style={{width:'15px',height:'15px'}}/>}
            label="Modo de manutenção" sub="Bloqueia acessos enquanto o sistema é atualizado"
            checked={maintenanceMode} onChange={setMaintenanceMode} color="#f97316"
            tag={maintenanceMode ? 'ATIVO' : undefined} tagColor="#f97316" />
          <SettingRow icon={<ActivityIcon style={{width:'15px',height:'15px'}}/>}
            label="Funcionalidades beta" sub="Acesso antecipado a novos módulos em teste"
            checked={betaFeatures} onChange={setBetaFeatures} color="#10b981" tag="Beta" tagColor="#6366f1" />
          <SettingRow icon={<PaletteIcon style={{width:'15px',height:'15px'}}/>}
            label="Vista compacta" sub="Reduz o espaçamento para mostrar mais informação"
            checked={compactView} onChange={setCompactView} color="#10b981" />
        </Section>

        {/* ── Danger zone ── */}
        <div className="as-r7" style={{ borderRadius:'20px', border:'1.5px solid #fecaca',
          background:'#fff5f5', padding:'22px 24px', display:'flex', alignItems:'center',
          justifyContent:'space-between', flexWrap:'wrap', gap:'14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ width:'38px', height:'38px', borderRadius:'12px', background:'#fef2f2',
              border:'1.5px solid #fecaca', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <AlertTriangleIcon style={{ width:'18px', height:'18px', color:'#dc2626' }} />
            </div>
            <div>
              <p style={{ fontWeight:800, fontSize:'14px', color:'#dc2626', margin:0 }}>Zona de Perigo</p>
              <p style={{ fontSize:'12px', color:'#ef4444', margin:0, fontWeight:500, opacity:.8 }}>
                Ações irreversíveis — proceder com cautela
              </p>
            </div>
          </div>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
            <button style={{ padding:'8px 18px', borderRadius:'11px', fontSize:'12px', fontWeight:700,
              background:'#fff', border:'1.5px solid #fecaca', color:'#dc2626', cursor:'pointer',
              fontFamily:'Figtree,sans-serif', transition:'all .18s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='#fef2f2'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='#fff'; }}>
              Limpar cache do sistema
            </button>
            <button style={{ padding:'8px 18px', borderRadius:'11px', fontSize:'12px', fontWeight:700,
              background:'#fef2f2', border:'1.5px solid #fecaca', color:'#dc2626', cursor:'pointer',
              fontFamily:'Figtree,sans-serif', transition:'all .18s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='#fee2e2'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='#fef2f2'; }}>
              Repor configurações padrão
            </button>
          </div>
        </div>

        {/* ── Floating save bar (appears on scroll) ── */}
        <div style={{ position:'sticky', bottom:'24px', display:'flex', justifyContent:'flex-end', pointerEvents:'none' }}>
          <button onClick={handleSave} disabled={saving}
            style={{ pointerEvents:'all', display:'inline-flex', alignItems:'center', gap:'8px',
              padding:'12px 26px', borderRadius:'14px', fontSize:'13px', fontWeight:800,
              background: saved ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#f59e0b,#d97706)',
              color:'white', border:'none', cursor: saving ? 'wait' : 'pointer',
              boxShadow: saved ? '0 8px 28px rgba(16,185,129,.5)' : '0 8px 28px rgba(245,158,11,.5)',
              transition:'all .3s', fontFamily:'Figtree,sans-serif' }}>
            {saving
              ? <><span className="as-spin-icon" style={{ width:'15px', height:'15px', border:'2px solid rgba(255,255,255,.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block' }} /> A guardar…</>
              : saved
                ? <><CheckIcon style={{ width:'16px', height:'16px' }} /> Guardado!</>
                : <><SaveIcon style={{ width:'15px', height:'15px' }} /> Guardar Alterações</>
            }
          </button>
        </div>

      </div>
    </>
  );
};

export default AdminSettings;