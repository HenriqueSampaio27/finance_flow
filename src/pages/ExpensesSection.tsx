import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  RotateCcw, 
  FileText, 
  Paperclip, 
  Slash, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  CheckCircle,
  ExternalLink,
  TrendingUp,
  Clock
} from 'lucide-react';
import { ExpenseItem } from '../types/expensesType';
import { formatCurrency } from '../utils/formatters';
import { entriesTheme, expensesTheme, styles, typography } from '../theme';
import { UserType } from '../types/userType';
import DateRangeFilter from '../components/modals/DateRangeFilter';

interface ExpensesSectionProps {
  expenses: ExpenseItem[];
  onOpenNewExpense: () => void;
  onDeleteExpense: (id: number) => void;
  user: UserType | null | undefined
}

export const ExpensesSection: React.FC<ExpensesSectionProps> = ({
  expenses,
  onOpenNewExpense,
  onDeleteExpense,
  user
}) => {

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [period, setPeriod] = useState('Período: Todos');
  const [category, setCategory] = useState('Categoria: Todas');
  const [account, setAccount] = useState('Conta: Todas');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const accounts = [
    user?.bank_account1,
    user?.bank_account2,
    user?.bank_account3,
    user?.bank_account4,
    user?.bank_account5,
  ].filter((account): account is string => !!account);

  const filteredExpenses = useMemo(() => {
  
    return expenses.filter((item) => {
      // =========================
      // FILTRO DE PERÍODO
      // =========================
      if (startDate && item.date < startDate) {
        return false;
      }

      if (endDate && item.date > endDate) {
        return false;
      }

      // =========================
      // FILTRO DE CATEGORIA
      // =========================
      if (
        category !== 'Categoria: Todas' &&
        item.category !== category
      ) {
        return false;
      }

      // =========================
      // FILTRO DE CONTA
      // =========================
      if (
        account !== 'Conta: Todas' &&
        item.outgoing_account !== account
      ) {
        return false;
      }

      return true;
    });

  }, [
    expenses,
    period,
    category,
    account,
    startDate,
    endDate
  ]);

  // KPI calculations
  const totalReceived = filteredExpenses
    .reduce((acc, curr) => acc + Number(curr.amount), 0)

  const totalCount = filteredExpenses.length

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / pageSize));
  const paginatedExpenses = filteredExpenses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleResetFilters = () => {
    setPeriod('Período: Todos');
    setCategory('Categoria: Todas');
    setAccount('Conta: Todas');
    setStartDate("")
    setEndDate("")
  };

  const handleDeleteClick = (id: number) => {
    setExpenseToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (expenseToDelete === null) return;

    onDeleteExpense(expenseToDelete);

    setShowDeleteModal(false);
    setExpenseToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setExpenseToDelete(null);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Breadcrumb & Top Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={typography.headings.pageTitle}>{expensesTheme.header.title}</h1>
            <p className={typography.headings.pageSubtitle}>{expensesTheme.header.subtitle}</p>
          </div>
          <button
            id="btn-nova-saida-top"
            onClick={onOpenNewExpense}
            className={styles.primaryButton}
          >
            <span>{expensesTheme.header.actionLabel}</span>
          </button>
        </div>
      </div>

      {/* Bottom KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Recebido */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className={typography.kpi.label}>Total pago</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
              {formatCurrency(totalReceived)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Total de saídas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className={typography.kpi.label}>Total de saídas</p>
            <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {totalCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        </div>

      {/* Filter Bar */}
      <div className={styles.card}>
        <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              FILTROS:
            </span>

            <div
              className="inline-flex items-center gap-1.5 px-10 bg-white rounded-xl border border-slate-200/90"
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

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-[#003d9b] cursor-pointer"
            >
              <option>Categoria: Todas</option>
              <option>Cloud Services</option>
              <option>Infraestrutura</option>
              <option>Marketing</option>
              <option>Materiais</option>
              <option>Software</option>
              <option>Outros</option>

            </select>

            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="bg-white-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-[#003d9b] cursor-pointer"
            >
              <option>Conta: Todas</option>
              {accounts.map((accountName, index) => (
                <option key={index} value={accountName}>
                  {accountName}
                </option>
              ))}
              <option>Caixa Interno</option>
            </select>

          </div>

          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Limpar Filtros
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-400 bg-white">
                <th className={typography.table.header}>DATA</th>
                <th className={typography.table.header}>FORNECEDOR</th>
                <th className={typography.table.header}>CATEGORIA</th>
                <th className={typography.table.header}>CONTA SAÍDA</th>
                <th className={`${typography.table.header} text-right`}>VALOR</th>
                <th className={typography.table.header}>OBS.</th>
                <th className={typography.table.header}>PARCELAS</th>
                <th className={`${typography.table.header} text-center`}>AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedExpenses.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 text-xs font-medium text-slate-600 tabular-nums whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">{item?.date.split(' ')[0]}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        item.supplier || 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.supplier}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-600 font-medium whitespace-nowrap">
                    {item.category}
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                    {item.outgoing_account}
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <span className="text-xs font-bold text-rose-600 tabular-nums">
                      {formatCurrency(item.amount)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap max-w-[150px] truncate">
                    {item.observations}
                  </td>
                  <td className="py-4 px-10 text-xs text-slate-500 whitespace-nowrap">
                    {item.installment}
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
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
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Mostrando 1-{paginatedExpenses.length} de {filteredExpenses.length} saídas</span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
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
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
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
              Tem certeza que deseja excluir esta saída?
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
