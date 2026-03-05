import React, { useState, useRef, useEffect } from 'react';
import {
  SendIcon, BotIcon, UserIcon, TrashIcon,
  SparklesIcon, ClipboardIcon, CheckIcon,
  StethoscopeIcon, PillIcon, FileTextIcon, ActivityIcon,
} from 'lucide-react';
import { api } from '../services/api';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/* ─────────────────────────────────────────────
   Quick suggestions
───────────────────────────────────────────── */
const SUGGESTIONS = [
  { icon: <PillIcon className="w-3.5 h-3.5" />,        text: 'Calcular dosagem de amoxicilina para criança de 20kg' },
  { icon: <StethoscopeIcon className="w-3.5 h-3.5" />, text: 'Protocolo de atendimento para dor torácica aguda'     },
  { icon: <ActivityIcon className="w-3.5 h-3.5" />,    text: 'Interpretação de valores de troponina elevados'       },
  { icon: <FileTextIcon className="w-3.5 h-3.5" />,    text: 'Critérios diagnósticos para sepse'                   },
];

/* ─────────────────────────────────────────────
   System prompt
───────────────────────────────────────────── */
const SYSTEM_PROMPT = `Você é um Assistente Clínico IA integrado ao sistema MedFlow Pro, desenvolvido para apoiar profissionais de saúde.

Suas capacidades:
- Calcular dosagens medicamentosas com base em peso, idade e condição clínica
- Explicar protocolos clínicos atualizados
- Resumir e interpretar artigos e estudos médicos
- Auxiliar no diagnóstico diferencial com base em sintomas e exames
- Fornecer informações sobre interações medicamentosas
- Esclarecer dúvidas sobre procedimentos e técnicas

Diretrizes:
- Sempre enfatize que suas respostas são de apoio à decisão, não substituem o julgamento clínico
- Seja preciso, claro e use terminologia médica adequada
- Quando calcular dosagens, mostre o cálculo passo a passo
- Para situações de emergência, sempre indique os cuidados imediatos prioritários
- Responda em Português de Portugal/Brasil conforme o contexto

Lembre-se: você é uma ferramenta de auxílio. O profissional de saúde tem a responsabilidade final.`;

/* ─────────────────────────────────────────────
   Copy button
───────────────────────────────────────────── */
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={handle}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10"
      title="Copiar"
    >
      {copied
        ? <CheckIcon className="w-3.5 h-3.5 text-green-500" />
        : <ClipboardIcon className="w-3.5 h-3.5" />
      }
    </button>
  );
};

/* ─────────────────────────────────────────────
   Message bubble
───────────────────────────────────────────── */
const Bubble: React.FC<{ msg: Message }> = ({ msg }) => {
  const isUser = msg.role === 'user';

  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ animation: 'msgIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }}
    >
      {/* Avatar */}
      <div className={[
        'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
        isUser
          ? 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
          : 'bg-primary text-white shadow-md shadow-primary/30',
      ].join(' ')}>
        {isUser
          ? <UserIcon className="w-4 h-4" />
          : <BotIcon className="w-4 h-4" />
        }
      </div>

      {/* Bubble */}
      <div className={`group flex flex-col max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={[
          'px-4 py-3 rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-white rounded-tr-sm shadow-md shadow-primary/20'
            : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 rounded-tl-sm border-2 border-slate-100 dark:border-white/10 shadow-sm',
        ].join(' ')}>
          <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>

        {/* Footer */}
        <div className={`flex items-center gap-1.5 mt-1 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] text-slate-400 font-mono">
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!isUser && <CopyButton text={msg.content} />}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Typing indicator
───────────────────────────────────────────── */
const TypingIndicator: React.FC = () => (
  <div className="flex gap-3" style={{ animation: 'msgIn 0.2s ease both' }}>
    <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/30">
      <BotIcon className="w-4 h-4" />
    </div>
    <div className="bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-primary rounded-full"
            style={{ animation: `bounce 1s ease ${i * 0.15}s infinite` }}
          />
        ))}
      </div>
      <span className="text-xs text-slate-400 font-medium">Analisando dados clínicos...</span>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Main
