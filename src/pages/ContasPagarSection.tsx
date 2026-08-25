import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  SlidersHorizontal, 
  Calendar, 
  AlertCircle, 
  Wallet, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  Search,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { PayableItem, StatusPagamento } from '../types';
import { formatCurrency } from '../utils/formatters';
import { payablesTheme, styles, typography } from '../theme';

interface ContasPagarSectionProps {
  payables: PayableItem[];
  onOpenNewPayable: () => void;
  onDeletePayable: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: StatusPagamento) => void;
}

export const ContasPagarSection: React.FC<ContasPagarSectionProps> = ({
  payables,
  onOpenNewPayable,
  onDeletePayable,
  onUpdateStatus,
}) => {
  const [period, setPeriod] = useState('Este Mês (Nov 2023)');
  const [statusFilter, setStatusFilter] = useState('Todos os Status');
  const [supplierQuery, setSupplierQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const filteredPayables = useMemo(() => {
    return payables.filter((item) => {
      if (statusFilter !== 'Todos os Status' && item.status !== statusFilter) return false;
      if (supplierQuery && !item.fornecedor.toLowerCase().includes(supplierQuery.toLowerCase())) return false;
      return true;
    });
  }, [payables, statusFilter, supplierQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPayables.length / pageSize));
  const paginatedPayables = filteredPayables.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalPayable = payables.reduce((acc, curr) => acc + curr.saldo, 0);
  const overduePayable = payables
    .filter((p) => p.status === 'Vencido')
    .reduce((acc, curr) => acc + curr.saldo, 0);
  const dueToday = payables
    .filter((p) => p.vencimentoTag?.includes('HOJE'))
    .reduce((acc, curr) => acc + curr.saldo, 0);

  return (
    <div className={`${styles.pageContainer} relative`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={typography.headings.pageTitle}>{payablesTheme.header.title}</h1>
          <p className={typography.headings.pageSubtitle}>{payablesTheme.header.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className={styles.secondaryButton}>
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Filtros Avançados</span>
          </button>
          <button
            id="btn-novo-pagamento"
            onClick={onOpenNewPayable}
            className={styles.primaryButton}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{payablesTheme.header.actionLabel}</span>
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total a Pagar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total a Pagar</span>
            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-slate-900 tabular-nums">
              {formatCurrency(totalPayable || 145230.00)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>ⓘ</span> Próximos 30 dias
            </p>
          </div>
        </div>

        {/* Contas Vencidas - Red Accent Left Border */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-rose-600 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Contas Vencidas</span>
            <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-rose-600 tabular-nums">
              {formatCurrency(overduePayable || 12450.20)}
            </p>
            <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
              <span>⚠️</span> 08 faturas pendentes
            </p>
          </div>
        </div>

        {/* Vencendo Hoje */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Vencendo Hoje</span>
            <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-slate-900 tabular-nums">
              {formatCurrency(dueToday || 3840.00)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>ⓘ</span> Processar até as 18h
            </p>
          </div>
        </div>

        {/* Eficiência de Pagamento */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Eficiência de Pagamento</span>
            <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl font-bold text-slate-900 tabular-nums">94.2%</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#003d9b] h-full rounded-full w-[94.2%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className={styles.card}>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 border-b border-slate-100 bg-white">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Período</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium"
            >
              <option>Este Mês (Nov 2023)</option>
              <option>Próximo Mês (Dez 2023)</option>
              <option>Todos os Períodos</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium"
            >
              <option>Todos os Status</option>
              <option>Vencido</option>
              <option>Pendente</option>
              <option>Agendado</option>
              <option>Parcial</option>
              <option>Pago</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Fornecedor</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Filtrar por nome..."
                value={supplierQuery}
                onChange={(e) => setSupplierQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => { setStatusFilter('Todos os Status'); setSupplierQuery(''); }}
              className="w-full py-1.5 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* Payables Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-white">
                <th className={typography.table.header}>FORNECEDOR</th>
                <th className={typography.table.header}>DOCUMENTO</th>
                <th className={typography.table.header}>VENCIMENTO</th>
                <th className={`${typography.table.header} text-right`}>VALOR ORIGINAL</th>
                <th className={`${typography.table.header} text-right`}>VALOR PAGO</th>
                <th className={`${typography.table.header} text-right`}>SALDO</th>
                <th className={`${typography.table.header} text-center`}>PARCELA</th>
                <th className={`${typography.table.header} text-center`}>STATUS</th>
                <th className={`${typography.table.header} text-center`}>AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPayables.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center">
                        {item.avatarLetter}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 leading-tight">{item.fornecedor}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                    {item.documento}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div>
                      <p className="text-xs font-semibold text-slate-800 tabular-nums">{item.vencimento}</p>
                      {item.vencimentoTag && (
                        <p className="text-[10px] font-bold text-rose-600 uppercase tracking-tight mt-0.5">
                          {item.vencimentoTag}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right text-xs font-medium text-slate-700 tabular-nums whitespace-nowrap">
                    {formatCurrency(item.valorOriginal)}
                  </td>
                  <td className="py-4 px-4 text-right text-xs font-medium text-slate-600 tabular-nums whitespace-nowrap">
                    {formatCurrency(item.valorPago)}
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <span className="text-xs font-bold text-rose-600 tabular-nums">
                      {formatCurrency(item.saldo)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center text-xs text-slate-600 font-medium whitespace-nowrap">
                    {item.parcela}
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-block ${
                      item.status === 'Vencido'
                        ? 'bg-rose-600 text-white font-bold'
                        : item.status === 'Pendente'
                        ? 'bg-slate-100 text-slate-600'
                        : item.status === 'Agendado'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-sky-50 text-sky-700 border border-sky-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onUpdateStatus(item.id, item.status === 'Pago' ? 'Pendente' : 'Pago')}
                        title="Marcar como Pago"
                        className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeletePayable(item.id)}
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
          <span>Mostrando 1-{paginatedPayables.length} de {filteredPayables.length} lançamentos</span>
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

      {/* Floating Action Button in bottom right */}
      <button
        id="btn-fab-contas-pagar"
        onClick={onOpenNewPayable}
        className="fixed bottom-6 right-8 w-12 h-12 bg-[#003d9b] hover:bg-[#003080] text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 z-30"
        title="Novo Pagamento"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>
    </div>
  );
};
