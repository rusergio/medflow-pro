import React, { useState } from 'react';
import {
  BellIcon, MailIcon, GlobeIcon, ShieldIcon,
  MonitorIcon, CheckIcon, LogOutIcon, ChevronRightIcon,
  BellOffIcon, Volume2Icon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─────────────────────────────────────────────
   Toggle Switch
───────────────────────────────────────────── */
interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={[
      'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent',
      'transition-colors duration-200 ease-in-out outline-none',
      'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      checked ? 'bg-primary' : 'bg-slate-200 dark:bg-white/20',
      disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
    ].join(' ')}
  >
    <span className={[
      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md',
      'transform transition-transform duration-200 ease-in-out',
      checked ? 'translate-x-5' : 'translate-x-0',
    ].join(' ')} />
  </button>
);

/* ─────────────────────────────────────────────
   SettingRow — single toggle row
───────────────────────────────────────────── */
interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon, label, description, checked, onChange, disabled,
}) => (
  <div className="flex items-center gap-4 py-3.5">
    <span className={[
      'w-9 h-9 rounded-xl flex items-center justify-center flex-none transition-colors duration-200',
      checked
        ? 'bg-primary/10 text-primary'
        : 'bg-slate-100 dark:bg-white/8 text-slate-400',
    ].join(' ')}>
      {icon}
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</p>
      {description && (
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      )}
    </div>
    <Toggle checked={checked} onChange={onChange} disabled={disabled} />
  </div>
);

