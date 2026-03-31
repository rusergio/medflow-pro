import React, { useState } from 'react';
import AIChat from '../AIChat';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BotIcon } from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';

interface PatientChatOrAuthProps {
  isLoggedIn: boolean;
  onLoginSuccess: (user: User, token: string) => void;
}

const PatientChatOrAuth: React.FC<PatientChatOrAuthProps> = ({ isLoggedIn, onLoginSuccess }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [telemovel, setTelemovel] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState<'M' | 'F'>('M');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, token } = await api.login(email, password);
      onLoginSuccess(user, token);
      setShowAuth(false);
    } catch (err: any) {
      setError(err.message || 'Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !password || !telemovel.trim() || !dataNascimento) {
      setError('Preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      const { user, token } = await api.registerPatient({
        name: name.trim(),
        email: email.trim(),
        password,
        telemovel: telemovel.trim(),
        dataNascimento,
        sexo,
      });
      onLoginSuccess(user, token);
      setShowAuth(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) return <AIChat />;

  if (showAuth) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold ${mode === 'login' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Iniciar sessão
              </button>
              <button
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold ${mode === 'register' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                Criar conta
              </button>
            </div>
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-10 rounded-lg border px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Senha</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full h-10 rounded-lg border px-3" />
                </div>
                <Button type="submit" disabled={loading} className="w-full">Entrar</Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full h-10 rounded-lg border px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-10 rounded-lg border px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Senha (mín. 6)</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full h-10 rounded-lg border px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telemóvel</label>
                  <input type="tel" value={telemovel} onChange={(e) => setTelemovel(e.target.value)} required className="w-full h-10 rounded-lg border px-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Data de nascimento</label>
                  <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} required className="w-full h-10 rounded-lg border px-3" />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2"><input type="radio" checked={sexo === 'M'} onChange={() => setSexo('M')} /> Masculino</label>
                  <label className="flex items-center gap-2"><input type="radio" checked={sexo === 'F'} onChange={() => setSexo('F')} /> Feminino</label>
                </div>
                <Button type="submit" disabled={loading} className="w-full">Criar conta</Button>
              </form>
            )}
            <button onClick={() => setShowAuth(false)} className="w-full mt-4 text-sm text-slate-500 hover:text-slate-700">
              Voltar
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="py-16 text-center">
          <BotIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Inicie sessão ou crie uma conta para usar o Assistente IA.
          </p>
          <Button onClick={() => setShowAuth(true)}>Iniciar sessão / Criar conta</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientChatOrAuth;
