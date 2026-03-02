import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, ArrowLeftIcon, KeyRoundIcon } from 'lucide-react';
import { LOGO } from '@/lib/logo';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface LoginProps {
  onLogin: (user: User, token: string) => void;
}

/* ─────────────────────────────────────────────
   PIN Input component
   6 boxes, supports paste, arrow-key nav,
   optional show/hide toggle
───────────────────────────────────────────── */
const PIN_LENGTH = 6;

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
        const next = [...value];
        next[i] = '';
        onChange(next);
      } else if (i > 0) {
        const next = [...value];
        next[i - 1] = '';
        onChange(next);
        focus(i - 1);
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      focus(i - 1);
    } else if (e.key === 'ArrowRight' && i < PIN_LENGTH - 1) {
      focus(i + 1);
    }
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;
    // handle paste of multiple digits
    if (raw.length > 1) {
      const digits = raw.slice(0, PIN_LENGTH).split('');
      const next = [...value];
      digits.forEach((d, idx) => {
        if (i + idx < PIN_LENGTH) next[i + idx] = d;
      });
      onChange(next);
      focus(Math.min(i + digits.length, PIN_LENGTH - 1));
      return;
    }
    const next = [...value];
    next[i] = raw;
    onChange(next);
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
            'w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200',
            'bg-white/80 dark:bg-white/10',
            'text-slate-800 dark:text-white',
            value[i]
              ? 'border-primary shadow-md shadow-primary/20 scale-105'
              : 'border-slate-200 dark:border-white/20',
            'focus:border-primary focus:shadow-lg focus:shadow-primary/30 focus:scale-105',
          ].join(' ')}
        />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Floating label input (wider feel)
───────────────────────────────────────────── */
interface FloatingInputProps {
  id: string;
  type: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  icon: React.ReactNode;
  rightAddon?: React.ReactNode;
  autoComplete?: string;
  required?: boolean;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  id, type, label, value, onChange, error, icon, rightAddon, autoComplete, required,
}) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-[13px] font-medium text-slate-600 dark:text-slate-400">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div
      className={[
        'flex items-center rounded-lg border-2 px-3 transition-colors duration-200',
        'focus-within:border-primary focus-within:shadow-lg focus-within:shadow-primary/20',
        error
          ? 'border-red-400 dark:border-red-500'
          : 'border-slate-200 dark:border-white/20',
      ].join(' ')}
      style={{ backgroundColor: 'transparent' }}
    >
      <span className="text-slate-400 dark:text-slate-500 flex-none flex items-center w-8">{icon}</span>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className={[
          'flex-1 h-10 outline-none text-sm text-slate-800 dark:text-white min-w-0',
          '[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_white]',
          '[&:-webkit-autofill]:[-webkit-text-fill-color:#1e293b]',
          'dark:[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#0f172a]',
          'dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#f1f5f9]',
        ].join(' ')}
        style={{ background: 'transparent' }}
      />
      {rightAddon && (
        <span className="flex-none flex items-center justify-center w-8 h-10">{rightAddon}</span>
      )}
    </div>
    {error && (
      <p className="text-xs text-red-500 pl-0.5 animate-[fadeSlideIn_0.2s_ease]">{error}</p>
    )}
  </div>
);

