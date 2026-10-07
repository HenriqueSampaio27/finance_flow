import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Calendar,
  AlertCircle,
  Wallet,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Trash2,
  X,
  Inbox,
  DollarSign,
} from 'lucide-react';
import { PayableItem } from '../types/payablesType';
import { formatCurrency } from '../utils/formatters';
import { payablesTheme, styles, typography } from '../theme';
import { UserType } from '../types/userType';

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface AccountPayableSectionProps {
  payables: PayableItem[];
  onOpenNewPayable: () => void;
  onDeletePayable: (id: number) => void;
  onUpdateStatus: (id: number, status: string, outgoingAccount?: string) => void | Promise<void>;
  user?: UserType | undefined | null;
}

/* -------------------------------------------------------------------------- */
/*  Auxiliares                                                                 */
/* -------------------------------------------------------------------------- */

type StatusPagar = 'Pendente' | 'Vencido' | 'Pago';
type FiltroStatus = StatusPagar | 'all';

const STATUS_CONFIG: Record<StatusPagar, { label: string; badge: string }> = {
  Pago: {
    label: 'Pago',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  Pendente: {
    label: 'Pendente',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  Vencido: {
    label: 'Vencido',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

const FILTROS_STATUS: { value: FiltroStatus; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Vencido', label: 'Vencido' },
  { value: 'Pago', label: 'Pago' },
];

const PAGE_SIZE = 8;

// Data local YYYY-MM-DD (evita o erro de fuso do toISOString)
const hojeISO = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

// "2026-10-02" -> "02/10/2026" sem usar Date (sem deslocamento de fuso)
const formatDate = (iso: string) => {
  if (!iso) return '-';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
};

/** Pendente com vencimento no passado é tratado como vencido. */
const getStatusEfetivo = (item: PayableItem, hoje: string): StatusPagar => {
  if (item.status === 'Pago') return 'Pago';
  return String(item.date).slice(0, 10) < hoje ? 'Vencido' : 'Pendente';
};

/* -------------------------------------------------------------------------- */
/*  Componente                                                                 */
/* -------------------------------------------------------------------------- */

export const AccountPayableSection: React.FC<AccountPayableSectionProps> = ({
  payables,
  onOpenNewPayable,
  onDeletePayable,
  onUpdateStatus,
  user,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FiltroStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [deleteItem, setDeleteItem] = useState<PayableItem | null>(null);
  const [paymentItem, setPaymentItem] = useState<PayableItem | null>(null);
  const [paymentAccount, setPaymentAccount] = useState('');
  const [paying, setPaying] = useState(false);

  const hoje = hojeISO();

  const bankAccounts = [
    user?.bank_account1,
    user?.bank_account2,
    user?.bank_account3,
    user?.bank_account4,
    user?.bank_account5,
  ].filter((a): a is string => !!a && a.trim() !== '');

  // Itens já com o status efetivo calculado
  const items = useMemo(
    () => payables.map((p) => ({ ...p, statusEfetivo: getStatusEfetivo(p, hoje) })),
    [payables, hoje]
  );

  const categories = useMemo(
    () => [...new Set(payables.map((p) => p.category).filter(Boolean))] as string[],
    [payables]
  );

  const accounts = useMemo(
    () => [...new Set(payables.map((p) => p.outgoing_account).filter(Boolean))] as string[],
    [payables]
  );

  /* ------------------------------- filtros -------------------------------- */

  const filtered = useMemo(() => {
    const termo = search.trim().toLowerCase();

    return items
      .filter((item) => {
        if (statusFilter !== 'all' && item.statusEfetivo !== statusFilter) return false;
        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
        if (accountFilter !== 'all' && item.outgoing_account !== accountFilter) return false;
        if (termo && !String(item.supplier ?? '').toLowerCase().includes(termo)) return false;

        const venc = String(item.date).slice(0, 10);
        if (fromDate && venc < fromDate) return false;
        if (toDate && venc > toDate) return false;

        return true;
      })
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }, [items, statusFilter, categoryFilter, accountFilter, search, fromDate, toDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categoryFilter, accountFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginated = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const temFiltroAtivo = !!(
    search ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all' ||
    accountFilter !== 'all' ||
    fromDate ||
    toDate
  );

  const limparFiltros = () => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setAccountFilter('all');
    setFromDate('');
    setToDate('');
  };

  const paginasVisiveis = useMemo(() => {
    const maxBotoes = 5;
    let inicio = Math.max(1, page - Math.floor(maxBotoes / 2));
    const fim = Math.min(totalPages, inicio + maxBotoes - 1);
    inicio = Math.max(1, fim - maxBotoes + 1);
    return Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i);
  }, [page, totalPages]);

  /* -------------------------------- KPIs ---------------------------------- */

  const kpis = useMemo(() => {
    const abertos = items.filter((i) => i.statusEfetivo !== 'Pago');
    const vencidos = items.filter((i) => i.statusEfetivo === 'Vencido');
    const pagos = items.filter((i) => i.statusEfetivo === 'Pago');
    const soma = (list: typeof items) => list.reduce((acc, i) => acc + Number(i.amount || 0), 0);

    return {
      totalAPagar: soma(abertos),
      titulosEmAberto: abertos.length,
      vencido: soma(vencidos),
      titulosVencidos: vencidos.length,
      pago: soma(pagos),
      titulosPagos: pagos.length,
    };
  }, [items]);

  /* ------------------------------- ações ---------------------------------- */

  const handlePayment = (item: PayableItem) => {
    setPaymentItem(item);
    setPaymentAccount(item.outgoing_account || bankAccounts[0] || 'Caixa Interno');
  };

  const handleConfirmPayment = async () => {
    if (!paymentItem?.id || paying) return;
    try {
      setPaying(true);
      await onUpdateStatus(paymentItem.id, 'Pago', paymentAccount);
      setPaymentItem(null);
    } catch (error) {
      console.error(error);
    } finally {
      setPaying(false);
    }
  };

  const inputBase =
    'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20 focus:border-[#003d9b]/40';

  const labelBase = 'block text-[11px] font-semibold text-slate-500 uppercase mb-1';

  // Contas disponíveis no modal de pagamento (sem duplicar)
  const contasPagamento = [...new Set([...bankAccounts, 'Caixa Interno'])];

  /* -------------------------------- render -------------------------------- */

  return (
    <div className={styles.pageContainer}>
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={typography.headings.pageTitle}>{payablesTheme.header.title}</h1>
          <p className={typography.headings.pageSubtitle}>{payablesTheme.header.subtitle}</p>
        </div>
        <button id="btn-novo-pagamento" onClick={onOpenNewPayable} className={styles.primaryButton}>
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{payablesTheme.header.actionLabel}</span>
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <p className={typography.kpi.label}>Total a Pagar</p>
          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {formatCurrency(kpis.totalAPagar)}
          </p>
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-2">
            <Wallet className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {kpis.titulosEmAberto} {kpis.titulosEmAberto === 1 ? 'conta em aberto' : 'contas em aberto'}
            </span>
          </p>
        </div>

        <div className="bg-rose-50/50 p-5 rounded-xl border border-rose-100 shadow-xs flex flex-col justify-between">
          <p className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Contas Vencidas</p>
          <p className="text-2xl font-bold text-rose-600 mt-2 tabular-nums">
            {formatCurrency(kpis.vencido)}
          </p>
          <p className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>
              {kpis.titulosVencidos} {kpis.titulosVencidos === 1 ? 'conta vencida' : 'contas vencidas'}
            </span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <p className={typography.kpi.label}>Total Pago</p>
          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {formatCurrency(kpis.pago)}
          </p>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {kpis.titulosPagos} {kpis.titulosPagos === 1 ? 'conta quitada' : 'contas quitadas'}
            </span>
          </p>
        </div>
      </div>

      {/* Filtros + tabela */}
      <div className={styles.card}>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 border-b border-slate-100 bg-white">
          <div>
            <label className={labelBase}>Fornecedor</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputBase} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className={labelBase}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FiltroStatus)}
              className={`${inputBase} font-medium`}
            >
              {FILTROS_STATUS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelBase}>Categoria</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`${inputBase} font-medium`}
            >
              <option value="all">Todas</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelBase}>Conta de Saída</label>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className={`${inputBase} font-medium`}
            >
              <option value="all">Todas</option>
              {accounts.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelBase}>Vencimento (De)</label>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => setFromDate(e.target.value)}
              className={inputBase}
            />
          </div>

          <div>
            <label className={labelBase}>Vencimento (Até)</label>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
              className={inputBase}
            />
          </div>

          {temFiltroAtivo && (
            <div className="sm:col-span-3 lg:col-span-6 flex justify-end -mt-1">
              <button
                onClick={limparFiltros}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-white">
                <th className={`${typography.table.header} text-center`}>CÓDIGO</th>
                <th className={typography.table.header}>FORNECEDOR</th>
                <th className={typography.table.header}>VENCIMENTO</th>
                <th className={`${typography.table.header} text-right`}>VALOR</th>
                <th className={`${typography.table.header} text-center`}>CATEGORIA</th>
                <th className={`${typography.table.header} text-center`}>CONTA SAÍDA</th>
                <th className={`${typography.table.header} text-center`}>PARCELA</th>
                <th className={`${typography.table.header} text-center`}>STATUS</th>
                <th className={`${typography.table.header} text-center`}>AÇÕES</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-14 text-center">
                    <div className="inline-flex flex-col items-center gap-2 text-slate-400">
                      <Inbox className="w-6 h-6" />
                      <p className="text-sm font-medium text-slate-600">
                        {temFiltroAtivo
                          ? 'Nenhuma conta encontrada com esses filtros.'
                          : 'Nenhuma conta a pagar cadastrada ainda.'}
                      </p>
                      {temFiltroAtivo ? (
                        <button
                          onClick={limparFiltros}
                          className="text-xs font-semibold text-[#003d9b] hover:underline cursor-pointer"
                        >
                          Limpar filtros
                        </button>
                      ) : (
                        <button
                          onClick={onOpenNewPayable}
                          className="text-xs font-semibold text-[#003d9b] hover:underline cursor-pointer"
                        >
                          Adicionar a primeira conta
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {paginated.map((item) => {
                const vencido = item.statusEfetivo === 'Vencido';
                const pago = item.statusEfetivo === 'Pago';
                const cfg = STATUS_CONFIG[item.statusEfetivo];

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 text-xs font-semibold text-center text-slate-900 whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">
                      {item.supplier}
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold tabular-nums whitespace-nowrap">
                      <span className={vencido ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                        {formatDate(item.date)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <span
                        className={`text-xs font-bold tabular-nums ${
                          pago ? 'text-slate-400' : vencido ? 'text-rose-600' : 'text-slate-800'
                        }`}
                      >
                        {formatCurrency(item.amount)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-xs text-slate-600 font-medium whitespace-nowrap">
                      {item.category}
                    </td>
                    <td className="py-4 px-4 text-center text-xs text-slate-600 font-medium whitespace-nowrap">
                      {item.outgoing_account}
                    </td>
                    <td className="py-4 px-4 text-center text-xs text-slate-600 font-medium whitespace-nowrap">
                      {item.installment_number}/{item.installment_total}
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold ${cfg.badge}`}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          disabled={pago}
                          onClick={() => handlePayment(item)}
                          title={pago ? 'Conta já paga' : 'Marcar como pago'}
                          aria-label="Marcar como pago"
                          className={`p-1 rounded transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                            pago
                              ? 'text-emerald-600'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteItem(item)}
                          title="Excluir"
                          aria-label="Excluir conta"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            {filtered.length === 0
              ? 'Nenhum registro'
              : `Mostrando ${startIndex + 1}-${startIndex + paginated.length} de ${filtered.length} ${
                  filtered.length === 1 ? 'registro' : 'registros'
                }`}
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setCurrentPage(page - 1)}
              aria-label="Página anterior"
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {paginasVisiveis.map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                aria-current={page === p ? 'page' : undefined}
                className={`w-7 h-7 rounded text-xs font-semibold cursor-pointer ${
                  page === p
                    ? 'bg-[#003d9b] text-white'
                    : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() => setCurrentPage(page + 1)}
              aria-label="Próxima página"
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------- Modal: excluir ------------------------- */}
      {deleteItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="px-6 pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold tracking-tight text-gray-900">
                    Excluir conta a pagar
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    Você está prestes a excluir este registro.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteItem(null)}
                  aria-label="Fechar"
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">Fornecedor</p>
                    <p className="truncate text-sm font-semibold text-gray-800">{deleteItem.supplier}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">Parcela</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {deleteItem.installment_number}/{deleteItem.installment_total}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">Vencimento</p>
                    <p className="text-sm font-semibold text-gray-800">{formatDate(deleteItem.date)}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">Valor</p>
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {formatCurrency(deleteItem.amount)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                <p className="text-xs leading-5 text-red-700">
                  Essa ação é permanente e não poderá ser desfeita.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
              <button
                type="button"
                onClick={() => setDeleteItem(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteItem.id) onDeletePayable(deleteItem.id);
                  setDeleteItem(null);
                }}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md active:scale-[0.98]"
              >
                Excluir registro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------ Modal: pagamento ------------------------ */}
      {paymentItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Confirmar pagamento</h3>
                  <p className="text-xs text-slate-400">Registre a saída desta conta.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaymentItem(null)}
                aria-label="Fechar"
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Fornecedor</p>
                  <p className="text-sm font-semibold text-slate-800">{paymentItem.supplier}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Parcela</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {paymentItem.installment_number}/{paymentItem.installment_total}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Vencimento</p>
                  <p className="text-sm font-semibold text-slate-800">{formatDate(paymentItem.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Valor a pagar</p>
                  <p className="text-sm font-bold text-emerald-600">{formatCurrency(paymentItem.amount)}</p>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Conta de saída</label>
              <select
                value={paymentAccount}
                onChange={(e) => setPaymentAccount(e.target.value)}
                className={styles.input}
              >
                {/* Mantém a conta original do lançamento, mesmo que não esteja no cadastro do usuário */}
                {paymentItem.outgoing_account && !contasPagamento.includes(paymentItem.outgoing_account) && (
                  <option value={paymentItem.outgoing_account}>{paymentItem.outgoing_account}</option>
                )}
                {contasPagamento.map((account) => (
                  <option key={account} value={account}>
                    {account}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={() => setPaymentItem(null)} className={styles.secondaryButton}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={paying}
                className={`${styles.primaryButton} disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {paying ? 'Salvando...' : 'Confirmar pagamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};