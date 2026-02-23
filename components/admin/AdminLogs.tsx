
import React from 'react';

const MOCK_LOGS = [
  { id: '1', user: 'medflowpro@gmail.com', action: 'Login realizado', time: '2026-02-22 15:32', ip: '192.168.1.1' },
  { id: '2', user: 'dr.silva@hospital.com', action: 'Criou novo paciente', time: '2026-02-22 14:20', ip: '192.168.1.15' },
  { id: '3', user: 'enfermeira@hospital.com', action: 'Atualizou agendamento', time: '2026-02-22 13:45', ip: '192.168.1.22' },
  { id: '4', user: 'medflowpro@gmail.com', action: 'Cadastrou novo usuário', time: '2026-02-22 12:10', ip: '192.168.1.1' },
  { id: '5', user: 'dr.silva@hospital.com', action: 'Login realizado', time: '2026-02-22 09:00', ip: '192.168.1.15' },
];

const AdminLogs: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Logs de Atividade</h1>
          <p className="text-slate-500">Histórico de ações no sistema</p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="Buscar por usuário..."
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm w-48"
          />
          <button className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100">
            Filtrar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Data/Hora</th>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Ação</th>
                <th className="px-6 py-4">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-slate-600 text-sm">{log.time}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{log.user}</td>
                  <td className="px-6 py-4 text-slate-600">{log.action}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