───────────────────────────────────────────── */
const INITIAL_MSG: Message = {
  id: '0',
  role: 'assistant',
  content: 'Olá! Sou seu Assistente Clínico IA integrado ao MedFlow Pro.\n\nPosso ajudar com dosagens, protocolos clínicos, diagnósticos diferenciais, interações medicamentosas e muito mais. Como posso apoiar sua prática clínica hoje?',
  timestamp: new Date(),
};

const AIChat: React.FC = () => {
  const [messages,  setMessages]  = useState<Message[]>([INITIAL_MSG]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [cleared,   setCleared]   = useState(false);

  const scrollRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  /* Auto-scroll */
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  /* Auto-resize textarea */
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  /* Send */
  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    if (inputRef.current) { inputRef.current.style.height = 'auto'; }
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const { response: reply } = await api.sendChatMessage(text, history);

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply || 'Não foi possível obter resposta. Tente novamente.',
        timestamp: new Date(),
      }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ocorreu um erro ao conectar com o assistente. Verifique sua conexão e tente novamente.';
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: msg,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleClear = () => {
    setMessages([INITIAL_MSG]);
    setCleared(true);
    setTimeout(() => setCleared(false), 1800);
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const isEmpty = messages.length === 1;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0);    }
          30%            { transform: translateY(-5px); }
        }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
      `}</style>

      <div className="h-full flex flex-col gap-4" style={{ animation: 'fadeUp 0.35s ease both' }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Assistente Clínico IA</h1>
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest">Beta</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Suporte à decisão clínica baseado em IA</p>
            </div>
          </div>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-slate-100 dark:border-white/10 text-xs font-semibold text-slate-400 hover:text-red-500 hover:border-red-100 dark:hover:border-red-900/30 transition-all duration-200"
          >
            {cleared
              ? <><CheckIcon className="w-3.5 h-3.5 text-green-500" /> Limpo</>
              : <><TrashIcon className="w-3.5 h-3.5" /> Limpar</>
            }
          </button>
        </div>

        {/* ── Chat area ── */}
        <div className="flex-1 min-h-0 bg-white dark:bg-white/5 rounded-2xl border-2 border-slate-100 dark:border-white/10 flex flex-col overflow-hidden shadow-sm">

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll px-5 py-5 space-y-5">

            {/* Suggestions — only when empty */}
            {isEmpty && (
              <div style={{ animation: 'fadeUp 0.4s ease 0.1s both' }}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Sugestões rápidas</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestion(s.text)}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 border-slate-100 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 text-left text-xs text-slate-600 dark:text-slate-300 font-medium hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition-all duration-200 group"
                      style={{ animation: `fadeUp 0.3s ease ${0.15 + i * 0.06}s both` }}
                    >
                      <span className="text-slate-400 group-hover:text-primary transition-colors shrink-0">{s.icon}</span>
                      {s.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message list */}
            {messages.map((msg) => (
              <Bubble key={msg.id} msg={msg} />
            ))}

            {/* Typing */}
            {loading && <TypingIndicator />}
          </div>

          {/* ── Input area ── */}
          <div className="shrink-0 px-4 py-3 border-t-2 border-slate-100 dark:border-white/10 bg-slate-50/40 dark:bg-white/[0.02]">
            <div className={[
              'flex items-end gap-3 rounded-xl border-2 px-4 py-2.5 transition-all duration-200',
              'bg-white dark:bg-white/5',
              input ? 'border-primary shadow-md shadow-primary/15' : 'border-slate-200 dark:border-white/15',
            ].join(' ')}>
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                disabled={loading}
                placeholder="Descreva sintomas, peça dosagens, protocolos... (Enter para enviar)"
                className="flex-1 text-sm bg-transparent outline-none resize-none text-slate-700 dark:text-white placeholder:text-slate-400 py-0.5 leading-relaxed max-h-[120px]"
                style={{ height: 'auto' }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className={[
                  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
                  input.trim() && !loading
                    ? 'bg-primary text-white shadow-md shadow-primary/30 hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-300 dark:text-slate-600 cursor-not-allowed',
                ].join(' ')}
              >
                <SendIcon className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-400 mt-2 font-medium uppercase tracking-widest">
              Ferramenta de auxílio · Valide sempre informações críticas com fontes oficiais
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChat;