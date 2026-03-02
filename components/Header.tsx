import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import {
  SearchIcon, BellIcon, UserIcon, SettingsIcon,
  LogOutIcon, XIcon, CheckCheckIcon, ClockIcon,
} from 'lucide-react';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

/* ─────────────────────────────────────────────
   Mock notifications
───────────────────────────────────────────── */
const NOTIFICATIONS = [
  { id: 1, text: 'Internação aprovada — João Silva',       time: 'agora',   unread: true,  type: 'success' },
  { id: 2, text: 'Leito 14B liberado para higienização',   time: '5 min',   unread: true,  type: 'info'    },
  { id: 3, text: 'Cirurgia agendada — Dr. Ramos · 18h30', time: '18 min',  unread: true,  type: 'warning' },
  { id: 4, text: 'Alta médica — Maria Oliveira',           time: '1h',      unread: false, type: 'success' },
];

const notifColors: Record<string, string> = {
  success: 'bg-green-400',
  info:    'bg-blue-400',
  warning: 'bg-amber-400',
  error:   'bg-red-400',
};

/* ─────────────────────────────────────────────
   Header
───────────────────────────────────────────── */
const Header: React.FC<HeaderProps> = ({ user, onLogout, onProfileClick, onSettingsClick }) => {
  const [showDropdown,  setShowDropdown]  = useState(false);
  const [showNotifs,    setShowNotifs]    = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal,     setSearchVal]     = useState('');
  const [notifs,        setNotifs]        = useState(NOTIFICATIONS);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifsRef   = useRef<HTMLDivElement>(null);
  const searchRef   = useRef<HTMLInputElement>(null);

  const unreadCount = notifs.filter((n) => n.unread).length;

  /* close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
      if (notifsRef.current   && !notifsRef.current.contains(e.target as Node))   setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));

  return (
    <>
      <style>{`
        @keyframes dropDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        .drop-anim { animation: dropDown 0.18s ease forwards; }
      `}</style>

      <header className="h-16 bg-white dark:bg-slate-900 border-b-2 border-slate-100 dark:border-white/10 flex items-center justify-between px-5 md:px-8 shrink-0 z-20">

        {/* ── Search ── */}
        <div
          className={[
            'flex items-center gap-2.5 h-9 rounded-xl border-2 px-3 transition-all duration-200',
            'bg-slate-50 dark:bg-white/5',
            searchFocused
              ? 'border-primary shadow-md shadow-primary/15 w-64 md:w-80'
              : 'border-transparent w-44 md:w-64',
          ].join(' ')}
        >
          <SearchIcon className={`w-4 h-4 shrink-0 transition-colors ${searchFocused ? 'text-primary' : 'text-slate-400'}`} />
          <input
            ref={searchRef}
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Buscar utente ou ficha..."
            className="flex-1 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
          />
          {searchVal && (
            <button onClick={() => { setSearchVal(''); searchRef.current?.focus(); }}
              className="text-slate-400 hover:text-slate-600 transition-colors">
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ── Right side ── */}
        <div className="flex items-center gap-2">

          {/* Notifications */}
          <div className="relative" ref={notifsRef}>
            <button
              onClick={() => { setShowNotifs(!showNotifs); setShowDropdown(false); }}
              className={[
                'relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
                showNotifs
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white',
              ].join(' ')}
            >
              <BellIcon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="drop-anim absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden z-50">
                {/* header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/10">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Notificações</p>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead}
                      className="flex items-center gap-1 text-[11px] text-primary font-semibold hover:underline">
                      <CheckCheckIcon className="w-3 h-3" /> Marcar todas
                    </button>
                  )}
                </div>

                {/* list */}
                <div className="divide-y divide-slate-50 dark:divide-white/5 max-h-72 overflow-y-auto">
                  {notifs.map((n) => (
                    <div key={n.id} className={[
                      'flex items-start gap-3 px-4 py-3 transition-colors',
                      n.unread ? 'bg-primary/[0.03] dark:bg-primary/10' : '',
                    ].join(' ')}>
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notifColors[n.type]} ${!n.unread ? 'opacity-30' : ''}`} />
                      <p className={`flex-1 text-xs leading-relaxed ${n.unread ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-400'}`}>
                        {n.text}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-0.5 mt-0.5">
                        <ClockIcon className="w-2.5 h-2.5" />{n.time}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-2.5 border-t border-slate-100 dark:border-white/10 text-center">
                  <button className="text-xs text-primary font-semibold hover:underline">
                    Ver todas as notificações
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* divider */}
          <div className="w-px h-6 bg-slate-100 dark:bg-white/10 mx-1" />

          {/* User menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => { setShowDropdown(!showDropdown); setShowNotifs(false); }}
              className={[
                'flex items-center gap-2.5 pl-2 pr-2.5 py-1.5 rounded-xl transition-all duration-200',
                showDropdown
                  ? 'bg-slate-100 dark:bg-white/10'
                  : 'hover:bg-slate-50 dark:hover:bg-white/5',
              ].join(' ')}
            >
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&size=80`}
                alt="Avatar"
                className="w-8 h-8 rounded-xl object-cover shrink-0"
              />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">{user.name}</p>
                <p className="text-[11px] text-slate-400 leading-tight">{user.role}</p>
              </div>
            </button>

            {showDropdown && (
              <div className="drop-anim absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden z-50">
                {/* user info */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>

                {/* actions */}
                <div className="py-1.5">
                  <button
                    onClick={() => { onProfileClick?.(); setShowDropdown(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    Meu Perfil
                  </button>
                  <button
                    onClick={() => { onSettingsClick?.(); setShowDropdown(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-400" />
                    Configurações
                  </button>
                </div>

                <div className="border-t border-slate-100 dark:border-white/10 py-1.5">
                  <button
                    onClick={() => { onLogout(); setShowDropdown(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    Sair da conta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;