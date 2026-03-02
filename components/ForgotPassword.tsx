import React, { useState } from 'react';
import { api } from '../services/api';
import PasswordInput from './PasswordInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeftIcon, CheckCircle2Icon } from 'lucide-react';

interface ForgotPasswordProps {
  onBack: () => void;
  onSuccess?: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, onSuccess }) => {
  const [step, setStep] = useState<'email' | 'pin' | 'newPassword'>('email');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Digite seu email.');
      return;
    }
    setStep('pin');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (pin.length < 4 || pin.length > 6) {
      setError('Digite o PIN de 4 a 6 dígitos.');
      return;
    }
    setStep('newPassword');
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await api.forgotPassword(email, pin, newPassword);
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onBack();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha. Verifique o PIN.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2Icon className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-bold mb-2">Senha alterada!</h3>
        <p className="text-muted-foreground text-sm">Você já pode fazer login com sua nova senha.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Button type="button" variant="ghost" size="icon" onClick={onBack} aria-label="Voltar">
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <h3 className="text-lg font-bold">Recuperar senha</h3>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {step === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Digite o email da sua conta. Em seguida, você precisará do PIN que configurou em Meu Perfil para redefinir a senha.
          </p>
          <div className="space-y-2">
            <Label htmlFor="fp-email">Email</Label>
            <Input
              id="fp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>
          <Button type="submit" className="w-full">Continuar</Button>
        </form>
      )}

      {step === 'pin' && (
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Digite o PIN de 4 a 6 dígitos que você configurou em Meu Perfil.
          </p>
          <div className="space-y-2">
            <Label htmlFor="fp-pin">PIN</Label>
            <Input
              id="fp-pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Digite seu PIN"
              required
            />
          </div>
          <Button type="submit" className="w-full">Continuar</Button>
        </form>
      )}

      {step === 'newPassword' && (
        <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Crie uma nova senha para sua conta.
          </p>
          <div className="space-y-2">
            <Label>Nova senha</Label>
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label>Confirmar senha</Label>
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repita a nova senha"
              minLength={6}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Redefinindo...' : 'Redefinir senha'}
          </Button>
        </form>
      )}

      {step !== 'email' && (
        <Button
          type="button"
          variant="link"
          className="text-sm p-0 h-auto"
          onClick={() => setStep(step === 'pin' ? 'email' : 'pin')}
        >
          Voltar
        </Button>
      )}
    </div>
  );
};

export default ForgotPassword;
