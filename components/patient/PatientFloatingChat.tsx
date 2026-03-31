import React, { useState } from 'react';
import { SparklesIcon, XIcon } from 'lucide-react';
import AIChat from '../AIChat';
import PatientChatOrAuth from './PatientChatOrAuth';
import { User } from '../../types';

interface PatientFloatingChatProps {
  isLoggedIn: boolean;
  onLoginSuccess: (user: User, token: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const PatientFloatingChat: React.FC<PatientFloatingChatProps> = ({ isLoggedIn, onLoginSuccess, open: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  return (
    <>
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulseRing {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.3); }
        }
        .chat-panel { animation: chatSlideUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fab-ring::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: inherit;
          animation: pulseRing 2s ease-out infinite;
          pointer-events: none;
        }
      `}</style>

      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fab-ring fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-105 hover:shadow-xl hover:shadow-primary/50 active:scale-95 transition-all duration-200"
        aria-label="Abrir Assistente IA"
      >
        <SparklesIcon className="w-6 h-6" />
      </button>

      {/* Chat panel overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="chat-panel absolute bottom-0 left-0 right-0 top-[15%] md:top-[10%] md:left-auto md:right-6 md:w-[420px] md:max-h-[85vh] md:rounded-2xl md:bottom-auto bg-white rounded-t-2xl border-t md:border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-primary" />
                <span className="font-semibold text-slate-800 dark:text-white">Assistente IA</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {isLoggedIn ? <AIChat /> : <PatientChatOrAuth isLoggedIn={false} onLoginSuccess={onLoginSuccess} />}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientFloatingChat;
