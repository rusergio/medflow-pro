import React, { useState, useRef } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import {
  UserIcon, MailIcon, PhoneIcon, LockIcon, KeyRoundIcon,
  EyeIcon, EyeOffIcon, CheckCircle2Icon, ChevronRightIcon,
  ShieldCheckIcon, ShieldAlertIcon, PencilIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface MyProfileProps {
  user: User;
  onUserUpdate?: (user: User) => void;
}

type Section = 'info' | 'password' | 'pin';

/* ─────────────────────────────────────────────
   PIN_LENGTH
───────────────────────────────────────────── */
const PIN_LENGTH = 6;

/* ─────────────────────────────────────────────
   Shared PinInput (same as Login)
───────────────────────────────────────────── */
interface PinInputProps {
  value: string[];
  onChange: (val: string[]) => void;
  show: boolean;
}

const PinInput: React.FC<PinInputProps> = ({ value, onChange, show }) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const focus = (i: number) => refs.current[i]?.focus();

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (value[i]) {
        const next = [...value]; next[i] = ''; onChange(next);
      } else if (i > 0) {
        const next = [...value]; next[i - 1] = ''; onChange(next); focus(i - 1);
      }
    } else if (e.key === 'ArrowLeft' && i > 0) focus(i - 1);
    else if (e.key === 'ArrowRight' && i < PIN_LENGTH - 1) focus(i + 1);
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;
    if (raw.length > 1) {
      const digits = raw.slice(0, PIN_LENGTH).split('');
      const next = [...value];
      digits.forEach((d, idx) => { if (i + idx < PIN_LENGTH) next[i + idx] = d; });
      onChange(next);
      focus(Math.min(i + digits.length, PIN_LENGTH - 1));
      return;
    }
    const next = [...value]; next[i] = raw; onChange(next);
    if (i < PIN_LENGTH - 1) focus(i + 1);
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type={show ? 'text' : 'password'}
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onFocus={(e) => e.target.select()}
          className={[
            'w-11 h-13 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200',
            'bg-white dark:bg-white/10 text-slate-800 dark:text-white',
            value[i]
              ? 'border-primary shadow-md shadow-primary/20 scale-105'
              : 'border-slate-200 dark:border-white/20',
            'focus:border-primary focus:shadow-lg focus:shadow-primary/30 focus:scale-105',
          ].join(' ')}
          style={{ height: '52px' }}
        />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   FieldInput — minimal inline input
───────────────────────────────────────────── */
interface FieldInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  hint?: string;
  icon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

