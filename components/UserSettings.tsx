
import React, { useState } from 'react';

const UserSettings: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [lang, setLang] = useState('pt-BR');

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
        <p className="text-slate-500">Preferências da sua conta</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
        <div className="p-6">
          <h3 className="font-bold text-slate-800 mb-4">Notificações</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-700">Notificações no sistema</span>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-700">Alertas por email</span>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
            <p className="text-sm text-slate-500">Receba avisos sobre consultas e atualizações importantes.</p>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-bold text-slate-800 mb-4">Idioma</h3>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="p-6">
          <h3 className="font-bold text-slate-800 mb-4">Sessão</h3>
          <p className="text-sm text-slate-500 mb-4">Sua sessão expira após um período de inatividade por segurança.</p>
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium">
            Encerrar outras sessões
          </button>
        </div>
      </div>

      <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
        Salvar preferências
      </button>
    </div>
  );
};

export default UserSettings;
