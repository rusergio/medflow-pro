
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'DOCTOR' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data.users || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.register({ ...form, role: form.role });
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'DOCTOR' });
      loadUsers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao criar usuário');
    }
  };

  const getRoleLabel = (role: string) => {
    const map: Record<string, string> = { ADMIN: 'Administrador', DOCTOR: 'Médico(a)', NURSE: 'Enfermeiro(a)' };
    return map[role] || role;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestão de Usuários</h1>
          <p className="text-slate-500">Médicos, enfermeiros e administradores</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors shadow-sm">
          + Novo Usuário
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Usuário</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Cargo</th>
              <th className="px-6 py-4">Cadastro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">{(u.name || '?').charAt(0)}</div>
                    <span className="font-semibold text-slate-800">{u.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${u.role === 'ADMIN' ? 'bg-amber-50 text-amber-600' : u.role === 'DOCTOR' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'}`}>{getRoleLabel(u.role)}</span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-sm">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="p-12 text-center text-slate-500">Nenhum usuário cadastrado.</div>}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Novo Usuário</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500" placeholder="Nome completo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500" placeholder="email@hospital.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500" placeholder="Mínimo 6 caracteres" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white">
                  <option value="DOCTOR">Médico(a)</option>
                  <option value="NURSE">Enfermeiro(a)</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