const FieldInput: React.FC<FieldInputProps> = ({
  id, label, type = 'text', value, onChange, placeholder, readOnly, hint, icon, rightAddon,
}) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-[12px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
      {label}
    </label>
    <div className={[
      'flex items-center rounded-lg border-2 px-3 transition-all duration-200',
      readOnly
        ? 'border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5'
        : 'border-slate-200 dark:border-white/15 bg-white dark:bg-transparent focus-within:border-primary focus-within:shadow-md focus-within:shadow-primary/15',
    ].join(' ')}>
      {icon && <span className="text-slate-400 flex-none flex items-center w-8">{icon}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className={[
          'flex-1 h-10 text-sm outline-none bg-transparent',
          readOnly ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed' : 'text-slate-800 dark:text-white',
          '[-webkit-autofill]:shadow-[inset_0_0_0_1000px_white]',
        ].join(' ')}
        style={{ background: 'transparent' }}
      />
      {rightAddon && <span className="flex-none flex items-center justify-center w-8 h-10">{rightAddon}</span>}
    </div>
    {hint && <p className="text-[11px] text-slate-400 pl-0.5">{hint}</p>}
  </div>
);

/* ─────────────────────────────────────────────
   SectionCard — collapsible panel
───────────────────────────────────────────── */
interface SectionCardProps {
  id: Section;
  active: Section | null;
  onToggle: (id: Section) => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  id, active, onToggle, icon, title, subtitle, badge, children,
}) => {
  const isOpen = active === id;
  return (
    <div className={[
      'rounded-2xl border-2 transition-all duration-300 overflow-hidden',
      isOpen
        ? 'border-primary/30 shadow-md shadow-primary/10'
        : 'border-slate-100 dark:border-white/10 hover:border-slate-200 dark:hover:border-white/20',
    ].join(' ')}>
      {/* Header */}
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        <span className={[
          'w-10 h-10 rounded-xl flex items-center justify-center flex-none transition-colors',
          isOpen ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500',
        ].join(' ')}>
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{subtitle}</p>
        </div>
        {badge && <span className="flex-none">{badge}</span>}
        <ChevronRightIcon className={[
          'w-4 h-4 text-slate-400 flex-none transition-transform duration-300',
          isOpen ? 'rotate-90' : '',
        ].join(' ')} />
      </button>

      {/* Body */}
      <div className={[
        'transition-all duration-300 ease-in-out',
        isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0',
      ].join(' ')}>
        <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-white/10">
          {children}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Toast notification
───────────────────────────────────────────── */
interface ToastProps {
  message: { type: 'success' | 'error'; text: string } | null;
}
const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;
  return (
    <div className={[
      'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium',
      'animate-[slideUpFade_0.3s_ease_forwards]',
      message.type === 'success'
        ? 'bg-green-500 text-white'
        : 'bg-red-500 text-white',
    ].join(' ')}>
      {message.type === 'success'
        ? <CheckCircle2Icon className="w-4 h-4 shrink-0" />
        : <ShieldAlertIcon className="w-4 h-4 shrink-0" />
      }
      {message.text}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
const MyProfile: React.FC<MyProfileProps> = ({ user, onUserUpdate }) => {
  const [activeSection, setActiveSection] = useState<Section | null>(null);

  // Info state
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // PIN state
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [confirmPin, setConfirmPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [pinStep, setPinStep] = useState<'create' | 'confirm'>('create');
  const [pinStepAnim, setPinStepAnim] = useState(false);

  // Shared
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const toggleSection = (id: Section) => {
    setActiveSection((prev) => (prev === id ? null : id));
  };

  /* ── Handlers ── */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateProfile({ email, phone });
      onUserUpdate?.({ ...user, ...updated });
      showToast('success', 'Perfil atualizado com sucesso.');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Erro ao atualizar perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { showToast('error', 'As senhas não coincidem.'); return; }
    if (newPassword.length < 6) { showToast('error', 'Mínimo 6 caracteres para a nova senha.'); return; }
    setSaving(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      showToast('success', 'Senha alterada com sucesso.');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Erro ao alterar senha.');
    } finally {
      setSaving(false);
    }
  };

  const goConfirmPin = () => {
    if (pin.join('').length < PIN_LENGTH) { showToast('error', `Digite os ${PIN_LENGTH} dígitos do PIN.`); return; }
    setPinStepAnim(true);
    setTimeout(() => { setPinStep('confirm'); setPinStepAnim(false); }, 280);
  };

  const handleActivatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = pin.join('');
    const c = confirmPin.join('');
    if (p !== c) { showToast('error', 'Os PINs não coincidem.'); return; }
    setSaving(true);
    try {
      await api.activatePin(p);
      onUserUpdate?.({ ...user, pinActive: true });
      showToast('success', 'PIN ativado com sucesso!');
      setPin(Array(PIN_LENGTH).fill(''));
      setConfirmPin(Array(PIN_LENGTH).fill(''));
      setPinStep('create');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Erro ao ativar PIN.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideOutLeft {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to   { opacity: 0; transform: translateX(-30px) scale(0.97); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        .anim-out { animation: slideOutLeft 0.28s cubic-bezier(0.4,0,0.2,1) forwards; }
        .anim-in  { animation: slideInRight 0.28s cubic-bezier(0.4,0,0.2,1) forwards; }
        .fade-in  { animation: fadeIn 0.35s ease forwards; }
        .stagger-1 { animation: fadeIn 0.35s ease 0.05s both; }
        .stagger-2 { animation: fadeIn 0.35s ease 0.1s both; }
        .stagger-3 { animation: fadeIn 0.35s ease 0.15s both; }
      `}</style>

      <div className="space-y-6 max-w-xl">

        {/* ── Page header ── */}
        <div className="fade-in">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Meu Perfil</h1>
          <p className="text-sm text-slate-400 mt-0.5">Gerencie suas informações e segurança</p>
        </div>

        {/* ── Avatar card ── */}
        <div className="stagger-1 flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/10">
          <div className="relative">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=96&background=3b82f6&color=fff`}
              alt="Avatar"
              className="w-16 h-16 rounded-2xl object-cover"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 dark:text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
          <span className="flex-none px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wide">
            {user.role}
          </span>
        </div>

        {/* ── Sections ── */}
        <div className="stagger-2 space-y-3">

          {/* SECTION: Info */}
          <SectionCard
            id="info"
            active={activeSection}
            onToggle={toggleSection}
            icon={<PencilIcon className="w-4 h-4" />}
            title="Informações pessoais"
            subtitle="Email e telefone de contato"
          >
            <form onSubmit={handleSaveProfile} className="space-y-4 mt-4">
              <FieldInput
                id="name"
                label="Nome completo"
                value={user.name}
                onChange={() => {}}
                readOnly
                hint="O nome não pode ser alterado aqui."
                icon={<UserIcon className="w-4 h-4" />}
              />
              <FieldInput
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="seu@email.com"
                icon={<MailIcon className="w-4 h-4" />}
              />
              <FieldInput
                id="phone"
                label="Telefone"
                type="tel"
                value={phone}
                onChange={setPhone}
                placeholder="(00) 00000-0000"
                hint="Importante para contato e recuperação de conta."
                icon={<PhoneIcon className="w-4 h-4" />}
              />
              <Button type="submit" disabled={saving} className="w-full h-10 rounded-lg text-sm font-semibold">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </span>
                ) : 'Salvar alterações'}
              </Button>
            </form>
          </SectionCard>

          {/* SECTION: Password */}
          <SectionCard
            id="password"
            active={activeSection}
            onToggle={toggleSection}
            icon={<LockIcon className="w-4 h-4" />}
            title="Alterar senha"
            subtitle="Mantenha sua conta segura"
          >
            <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
              <FieldInput
                id="current-password"
                label="Senha atual"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="Digite sua senha atual"
                icon={<LockIcon className="w-4 h-4" />}
                rightAddon={
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                    className="text-slate-400 hover:text-primary transition-colors flex items-center justify-center w-5 h-5">
                    {showCurrent ? <EyeOffIcon className="w-4 h-4" strokeWidth={1.75} /> : <EyeIcon className="w-4 h-4" strokeWidth={1.75} />}
                  </button>
                }
              />
              <FieldInput
                id="new-password"
                label="Nova senha"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Mínimo 6 caracteres"
                icon={<LockIcon className="w-4 h-4" />}
                rightAddon={
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="text-slate-400 hover:text-primary transition-colors flex items-center justify-center w-5 h-5">
                    {showNew ? <EyeOffIcon className="w-4 h-4" strokeWidth={1.75} /> : <EyeIcon className="w-4 h-4" strokeWidth={1.75} />}
                  </button>
                }
              />
              <FieldInput
                id="confirm-password"
                label="Confirmar nova senha"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Repita a nova senha"
                icon={<LockIcon className="w-4 h-4" />}
                rightAddon={
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="text-slate-400 hover:text-primary transition-colors flex items-center justify-center w-5 h-5">
                    {showConfirm ? <EyeOffIcon className="w-4 h-4" strokeWidth={1.75} /> : <EyeIcon className="w-4 h-4" strokeWidth={1.75} />}
                  </button>
                }
              />
              <Button type="submit" variant="secondary" disabled={saving} className="w-full h-10 rounded-lg text-sm font-semibold">
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
                    Alterando...
                  </span>
                ) : 'Alterar senha'}
              </Button>
            </form>
          </SectionCard>

          {/* SECTION: PIN */}
          <SectionCard
            id="pin"
            active={activeSection}
            onToggle={toggleSection}
            icon={<KeyRoundIcon className="w-4 h-4" />}
            title="PIN de recuperação"
            subtitle={user.pinActive ? 'PIN ativo — conta protegida' : 'Ative para proteger sua conta'}
            badge={
              user.pinActive
                ? <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                    <ShieldCheckIcon className="w-3 h-3" /> Ativo
                  </span>
                : <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
                    <ShieldAlertIcon className="w-3 h-3" /> Inativo
                  </span>
            }
          >
            {user.pinActive ? (
              /* ── Already active ── */
              <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <CheckCircle2Icon className="w-5 h-5 text-green-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">PIN ativado!</p>
                  <p className="text-xs text-green-600/80 dark:text-green-500 mt-0.5">
                    Você pode recuperar sua conta usando o PIN caso esqueça a senha.
                  </p>
                </div>
              </div>
            ) : (
              /* ── Activation flow ── */
              <form onSubmit={handleActivatePin} className="mt-4 space-y-5">

                {/* Step indicator */}
                <div className="flex items-center gap-2">
                  {['Criar PIN', 'Confirmar'].map((label, i) => (
                    <React.Fragment key={i}>
                      <div className="flex items-center gap-1.5">
                        <span className={[
                          'w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center transition-colors duration-300',
                          (i === 0 && pinStep === 'create') || (i === 1 && pinStep === 'confirm')
                            ? 'bg-primary text-white'
                            : i === 0 && pinStep === 'confirm'
                              ? 'bg-green-500 text-white'
                              : 'bg-slate-100 dark:bg-white/10 text-slate-400',
                        ].join(' ')}>
                          {i === 0 && pinStep === 'confirm' ? '✓' : i + 1}
                        </span>
                        <span className={[
                          'text-xs font-medium transition-colors',
                          (i === 0 && pinStep === 'create') || (i === 1 && pinStep === 'confirm')
                            ? 'text-slate-700 dark:text-slate-200'
                            : 'text-slate-400',
                        ].join(' ')}>{label}</span>
                      </div>
                      {i === 0 && (
                        <div className="flex-1 h-px bg-slate-200 dark:bg-white/10 mx-1" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Animated step content */}
                <div className={pinStepAnim ? 'anim-out' : 'anim-in'}>
                  {pinStep === 'create' ? (
                    <div className="space-y-4">
                      <div className="text-center space-y-1">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Crie seu PIN de {PIN_LENGTH} dígitos</p>
                        <p className="text-xs text-slate-400">Será usado para recuperar sua conta</p>
                      </div>
                      <PinInput value={pin} onChange={setPin} show={showPin} />
                      <div className="flex justify-center">
                        <button type="button" onClick={() => setShowPin(!showPin)}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary transition-colors">
                          {showPin ? <><EyeOffIcon className="w-3.5 h-3.5" /> Ocultar</> : <><EyeIcon className="w-3.5 h-3.5" /> Mostrar</>}
                        </button>
                      </div>
                      <Button
                        type="button"
                        onClick={goConfirmPin}
                        disabled={pin.join('').length < PIN_LENGTH}
                        className="w-full h-10 rounded-lg text-sm font-semibold"
                      >
                        Continuar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center space-y-1">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Confirme seu PIN</p>
                        <p className="text-xs text-slate-400">Digite novamente para verificar</p>
                      </div>
                      <PinInput value={confirmPin} onChange={setConfirmPin} show={showConfirmPin} />
                      <div className="flex justify-center">
                        <button type="button" onClick={() => setShowConfirmPin(!showConfirmPin)}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary transition-colors">
                          {showConfirmPin ? <><EyeOffIcon className="w-3.5 h-3.5" /> Ocultar</> : <><EyeIcon className="w-3.5 h-3.5" /> Mostrar</>}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setPinStepAnim(true);
                            setTimeout(() => { setPinStep('create'); setPinStepAnim(false); }, 280);
                          }}
                          className="flex-1 h-10 rounded-lg text-sm"
                        >
                          Voltar
                        </Button>
                        <Button
                          type="submit"
                          disabled={saving || confirmPin.join('').length < PIN_LENGTH}
                          className="flex-1 h-10 rounded-lg text-sm font-semibold"
                        >
                          {saving ? (
                            <span className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              Ativando...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <ShieldCheckIcon className="w-4 h-4" /> Ativar PIN
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            )}
          </SectionCard>
        </div>
      </div>

      <Toast message={message} />
    </>
  );
};

export default MyProfile;