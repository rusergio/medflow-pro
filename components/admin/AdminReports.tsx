
import React from 'react';

const reportTypes = [
  { id: 'patients', label: 'Relatório de Pacientes', desc: 'Lista completa com status e histórico', icon: '📋' },
  { id: 'appointments', label: 'Relatório de Consultas', desc: 'Agendamentos por período', icon: '📅' },
  { id: 'financial', label: 'Relatório Financeiro', desc: 'Faturamento e custos', icon: '💰' },
  { id: 'occupancy', label: 'Ocupação de Leitos', desc: 'Taxa de ocupação por setor', icon: '🛏️' },
];

const AdminReports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Relatórios</h1>
        <p className="text-slate-500">Gere relatórios do sistema hospitalar</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((r) => (
          <div key={r.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-amber-200 transition-colors flex items-start gap-4">
            <span className="text-4xl">{r.icon}</span>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">{r.label}</h3>
              <p className="text-sm text-slate-500 mt-1">{r.desc}</p>
              <button className="mt-4 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100">Gerar relatório</button>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">Filtros de Período</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200">Hoje</button>
          <button className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200">Esta semana</button>
          <button className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200">Este mês</button>
          <button className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium hover:bg-slate-200">Personalizado</button>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
