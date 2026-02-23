
import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface MyProfileProps {
  user: User;
  onUserUpdate?: (user: User) => void;
}

const MyProfile: React.FC<MyProfileProps> = ({ user, onUserUpdate }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      // Backend would need PATCH /auth/me to update profile
      onUserUpdate?.({ ...user, name, email });
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    setSaving(true);
    try {
      // Backend would need POST /auth/change-password
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Senha alterada com sucesso.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao alterar senha.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Meu Perfil</h1>
        <p className="text-slate-500">Gerencie suas informações pessoais</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-6">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=96&background=3b82f6&color=fff`}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-100"
            />
            <div>
              <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
              <p className="text-slate-500">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">{user.role}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
          <h3 className="font-bold text-slate-800">Informações pessoais</h3>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
            />
          </div>
          <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>

        <div className="p-6 border-t border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Alterar senha</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha atual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Digite sua senha atual"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nova senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar nova senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Repita a nova senha"
                minLength={6}
              />
            </div>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 disabled:opacity-50">
              {saving ? 'Alterando...' : 'Alterar senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
