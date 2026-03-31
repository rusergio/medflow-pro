import React from 'react';
import { HomeIcon, PillIcon, LogOutIcon } from 'lucide-react';
import { LOGO } from '@/lib/logo';

export type PatientTab = 'home' | 'farmacia';

interface PatientNavProps {
  activeTab: PatientTab;
  setActiveTab: (tab: PatientTab) => void;
  userName?: string;
  onLogout?: () => void;
}

const NAV_ITEMS: { id: PatientTab; label: string; icon: React.ReactNode }[] = [
  { id: 'home',     label: 'Início',    icon: <HomeIcon className="w-5 h-5" /> },
  { id: 'farmacia', label: 'Farmácia',  icon: <PillIcon className="w-5 h-5" /> },
];

const PatientNav: React.FC<PatientNavProps> = ({ activeTab, setActiveTab, userName, onLogout }) => {
  return (
    <nav className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary flex items-center justify-center shrink-0">
              <img src={LOGO.main} alt="MedFlow" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg text-slate-800 dark:text-white tracking-tight">
              MedFlow<span className="text-primary">Pro</span>
            </span>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={[
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white',
                  ].join(' ')}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User + Logout / Registar */}
          <div className="flex items-center gap-2">
            {userName && (
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px] hidden sm:block">
                {userName}
              </span>
            )}
            {onLogout && !userName && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      window.localStorage.setItem('medflow_login_view', 'patient-register');
                    } catch {
                      // ignore
                    }
                    onLogout();
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors border border-emerald-100"
                >
                  Registar
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <LogOutIcon className="w-4 h-4" />
                  Voltar ao início
                </button>
              </>
            )}
            {onLogout && userName && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <LogOutIcon className="w-4 h-4" />
                Sair
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PatientNav;
