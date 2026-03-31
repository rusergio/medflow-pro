import React, { useState } from 'react';
import {
  ActivityIcon,
  BarChart3,
  ChevronLeftIcon,
  ChevronRightIcon,
  LayoutDashboardIcon,
  ScrollTextIcon,
  UsersIcon,
  WifiIcon,
} from 'lucide-react';
import { LOGO } from '@/lib/logo';

export type AdminTab = 'admin-dashboard' | 'users' | 'reports' | 'settings' | 'logs' | 'profile';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState<AdminTab | null>(null);

  const MENU: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'admin-dashboard', label: 'Painel Admin', icon: <LayoutDashboardIcon className="w-5 h-5" /> },
    { id: 'users', label: 'Usuários', icon: <UsersIcon className="w-5 h-5" /> },
    { id: 'reports', label: 'Relatórios', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'logs', label: 'Logs de Atividade', icon: <ScrollTextIcon className="w-5 h-5" /> },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .sidebar-label { animation: fadeInLeft 0.18s ease both; }
        .sidebar-tooltip {
          position: absolute;
          left: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%);
          background: #1e293b;
          color: white;
          font-size: 12px;
          font-weight: 600;
          padding: 5px 10px;
          border-radius: 8px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 999;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .sidebar-tooltip::before {
          content: '';
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-right-color: #1e293b;
        }
      `}</style>

      <aside
        className="relative flex flex-col bg-white dark:bg-slate-900 border-r-2 border-slate-100 dark:border-white/10 transition-all duration-300 ease-in-out shrink-0"
        style={{ width: collapsed ? '72px' : '240px' }}
      >
        {/* Logo */}
        <div
          className={`flex items-center border-b-2 border-slate-100 dark:border-white/10 h-16 transition-all duration-300 ${
            collapsed ? 'px-4 justify-center' : 'px-5 gap-3'
          }`}
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-amber-500 flex items-center justify-center">
            <img
              src={LOGO.main}
              alt="MedFlow"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="text-white font-black text-sm hidden">MF</span>
          </div>

          {!collapsed && (
            <span className="sidebar-label font-bold text-lg text-slate-800 dark:text-white tracking-tight whitespace-nowrap">
              Admin<span className="text-amber-400">Panel</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-hidden">
          {MENU.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={[
                    'w-full flex items-center rounded-xl transition-all duration-200 group',
                    collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                    isActive
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'shrink-0 transition-transform duration-200',
                      !isActive && 'group-hover:scale-110',
                    ].join(' ')}
                  >
                    {item.icon}
                  </span>

                  {!collapsed && (
                    <span className="sidebar-label text-sm font-semibold truncate">{item.label}</span>
                  )}

                  {isActive && collapsed && (
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/80" />
                  )}
                </button>

                {collapsed && hovered === item.id && <div className="sidebar-tooltip">{item.label}</div>}
              </div>
            );
          })}
        </nav>

        {/* Status block */}
        {!collapsed && (
          <div className="mx-3 mb-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 sidebar-label">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">
              Admin MedFlow
            </p>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sistema OK</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <WifiIcon className="w-3 h-3 text-slate-400" />
              <span className="text-[11px] text-slate-400">Tempo real · 0ms</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <ActivityIcon className="w-3 h-3 text-slate-400" />
              <span className="text-[11px] text-slate-400">Monitorização ativa</span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="flex justify-center mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={[
            'absolute -right-3.5 top-1/2 -translate-y-1/2',
            'w-7 h-7 rounded-full bg-white dark:bg-slate-800',
            'border-2 border-slate-100 dark:border-white/15',
            'flex items-center justify-center',
            'text-slate-400 hover:text-amber-500 hover:border-amber-500/40',
            'transition-all duration-200 shadow-sm',
            'z-10',
          ].join(' ')}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <ChevronRightIcon className="w-3.5 h-3.5" /> : <ChevronLeftIcon className="w-3.5 h-3.5" />}
        </button>
      </aside>
    </>
  );
};

export default AdminSidebar;
