
import React, { useState } from 'react';
import { Patient } from '../types';

const MOCK_PATIENTS: Patient[] = [
  { id: '1', name: 'Maria Souza', age: 45, gender: 'F', bloodType: 'A+', status: 'Estável', room: '202A', lastVisit: '2024-05-15', history: [] },
  { id: '2', name: 'João Pereira', age: 62, gender: 'M', bloodType: 'O-', status: 'Em Observação', room: '105B', lastVisit: '2024-05-18', history: [] },
  { id: '3', name: 'Ana Oliveira', age: 28, gender: 'F', bloodType: 'B+', status: 'Crítico', room: 'UTI-04', lastVisit: '2024-05-20', history: [] },
  { id: '4', name: 'Carlos Santos', age: 53, gender: 'M', bloodType: 'AB+', status: 'Alta', room: '-', lastVisit: '2024-05-10', history: [] },
  { id: '5', name: 'Beatriz Costa', age: 34, gender: 'F', bloodType: 'O+', status: 'Estável', room: '310C', lastVisit: '2024-05-19', history: [] },
];

const PatientList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = MOCK_PATIENTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.includes(searchTerm)
  );

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Crítico': return 'bg-red-50 text-red-600 border-red-100';
      case 'Em Observação': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Alta': return 'bg-slate-50 text-slate-600 border-slate-100';
      default: return 'bg-green-50 text-green-600 border-green-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Controle de Pacientes</h1>
          <p className="text-slate-500">Lista completa e histórico médico</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">+ Admitir Paciente</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Info Clínica</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 leading-none">{p.name}</p>
                        <p className="text-xs text-slate-400 mt-1">ID: #{p.id.padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${getStatusStyle(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-slate-600">Sangue: {p.bloodType}</span>
                      <span className="text-xs text-slate-400">{p.age} anos • {p.gender}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      <span className="text-sm">{p.room}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <span>Mostrando {filteredPatients.length} de {MOCK_PATIENTS.length} pacientes</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-50" disabled>Anterior</button>
            <button className="px-3 py-1 border border-slate-200 rounded-lg disabled:opacity-50" disabled>Próxima</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientList;
