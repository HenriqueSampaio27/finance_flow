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
  ExternalLink
} from 'lucide-react';
import { ExpenseItem, StatusPagamento } from '../types';
import { formatCurrency } from '../utils/formatters';
import { expensesTheme, styles, typography } from '../theme';

interface SaidasSectionProps {
  expenses: ExpenseItem[];
  onOpenNewExpense: () => void;
  onDeleteExpense: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: StatusPagamento) => void;
}

export const SaidasSection: React.FC<SaidasSectionProps> = ({
  expenses,
  onOpenNewExpense,
  onDeleteExpense,
  onUpdateStatus,
}) => {
  const [period, setPeriod] = useState('Este Mês');
  const [category, setCategory] = useState('Todas');
  const [supplier, setSupplier] = useState('Todos');
  const [account, setAccount] = useState('Todas');
  const [status, setStatus] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      if (category !== 'Todas' && item.categoria !== category) return false;
      if (supplier !== 'Todos' && item.fornecedor !== supplier) return false;
      if (account !== 'Todas' && item.conta !== account) return false;
      if (status !== 'Todos' && item.status !== status) return false;
      return true;
    });
  }, [expenses, category, supplier, account, status]);

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / pageSize));
  const paginatedExpenses = filteredExpenses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleResetFilters = () => {
    setPeriod('Este Mês');
    setCategory('Todas');
    setSupplier('Todos');
    setAccount('Todas');
    setStatus('Todos');
  };

  return (
    <div className={styles.pageContainer}>
      {/* Breadcrumb & Top Header */}
      <div>
        <p className="text-xs font-semibold text-slate-400 mb-1">
          {expensesTheme.header.breadcrumbs}
        </p>
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
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{expensesTheme.header.actionLabel}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.card}>
        <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              FILTROS:
            </span>

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-[#003d9b] cursor-pointer"
            >
              <option>Período: Este Mês</option>
              <option>Período: Mês Passado</option>
              <option>Período: Últimos 90 dias</option>
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-[#003d9b] cursor-pointer"
            >
              <option>Categoria: Todas</option>
              <option>Cloud Services</option>
              <option>Infraestrutura</option>
              <option>Marketing</option>
              <option>Materiais</option>
              <option>Software</option>
            </select>

            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-[#003d9b] cursor-pointer"
            >
              <option>Fornecedor: Todos</option>
              <option>Amazon Web Services</option>
              <option>Limpeza & Cia</option>
              <option>Google Ads</option>
              <option>Papelaria Central</option>
              <option>Figma Inc.</option>
            </select>

            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-[#003d9b] cursor-pointer"
            >
              <option>Conta: Todas</option>
              <option>Itaú PJ</option>
              <option>Caixa</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:ring-1 focus:ring-[#003d9b] cursor-pointer"
            >
              <option>Status: Todos</option>
              <option>Pago</option>
              <option>Pendente</option>
              <option>Vencido</option>
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
              <tr className="border-b border-slate-200 bg-white">
                <th className={typography.table.header}>DATA</th>
                <th className={typography.table.header}>FORNECEDOR</th>
                <th className={typography.table.header}>CATEGORIA</th>
                <th className={typography.table.header}>CONTA</th>
                <th className={`${typography.table.header} text-right`}>VALOR</th>
                <th className={`${typography.table.header} text-center`}>STATUS</th>
                <th className={typography.table.header}>OBS.</th>
                <th className={`${typography.table.header} text-center`}>ANEXO</th>
                <th className={`${typography.table.header} text-center`}>AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedExpenses.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 text-xs font-medium text-slate-600 tabular-nums whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-800">{item.data.split(' ')[0]}</span>
                      <span className="text-[11px] text-slate-400">{item.data.split(' ').slice(1).join(' ')}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        item.avatarBgColor || 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.avatarLetter}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 leading-tight">{item.fornecedor}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-600 font-medium whitespace-nowrap">
                    {item.categoria}
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                    {item.conta}
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <span className="text-xs font-bold text-rose-600 tabular-nums">
                      {formatCurrency(item.valor)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 ${
                      item.status === 'Pago'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.status === 'Pendente'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700 font-bold'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'Pago' ? 'bg-emerald-500' : item.status === 'Pendente' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} />
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap max-w-[150px] truncate">
                    {item.obs}
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    {item.temAnexo ? (
                      <span className="inline-flex p-1 text-slate-500 hover:text-[#003d9b] cursor-pointer">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 text-slate-300">
                        <Slash className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onUpdateStatus(item.id, item.status === 'Pago' ? 'Pendente' : 'Pago')}
                        title={item.status === 'Pago' ? 'Marcar como Pendente' : 'Marcar como Pago'}
                        className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(item.id)}
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
    </div>
  );
};
