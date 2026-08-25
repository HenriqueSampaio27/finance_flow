import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  AlertCircle, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { ReceivableItem, StatusRecebimento } from '../types';
import { formatCurrency } from '../utils/formatters';
import { receivablesTheme, styles, typography } from '../theme';

interface ContasReceberSectionProps {
  receivables: ReceivableItem[];
  onOpenNewReceivable: () => void;
  onDeleteReceivable: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: StatusRecebimento) => void;
}

export const ContasReceberSection: React.FC<ContasReceberSectionProps> = ({
  receivables,
  onOpenNewReceivable,
  onDeleteReceivable,
  onUpdateStatus,
}) => {
  const [clientSearch, setClientSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const filteredReceivables = useMemo(() => {
    return receivables.filter((item) => {
      if (statusFilter !== 'Todos' && item.status !== statusFilter) return false;
      if (clientSearch && !item.cliente.toLowerCase().includes(clientSearch.toLowerCase())) return false;
      return true;
    });
  }, [receivables, statusFilter, clientSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredReceivables.length / pageSize));
  const paginatedReceivables = filteredReceivables.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalReceivable = receivables.reduce((acc, curr) => acc + curr.saldo, 0);
  const overdueReceivable = receivables
    .filter((r) => r.status === 'Atrasado')
    .reduce((acc, curr) => acc + curr.saldo, 0);
  const todayReceivable = receivables
    .filter((r) => r.status === 'Recebido')
    .reduce((acc, curr) => acc + curr.valorRecebido, 0);

  return (
    <div className={styles.pageContainer}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={typography.headings.pageTitle}>{receivablesTheme.header.title}</h1>
          <p className={typography.headings.pageSubtitle}>{receivablesTheme.header.subtitle}</p>
        </div>
        <button
          id="btn-novo-recebivel"
          onClick={onOpenNewReceivable}
          className={styles.primaryButton}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{receivablesTheme.header.actionLabel}</span>
        </button>
      </div>

      {/* 3 Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total a Receber */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <p className={typography.kpi.label}>{receivablesTheme.kpis.total.label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {formatCurrency(totalReceivable || 145890.00)}
          </p>
          <p className="text-xs font-medium text-emerald-600 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{receivablesTheme.kpis.total.trend}</span>
          </p>
        </div>

        {/* Contas em Atraso (Light Pink Background Accent) */}
        <div className="bg-rose-50/50 p-5 rounded-xl border border-rose-100 shadow-xs flex flex-col justify-between">
          <p className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
            {receivablesTheme.kpis.overdue.label}
          </p>
          <p className="text-2xl font-bold text-rose-600 mt-2 tabular-nums">
            {formatCurrency(overdueReceivable || 18240.50)}
          </p>
          <p className="text-xs font-medium text-rose-600 flex items-center gap-1 mt-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{receivablesTheme.kpis.overdue.subtext}</span>
          </p>
        </div>

        {/* Recebimentos Hoje */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <p className={typography.kpi.label}>{receivablesTheme.kpis.today.label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {formatCurrency(todayReceivable || 5420.00)}
          </p>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{receivablesTheme.kpis.today.subtext}</span>
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className={styles.card}>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 border-b border-slate-100 bg-white">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Cliente</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por cliente..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium"
            >
              <option>Todos</option>
              <option>Recebido</option>
              <option>Pendente</option>
              <option>Atrasado</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Vencimento (De)</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Vencimento (Até)</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700"
            />
          </div>
        </div>

        {/* Receivables Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-white">
                <th className={typography.table.header}>CLIENTE</th>
                <th className={typography.table.header}>DOCUMENTO</th>
                <th className={typography.table.header}>VENCIMENTO</th>
                <th className={`${typography.table.header} text-right`}>VALOR ORIGINAL</th>
                <th className={`${typography.table.header} text-right`}>VALOR RECEBIDO</th>
                <th className={`${typography.table.header} text-right`}>SALDO</th>
                <th className={`${typography.table.header} text-center`}>PARCELA</th>
                <th className={`${typography.table.header} text-center`}>AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedReceivables.map((item) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-slate-50/80 transition-colors ${item.isStriked ? 'opacity-70 bg-slate-50/40' : ''}`}
                >
                  <td className="py-4 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">
                    {item.cliente}
                  </td>
                  <td className="py-4 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                    {item.documento}
                  </td>
                  <td className="py-4 px-4 text-xs font-semibold tabular-nums whitespace-nowrap">
                    <span className={item.isStriked ? 'line-through text-slate-400' : item.status === 'Atrasado' ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                      {item.vencimento}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-xs font-medium text-slate-700 tabular-nums whitespace-nowrap">
                    {formatCurrency(item.valorOriginal)}
                  </td>
                  <td className="py-4 px-4 text-right text-xs font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                    {formatCurrency(item.valorRecebido)}
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <span className={`text-xs font-bold tabular-nums ${item.saldo === 0 ? 'text-slate-400' : 'text-rose-600'}`}>
                      {formatCurrency(item.saldo)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center text-xs text-slate-600 font-medium whitespace-nowrap">
                    {item.parcela}
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onUpdateStatus(item.id, item.status === 'Recebido' ? 'Pendente' : 'Recebido')}
                        title={item.status === 'Recebido' ? 'Marcar Pendente' : 'Marcar como Recebido'}
                        className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteReceivable(item.id)}
                        title="Excluir"
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

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Mostrando 1-{paginatedReceivables.length} de {filteredReceivables.length} registros</span>
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
