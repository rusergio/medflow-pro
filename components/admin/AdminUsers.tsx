import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from '@/components/ui/select';
import {
  PlusIcon, SearchIcon, XIcon, UserIcon,
  MailIcon, LockIcon, ShieldIcon, UsersIcon,
  StethoscopeIcon, CheckIcon, CalendarIcon,
  ArrowUpDownIcon, ChevronLeftIcon, ChevronRightIcon,
} from 'lucide-react';

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const ROLE_CONFIG: Record<string, { label: string; badge: string; dot: string; icon: React.ReactNode }> = {
  ADMIN:  {
    label: 'Administrador',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400',
    dot:   'bg-amber-500',
    icon:  <ShieldIcon className="w-3 h-3" />,
  },
  DOCTOR: {
    label: 'Médico(a)',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
    dot:   'bg-blue-500',
    icon:  <StethoscopeIcon className="w-3 h-3" />,
  },
  NURSE:  {
    label: 'Enfermeiro(a)',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400',
    dot:   'bg-emerald-500',
    icon:  <UsersIcon className="w-3 h-3" />,
  },
};

const AVATAR_PALETTE = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
];

const PAGE_SIZE = 8;

/* ─────────────────────────────────────────
   Icon Input
───────────────────────────────────────── */
const IconInput: React.FC<{
  id?: string; icon: React.ReactNode; type?: string;
  value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; minLength?: number;
  error?: string;
}> = ({ id, icon, type = 'text', value, onChange, placeholder, required, minLength, error }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none">
      {icon}
    </span>
    <Input
      id={id} type={type} value={value} required={required} minLength={minLength}
      onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className={`pl-9 ${error ? 'border-destructive focus-visible:ring-destructive/30' : ''}`}
    />
    {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
  </div>
);

/* ─────────────────────────────────────────
   Novo Utilizador Modal
───────────────────────────────────────── */
interface UserForm { name: string; email: string; password: string; role: string; }
const EMPTY_FORM: UserForm = { name: '', email: '', password: '', role: 'DOCTOR' };

const NovoUtilizadorModal: React.FC<{
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}> = ({ open, onOpenChange, onCreated }) => {
  const [form,    setForm]    = useState<UserForm>(EMPTY_FORM);
  const [errors,  setErrors]  = useState<Partial<UserForm>>({});
  const [saving,  setSaving]  = useState(false);
  const [apiErr,  setApiErr]  = useState('');

  const set = (k: keyof UserForm, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
    setApiErr('');
  };

  const validate = () => {
    const e: Partial<UserForm> = {};
    if (!form.name.trim())               e.name     = 'Campo obrigatório';
    if (!form.email.trim())              e.email    = 'Campo obrigatório';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido';
    if (form.password.length < 6)        e.password = 'Mínimo 6 caracteres';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await api.register({ ...form });
      setForm(EMPTY_FORM);
      setErrors({});
      onOpenChange(false);
      onCreated();
    } catch (err: unknown) {
      setApiErr(err instanceof Error ? err.message : 'Erro ao criar utilizador');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => { setForm(EMPTY_FORM); setErrors({}); setApiErr(''); }, 200);
  };

  const roleConf = ROLE_CONFIG[form.role] ?? ROLE_CONFIG.DOCTOR;

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">

        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/30 shrink-0">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold leading-tight">Novo Utilizador</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Preencha os dados de acesso ao sistema</p>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-5 space-y-4">

            {/* Role selector — visual pills at the top */}
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-2 block">Cargo</Label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(ROLE_CONFIG).map(([key, conf]) => (
                  <button key={key} type="button"
                    onClick={() => set('role', key)}
                    className={[
                      'flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-semibold transition-all duration-150',
                      form.role === key
                        ? 'border-amber-400 bg-amber-50 text-amber-700 shadow-sm shadow-amber-200/50 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-600'
                        : 'border-border bg-muted/30 text-muted-foreground hover:border-border/80 hover:bg-muted/50',
                    ].join(' ')}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center ${form.role === key ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {conf.icon}
                    </span>
                    <span className="leading-tight text-center">{conf.label}</span>
                    {form.role === key && <CheckIcon className="w-3 h-3 text-amber-500" />}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Name */}
            <div>
              <Label htmlFor="u-name" className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Nome completo <span className="text-destructive">*</span>
              </Label>
              <IconInput id="u-name" icon={<UserIcon className="w-3.5 h-3.5" />}
                value={form.name} onChange={v => set('name', v)}
                placeholder="Ex: Dr. João Silva" required error={errors.name} />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="u-email" className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Email <span className="text-destructive">*</span>
              </Label>
              <IconInput id="u-email" type="email" icon={<MailIcon className="w-3.5 h-3.5" />}
                value={form.email} onChange={v => set('email', v)}
                placeholder="nome@hospital.pt" required error={errors.email} />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="u-pass" className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Senha <span className="text-destructive">*</span>
              </Label>
              <IconInput id="u-pass" type="password" icon={<LockIcon className="w-3.5 h-3.5" />}
                value={form.password} onChange={v => set('password', v)}
                placeholder="Mínimo 6 caracteres" required minLength={6} error={errors.password} />
            </div>

            {/* API error */}
            {apiErr && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                <XIcon className="w-3.5 h-3.5 shrink-0" /> {apiErr}
              </div>
            )}

            {/* Preview badge */}
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/40 border border-border">
              <span className="text-xs text-muted-foreground font-medium">Será criado como:</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleConf.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${roleConf.dot}`} />
                {roleConf.label}
              </span>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t bg-muted/10 flex-row gap-2 sm:justify-between">
            <Button type="button" variant="ghost" className="text-muted-foreground" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}
              className="gap-2 min-w-[130px] bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25">
              {saving
                ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> A criar...</>
                : <><CheckIcon className="w-4 h-4" /> Criar Utilizador</>
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/* ─────────────────────────────────────────
   Main AdminUsers
───────────────────────────────────────── */
const AdminUsers: React.FC = () => {
  const [users,   setUsers]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [search,  setSearch]  = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('Todos');
  const [page,    setPage]    = useState(1);
  const [sortAsc, setSortAsc] = useState(true);

  const loadUsers = async () => {
    try { const d = await api.getUsers(); setUsers(d.users || []); }
    catch { setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  /* filtering + sorting */
  const filtered = React.useMemo(() => {
    let list = users;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'Todos') list = list.filter(u => u.role === roleFilter);
    return [...list].sort((a, b) =>
      sortAsc
        ? (a.name || '').localeCompare(b.name || '')
        : (b.name || '').localeCompare(a.name || '')
    );
  }, [users, search, roleFilter, sortAsc]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const roleFilterOptions = ['Todos', 'ADMIN', 'DOCTOR', 'NURSE'];
  const roleFilterLabel: Record<string, string> = { Todos:'Todos', ADMIN:'Administradores', DOCTOR:'Médicos', NURSE:'Enfermeiros' };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-amber-200 border-t-amber-500 animate-spin" style={{ borderWidth:'3px' }} />
        <span className="text-sm text-muted-foreground font-medium">A carregar utilizadores…</span>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes au-rise { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        .au-r1{animation:au-rise .4s cubic-bezier(.22,1,.36,1) .00s both}
        .au-r2{animation:au-rise .4s cubic-bezier(.22,1,.36,1) .06s both}
        .au-r3{animation:au-rise .4s cubic-bezier(.22,1,.36,1) .12s both}
        .au-row{animation:au-rise .3s cubic-bezier(.22,1,.36,1) both}
      `}</style>

      <NovoUtilizadorModal open={modal} onOpenChange={setModal} onCreated={loadUsers} />

      <div className="space-y-5 max-w-6xl">

        {/* ── Header ── */}
        <div className="au-r1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
              Gestão de Utilizadores
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {users.length} utilizador{users.length !== 1 ? 'es' : ''} registado{users.length !== 1 ? 's' : ''} no sistema
            </p>
          </div>
          <Button
            onClick={() => setModal(true)}
            className="gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all duration-200 self-start sm:self-auto">
            <PlusIcon className="w-4 h-4" /> Novo Utilizador
          </Button>
        </div>

        {/* ── Summary cards ── */}
        <div className="au-r2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { role:'Todos',  label:'Total',           val: users.length,                                icon:<UsersIcon className="w-4 h-4"/>,        color:'text-slate-600',   bg:'bg-slate-100 dark:bg-slate-700/40'  },
            { role:'ADMIN',  label:'Administradores', val: users.filter(u=>u.role==='ADMIN').length,   icon:<ShieldIcon className="w-4 h-4"/>,        color:'text-amber-600',   bg:'bg-amber-50 dark:bg-amber-900/20'   },
            { role:'DOCTOR', label:'Médicos',          val: users.filter(u=>u.role==='DOCTOR').length,  icon:<StethoscopeIcon className="w-4 h-4"/>,   color:'text-blue-600',    bg:'bg-blue-50 dark:bg-blue-900/20'     },
            { role:'NURSE',  label:'Enfermeiros',      val: users.filter(u=>u.role==='NURSE').length,   icon:<UsersIcon className="w-4 h-4"/>,         color:'text-emerald-600', bg:'bg-emerald-50 dark:bg-emerald-900/20'},
          ].map((c, i) => (
            <button key={i} onClick={() => { setRoleFilter(c.role); setPage(1); }}
              className={[
                'text-left p-4 rounded-2xl border-2 transition-all duration-150 cursor-pointer hover:-translate-y-0.5 hover:shadow-md',
                roleFilter === c.role
                  ? 'border-amber-300 bg-amber-50/80 dark:bg-amber-900/20 shadow-sm shadow-amber-100 dark:border-amber-700'
                  : 'border-slate-100 dark:border-white/10 bg-white dark:bg-white/5 hover:border-slate-200',
              ].join(' ')}>
              <div className={`w-8 h-8 rounded-lg ${c.bg} ${c.color} flex items-center justify-center mb-2`}>
                {c.icon}
              </div>
              <div className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">{c.val}</div>
              <div className="text-xs font-semibold text-muted-foreground mt-0.5">{c.label}</div>
            </button>
          ))}
        </div>

        {/* ── Table card ── */}
        <div className="au-r3 bg-white dark:bg-white/5 rounded-2xl border-2 border-slate-100 dark:border-white/10 overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className={[
              'flex items-center gap-2 h-9 rounded-xl border-2 px-3 transition-all duration-200 flex-1',
              'bg-slate-50 dark:bg-white/5',
              search ? 'border-amber-400 shadow-sm shadow-amber-100' : 'border-transparent',
            ].join(' ')}>
              <SearchIcon className={`w-4 h-4 shrink-0 transition-colors ${search ? 'text-amber-500' : 'text-slate-400'}`} />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Pesquisar por nome ou email…"
                className="flex-1 text-sm bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400" />
              {search && (
                <button onClick={() => { setSearch(''); setPage(1); }} className="text-slate-400 hover:text-slate-600">
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {/* Role filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {roleFilterOptions.map(r => (
                <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
                  className={[
                    'px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all duration-150',
                    roleFilter === r
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-200'
                      : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-white/10 hover:border-slate-200',
                  ].join(' ')}>
                  {roleFilterLabel[r]}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/10">
                  <th className="px-5 py-3">
                    <button onClick={() => setSortAsc(!sortAsc)}
                      className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      Utilizador <ArrowUpDownIcon className="w-3 h-3" />
                    </button>
                  </th>
                  {['Email', 'Cargo', 'Cadastro'].map(h => (
                    <th key={h} className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-16 text-center text-slate-400 text-sm">
                      {search || roleFilter !== 'Todos' ? 'Nenhum utilizador encontrado.' : 'Nenhum utilizador registado.'}
                    </td>
                  </tr>
                ) : (
                  paginated.map((u, i) => {
                    const conf = ROLE_CONFIG[u.role] ?? ROLE_CONFIG.DOCTOR;
                    const avatarColor = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
                    return (
                      <tr key={u.id} className="au-row group hover:bg-slate-50/80 dark:hover:bg-white/[0.03] transition-colors"
                        style={{ animationDelay:`${i*0.04}s` }}>
                        {/* Name + avatar */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${avatarColor}`}>
                              {(u.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{u.name || '—'}</p>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">#{u.id?.toString().slice(0,8) || '—'}</p>
                            </div>
                          </div>
                        </td>
                        {/* Email */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                            <MailIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {u.email}
                          </div>
                        </td>
                        {/* Role badge */}
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${conf.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
                            {conf.label}
                          </span>
                        </td>
                        {/* Date */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-PT') : '—'}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="px-5 py-3.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/60 dark:bg-white/[0.02]">
            <span className="text-xs text-slate-400">
              Mostrando <span className="font-semibold text-slate-600 dark:text-slate-300">{paginated.length}</span> de{' '}
              <span className="font-semibold text-slate-600 dark:text-slate-300">{filtered.length}</span> utilizadores
            </span>
            <div className="flex items-center gap-1.5">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                className="w-8 h-8 rounded-lg border-2 border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={[
                    'w-8 h-8 rounded-lg text-xs font-bold transition-all',
                    p === page
                      ? 'bg-amber-500 text-white shadow-sm shadow-amber-200'
                      : 'border-2 border-slate-100 dark:border-white/10 text-slate-400 hover:border-slate-200',
                  ].join(' ')}>
                  {p}
                </button>
              ))}
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
                className="w-8 h-8 rounded-lg border-2 border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default AdminUsers;