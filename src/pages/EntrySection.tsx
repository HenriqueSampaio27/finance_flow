import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Download, 
  RotateCcw, 
  ArrowUpDown, 
  TrendingUp, 
  Clock, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { EntryItem } from '../types/entryType';
import { formatCurrency, exportToCSV } from '../utils/formatters';
import { entriesTheme, styles, typography } from '../theme';
import { UserType } from '../types/userType';
import DateRangeFilter from '../components/modals/DateRangeFilter';

interface EntradasSectionProps {
  entries: EntryItem[];
  onOpenNewEntry: () => void;
  onDeleteEntry: (id: number) => void;
  user: UserType | null | undefined;
}

export const EntradasSection: React.FC<EntradasSectionProps> = ({
  entries,
  onOpenNewEntry,
  onDeleteEntry,
  user
}) => {
  // Filter states
  const [period, setPeriod] = useState('Todos');
  const [category, setCategory] = useState('Todas');
  const [receipt, setReceipt] = useState('Todos');
  const [account, setAccount] = useState('Todas as Contas');
  const [sortField, setSortField] = useState<'data' | 'valor'>('data');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const accounts = [
    user?.bank_account1,
    user?.bank_account2,
    user?.bank_account3,
    user?.bank_account4,
    user?.bank_account5,
  ].filter((account): account is string => !!account);

  // Derived filtered entries
  const filteredEntries = useMemo(() => {

    return entries.filter((item) => {

      // Categoria
      if (category !== 'Todas' && item.category !== category) {
        return false;
      }

      // Conta
      if (account && account !== 'Todas as Contas' &&
          item.destination_account !== account) {
        return false;
      }
      // Recebimento
      if (
        receipt !== 'Todos' &&
        item.receipt !== receipt
      ) {
        return false;
      }

      // Período
      if (startDate && item.date < startDate) {
        return false;
      }

      if (endDate && item.date > endDate) {
        return false;
      }

      return true;

    }).sort((a, b) => {

      if (sortField === 'valor') {
        return sortOrder === 'asc'
          ? a.amount - b.amount
          : b.amount - a.amount;
      }

      return sortOrder === 'asc'
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date);

    });

  }, [
    entries,
    category,
    receipt,
    account,
    status,
    period,
    startDate,
    endDate,
    sortField,
    sortOrder
  ]);
  
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const paginatedEntries = filteredEntries.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // KPI calculations
  const totalReceivedFee = filteredEntries
    .filter((e) => e.fee != 0)
    .reduce((acc, curr) => acc + (Number(curr.amount) - (Number(curr.fee)/100 * Number(curr.amount))), 0);
  const totalReceived = filteredEntries
    .filter((e) => e.fee === 0)
    .reduce((acc, curr) => acc + Number(curr.amount), 0) + totalReceivedFee

  const totalCount = filteredEntries.length

  const averageTicket = filteredEntries.length ? (totalReceived) / filteredEntries.length : 0;

  const handleResetFilters = () => {
    setPeriod('Este Mês');
    setCategory('Todas');
    setReceipt('Todos');
    setAccount('Todas as Contas');
    setStartDate("")
    setEndDate("")
  };

  const handleExportCSV = () => {
    exportToCSV('entradas_financeiras_financeflow', filteredEntries);
  };

  const toggleSort = (field: 'data' | 'valor') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleDeleteClick = (id: number) => {
    setEntryToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (entryToDelete === null) return;

    onDeleteEntry(entryToDelete);

    setShowDeleteModal(false);
    setEntryToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setEntryToDelete(null);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={typography.headings.pageTitle}>{entriesTheme.header.title}</h1>
          <p className={typography.headings.pageSubtitle}>{entriesTheme.header.subtitle}</p>
        </div>
        <button
          id="btn-nova-entrada-top"
          onClick={onOpenNewEntry}
          className={styles.primaryButton}
        >
          <span>{entriesTheme.header.actionLabel}</span>
        </button>
      </div>

      {/* Bottom KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Recebido */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className={typography.kpi.label}>{entriesTheme.kpiCards.totalReceived.label}</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
              {formatCurrency(totalReceived)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Pendente de Recebimento */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className={typography.kpi.label}>{entriesTheme.kpiCards.count.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {totalCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Ticket Médio por Cliente */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className={typography.kpi.label}>{entriesTheme.kpiCards.averageTicket.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {formatCurrency(averageTicket)}
            </p>
    
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.card}>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 border-b border-slate-100 bg-slate-50/50">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Período
            </label>

            <div
              className="inline-flex items-center gap-1.5 px-16 bg-white rounded-xl border border-slate-200/90"
            >
              <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
            />
            </div>
          
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-[#003d9b] focus:border-[#003d9b]"
            >
              <option>Todas</option>
              <option>SERVIÇOS</option>
              <option>MANUTENÇÃO</option>
              <option>PRODUTOS</option>
              <option>OUTROS</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Recebimento
            </label>
            <select
              value={receipt}
              onChange={(e) => setReceipt(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-[#003d9b] focus:border-[#003d9b]"
            >
              <option>Todos</option>
              <option>PIX</option>
              <option>Boleto Bancário</option>
              <option>Cartão de Crédito</option>
              <option>Cartão de Débito</option>
              <option>Espécie</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Conta
            </label>

            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-[#003d9b] focus:border-[#003d9b]"
            >
              <option value="">Todas as Contas</option>

              {accounts.map((accountName, index) => (
                <option key={index} value={accountName}>
                  {accountName}
                </option>
              ))}

              <option value="Caixa Interno">Caixa Interno</option>
            </select>
          </div>

        </div>

        {/* Filter controls & action bar */}
        <div className="p-3 px-4 flex items-center justify-between flex-wrap gap-3 text-xs text-slate-500 border-b border-slate-100">
          <span className="font-medium">
            Exibindo <strong className="text-slate-800">{filteredEntries.length}</strong> de <strong className="text-slate-800">{entries.length}</strong> entradas
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-white">
                <th 
                  onClick={() => toggleSort('data')}
                  className={`${typography.table.header} cursor-pointer hover:text-slate-700`}
                >
                  <span className="inline-flex items-center gap-1">
                    DATA <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className={typography.table.header}>DESCRIÇÃO</th>
                <th className={typography.table.header}>CATEGORIA</th>
                <th className={typography.table.header}>CLIENTE</th>
                <th className={typography.table.header}>RECEBIMENTO</th>
                <th className={typography.table.header}>CONTA</th>
                <th 
                  onClick={() => toggleSort('valor')}
                  className={`${typography.table.header} text-right cursor-pointer hover:text-slate-700`}
                >
                  <span className="inline-flex items-center justify-end gap-1 w-full">
                    VALOR <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className={`${typography.table.header} text-center`}>PARCELA</th>
                <th className={`${typography.table.header} text-center`}>AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEntries.map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="py-4 px-4 text-xs font-medium text-slate-600 tabular-nums whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="py-4 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">
                    {item.description}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={styles.categoryPill}>
                      {item.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-700 font-medium whitespace-nowrap">
                    {item.client_id}
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                    {item.receipt}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                      <span className={`w-2 h-2 rounded-full ${
                        item.destination_account === 'Itaú PJ' ? 'bg-[#003d9b]' : item.destination_account === 'NuBank PJ' ? 'bg-purple-600' : 'bg-amber-500'
                      }`} />
                      {item.destination_account}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <span className="text-xs font-bold text-emerald-700 tabular-nums">
                      {formatCurrency(item.amount)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                      {item.installment}
                  </td>
                  <td className="py-4 px-4 text-center relative whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => {
                          if (!item.id) return;
                          handleDeleteClick(item.id);
                        }}
                        title="Excluir Saída"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Linhas por página:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700 font-medium cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>1-{Math.min(pageSize, filteredEntries.length)} de {filteredEntries.length}</span>
            <div className="flex items-center gap-1 ml-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {[1, 2, 3].slice(0, totalPages).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded text-xs font-semibold cursor-pointer ${
                    currentPage === p
                      ? 'bg-[#003d9b] text-white'
                      : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            
            <h2 className="text-lg font-bold text-slate-800">
              Excluir saída?
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Tem certeza que deseja excluir esta entrada?
              Essa ação não poderá ser desfeita.
            </p>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Excluir
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
