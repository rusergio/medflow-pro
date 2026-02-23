
import React, { useState } from 'react';

const AdminSettings: React.FC = () => {
  const [hospitalName, setHospitalName] = useState('Hospital MedFlow');
  const [workStart, setWorkStart] = useState('08:00');
  const [workEnd, setWorkEnd] = useState('18:00');

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h1>
        <p className="text-slate-500">Ajustes gerais do hospital</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
        <div className="p-6">
          <h3 className="font-bold text-slate-800 mb-4">Informações do Hospital</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome do hospital</label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>
        <div className="p-6">
          <h3 className="font-bold text-slate-800 mb-4">Horário de Funcionamento</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Início</label>
              <input
                type="time"
                value={workStart}
                onChange={(e) => setWorkStart(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fim</label>
              <input
                type="time"
                value={workEnd}
                onChange={(e) => setWorkEnd(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>
        <div className="p-6">
          <h3 className="font-bold text-slate-800 mb-4">Segurança</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-300" defaultChecked />
              <span className="text-slate-700">Exigir senha forte</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-300" />
              <span className="text-slate-700">Log de atividades obrigatório</span>
            </label>
          </div>
        </div>
      </div>
      <button className="px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600">
        Salvar alterações
      </button>
    </div>
  );
};

export default AdminSettings;
