
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (error) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const adminCards = [
    { label: 'Usuários Cadastrados', value: stats?.usersTotal ?? '-', icon: '👥' },
    { label: 'Pacientes Totais', value: stats?.stats?.totalPatients ?? '-', icon: '🏥' },
    { label: 'Consultas Hoje', value: stats?.stats?.appointmentsToday ?? '-', icon: '📅' },
    { label: 'Leitos Disponíveis', value: stats?.stats?.availableBeds ?? '-', icon: '🛏️' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Painel Administrativo</h1>
        <p className="text-slate-500">Visão geral do sistema hospitalar</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adminCards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <span className="text-2xl mb-2">{card.icon}</span>
            <span className="text-sm font-medium text-slate-500 mb-2">{card.label}</span>
            <span className="text-3xl font-bold text-slate-800 tracking-tight">{card.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-amber-50 text-amber-700 rounded-xl font-medium hover:bg-amber-100 transition-colors text-left flex items-center gap-3">
              <span className="text-xl">➕</span> Cadastrar novo usuário
            </button>
            <button className="w-full px-4 py-3 bg-slate-50 text-slate-700 rounded-xl font-medium hover:bg-slate-100 transition-colors text-left flex items-center gap-3">
              <span className="text-xl">📊</span> Gerar relatório
            </button>
            <button className="w-full px-4 py-3 bg-slate-50 text-slate-700 rounded-xl font-medium hover:bg-slate-100 transition-colors text-left flex items-center gap-3">
              <span className="text-xl">⚙️</span> Configurações do sistema
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Status do Sistema</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="font-medium text-slate-700">Backend API</span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="font-medium text-slate-700">Base de Dados</span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="font-medium text-slate-700">Assistente IA</span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
