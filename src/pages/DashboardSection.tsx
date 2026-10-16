import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  CalendarClock,
  CheckCircle2,
  Landmark,
  Layers,
  Percent,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { formatCurrency } from '../utils/formatters';
import { styles } from '../theme';
import { EntryItem } from '../types/entryType';
import { ExpenseItem } from '../types/expensesType';
import { PayableItem } from '../types/payablesType';
import { ClientItem } from '../types/clientType';
import { ReceivableItem } from '../types/receivableType';
import { NavigationTab, Projeto2D, TipoProjeto } from '../types';
import { Bank_account, UserType } from '../types/userType';

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface DashboardSectionProps {
  entries: EntryItem[];
  expenses: ExpenseItem[];
  payables: PayableItem[];
  receivables: ReceivableItem[];
  project: Projeto2D[];
  clients?: ClientItem[];
  bank: Bank_account[];
  user: UserType | undefined | null;
  onNavigate?: (tab: NavigationTab) => void;
  onOpenNewEntry?: () => void;
  onOpenNewExpense?: () => void;
}

type FilterMode = 'day' | 'month' | 'custom';

/* -------------------------------------------------------------------------- */
/*  Constantes                                                                 */
/* -------------------------------------------------------------------------- */

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const PALETTE = ['#003d9b', '#0284c7', '#0d9488', '#6366f1', '#f59e0b', '#94a3b8'];

const TIPO_LABEL: Record<TipoProjeto, string> = {
  'porta-vidro': 'Porta de vidro',
  'janela': 'Janela',
  'box-banheiro': 'Box de banheiro',
  'portao-ferro': 'Portão',
  'porta-aluminio': 'Porta de alumínio',
};

// Animações (CSS puro, sem dependências). Respeita "reduzir movimento" do sistema.
const CSS = `
@keyframes ff-rise { from { opacity: 0; transform: translateY(18px) scale(.985); } }
@keyframes ff-fade { from { opacity: 0; } }
@keyframes ff-grow-y { from { transform: scaleY(0); } }
@keyframes ff-grow-x { from { transform: scaleX(0); } }
@keyframes ff-draw { from { stroke-dasharray: 1; stroke-dashoffset: 1; } to { stroke-dasharray: 1; stroke-dashoffset: 0; } }
@keyframes ff-donut { from { stroke-dasharray: 0 var(--c); } }
@keyframes ff-float { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-8px) scale(1.04); } }
@keyframes ff-pulse { 0% { box-shadow: 0 0 0 0 var(--pulse); } 70% { box-shadow: 0 0 0 12px rgba(255,255,255,0); } 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); } }
@keyframes ff-sheen { from { transform: translateX(-120%) skewX(-18deg); } to { transform: translateX(260%) skewX(-18deg); } }
.ff-rise { animation: ff-rise .7s cubic-bezier(.22,1,.36,1) backwards; animation-delay: var(--d, 0ms); }
.ff-fade { animation: ff-fade .8s ease backwards; animation-delay: var(--d, 0ms); }
.ff-bar { transform-box: fill-box; transform-origin: bottom; animation: ff-grow-y .9s cubic-bezier(.22,1,.36,1) backwards; animation-delay: var(--d, 0ms); }
.ff-barx { transform-origin: left; animation: ff-grow-x 1s cubic-bezier(.22,1,.36,1) backwards; animation-delay: var(--d, 0ms); }
.ff-draw { animation: ff-draw 1.5s cubic-bezier(.4,0,.2,1) .25s backwards; }
.ff-donut { animation: ff-donut 1.1s cubic-bezier(.22,1,.36,1) backwards; animation-delay: var(--d, 0ms); }
.ff-float { animation: ff-float 7s ease-in-out infinite; }
.ff-pulse { animation: ff-pulse 2.2s ease-out infinite; }
.ff-sheen::after { content: ''; position: absolute; inset: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent); transform: translateX(-120%) skewX(-18deg); pointer-events: none; }
.ff-sheen:hover::after { animation: ff-sheen 1s ease; }
@media (prefers-reduced-motion: reduce) {
  .ff-rise, .ff-fade, .ff-bar, .ff-barx, .ff-draw, .ff-donut, .ff-float, .ff-pulse { animation: none !important; }
}
`;

/* -------------------------------------------------------------------------- */
/*  Utilitários                                                                */
/* -------------------------------------------------------------------------- */

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const norm = (s?: string | null) => (s ?? '').trim().toLowerCase();

// Interpreta "YYYY-MM-DD", "DD/MM/YYYY" ou qualquer data válida, sempre no fuso local
const toDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const s = String(value).trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const firstOfMonth = (d: Date, offset = 0) => new Date(d.getFullYear(), d.getMonth() + offset, 1);
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const diffDays = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / 86400000);
const fmtDate = (d: Date | null) => (d ? d.toLocaleDateString('pt-BR') : '—');
const dateInputValue = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const inRange = (d: Date | null, start: Date, endExclusive: Date) => !!d && d >= start && d < endExclusive;

const variation = (cur: number, prev: number): number | null =>
  prev > 0 ? ((cur - prev) / prev) * 100 : null;

const niceCeil = (v: number): number => {
  if (v <= 0) return 1000;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / p;
  const n = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return n * p;
};

const compact = (v: number): string => {
  const a = Math.abs(v);
  const s = v < 0 ? '-' : '';
  if (a >= 1_000_000) return `${s}${(a / 1_000_000).toFixed(1)}M`;
  if (a >= 1_000) return `${s}${(a / 1_000).toFixed(a >= 10_000 ? 0 : 1)}k`;
  return `${s}${a.toFixed(0)}`;
};

const isPaidPayable = (p: PayableItem) => norm(p.status) === 'pago';
const isClosedReceivable = (r: ReceivableItem) => r.status === 'paid' || r.status === 'received';

// Variáveis CSS para atraso das animações
const delay = (ms: number) => ({ '--d': `${ms}ms` } as React.CSSProperties);

