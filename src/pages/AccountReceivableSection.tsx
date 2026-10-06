import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Calendar,
  AlertCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Trash2,
  X,
  Inbox,
  DollarSign,
} from 'lucide-react';
import { ReceivableItem, StatusRecebimento } from '../types/receivableType';
import { ClientItem } from '../types/clientType';
import { formatCurrency } from '../utils/formatters';
import { receivablesTheme, styles, typography } from '../theme';
import { UserType } from '../types/userType';

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface AccountReceivableSectionProps {
  receivables: ReceivableItem[];
  clients: ClientItem[];
  onOpenNewReceivable: () => void;
  onDeleteReceivable: (id: number) => void;
  onUpdateStatus: (id: number, paymentAmount: number, receipt: string, destination_account: string, fee: number) => void;
  user?: UserType | undefined | null
  onEntryCreated: () => Promise<void>;
}

/* -------------------------------------------------------------------------- */
/*  Auxiliares                                                                 */
/* -------------------------------------------------------------------------- */

type FiltroStatus = StatusRecebimento | 'all';

const STATUS_CONFIG: Record<StatusRecebimento, { label: string; badge: string }> = {
  received: {
    label: 'Recebido',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  pending: {
    label: 'Pendente',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  late: {
    label: 'Atrasado',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  canceled: {
    label: 'Cancelado',
    badge: 'bg-slate-100 text-slate-500 border-slate-200',
  },
  partial: {
    label: 'Parcial',
    badge: 'bg-violet-50 text-violet-600 border-violet-200',
  },
  paid: {
    label: 'Recebido',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

const FILTROS_STATUS: { value: FiltroStatus; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendente' },
  { value: 'late', label: 'Atrasado' },
  { value: 'paid', label: 'Recebido' },
  { value: 'canceled', label: 'Cancelado' },
  { value: 'partial', label: 'Parcial' },
];

const PAGE_SIZE = 8;

// Data local YYYY-MM-DD (evita o erro de fuso do toISOString)
const hojeISO = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

// Converte "2026-10-02" (ou "2026-10-02T00:00:00") em "02/10/2026" sem usar Date,
// assim não há deslocamento de um dia por causa do fuso horário.
const formatDate = (iso: string) => {
  if (!iso) return '-';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
};

/**
 * Um título "pendente" com vencimento no passado e saldo em aberto
 * é tratado como atrasado, mesmo que o status salvo ainda seja 'pending'.
 */
const getStatusEfetivo = (item: ReceivableItem, hoje: string): StatusRecebimento => {
  if (item.status === 'pending' && item.balance > 0 && item.due_date.slice(0, 10) < hoje) {
    return 'late';
  }
  return item.status;
};

/* -------------------------------------------------------------------------- */
/*  Componente                                                                 */
/* -------------------------------------------------------------------------- */

export const AccountReceivableSection: React.FC<AccountReceivableSectionProps> = ({
  receivables,
  clients,
  onOpenNewReceivable,
  onDeleteReceivable,
  onUpdateStatus,
  user,
  onEntryCreated
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FiltroStatus>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteItem, setDeleteItem] = useState<ReceivableItem | null>(null);  

  const [paymentItem, setPaymentItem] = useState<ReceivableItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentReceipt, setPaymentReceipt] = useState("PIX");
  const [paymentDestinationAccount, setPaymentDestinationAccount] = useState("");
  const [paymentFee, setPaymentFee] = useState(0);

  const hoje = hojeISO();

  const bankAccounts = [
    user?.bank_account1,
    user?.bank_account2,
    user?.bank_account3,
    user?.bank_account4,
    user?.bank_account5,
  ].filter(
    (account): account is string =>
      !!account && account.trim() !== ""
  );

  const calculatePaymentFee = (receipt: string) => {
    if (!user) return 0;

    if (receipt === "PIX") {
      return user.pix_fee || 0;
    }

    if (receipt === "Cartão de Crédito") {
      return user.credit_fee || 0;
    }

    if (receipt === "Cartão de Débito") {
      return user.debit_fee || 0;
    }

    return 0;
  };

  // client_id -> nome
  const clientNames = useMemo(() => {
    const map = new Map<number, string>();
    clients.forEach((c) => {
      if (c.id !== undefined && c.id !== null) map.set(Number(c.id), c.name);
    });
    return map;
  }, [clients]);

  const getClientName = (clientId: number) =>
    clientNames.get(Number(clientId)) ?? `Cliente #${clientId}`;

  // Itens já com o status efetivo calculado
  const items = useMemo(
    () => receivables.map((r) => ({ ...r, statusEfetivo: getStatusEfetivo(r, hoje) })),
    [receivables, hoje]
  );

  /* ------------------------------- filtros -------------------------------- */
  
  const filtered = useMemo(() => {
    const termo = search.trim().toLowerCase();

    return items
      .filter((item) => {
        if (statusFilter !== 'all' && item.statusEfetivo !== statusFilter) return false;

        if (termo) {
          const nome = getClientName(item.client_id).toLowerCase();
          const doc = String(item.document_id ?? '').toLowerCase();
          if (!nome.includes(termo) && !doc.includes(termo)) return false;
        }

        const venc = item.due_date.slice(0, 10);        
        if (fromDate && venc < fromDate) return false;
        if (toDate && venc > toDate) return false;

        return true;
      })
      .sort((a, b) => a.due_date.localeCompare(b.due_date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, statusFilter, search, fromDate, toDate, clientNames]);

  // Volta para a primeira página quando o filtro muda
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginated = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const temFiltroAtivo = !!(search || statusFilter !== 'all' || fromDate || toDate);

  const limparFiltros = () => {
    setSearch('');
    setStatusFilter('all');
    setFromDate('');
    setToDate('');
  };

  // Janela de até 5 páginas ao redor da atual
  const paginasVisiveis = useMemo(() => {
    const maxBotoes = 5;
    let inicio = Math.max(1, page - Math.floor(maxBotoes / 2));
    const fim = Math.min(totalPages, inicio + maxBotoes - 1);
    inicio = Math.max(1, fim - maxBotoes + 1);
    return Array.from({ length: fim - inicio + 1 }, (_, i) => inicio + i);
  }, [page, totalPages]);

  /* -------------------------------- KPIs ---------------------------------- */

  const kpis = useMemo(() => {
    const ativos = items.filter((i) => i.statusEfetivo !== 'canceled');
    const atrasados = ativos.filter((i) => i.statusEfetivo === 'late');
    const quitados = ativos.filter((i) => i.statusEfetivo === 'received' || i.statusEfetivo === 'paid');

    return {
      totalAReceber: ativos.reduce((acc, i) => acc + i.balance, 0),
      titulosEmAberto: ativos.filter((i) => i.balance > 0).length,
      atrasado: atrasados.reduce((acc, i) => acc + i.balance, 0),
      titulosAtrasados: atrasados.length,
      recebido: ativos.reduce((acc, i) => acc + i.received_amount, 0),
      titulosQuitados: quitados.length,
    };
  }, [items]);

  /* ------------------------------- ações ---------------------------------- */

  const handleDelete = (item: ReceivableItem) => {
    setDeleteItem(item);
  };

  const handlePaymentReceiptChange = (receipt: string) => {
    setPaymentReceipt(receipt);

    const fee = calculatePaymentFee(receipt);

    setPaymentFee(fee);
  };

  const handlePayment = (item: ReceivableItem) => {
    setPaymentItem(item);

    setPaymentAmount("");

    setPaymentReceipt("PIX");

    setPaymentFee(
      user?.pix_fee || 0
    );

    setPaymentDestinationAccount(
      bankAccounts[0] || "Caixa Interno"
    );
  };

  const handleConfirmPayment = async () => {
    if (!paymentItem) return;

    const amount = Number(paymentAmount);

    if (!amount || amount <= 0) {
      return;
    }

    if (amount > paymentItem.balance) {
      return;
    }

    try {
      await onUpdateStatus(
        paymentItem.id,
        amount,
        paymentReceipt,
        paymentDestinationAccount,
        paymentFee
      );

      await onEntryCreated();

      setPaymentItem(null);
      setPaymentAmount("");
      setPaymentReceipt("PIX");
      setPaymentDestinationAccount("");
      setPaymentFee(0);

    } catch (error) {
      console.error(error);
    }
  };

  const inputBase =
    'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20 focus:border-[#003d9b]/40';

  /* -------------------------------- render -------------------------------- */

  return (
    <div className={styles.pageContainer}>
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={typography.headings.pageTitle}>{receivablesTheme.header.title}</h1>
          <p className={typography.headings.pageSubtitle}>{receivablesTheme.header.subtitle}</p>
        </div>
        <button id="btn-novo-recebivel" onClick={onOpenNewReceivable} className={styles.primaryButton}>
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{receivablesTheme.header.actionLabel}</span>
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <p className={typography.kpi.label}>{receivablesTheme.kpis.total.label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {formatCurrency(kpis.totalAReceber)}
          </p>
          <p className="text-xs font-medium text-emerald-600 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {kpis.titulosEmAberto} {kpis.titulosEmAberto === 1 ? 'título em aberto' : 'títulos em aberto'}
            </span>
          </p>
        </div>

        <div className="bg-rose-50/50 p-5 rounded-xl border border-rose-100 shadow-xs flex flex-col justify-between">
          <p className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
            {receivablesTheme.kpis.overdue.label}
          </p>
          <p className="text-2xl font-bold text-rose-600 mt-2 tabular-nums">
            {formatCurrency(kpis.atrasado)}
          </p>
          <p className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>
              {kpis.titulosAtrasados} {kpis.titulosAtrasados === 1 ? 'título atrasado' : 'títulos atrasados'}
            </span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <p className={typography.kpi.label}>Total Recebido</p>
          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {formatCurrency(kpis.recebido)}
          </p>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {kpis.titulosQuitados} {kpis.titulosQuitados === 1 ? 'título quitado' : 'títulos quitados'}
            </span>
          </p>
        </div>
      </div>

      {/* Filtros + tabela */}
      <div className={styles.card}>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 border-b border-slate-100 bg-white">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Cliente / Documento
            </label>
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
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Status</label>
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
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Vencimento (De)
            </label>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => setFromDate(e.target.value)}
              className={inputBase}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
              Vencimento (Até)
            </label>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
              className={inputBase}
            />
          </div>

          {temFiltroAtivo && (
            <div className="sm:col-span-4 flex justify-end -mt-1">
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
                <th className={typography.table.header}>CÓDIGO</th>
                <th className={typography.table.header}>CLIENTE</th>
                <th className={typography.table.header}>DOCUMENTO</th>
                <th className={typography.table.header}>EMISSÃO</th>
                <th className={typography.table.header}>VENCIMENTO</th>
                <th className={`${typography.table.header} text-right`}>VALOR ORIGINAL</th>
                <th className={`${typography.table.header} text-right`}>VALOR RECEBIDO</th>
                <th className={`${typography.table.header} text-right`}>SALDO</th>
                <th className={`${typography.table.header} text-center`}>PARCELA</th>
                <th className={`${typography.table.header} text-center`}>STATUS</th>
                <th className={`${typography.table.header} text-center`}>AÇÕES</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-14 text-center">
                    <div className="inline-flex flex-col items-center gap-2 text-slate-400">
                      <Inbox className="w-6 h-6" />
                      <p className="text-sm font-medium text-slate-600">
                        {temFiltroAtivo
                          ? 'Nenhum recebimento encontrado com esses filtros.'
                          : 'Nenhum recebimento cadastrado ainda.'}
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
                          onClick={onOpenNewReceivable}
                          className="text-xs font-semibold text-[#003d9b] hover:underline cursor-pointer"
                        >
                          Adicionar o primeiro recebimento
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {paginated.map((item) => {
                const cancelado = item.statusEfetivo === 'canceled';
                const atrasado = item.statusEfetivo === 'late';
                const quitado = item.statusEfetivo === 'received';
                const percentual =
                  item.original_amount > 0
                    ? Math.min(100, Math.round((item.received_amount / item.original_amount) * 100))
                    : 0;
                const cfg = STATUS_CONFIG[item.statusEfetivo];

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      cancelado ? 'opacity-60 bg-slate-50/40' : ''
                    }`}
                  >
                    <td className="py-4 px-4 text-xs font-semibold text-center text-slate-900 whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">
                      {getClientName(item.client_id)}
                    </td>
                    <td className="py-4 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                      {item.document_id}
                    </td>
                    <td className="py-4 px-4 text-xs font-medium text-slate-500 tabular-nums whitespace-nowrap">
                      {formatDate(item.entry_date)}
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold tabular-nums whitespace-nowrap">
                      <span
                        className={
                          cancelado
                            ? 'line-through text-slate-400'
                            : atrasado
                            ? 'text-rose-600 font-bold'
                            : 'text-slate-800'
                        }
                      >
                        {formatDate(item.due_date)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-xs font-medium text-slate-700 tabular-nums whitespace-nowrap">
                      {formatCurrency(item.original_amount)}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <span className="text-xs font-semibold text-slate-900 tabular-nums">
                        {formatCurrency(item.received_amount)}
                      </span>
                      {!cancelado && item.original_amount > 0 && (
                        <div
                          className="mt-1 ml-auto h-1 w-16 rounded-full bg-slate-100 overflow-hidden"
                          title={`${percentual}% recebido`}
                        >
                          <div
                            className={`h-full rounded-full ${quitado ? 'bg-emerald-500' : 'bg-[#003d9b]'}`}
                            style={{ width: `${percentual}%` }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <span
                        className={`text-xs font-bold tabular-nums ${
                          item.balance <= 0 || cancelado
                            ? 'text-slate-400'
                            : atrasado
                            ? 'text-rose-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {formatCurrency(item.balance)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-xs text-slate-600 font-medium whitespace-nowrap">
                      {item.installment}
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
                          disabled={Number(Number(item.balance).toFixed(2)) == 0}
                          onClick={() => handlePayment(item)}
                          title={quitado ? 'Reabrir (marcar como pendente)' : 'Marcar como recebido'}
                          aria-label={quitado ? 'Marcar como pendente' : 'Marcar como recebido'}
                          className={`p-1 rounded transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                            quitado
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          title="Excluir"
                          aria-label="Excluir recebimento"
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

      {deleteItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Cabeçalho */}
            <div className="px-6 pt-6">
              <div className="flex items-start gap-4">

                {/* Ícone */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-7 0h10"
                    />
                  </svg>
                </div>

                {/* Título */}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold tracking-tight text-gray-900">
                    Excluir conta a receber
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    Você está prestes a excluir este registro.
                  </p>
                </div>

                {/* Fechar */}
                <button
                  type="button"
                  onClick={() => setDeleteItem(null)}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Informações */}
            <div className="px-6 py-5">

              <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">

                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                      Documento
                    </p>

                    <p className="truncate text-sm font-semibold text-gray-800">
                      {deleteItem.document_id || "Sem documento"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                      Parcela
                    </p>

                    <p className="text-sm font-semibold text-gray-800">
                      {deleteItem.installment}
                    </p>
                  </div>

                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                      Cliente
                    </p>

                    <p className="truncate text-sm font-semibold text-gray-800">
                      {getClientName(deleteItem.client_id)}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                      Valor
                    </p>

                    <p className="truncate text-sm font-semibold text-gray-800">
                      {deleteItem.original_amount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Aviso */}
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m0 3.75h.008M10.29 3.86l-7.82 13.5A2 2 0 004.2 20h15.6a2 2 0 001.73-2.64l-7.82-13.5a2 2 0 00-3.42 0z"
                  />
                </svg>

                <p className="text-xs leading-5 text-red-700">
                  Essa ação é permanente e não poderá ser desfeita.
                </p>
              </div>
            </div>

            {/* Rodapé */}
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
                  onDeleteReceivable(deleteItem.id);
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

      {paymentItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">

            {/* HEADER */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Registrar pagamento
                  </h3>

                  <p className="text-xs text-slate-400">
                    Registre o valor recebido da conta.
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => setPaymentItem(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>

            </div>


            {/* INFORMAÇÕES DA CONTA */}
            <div className="bg-slate-50 rounded-xl p-4 mb-5">

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <p className="text-xs text-slate-400">
                    Documento
                  </p>

                  <p className="text-sm font-semibold text-slate-800">
                    {paymentItem.document_id || "Sem documento"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Parcela
                  </p>

                  <p className="text-sm font-semibold text-slate-800">
                    {paymentItem.installment}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Valor original
                  </p>

                  <p className="text-sm font-semibold text-slate-800">
                    {Number(paymentItem.original_amount).toLocaleString(
                      "pt-BR",
                      {
                        style: "currency",
                        currency: "BRL",
                      }
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Saldo atual
                  </p>

                  <p className="text-sm font-bold text-emerald-600">
                    {Number(paymentItem.balance).toLocaleString(
                      "pt-BR",
                      {
                        style: "currency",
                        currency: "BRL",
                      }
                    )}
                  </p>
                </div>

              </div>

            </div>


            {/* VALOR PAGO */}
            <div className="mb-4">

              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Valor pago
              </label>

              <div className="relative">

                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  R$
                </span>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={paymentItem.balance}
                  value={paymentAmount}
                  onChange={(e) =>
                    setPaymentAmount(e.target.value)
                  }
                  className={`${styles.input} pl-10`}
                  placeholder="0,00"
                />

              </div>

            </div>


            {/* RECEBIMENTO */}
            <div className="grid grid-cols-2 gap-4 mb-4">

              <div>

                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Recebimento
                </label>

                <select
                  value={paymentReceipt}
                  onChange={(e) =>
                    handlePaymentReceiptChange(
                      e.target.value
                    )
                  }
                  className={styles.input}
                >

                  <option value="PIX">
                    PIX
                  </option>

                  <option value="Boleto Bancário">
                    Boleto Bancário
                  </option>

                  <option value="Cartão de Crédito">
                    Cartão de Crédito
                  </option>

                  <option value="Cartão de Débito">
                    Cartão de Débito
                  </option>

                  <option value="Espécie">
                    Espécie
                  </option>

                </select>

              </div>


              {/* CONTA */}
              <div>

                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Conta de destino
                </label>

                <select
                  value={paymentDestinationAccount}
                  onChange={(e) =>
                    setPaymentDestinationAccount(
                      e.target.value
                    )
                  }
                  className={styles.input}
                >

                  {bankAccounts.map(
                    (account, index) => (
                      <option
                        key={index}
                        value={account}
                      >
                        {account}
                      </option>
                    )
                  )}

                  <option value="Caixa Interno">
                    Caixa Interno
                  </option>

                </select>

              </div>

            </div>


            {/* TAXA */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-5">

              <div className="flex items-center justify-between">

                <span className="text-xs font-medium text-slate-500">
                  Taxa de recebimento
                </span>

                <span className="text-sm font-bold text-slate-700">
                  {paymentFee.toFixed(2)}%
                </span>

              </div>

            </div>


            {/* RESTANTE */}
            {paymentAmount && (
              <div className="flex items-center justify-between mb-5 px-1">

                <span className="text-xs text-slate-500">
                  Saldo após pagamento
                </span>

                <span className="text-sm font-bold text-slate-700">

                  {Math.max(
                    Number(paymentItem.balance) -
                      Number(paymentAmount || 0), 0
                    
                  ).toLocaleString(
                    "pt-BR",
                    {
                      style: "currency",
                      currency: "BRL",
                    }
                  )}

                </span>

              </div>
            )}

            {/* BOTÕES */}
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => setPaymentItem(null)}
                className={styles.secondaryButton}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={
                  !paymentAmount ||
                  Number(paymentAmount) <= 0 ||
                  Number(Number(paymentAmount).toFixed(2)) > Number(Number(paymentItem.balance).toFixed(2))
                  
                }
                className={styles.primaryButton}
              >
                Confirmar pagamento
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
};