/* ─────────────────────────────────────────────
   Main Login component
───────────────────────────────────────────── */
type View = 'login' | 'forgot';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [showPin, setShowPin] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'pin'>('email');
  const [stepAnimating, setStepAnimating] = useState(false);
  const [stepDirection, setStepDirection] = useState<'forward' | 'back'>('forward');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const switchStep = (next: 'email' | 'pin', direction: 'forward' | 'back' = 'forward') => {
    setStepDirection(direction);
    setStepAnimating(true);
    setTimeout(() => {
      setForgotStep(next);
      setStepAnimating(false);
    }, 280);
  };

  // View transition
  const [view, setView] = useState<View>('login');
  const [animating, setAnimating] = useState(false);

  const switchView = (next: View) => {
    setAnimating(true);
    setTimeout(() => {
      setView(next);
      setAnimating(false);
    }, 320);
  };

  const goForgot = () => {
    setForgotStep('email');
    setForgotEmail('');
    setPin(Array(PIN_LENGTH).fill(''));
    setForgotError('');
    setForgotSuccess(false);
    switchView('forgot');
  };

  const goLogin = () => {
    setError('');
    setFieldErrors({});
    switchView('login');
  };

  // ── Login handlers ──
  const validateLogin = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Email é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Informe um email válido.';
    }
    if (!password) {
      errs.password = 'Senha é obrigatória.';
    } else if (password.length < 6) {
      errs.password = 'A senha deve ter no mínimo 6 caracteres.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateLogin()) return;
    setIsLoading(true);
    try {
      const { user, token } = await api.login(email, password);
      onLogin(user, token);
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot handlers ──
  const handleSendPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      setForgotError(!forgotEmail.trim() ? 'Email é obrigatório.' : 'Informe um email válido.');
      return;
    }
    setForgotLoading(true);
    try {
      // await api.sendPasswordResetPin(forgotEmail);
      await new Promise((r) => setTimeout(r, 900)); // mock
      switchStep('pin', 'forward');
    } catch (err: any) {
      setForgotError(err.message || 'Erro ao enviar PIN.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    const code = pin.join('');
    if (code.length < PIN_LENGTH) {
      setForgotError(`Digite os ${PIN_LENGTH} dígitos do PIN.`);
      return;
    }
    setForgotLoading(true);
    try {
      // await api.verifyPin(forgotEmail, code);
      await new Promise((r) => setTimeout(r, 900)); // mock
      setForgotSuccess(true);
    } catch (err: any) {
      setForgotError(err.message || 'PIN inválido ou expirado.');
    } finally {
      setForgotLoading(false);
    }
  };

  // ── Render ──
  return (
    <>
      {/* Global keyframe styles */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideOutLeft {
          from { opacity: 1; transform: translateX(0)   scale(1); }
          to   { opacity: 0; transform: translateX(-40px) scale(0.97); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0)   scale(1); }
        }
        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0)   scale(1); }
          to   { opacity: 0; transform: translateX(40px) scale(0.97); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0)    scale(1); }
        }
        .anim-out-left  { animation: slideOutLeft  0.32s cubic-bezier(0.4,0,0.2,1) forwards; }
        .anim-in-right  { animation: slideInRight  0.32s cubic-bezier(0.4,0,0.2,1) forwards; }
        .anim-out-right { animation: slideOutRight 0.32s cubic-bezier(0.4,0,0.2,1) forwards; }
        .anim-in-left   { animation: slideInLeft   0.32s cubic-bezier(0.4,0,0.2,1) forwards; }
        .pin-success { animation: fadeSlideIn 0.4s ease forwards; }

        /* ── Kill browser autofill blue background ── */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px white inset !important;
          -webkit-text-fill-color: #1e293b !important;
          transition: background-color 9999s ease-in-out 0s;
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/90 to-primary p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl">
            {/* ── Header (shared) ── */}
            <CardHeader className="text-center space-y-4 pb-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto overflow-hidden">
                <img src={LOGO.main} alt="MedFlow Pro" className="w-full h-full object-contain" />
              </div>
              <div>
                <CardTitle className="text-2xl">MedFlow Pro</CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">Sistema de Gestão Hospitalar</p>
              </div>
            </CardHeader>

            <CardContent className="pt-4 pb-4 px-8">
              {/* ── VIEW WRAPPER (animated) ── */}
              <div style={{ minHeight: '280px' }}>
              <div
                className={[
                  animating
                    ? view === 'login' ? 'anim-out-left' : 'anim-out-right'
                    : view === 'login' ? 'anim-in-left' : 'anim-in-right',
                ].join(' ')}
              >
                {/* ══════════════ LOGIN VIEW ══════════════ */}
                {view === 'login' && (
                  <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm animate-[fadeSlideIn_0.25s_ease]">
                        {error}
                      </div>
                    )}

                    <FloatingInput
                      id="email"
                      type="email"
                      label="Email"
                      value={email}
                      onChange={setEmail}
                      autoComplete="email"
                      error={fieldErrors.email}
                      required
                      icon={<MailIcon className="w-4 h-4" />}
                    />

                    <FloatingInput
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      label="Senha"
                      value={password}
                      onChange={setPassword}
                      autoComplete="current-password"
                      error={fieldErrors.password}
                      required
                      icon={<LockIcon className="w-4 h-4" />}
                      rightAddon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-primary transition-colors flex items-center justify-center w-5 h-5"
                          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        >
                          {showPassword
                            ? <EyeOffIcon className="w-4 h-4" strokeWidth={1.75} />
                            : <EyeIcon className="w-4 h-4" strokeWidth={1.75} />
                          }
                        </button>
                      }
                    />

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-10 text-sm font-semibold rounded-lg mt-1"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Entrando...
                        </span>
                      ) : 'Acessar Sistema'}
                    </Button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={goForgot}
                        className="text-sm text-primary hover:underline underline-offset-2 transition-all"
                      >
                        Esqueceu sua senha?
                      </button>
                    </div>
                  </form>
                )}

                {/* ══════════════ FORGOT PASSWORD VIEW ══════════════ */}
                {view === 'forgot' && (
                  <div className="mt-2">
                    {/* Back button */}
                    <button
                      type="button"
                      onClick={goLogin}
                      className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-5"
                    >
                      <ArrowLeftIcon className="w-3.5 h-3.5" />
                      Voltar ao login
                    </button>

                    {/* ── SUCCESS state ── */}
                    {forgotSuccess ? (
                      <div className="pin-success text-center py-6 space-y-3">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">PIN verificado!</p>
                        <p className="text-sm text-muted-foreground">Você pode agora redefinir sua senha.</p>
                        <Button className="mt-2 w-full h-10 rounded-lg" onClick={goLogin}>
                          Continuar
                        </Button>
                      </div>
                    ) : (
                      <div
                        className={
                          stepAnimating
                            ? stepDirection === 'forward' ? 'anim-out-left' : 'anim-out-right'
                            : stepDirection === 'forward' ? 'anim-in-right' : 'anim-in-left'
                        }
                      >
                        {forgotStep === 'email' ? (
                          /* ── STEP 1: email ── */
                          <form onSubmit={handleSendPin} className="space-y-5">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Recuperar acesso</h3>
                              <p className="text-sm text-muted-foreground">
                                Informe seu email e enviaremos um PIN de verificação.
                              </p>
                            </div>

                            <FloatingInput
                              id="forgot-email"
                              type="email"
                              label="Email cadastrado"
                              value={forgotEmail}
                              onChange={setForgotEmail}
                              autoComplete="email"
                              error={forgotError}
                              required
                              icon={<MailIcon className="w-4 h-4" />}
                            />

                            <Button
                              type="submit"
                              disabled={forgotLoading}
                              className="w-full h-10 rounded-lg font-semibold text-sm"
                            >
                              {forgotLoading ? (
                                <span className="flex items-center gap-2">
                                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                  Enviando...
                                </span>
                              ) : 'Enviar PIN'}
                            </Button>
                          </form>
                        ) : (
                          /* ── STEP 2: PIN ── */
                          <form onSubmit={handleVerifyPin} className="space-y-5">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Digite o PIN</h3>
                              <p className="text-sm text-muted-foreground">
                                Enviamos um PIN de {PIN_LENGTH} dígitos para{' '}
                                <span className="font-medium text-primary">{forgotEmail}</span>.
                              </p>
                            </div>

                            {/* PIN boxes */}
                            <div className="space-y-3">
                              <PinInput value={pin} onChange={setPin} show={showPin} />

                              {/* Show/hide PIN toggle */}
                              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                                <button
                                  type="button"
                                  onClick={() => setShowPin(!showPin)}
                                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                                >
                                  {showPin
                                    ? <><EyeOffIcon className="w-3.5 h-3.5" /> Ocultar PIN</>
                                    : <><EyeIcon className="w-3.5 h-3.5" /> Mostrar PIN</>
                                  }
                                </button>
                              </div>
                            </div>

                            {forgotError && (
                              <p className="text-xs text-red-500 text-center animate-[fadeSlideIn_0.2s_ease]">
                                {forgotError}
                              </p>
                            )}

                            <Button
                              type="submit"
                              disabled={forgotLoading || pin.join('').length < PIN_LENGTH}
                              className="w-full h-10 rounded-lg font-semibold text-sm"
                            >
                              {forgotLoading ? (
                                <span className="flex items-center gap-2">
                                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                  Verificando...
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <KeyRoundIcon className="w-4 h-4" />
                                  Verificar PIN
                                </span>
                              )}
                            </Button>

                            <p className="text-center text-xs text-muted-foreground">
                              Não recebeu?{' '}
                              <button
                                type="button"
                                onClick={() => switchStep('email', 'back')}
                                className="text-primary hover:underline"
                              >
                                Reenviar
                              </button>
                            </p>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              </div>
            </CardContent>

            <div className="border-t px-8 py-2 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                Portal de Acesso Restrito
              </p>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Login;