// Cor translúcida a partir de um hex (#rrggbb); cai para cinza se não for hex
const tint = (color: string, alpha = '1f') => (/^#[0-9a-f]{6}$/i.test(color) ? `${color}${alpha}` : '#e2e8f0');

/* -------------------------------------------------------------------------- */
/*  Hook: contagem animada                                                     */
/* -------------------------------------------------------------------------- */

const useCountUp = (target: number, duration = 1200): number => {
  const isServer = typeof window === 'undefined';
  const [value, setValue] = useState<number>(isServer ? target : 0);
  const from = useRef<number>(isServer ? target : 0);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      from.current = target;
      setValue(target);
      return;
    }
    const origin = from.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = origin + (target - origin) * eased;
      from.current = v;
      setValue(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
};

const AnimatedValue: React.FC<{ value: number; format: (n: number) => string }> = ({ value, format }) => {
  const v = useCountUp(value);
  return <>{format(v)}</>;
};

const asCurrency = (n: number) => formatCurrency(n);
const asInt = (n: number) => String(Math.round(n));

/* -------------------------------------------------------------------------- */
/*  Componentes de apoio                                                       */
/* -------------------------------------------------------------------------- */

const Sparkline: React.FC<{ values: number[] }> = ({ values }) => {
  if (values.length < 2) return null;
  const w = 120;
  const h = 40;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * w,
    y: h - 6 - ((v - min) / span) * (h - 14),
  }));
  const line = pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-28 shrink-0 overflow-visible" aria-hidden="true">
      <path d={`${line} L ${w} ${h} L 0 ${h} Z`} fill="#fff" opacity="0.15" className="ff-fade" style={delay(500)} />
      <path d={line} pathLength={1} className="ff-draw" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="3" fill="#fff" className="ff-fade" style={delay(1400)} />
    </svg>
  );
};

const MiniStack: React.FC<{ parts: { pct: number; opacity: number }[] }> = ({ parts }) => (
  <div className="flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full bg-white/20">
    {parts
      .filter((p) => p.pct > 0)
      .map((p, i) => (
        <div key={i} className="ff-barx h-full rounded-full bg-white" style={{ width: `${p.pct}%`, opacity: p.opacity, ...delay(500 + i * 120) }} />
      ))}
  </div>
);

interface KpiCardProps {
  label: string;
  value: number;
  format: (n: number) => string;
  icon: LucideIcon;
  from: string;
  to: string;
  glow: string;
  trend?: number | null; // undefined = sem indicador; null = sem base de comparação
  invertTrend?: boolean; // true quando subir é ruim (ex.: despesas)
  hint?: string;
  spark?: number[];
  bar?: React.ReactNode;
  delayMs?: number;
}

const KpiCard: React.FC<KpiCardProps> = ({
  label, value, format, icon: Icon, from, to, glow, trend, invertTrend, hint, spark, bar, delayMs = 0,
}) => {
  const up = (trend ?? 0) >= 0;
  const good = invertTrend ? !up : up;
  return (
    <div
      className="ff-rise ff-sheen group relative overflow-hidden rounded-2xl p-5 text-white transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundImage: `linear-gradient(135deg, ${from} 100%, ${to} 0%)`,
        boxShadow: `0 18px 34px -18px ${glow}`,
        ...delay(delayMs),
      }}
    >
      <span className="ff-float pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
      <span className="ff-float pointer-events-none absolute -bottom-12 left-1/3 h-28 w-28 rounded-full bg-white/[0.07]" style={{ animationDelay: '-3s' }} />

      <div className="relative flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/80">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shadow-inner backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>

      <p className="relative mt-3 text-[28px] font-semibold leading-none tracking-tight tabular-nums">
        <AnimatedValue value={value} format={format} />
      </p>

      <div className="relative mt-4 flex items-end justify-between gap-3">
        <div className="flex flex-col items-start gap-1.5 text-xs">
          {trend !== undefined &&
            (trend === null ? (
              <span className="text-white/70">Sem período anterior</span>
            ) : (
              <span className={`inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 font-semibold ${good ? 'text-emerald-700' : 'text-rose-700'}`}>
                {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(trend).toFixed(1)}%
              </span>
            ))}
          {hint && <span className="text-white/80">{hint}</span>}
        </div>
        {spark && <Sparkline values={spark} />}
      </div>

      {bar && <div className="relative mt-3">{bar}</div>}
    </div>
  );
};

const Card: React.FC<{ className?: string; delayMs?: number; children: React.ReactNode }> = ({
  className = '',
  delayMs = 0,
  children,
}) => (
  <section
    className={`ff-rise rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow duration-300 hover:shadow-lg hover:shadow-slate-200/60 ${className}`}
    style={delay(delayMs)}
  >
    {children}
  </section>
);