/* ─────────────────────────────────────────────
   SectionBlock
───────────────────────────────────────────── */
interface SectionBlockProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const SectionBlock: React.FC<SectionBlockProps> = ({ icon, title, children }) => (
  <div className="rounded-2xl border-2 border-slate-100 dark:border-white/10 overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-white/3">
      <span className="w-7 h-7 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400">
        {icon}
      </span>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{title}</p>
    </div>
    <div className="px-5 divide-y divide-slate-100 dark:divide-white/8">
      {children}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Custom Select
───────────────────────────────────────────── */
interface LangOption { value: string; label: string; flagUrl: string; }

const LANGS: LangOption[] = [
  {
    value: 'pt-PT',
    label: 'Português (Portugal)',
    flagUrl: 'https://flagcdn.com/w40/pt.png',
  },
  {
    value: 'es',
    label: 'Español',
    flagUrl: 'https://flagcdn.com/w40/es.png',
  },
  {
    value: 'en',
    label: 'English',
    flagUrl: 'https://flagcdn.com/w40/us.png',
  },
];

interface LangSelectProps {
  value: string;
  onChange: (v: string) => void;
}

const LangSelect: React.FC<LangSelectProps> = ({ value, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const selected = LANGS.find((l) => l.value === value) ?? LANGS[0];

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          borderRadius: '12px',
          border: `2px solid ${open ? 'var(--primary, #3b82f6)' : '#e2e8f0'}`,
          background: 'white',
          cursor: 'pointer',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: open ? '0 4px 12px rgba(59,130,246,0.15)' : 'none',
        }}
      >
        <img
          src={selected.flagUrl}
          alt={selected.label}
          style={{ width: '24px', height: '16px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0 }}
        />
        <span style={{ flex: 1, textAlign: 'left', fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>
          {selected.label}
        </span>
        <ChevronRightIcon
          style={{
            width: '16px', height: '16px', color: '#94a3b8', flexShrink: 0,
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          zIndex: 9999,
          background: 'white',
          borderRadius: '12px',
          border: '2px solid #f1f5f9',
          boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          animation: 'fadeDropIn 0.15s ease forwards',
        }}>
          {LANGS.map((lang) => (
            <button
              key={lang.value}
              type="button"
              onClick={() => { onChange(lang.value); setOpen(false); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: lang.value === value ? 'rgba(59,130,246,0.08)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.15s',
                color: lang.value === value ? '#3b82f6' : '#334155',
              }}
              onMouseEnter={(e) => {
                if (lang.value !== value) (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                if (lang.value !== value) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <img
                src={lang.flagUrl}
                alt={lang.label}
                style={{ width: '24px', height: '16px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0 }}
              />
              <span style={{ flex: 1, textAlign: 'left', fontSize: '14px', fontWeight: lang.value === value ? 600 : 400 }}>
                {lang.label}
              </span>
              {lang.value === value && <CheckIcon style={{ width: '16px', height: '16px', flexShrink: 0 }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Toast
───────────────────────────────────────────── */
interface ToastProps {
  show: boolean;
}
const SavedToast: React.FC<ToastProps> = ({ show }) => (
  <div className={[
    'fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl',
    'bg-slate-800 dark:bg-white text-white dark:text-slate-800',
    'text-sm font-medium shadow-2xl transition-all duration-300',
    show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none',
  ].join(' ')}>
    <CheckIcon className="w-4 h-4 text-green-400 dark:text-green-600" />
    Preferências salvas
  </div>
);

/* ─────────────────────────────────────────────
   Main
───────────────────────────────────────────── */
const UserSettings: React.FC = () => {
  const [notifications, setNotifications]   = useState(true);
  const [emailAlerts,   setEmailAlerts]      = useState(true);
  const [sounds,        setSounds]           = useState(false);
  const [lang,          setLang]             = useState('pt-PT');
  const [saving,        setSaving]           = useState(false);
  const [saved,         setSaved]            = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800)); // mock
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2800);
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        .fade-in   { animation: fadeIn 0.35s ease forwards; }
        .stagger-1 { animation: fadeIn 0.35s ease 0.05s both; }
        .stagger-2 { animation: fadeIn 0.35s ease 0.1s  both; }
        .stagger-3 { animation: fadeIn 0.35s ease 0.15s both; }
        .stagger-4 { animation: fadeIn 0.35s ease 0.2s  both; }
      `}</style>

      <div className="space-y-6 max-w-xl">

        {/* Header */}
        <div className="fade-in">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Configurações</h1>
          <p className="text-sm text-slate-400 mt-0.5">Preferências da sua conta</p>
        </div>

        {/* Notifications */}
        <div className="stagger-1">
          <SectionBlock icon={<BellIcon className="w-3.5 h-3.5" />} title="Notificações">
            <SettingRow
              icon={<BellIcon className="w-4 h-4" />}
              label="Notificações no sistema"
              description="Avisos de consultas e atualizações"
              checked={notifications}
              onChange={setNotifications}
            />
            <SettingRow
              icon={<MailIcon className="w-4 h-4" />}
              label="Alertas por email"
              description="Receba resumos e lembretes no seu email"
              checked={emailAlerts}
              onChange={setEmailAlerts}
            />
            <SettingRow
              icon={<Volume2Icon className="w-4 h-4" />}
              label="Sons do sistema"
              description="Alertas sonoros para novos eventos"
              checked={sounds}
              onChange={setSounds}
            />
          </SectionBlock>
        </div>

        {/* Language */}
        <div className="stagger-2">
          <SectionBlock icon={<GlobeIcon className="w-3.5 h-3.5" />} title="Idioma">
            <div className="py-4">
              <p className="text-xs text-slate-400 mb-3">
                Idioma utilizado na interface do sistema.
              </p>
              <LangSelect value={lang} onChange={setLang} />
            </div>
          </SectionBlock>
        </div>

        {/* Session */}
        <div className="stagger-3">
          <SectionBlock icon={<ShieldIcon className="w-3.5 h-3.5" />} title="Sessão">
            <div className="py-4 space-y-4">
              {/* Session info row */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                <MonitorIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Sessão atual</p>
                  <p className="text-[11px] text-slate-400 truncate">Chrome — Lisboa, PT · Agora</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
              </div>

              <p className="text-xs text-slate-400">
                Sua sessão expira após um período de inatividade por segurança.
              </p>

              <button
                type="button"
                className={[
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium',
                  'border-red-100 dark:border-red-900/40 text-red-500',
                  'hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800',
                  'transition-all duration-200',
                ].join(' ')}
              >
                <LogOutIcon className="w-4 h-4" />
                Encerrar outras sessões
              </button>
            </div>
          </SectionBlock>
        </div>

        {/* Save */}
        <div className="stagger-4">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full h-10 rounded-xl text-sm font-semibold"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Salvando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4" />
                Salvar preferências
              </span>
            )}
          </Button>
        </div>

      </div>

      <SavedToast show={saved} />
    </>
  );
};

export default UserSettings;