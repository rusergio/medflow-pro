import React from 'react';
import { LayoutDashboard, Users, BarChart3, Settings, User, ScrollText, ShieldCheck } from 'lucide-react';

export type AdminTab = 'admin-dashboard' | 'users' | 'reports' | 'settings' | 'logs' | 'profile';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

const iconClass = 'w-5 h-5';

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'admin-dashboard', label: 'Painel Admin', icon: <LayoutDashboard className={iconClass} /> },
    { id: 'users', label: 'Usuários', icon: <Users className={iconClass} /> },
    { id: 'reports', label: 'Relatórios', icon: <BarChart3 className={iconClass} /> },
    { id: 'settings', label: 'Configurações', icon: <Settings className={iconClass} /> },
    { id: 'profile', label: 'Meu Perfil', icon: <User className={iconClass} /> },
    { id: 'logs', label: 'Logs de Atividade', icon: <ScrollText className={iconClass} /> },
  ];

  return (
    <div className="w-20 md:w-64 bg-slate-900 flex flex-col transition-all duration-300">
      <div className="p-4 flex items-center gap-3 border-b border-slate-700">
        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-900 font-bold shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <span className="hidden md:block font-bold text-lg text-white tracking-tight">
          Admin<span className="text-amber-400">Panel</span>
        </span>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-colors ${
              activeTab === item.id
                ? 'bg-amber-500/20 text-amber-400 border-l-2 border-amber-500'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className={activeTab === item.id ? 'text-amber-400' : 'text-slate-500'}>
              {item.icon}
            </span>
            <span className="hidden md:block truncate">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800 rounded-xl p-3 hidden md:block">
          <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Painel Administrativo</p>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            Modo Admin
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