const CardHeader: React.FC<{ title: string; subtitle?: string; right?: React.ReactNode }> = ({ title, subtitle, right }) => (
  <div className="mb-5 flex items-start justify-between gap-3">
    <div>
      <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
    </div>
    {right}
  </div>
);

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-xs text-slate-400">
    {text}
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  entries,
  expenses,
  payables,
  receivables,
  project,
  clients = [],
  bank,
  user,
  onNavigate,
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('month');
  const [selectedDay, setSelectedDay] = useState(() => dateInputValue(new Date()));
  const [selectedMonth, setSelectedMonth] = useState(() => dateInputValue(new Date()).slice(0, 7));
  const [startDate, setStartDate] = useState(() => dateInputValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
  const [endDate, setEndDate] = useState(() => dateInputValue(new Date()));
  const [hoverBar, setHoverBar] = useState<number | null>(null);
  const [hoverSlice, setHoverSlice] = useState<number | null>(null);

  const today = useMemo(() => startOfDay(new Date()), []);

  /* ------------------------------ janelas ------------------------------- */

  const win = useMemo(() => {
    let start: Date;
    let end: Date;

    if (filterMode === 'day') {
      start = startOfDay(toDate(selectedDay) ?? today);
      end = addDays(start, 1);
    } else if (filterMode === 'month') {
      const [year, month] = selectedMonth.split('-').map(Number);
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 1);
    } else {
      start = startOfDay(toDate(startDate) ?? today);
      const selectedEnd = startOfDay(toDate(endDate) ?? today);
      end = addDays(selectedEnd < start ? start : selectedEnd, 1);
    }

    const duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
    return {
      start,
      end,
      prevStart: filterMode === 'month' ? firstOfMonth(start, -1) : addDays(start, -duration),
      prevEnd: start,
    };
  }, [filterMode, selectedDay, selectedMonth, startDate, endDate, today]);

  const filterDescription = useMemo(() => {
    if (filterMode === 'day') return `Dia ${fmtDate(win.start)}`;
    if (filterMode === 'month') return win.start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return `${fmtDate(win.start)} a ${fmtDate(addDays(win.end, -1))}`;
  }, [filterMode, win]);

  const filterKey = `${filterMode}-${dateInputValue(win.start)}-${dateInputValue(addDays(win.end, -1))}`;

  const datedEntries = useMemo(() => entries.map((item) => ({ item, date: toDate(item.date) })), [entries]);
  const datedExpenses = useMemo(() => expenses.map((item) => ({ item, date: toDate(item.date) })), [expenses]);

  /* ------------------------------- caixa -------------------------------- */

  // Caixa interno = saldo inicial + entradas no "Caixa Interno" − saídas do "Caixa Interno"
  const caixaInterno = useMemo(() => {
    const inflow = entries
      .filter((e) => norm(e.destination_account).includes('caixa interno'))
      .reduce((a, e) => a + num(e.amount), 0);
    const outflow = expenses
      .filter((e) => norm(e.outgoing_account).includes('caixa interno'))
      .reduce((a, e) => a + num(e.amount), 0);
    return num(user?.cash_balance_initial) + inflow - outflow;
  }, [entries, expenses, user]);

  const saldoContas = useMemo(() => bank.reduce((a, b) => a + num(b.saldo), 0), [bank]);
  const saldoConsolidado = saldoContas + caixaInterno;

  /* -------------------------------- KPIs -------------------------------- */

  const kpi = useMemo(() => {
    const calc = (s: Date, e: Date) => {
      let receitas = 0;
      let taxas = 0;
      let despesas = 0;
      datedEntries.forEach(({ item, date }) => {
        if (!inRange(date, s, e)) return;
        receitas += num(item.amount);
        taxas += (num(item.fee) / 100) * num(item.amount);
      });
      datedExpenses.forEach(({ item, date }) => {
        if (inRange(date, s, e)) despesas += num(item.amount);
      });
      return { receitas, despesas, taxas, lucro: receitas - despesas };
    };
    return { cur: calc(win.start, win.end), prev: calc(win.prevStart, win.prevEnd) };
  }, [datedEntries, datedExpenses, win]);

  const margem = kpi.cur.receitas > 0 ? (kpi.cur.lucro / kpi.cur.receitas) * 100 : 0;

  /* ----------------------------- clientes/proj. ------------------------- */

  const projetosAprovados = useMemo(() => project.filter((p) => p.status === 'approved'), [project]);
  const valorAprovado = projetosAprovados.reduce((a, p) => a + num(p.estimated_value), 0);
  const taxaAprovacao = project.length > 0 ? (projetosAprovados.length / project.length) * 100 : 0;

  const clientesComProjeto = useMemo(() => {
    const ids = new Set(project.map((p) => p.client_id).filter((id): id is number => !!id));
    return ids.size;
  }, [project]);
  const pctClientesComProjeto = clients.length > 0 ? Math.min(100, (clientesComProjeto / clients.length) * 100) : 0;

  const ultimosAprovados = useMemo(() => {
    return projetosAprovados
      .map((p) => ({
        p,
        date: toDate(p.updated_at),
        stamp: Number(String(p.id).replace(/\D/g, '')) || 0,
      }))
      .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0) || b.stamp - a.stamp)
      .slice(0, 5);
  }, [projetosAprovados]);

  const funil = useMemo(() => {
    const defs: { key: Projeto2D['status']; label: string; color: string }[] = [
      { key: 'draft', label: 'Em elaboração', color: '#94a3b8' },
      { key: 'presented', label: 'Apresentados', color: '#0284c7' },
      { key: 'approved', label: 'Aprovados', color: '#059669' },
    ];
    return defs.map((d) => {
      const list = project.filter((p) => p.status === d.key);
      return { ...d, count: list.length, value: list.reduce((a, p) => a + num(p.estimated_value), 0) };
    });
  }, [project]);

  /* ----------------------------- fluxo do período ----------------------- */

  const flow = useMemo(() => {
    const totalDays = Math.max(1, Math.round((win.end.getTime() - win.start.getTime()) / 86400000));
    // Dia selecionado: um total diário. Mês: detalhamento por dia. Personalizado:
    // detalha por dia em intervalos de até 45 dias; acima disso agrupa por mês.
    const granularity: 'single' | 'day' | 'month' =
      filterMode === 'day' ? 'single' : filterMode === 'month' || totalDays <= 45 ? 'day' : 'month';

    const buckets: { start: Date; end: Date }[] = [];
    if (granularity === 'single') {
      buckets.push({ start: win.start, end: win.end });
    } else if (granularity === 'day') {
      for (let d = new Date(win.start); d < win.end; d = addDays(d, 1)) {
        buckets.push({ start: d, end: addDays(d, 1) });
      }
    } else {
      let cursor = firstOfMonth(win.start);
      while (cursor < win.end) {
        const next = firstOfMonth(cursor, 1);
        buckets.push({ start: cursor < win.start ? win.start : cursor, end: next > win.end ? win.end : next });
        cursor = next;
      }
    }

    const series = buckets.map(({ start: s, end: e }) => {
      const entradas = datedEntries
        .filter(({ date }) => inRange(date, s, e))
        .reduce((a, { item }) => a + num(item.amount), 0);
      const saidas = datedExpenses
        .filter(({ date }) => inRange(date, s, e))
        .reduce((a, { item }) => a + num(item.amount), 0);
      const label = granularity === 'single'
        ? s.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        : granularity === 'day'
          ? String(s.getDate())
          : MESES[s.getMonth()];
      const full = granularity === 'month'
        ? `${MESES[s.getMonth()]}/${s.getFullYear()}`
        : s.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return { label, full, entradas, saidas, saldo: entradas - saidas };
    });

    const W = 760;
    const H = 270;
    const L = 56;
    const R = 16;
    const T = 16;
    const B = 34;
    const pw = W - L - R;
    const ph = H - T - B;
    const maxVal = Math.max(...series.map((item) => Math.max(item.entradas, item.saidas, item.saldo)), 0);
    const minSaldo = Math.min(...series.map((item) => item.saldo), 0);
    const yMax = niceCeil(maxVal * 1.1);
    const yMin = minSaldo < 0 ? -niceCeil(-minSaldo * 1.1) : 0;
    const y = (v: number) => T + ph - ((v - yMin) / (yMax - yMin || 1)) * ph;
    const groupW = pw / Math.max(1, series.length);
    const barW = Math.min(28, groupW * 0.3);
    const points = series.map((item, i) => {
      const cx = L + (i + 0.5) * groupW;
      return { ...item, cx, yEnt: y(item.entradas), ySai: y(item.saidas), ySal: y(item.saldo) };
    });
    const line = points.map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.cx} ${point.ySal}`).join(' ');
    const y0 = y(0);
    const best = series.length ? series.reduce((a, b) => (b.saldo > a.saldo ? b : a), series[0]) : null;
    const sumIn = series.reduce((a, item) => a + item.entradas, 0);
    const periodDays = Math.max(1, totalDays);
    const monthCount = Math.max(1, (win.end.getFullYear() - win.start.getFullYear()) * 12 + win.end.getMonth() - win.start.getMonth());

    return {
      W, H, L, R, T, B, pw, ph, groupW, barW, y0, points, line,
      area: points.length ? `${line} L ${points[points.length - 1].cx} ${y0} L ${points[0].cx} ${y0} Z` : '',
      ticks: [0, 1, 2, 3, 4].map((k) => {
        const v = yMin + ((yMax - yMin) * k) / 4;
        return { v, y: y(v) };
      }),
      hasData: series.some((item) => item.entradas > 0 || item.saidas > 0),
      best,
      avgIn: sumIn / (granularity === 'single' ? 1 : granularity === 'day' ? periodDays : monthCount),
      count:
        datedEntries.filter(({ date }) => inRange(date, win.start, win.end)).length +
        datedExpenses.filter(({ date }) => inRange(date, win.start, win.end)).length,
      granularity,
    };
  }, [datedEntries, datedExpenses, win, filterMode]);

  const sparkOf = (k: 'entradas' | 'saidas' | 'saldo') => flow.points.map((p) => p[k]);

  /* ------------------------ despesas por categoria ---------------------- */

  const expenseCats = useMemo(() => {
    const map = new Map<string, number>();
    datedExpenses.forEach(({ item, date }) => {
      if (!inRange(date, win.start, win.end)) return;
      const k = (item.category || 'Sem categoria').trim();
      map.set(k, (map.get(k) ?? 0) + num(item.amount));
    });
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 5);
    const rest = sorted.slice(5).reduce((a, [, v]) => a + v, 0);
    if (rest > 0) top.push(['Outras', rest]);
    const total = top.reduce((a, [, v]) => a + v, 0);
    const C = 2 * Math.PI * 40;
    let offset = 0;
    const slices = top.map(([label, value], i) => {
      const len = total > 0 ? (value / total) * C : 0;
      const s = { label, value, pct: total > 0 ? (value / total) * 100 : 0, color: PALETTE[i % PALETTE.length], len, offset };
      offset += len;
      return s;
    });
    return { total, slices, C };
  }, [datedExpenses, win]);

  /* ----------------------- receitas por forma de recebimento ------------ */

  const receiptMix = useMemo(() => {
    const map = new Map<string, number>();
    datedEntries.forEach(({ item, date }) => {
      if (!inRange(date, win.start, win.end)) return;
      const k = (item.receipt || 'Não informado').trim();
      map.set(k, (map.get(k) ?? 0) + num(item.amount));
    });
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const total = Array.from(map.values()).reduce((a, v) => a + v, 0);
    return sorted.map(([label, value], i) => ({
      label,
      value,
      pct: total > 0 ? (value / total) * 100 : 0,
      color: PALETTE[i % PALETTE.length],
    }));
  }, [datedEntries, win]);

  /* ---------------------------- liquidez / alertas ---------------------- */

  const liquidity = useMemo(() => {
    const open = payables
      .filter((p) => !isPaidPayable(p))
      .map((p) => ({ p, due: toDate(p.date) }))
      .sort((a, b) => (a.due?.getTime() ?? Infinity) - (b.due?.getTime() ?? Infinity));

    const overdue = open.filter(({ due }) => due && due < today);
    const next7 = open.filter(({ due }) => due && due >= today && diffDays(due, today) <= 7);
    const pagar30 = open
      .filter(({ due }) => due && diffDays(due, today) <= 30)
      .reduce((a, { p }) => a + num(p.amount), 0);

    const openRec = receivables.filter((r) => !isClosedReceivable(r) && num(r.balance) > 0);
    const recOverdue = openRec.filter((r) => {
      const d = toDate(r.due_date);
      return d && d < today;
    });
    const receber30 = openRec
      .filter((r) => {
        const d = toDate(r.due_date);
        return d && d >= today && diffDays(d, today) <= 30;
      })
      .reduce((a, r) => a + num(r.balance), 0);

    const projetado = saldoConsolidado + receber30 - pagar30;
    const cobertura = pagar30 > 0 ? saldoConsolidado / pagar30 : null;
    const level: 'ok' | 'atencao' | 'critico' =
      projetado < 0 ? 'critico' : overdue.length > 0 || (cobertura !== null && cobertura < 1.2) ? 'atencao' : 'ok';

    return {
      list: open.slice(0, 5),
      overdueCount: overdue.length,
      overdueValue: overdue.reduce((a, { p }) => a + num(p.amount), 0),
      next7Count: next7.length,
      next7Value: next7.reduce((a, { p }) => a + num(p.amount), 0),
      recOverdueCount: recOverdue.length,
      recOverdueValue: recOverdue.reduce((a, r) => a + num(r.balance), 0),
      pagar30,
      receber30,
      projetado,
      cobertura,
      level,
    };
  }, [payables, receivables, today, saldoConsolidado]);

  const LEVEL = {
    ok: {
      title: 'Liquidez confortável',
      text: 'Os recebimentos e o saldo cobrem os compromissos dos próximos 30 dias.',
      box: 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-white',
      tone: 'text-emerald-800',
      chip: 'bg-emerald-100',
      pulse: 'rgba(16,185,129,.45)',
      icon: ShieldCheck,
    },
    atencao: {
      title: 'Atenção ao caixa',
      text: 'Há contas vencidas ou a cobertura dos próximos 30 dias está apertada.',
      box: 'border-amber-200 bg-gradient-to-r from-amber-50 to-white',
      tone: 'text-amber-800',
      chip: 'bg-amber-100',
      pulse: 'rgba(245,158,11,.5)',
      icon: AlertTriangle,
    },
    critico: {
      title: 'Risco de descasamento',
      text: 'O saldo projetado para os próximos 30 dias é negativo. Priorize recebimentos.',
      box: 'border-rose-200 bg-gradient-to-r from-rose-50 to-white',
      tone: 'text-rose-800',
      chip: 'bg-rose-100',
      pulse: 'rgba(244,63,94,.5)',
      icon: AlertTriangle,
    },
  }[liquidity.level];
  const LevelIcon = LEVEL.icon;

  /* --------------------------- composição do saldo ---------------------- */

  const accounts = useMemo(() => {
    const items = bank.map((b, i) => ({
      key: `bank-${b.id}`,
      name: b.name,
      sub: `${b.bank}${b.tipo ? ` · ${b.tipo}` : ''}`,
      detail: `Ag ${b.agencia} · C/C ${b.conta}`,
      saldo: num(b.saldo),
      color: b.color || PALETTE[i % PALETTE.length],
      isCash: false,
    }));
    items.push({
      key: 'cash',
      name: 'Caixa Interno',
      sub: 'Dinheiro em espécie',
      detail: 'Saldo inicial + movimentações',
      saldo: caixaInterno,
      color: '#004b03',
      isCash: true,
    });
    return items;
  }, [bank, caixaInterno]);

  const totalPositive = accounts.reduce((a, c) => a + Math.max(0, c.saldo), 0);
  const topAccountKey = accounts.reduce((best, c) => (c.saldo > (accounts.find((x) => x.key === best)?.saldo ?? -Infinity) ? c.key : best), accounts[0]?.key);
  const STACK_OPACITY = [1, 0.8, 0.62, 0.48, 0.36];

  const clientName = (id?: number | null) =>
    id ? clients.find((c) => c.id === id)?.name ?? `Cliente #${id}` : 'Cliente não informado';

  const hovered = hoverBar !== null ? flow.points[hoverBar] ?? null : null;

  /* ------------------------------- render -------------------------------- */

  return (
    <div className={styles.pageContainer}>
      <style>{CSS}</style>

      {/* CABEÇALHO */}
      <header className="ff-rise flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#003d9b]">
            {user?.razao || user?.name || 'FinanceFlow'}
          </p>
          <h1 className="mt-1 text-[30px] font-semibold tracking-tight text-slate-900">Visão Executiva</h1>
          <p className="mt-1 flex items-center gap-2 text-xs capitalize text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {today.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
          <div className="inline-flex rounded-lg bg-slate-100 p-1" role="group" aria-label="Tipo de período">
            {[
              { value: 'day', label: 'Dia' },
              { value: 'month', label: 'Mês' },
              { value: 'custom', label: 'Personalizado' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilterMode(option.value as FilterMode)}
                className={`rounded-md px-3 py-2 text-xs font-semibold transition-all ${
                  filterMode === option.value ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {filterMode === 'day' && (
            <input
              aria-label="Selecionar dia"
              type="date"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
            />
          )}

          {filterMode === 'month' && (
            <input
              aria-label="Selecionar mês"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
            />
          )}

          {filterMode === 'custom' && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
                De
                <input
                  aria-label="Data inicial"
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-700 outline-none focus:border-blue-400"
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
                Até
                <input
                  aria-label="Data final"
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-700 outline-none focus:border-blue-400"
                />
              </label>
            </div>
          )}
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="Saldo consolidado"
          value={saldoConsolidado}
          format={asCurrency}
          icon={Wallet}
          from="#003d9b"
          to="#0284c7"
          glow="rgba(2,132,199,.8)"
          hint={`${bank.length} ${bank.length === 1 ? 'conta' : 'contas'} + caixa interno`}
          bar={
            <MiniStack
              parts={accounts
                .filter((a) => a.saldo > 0)
                .map((a, i) => ({ pct: totalPositive > 0 ? (a.saldo / totalPositive) * 100 : 0, opacity: STACK_OPACITY[i % STACK_OPACITY.length] }))}
            />
          }
          delayMs={0}
        />
        <KpiCard
          label="Receitas"
          value={kpi.cur.receitas}
          format={asCurrency}
          icon={ArrowDownLeft}
          from="#059669"
          to="#14b8a6"
          glow="rgba(5,150,105,.8)"
          trend={variation(kpi.cur.receitas, kpi.prev.receitas)}
          hint={`Taxas: ${formatCurrency(kpi.cur.taxas)}`}
          spark={sparkOf('entradas')}
          delayMs={70}
        />
        <KpiCard
          label="Despesas"
          value={kpi.cur.despesas}
          format={asCurrency}
          icon={ArrowUpRight}
          from="#e11d48"
          to="#fb923c"
          glow="rgba(225,29,72,.75)"
          trend={variation(kpi.cur.despesas, kpi.prev.despesas)}
          invertTrend
          hint={`${expenses.length} saídas registradas`}
          spark={sparkOf('saidas')}
          delayMs={140}
        />
        <KpiCard
          label="Lucro do período"
          value={kpi.cur.lucro}
          format={asCurrency}
          icon={Percent}
          from="#4338ca"
          to="#8b5cf6"
          glow="rgba(79,70,229,.8)"
          trend={variation(kpi.cur.lucro, kpi.prev.lucro)}
          hint={`Margem ${margem.toFixed(1)}%`}
          spark={sparkOf('saldo')}
          delayMs={210}
        />
        <KpiCard
          label="Base de clientes"
          value={clients.length}
          format={asInt}
          icon={Users}
          from="#a21caf"
          to="#7c3aed"
          glow="rgba(162,28,175,.75)"
          hint={`${clientesComProjeto} com projetos (${pctClientesComProjeto.toFixed(0)}%)`}
          bar={<MiniStack parts={[{ pct: pctClientesComProjeto, opacity: 1 }]} />}
          delayMs={280}
        />
        <KpiCard
          label="Projetos"
          value={project.length}
          format={asInt}
          icon={Layers}
          from="#0369a1"
          to="#06b6d4"
          glow="rgba(3,105,161,.8)"
          hint={`${projetosAprovados.length} aprovados · ${formatCurrency(valorAprovado)}`}
          bar={
            <MiniStack
              parts={funil.map((f, i) => ({ pct: project.length > 0 ? (f.count / project.length) * 100 : 0, opacity: [0.4, 0.7, 1][i] }))}
            />
          }
          delayMs={350}
        />
      </div>

      {/* CONTAS E SALDOS (logo abaixo dos KPIs) */}
      <Card delayMs={420}>
        <CardHeader
          title="Contas e saldos"
          subtitle="Saldo por conta bancária e caixa interno"
          right={
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Total consolidado</p>
              <p className="text-xl font-semibold tabular-nums text-slate-900">
                <AnimatedValue value={saldoConsolidado} format={asCurrency} />
              </p>
            </div>
          }
        />

        {totalPositive > 0 && (
          <div className="mb-5 flex h-3 gap-0.5 overflow-hidden rounded-full bg-slate-100">
            {accounts
              .filter((a) => a.saldo > 0)
              .map((a, i) => (
                <div
                  key={a.key}
                  title={`${a.name}: ${formatCurrency(a.saldo)}`}
                  className="ff-barx h-full rounded-full"
                  style={{ width: `${(a.saldo / totalPositive) * 100}%`, backgroundColor: a.color, ...delay(500 + i * 120) }}
                />
              ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {accounts.map((a, i) => {
            const share = totalPositive > 0 && a.saldo > 0 ? (a.saldo / totalPositive) * 100 : 0;
            return (
              <div
                key={a.key}
                className="ff-rise group relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
                style={delay(520 + i * 80)}
              >
                <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: a.color }} />
                <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-60 transition-transform duration-500 group-hover:scale-125" style={{ backgroundColor: tint(a.color, '14') }} />

                <div className="relative flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: tint(a.color), color: a.color }}>
                      {a.isCash ? <Banknote className="h-5 w-5" /> : <Landmark className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{a.name}</p>
                      <p className="truncate text-[11px] text-slate-500">{a.sub}</p>
                    </div>
                  </div>
                  {a.key === topAccountKey && a.saldo > 0 && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">Maior saldo</span>
                  )}
                </div>

                <p className={`relative mt-4 text-[22px] font-semibold tracking-tight tabular-nums ${a.saldo < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  <AnimatedValue value={a.saldo} format={asCurrency} />
                </p>

                <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="ff-barx h-full rounded-full" style={{ width: `${share}%`, backgroundColor: a.color, ...delay(700 + i * 80) }} />
                </div>
                <div className="relative mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">{a.detail}</span>
                  {share > 0 && <span className="ml-2 shrink-0 font-semibold text-slate-500">{share.toFixed(0)}%</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* GRÁFICOS: FLUXO + DESPESAS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8" delayMs={500}>
          <CardHeader
            title="Fluxo de caixa"
            subtitle={`Receitas, despesas e resultado · ${filterDescription}`}
            right={
              <div className="hidden items-center gap-4 text-[11px] font-medium text-slate-500 sm:flex">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#0284c7]" />Receitas</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#003d9b]" />Despesas</span>
                <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-emerald-500" />Resultado</span>
              </div>
            }
          />

          {!flow.hasData ? (
            <EmptyState text="Sem lançamentos no período selecionado" />
          ) : (
            <div key={`flow-${filterKey}`}> 
              <div className="relative">
                <svg viewBox={`0 0 ${flow.W} ${flow.H}`} className="h-auto w-full select-none" role="img" aria-label="Gráfico de fluxo de caixa">
                  <defs>
                    <linearGradient id="ff-g-in" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                    <linearGradient id="ff-g-out" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#003d9b" />
                    </linearGradient>
                    <linearGradient id="ff-g-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {flow.ticks.map((t, i) => (
                    <g key={i}>
                      <line x1={flow.L} x2={flow.W - flow.R} y1={t.y} y2={t.y} stroke="#e2e8f0" strokeDasharray={t.v === 0 ? undefined : '3 4'} />
                      <text x={flow.L - 10} y={t.y + 3.5} textAnchor="end" fontSize="10" fill="#94a3b8">
                        {compact(t.v)}
                      </text>
                    </g>
                  ))}

                  <path d={flow.area} fill="url(#ff-g-area)" className="ff-fade" style={delay(700)} />

                  {flow.points.map((p, i) => (
                    <g key={p.full}>
                      {hoverBar === i && (
                        <rect x={flow.L + i * flow.groupW} y={flow.T} width={flow.groupW} height={flow.ph} fill="#f1f5f9" opacity="0.8" rx="6" />
                      )}
                      <rect className="ff-bar" style={delay(i * 80)} x={p.cx - flow.barW - 1.5} y={p.yEnt} width={flow.barW} height={Math.max(0, flow.y0 - p.yEnt)} rx="4" fill="url(#ff-g-in)" />
                      <rect className="ff-bar" style={delay(i * 80 + 60)} x={p.cx + 1.5} y={p.ySai} width={flow.barW} height={Math.max(0, flow.y0 - p.ySai)} rx="4" fill="url(#ff-g-out)" />
                      <text x={p.cx} y={flow.H - 12} textAnchor="middle" fontSize="11" fontWeight={hoverBar === i ? 700 : 500} fill={hoverBar === i ? '#003d9b' : '#64748b'}>
                        {p.label}
                      </text>
                      <rect
                        x={flow.L + i * flow.groupW}
                        y={flow.T}
                        width={flow.groupW}
                        height={flow.ph + 20}
                        fill="transparent"
                        onMouseEnter={() => setHoverBar(i)}
                        onMouseLeave={() => setHoverBar(null)}
                      />
                    </g>
                  ))}

                  <path d={flow.line} pathLength={1} className="ff-draw" fill="none" stroke="#10b981" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  {flow.points.map((p, i) => (
                    <circle key={`d-${p.full}`} className="ff-fade" style={delay(900 + i * 90)} cx={p.cx} cy={p.ySal} r={hoverBar === i ? 5.5 : 4} fill="#fff" stroke="#10b981" strokeWidth="2.2" />
                  ))}
                </svg>

                {hovered && (
                  <div
                    className="pointer-events-none absolute top-0 z-10 w-48 -translate-x-1/2 rounded-xl bg-slate-900 px-3 py-2.5 text-[11px] text-white shadow-xl"
                    style={{ left: `${Math.min(86, Math.max(14, (hovered.cx / flow.W) * 100))}%` }}
                  >
                    <p className="mb-1.5 border-b border-slate-700 pb-1 font-semibold">{hovered.full}</p>
                    <div className="space-y-1">
                      <p className="flex justify-between"><span className="text-sky-300">Receitas</span><span className="font-semibold">{formatCurrency(hovered.entradas)}</span></p>
                      <p className="flex justify-between"><span className="text-blue-300">Despesas</span><span className="font-semibold">{formatCurrency(hovered.saidas)}</span></p>
                      <p className="flex justify-between border-t border-slate-700 pt-1">
                        <span className="text-emerald-300">Resultado</span>
                        <span className={`font-semibold ${hovered.saldo >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{formatCurrency(hovered.saldo)}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                {[
                  { label: flow.granularity === 'single' ? 'Resultado do dia' : flow.granularity === 'day' ? 'Melhor dia' : 'Melhor mês', value: flow.best ? `${flow.best.full}` : '—', sub: flow.best ? formatCurrency(flow.best.saldo) : '' },
                  { label: flow.granularity === 'single' ? 'Receita do dia' : flow.granularity === 'day' ? 'Receita média diária' : 'Receita média mensal', value: formatCurrency(flow.avgIn), sub: filterDescription },
                  { label: 'Lançamentos', value: String(flow.count), sub: 'entradas + saídas' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-slate-50 px-3 py-2.5 transition-colors hover:bg-slate-100/80">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">{s.value}</p>
                    <p className="text-[11px] text-slate-400">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-4" delayMs={580}>
          <CardHeader title="Despesas por categoria" subtitle={`Distribuição · ${filterDescription}`} />
          {expenseCats.total <= 0 ? (
            <EmptyState text="Sem despesas no período" />
          ) : (
            <div key={`donut-${filterKey}`}> 
              <div className="relative mx-auto my-2 h-44 w-44">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  {expenseCats.slices.map((s, i) => (
                    <circle
                      key={s.label}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={s.color}
                      strokeWidth={hoverSlice === i ? 14 : 12}
                      strokeDasharray={`${s.len} ${expenseCats.C - s.len}`}
                      strokeDashoffset={-s.offset}
                      className="ff-donut cursor-pointer transition-[stroke-width] duration-200"
                      style={{ ...delay(i * 140), '--c': expenseCats.C } as React.CSSProperties}
                      onMouseEnter={() => setHoverSlice(i)}
                      onMouseLeave={() => setHoverSlice(null)}
                    />
                  ))}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="max-w-[90px] truncate text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {hoverSlice !== null ? expenseCats.slices[hoverSlice].label : 'Total'}
                  </span>
                  <span className="mt-0.5 text-[15px] font-semibold text-slate-900 tabular-nums">
                    {formatCurrency(hoverSlice !== null ? expenseCats.slices[hoverSlice].value : expenseCats.total)}
                  </span>
                  {hoverSlice !== null && <span className="text-[10px] text-slate-500">{expenseCats.slices[hoverSlice].pct.toFixed(1)}%</span>}
                </div>
              </div>

              <ul className="mt-4 space-y-1">
                {expenseCats.slices.map((s, i) => (
                  <li
                    key={s.label}
                    onMouseEnter={() => setHoverSlice(i)}
                    onMouseLeave={() => setHoverSlice(null)}
                    className={`ff-rise flex items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-all duration-200 ${hoverSlice === i ? 'translate-x-1 bg-slate-50' : ''}`}
                    style={delay(300 + i * 70)}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="truncate font-medium text-slate-700">{s.label}</span>
                    </span>
                    <span className="ml-2 shrink-0 tabular-nums text-slate-500">
                      <span className="font-semibold text-slate-800">{s.pct.toFixed(0)}%</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      {/* ALERTAS DE LIQUIDEZ + RECEITAS POR FORMA */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7" delayMs={640}>
          <CardHeader
            title="Alertas de liquidez"
            subtitle="Compromissos e recebíveis que exigem atenção"
            right={
              onNavigate && (
                <button type="button" onClick={() => onNavigate('contas-pagar')} className="group inline-flex items-center gap-1 text-xs font-semibold text-[#003d9b] hover:underline">
                  Contas a pagar <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              )
            }
          />

          <div className={`mb-4 flex items-start gap-3 rounded-xl border p-4 ${LEVEL.box}`}>
            <span
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${LEVEL.chip} ${liquidity.level !== 'ok' ? 'ff-pulse' : ''}`}
              style={{ '--pulse': LEVEL.pulse } as React.CSSProperties}
            >
              <LevelIcon className={`h-5 w-5 ${LEVEL.tone}`} />
            </span>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${LEVEL.tone}`}>{LEVEL.title}</p>
              <p className="mt-0.5 text-xs text-slate-600">{LEVEL.text}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Saldo projetado 30d</p>
              <p className={`text-base font-semibold tabular-nums ${liquidity.projetado >= 0 ? 'text-slate-900' : 'text-rose-700'}`}>
                <AnimatedValue value={liquidity.projetado} format={asCurrency} />
              </p>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: 'Vencidas', value: formatCurrency(liquidity.overdueValue), sub: `${liquidity.overdueCount} conta(s)`, cls: 'text-rose-600' },
              { label: 'Vencem em 7 dias', value: formatCurrency(liquidity.next7Value), sub: `${liquidity.next7Count} conta(s)`, cls: 'text-amber-600' },
              { label: 'Recebíveis em atraso', value: formatCurrency(liquidity.recOverdueValue), sub: `${liquidity.recOverdueCount} título(s)`, cls: 'text-rose-600' },
              {
                label: 'Cobertura 30 dias',
                value: liquidity.cobertura === null ? '—' : `${liquidity.cobertura.toFixed(1)}x`,
                sub: liquidity.cobertura === null ? 'Sem contas a pagar' : 'saldo ÷ a pagar',
                cls: 'text-slate-900',
              },
            ].map((t, i) => (
              <div key={t.label} className="ff-rise rounded-xl bg-slate-50 p-3 transition-colors hover:bg-slate-100/80" style={delay(700 + i * 70)}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{t.label}</p>
                <p className={`mt-1 text-sm font-semibold tabular-nums ${t.cls}`}>{t.value}</p>
                <p className="text-[11px] text-slate-400">{t.sub}</p>
              </div>
            ))}
          </div>

          {liquidity.list.length === 0 ? (
            <EmptyState text="Nenhuma conta a pagar em aberto" />
          ) : (
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200/80">
              {liquidity.list.map(({ p, due }, i) => {
                const days = due ? diffDays(due, today) : null;
                const late = days !== null && days < 0;
                const soon = days !== null && days >= 0 && days <= 7;
                return (
                  <li key={p.id ?? `${p.supplier}-${p.date}`} className="ff-rise flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50" style={delay(760 + i * 70)}>
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${late ? 'bg-rose-100 text-rose-700' : soon ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {(p.supplier || '?').charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{p.supplier}</p>
                        <p className="text-[11px] text-slate-400">Parcela {p.installment_number}/{p.installment_total} · vence {fmtDate(due)}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums text-slate-900">{formatCurrency(num(p.amount))}</p>
                      <span className={`text-[10px] font-semibold ${late ? 'text-rose-600' : soon ? 'text-amber-600' : 'text-slate-400'}`}>
                        {days === null ? 'Sem data' : late ? `Vencida há ${Math.abs(days)}d` : days === 0 ? 'Vence hoje' : `Vence em ${days}d`}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-5" delayMs={700}>
          <CardHeader title="Receitas por forma de recebimento" subtitle={`Participação · ${filterDescription}`} />
          {receiptMix.length === 0 ? (
            <EmptyState text="Sem receitas no período" />
          ) : (
            <ul key={`mix-${filterKey}`} className="space-y-4">
              {receiptMix.map((r, i) => (
                <li key={r.label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{r.label}</span>
                    <span className="tabular-nums text-slate-500">
                      <span className="font-semibold text-slate-900">{formatCurrency(r.value)}</span> · {r.pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="ff-barx h-full rounded-full" style={{ width: `${r.pct}%`, backgroundColor: r.color, ...delay(i * 110) }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* PROJETOS APROVADOS + FUNIL */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7" delayMs={760}>
          <CardHeader
            title="Últimos projetos aprovados"
            subtitle="Os cinco mais recentes"
            right={
              onNavigate && (
                <button type="button" onClick={() => onNavigate('projetos')} className="group inline-flex items-center gap-1 text-xs font-semibold text-[#003d9b] hover:underline">
                  Ver projetos <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              )
            }
          />
          {ultimosAprovados.length === 0 ? (
            <EmptyState text="Nenhum projeto aprovado ainda" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {ultimosAprovados.map(({ p, date }, i) => (
                <li key={p.id} className="ff-rise group flex items-center justify-between gap-4 py-3.5 transition-colors first:pt-0 last:pb-0" style={delay(820 + i * 80)}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-100">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                      <p className="truncate text-[11px] text-slate-500">
                        {clientName(p.client_id)} · {TIPO_LABEL[p.type] ?? p.type} · {num(p.width).toFixed(2)}m × {num(p.height).toFixed(2)}m
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-[#003d9b]">{formatCurrency(num(p.estimated_value))}</p>
                    <p className="flex items-center justify-end gap-1 text-[11px] text-slate-400">
                      <CalendarClock className="h-3 w-3" />
                      {fmtDate(date)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-5" delayMs={820}>
          <CardHeader
            title="Funil de projetos"
            subtitle={`Taxa de aprovação ${taxaAprovacao.toFixed(0)}%`}
            right={
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                <Activity className="h-3 w-3" />
                {projetosAprovados.length}/{project.length}
              </span>
            }
          />
          {project.length === 0 ? (
            <EmptyState text="Nenhum projeto cadastrado" />
          ) : (
            <ul className="space-y-4">
              {funil.map((f, i) => (
                <li key={f.key}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{f.label}</span>
                    <span className="tabular-nums text-slate-500">
                      <span className="font-semibold text-slate-900">{f.count}</span> · {formatCurrency(f.value)}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="ff-barx h-full rounded-full" style={{ width: `${(f.count / project.length) * 100}%`, backgroundColor: f.color, ...delay(900 + i * 130) }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <p className="pb-2 text-center text-[11px] text-slate-400">
        Receitas e despesas somam os lançamentos de Entradas e Saídas do período. Saldos das contas conforme cadastro; o caixa interno considera saldo inicial e movimentações.
      </p>
    </div>
  );
};