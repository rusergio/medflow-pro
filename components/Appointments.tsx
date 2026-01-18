
import React from 'react';
import { Appointment } from '../types';

const MOCK_APPOINTMENTS: Appointment[] = [
  { id: '1', patientId: '1', patientName: 'Maria Souza', doctorName: 'Dr. Ricardo Silva', date: '2024-05-22', time: '09:00', type: 'Consulta', status: 'Agendado' },
  { id: '2', patientId: '5', patientName: 'Beatriz Costa', doctorName: 'Dra. Luiza Melo', date: '2024-05-22', time: '10:30', type: 'Exame', status: 'Agendado' },
  { id: '3', patientId: '2', patientName: 'João Pereira', doctorName: 'Dr. Ricardo Silva', date: '2024-05-22', time: '14:00', type: 'Retorno', status: 'Agendado' },
  { id: '4', patientId: '4', patientName: 'Carlos Santos', doctorName: 'Dr. Felipe Amorim', date: '2024-05-23', time: '08:15', type: 'Consulta', status: 'Agendado' },
];

const Appointments: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Agenda Médica</h1>
          <p className="text-slate-500">Consultas, exames e retornos</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">+ Novo Agendamento</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="font-bold text-slate-800">Hoje, 22 de Maio</h2>
              <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button className="px-3 py-1.5 text-xs font-bold bg-white text-blue-600 rounded-md shadow-sm">Lista</button>
              <button className="px-3 py-1.5 text-xs font-bold text-slate-500">Calendário</button>
            </div>
          </div>

          <div className="space-y-3">
            {MOCK_APPOINTMENTS.filter(a => a.date === '2024-05-22').map((app) => (
              <div key={app.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:border-blue-200 transition-colors">
                <div className="w-16 flex flex-col items-center justify-center border-r border-slate-100 shrink-0">
                  <span className="text-lg font-bold text-slate-800 leading-tight">{app.time}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">AM</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-800 truncate">{app.patientName}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                      app.type === 'Emergência' ? 'bg-red-50 text-red-600' :
                      app.type === 'Exame' ? 'bg-purple-50 text-purple-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {app.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {app.doctorName}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100">Checkout</button>
                  <button className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">Atender</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Disponibilidade de Sala</h3>
            <div className="space-y-4">
              {[
                { name: 'Consultório 01', status: 'Ocupado', patient: 'Maria Souza' },
                { name: 'Consultório 02', status: 'Livre', patient: '-' },
                { name: 'Sala de Exames', status: 'Limpeza', patient: '-' },
                { name: 'Centro Cirúrgico', status: 'Ocupado', patient: 'Ana Oliveira' },
              ].map((sala, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-bold text-slate-700">{sala.name}</p>
                    <p className="text-xs text-slate-400">{sala.patient}</p>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    sala.status === 'Ocupado' ? 'bg-red-500' :
                    sala.status === 'Livre' ? 'bg-green-500' :
                    'bg-orange-400'
                  }`}></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
