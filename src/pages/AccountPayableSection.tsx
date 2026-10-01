import React, { useState, useMemo, useEffect } from 'react';
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

import { PayableItem } from '../types/payablesType';
import { formatCurrency } from '../utils/formatters';
import { payablesTheme, styles, typography } from '../theme';
import DateRangeFilter from '../components/modals/DateRangeFilter';

interface AccountPayableSectionProps {
  payables: PayableItem[];
  onOpenNewPayable: () => void;
  onDeletePayable: (id: number) => void;
  onUpdateStatus: (id: number, status: string) => void;
}

export const AccountPayableSection: React.FC<AccountPayableSectionProps> = ({
  payables,
  onOpenNewPayable,
  onDeletePayable,
  onUpdateStatus,
}) => {

  const [payableToPay, setPayableToPay] = useState<PayableItem | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ==============================
  // FILTROS
  // ==============================

  const [period, setPeriod] = useState('Todos os Períodos');
  const [statusFilter, setStatusFilter] = useState('Todos os Status');
  const [supplierQuery, setSupplierQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas as Categorias');
  const [accountFilter, setAccountFilter] = useState('Todas as Contas');

  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;


  // ==============================
  // DATA ATUAL
  // ==============================

  const today = useMemo(() => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
  }, []);


  // ==============================
  // CALCULAR STATUS
  // ==============================

  const getPayableStatus = (item: PayableItem) => {

    // Se já estiver pago, continua pago
    if (item.status === 'Pago') {
      return 'Pago';
    }

    const dueDate = new Date(`${item.date}T00:00:00`);

    dueDate.setHours(0, 0, 0, 0);

    // Se a data já passou
    if (dueDate < today) {
      return 'Vencido';
    }

    return 'Pendente';
  };


  // ==============================
  // CATEGORIAS DINÂMICAS
  // ==============================

  const categories = useMemo(() => {

    const values = payables
      .map(item => item.category)
      .filter(Boolean);

    return [...new Set(values)];

  }, [payables]);


  // ==============================
  // CONTAS DINÂMICAS
  // ==============================

  const accounts = useMemo(() => {

    const values = payables
      .map(item => item.outgoing_account)
      .filter(Boolean);

    return [...new Set(values)];

  }, [payables]);


  // ==============================
  // FILTRO PRINCIPAL
  // ==============================

  const filteredPayables = useMemo(() => {

    return payables.filter((item) => {

      const itemStatus = getPayableStatus(item);


      // ------------------------------
      // STATUS
      // ------------------------------

      if (
        statusFilter !== 'Todos os Status' &&
        itemStatus !== statusFilter
      ) {
        return false;
      }


      // ------------------------------
      // FORNECEDOR
      // ------------------------------

      if (
        supplierQuery &&
        !item.supplier
          ?.toLowerCase()
          .includes(supplierQuery.toLowerCase())
      ) {
        return false;
      }


      // ------------------------------
      // CATEGORIA
      // ------------------------------

      if (
        categoryFilter !== 'Todas as Categorias' &&
        item.category !== categoryFilter
      ) {
        return false;
      }


      // ------------------------------
      // CONTA
      // ------------------------------

      if (
        accountFilter !== 'Todas as Contas' &&
        item.outgoing_account !== accountFilter
      ) {
        return false;
      }


      // ------------------------------
      // PERÍODO
      // ------------------------------

      if (startDate && item.date < startDate) {
        return false;
      }

      if (endDate && item.date > endDate) {
        return false;
      }


      return true;

    });

  }, [
    payables,
    period,
    statusFilter,
    supplierQuery,
    categoryFilter,
    accountFilter,
    startDate,
    endDate,
    today
  ]);


  // ==============================
  // PAGINAÇÃO
  // ==============================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayables.length / pageSize)
  );

  const paginatedPayables = filteredPayables.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );


  // Volta para página 1 quando mudar o filtro
  useEffect(() => {

    setCurrentPage(1);

  }, [
    period,
    statusFilter,
    supplierQuery,
    categoryFilter,
    accountFilter
  ]);


  // ==============================
  // KPIs
  // ==============================

  const totalPayable = filteredPayables
    .filter(item => getPayableStatus(item) === 'Pendente')
    .reduce(
      (acc, curr) => acc + Number(curr.amount || 0),
      0
    );


  const overduePayable = filteredPayables
    .filter(item => getPayableStatus(item) === 'Vencido')
    .reduce(
      (acc, curr) => acc + Number(curr.amount || 0),
      0
    );


  const overdueCount = filteredPayables
    .filter(item => getPayableStatus(item) === 'Vencido')
    .length;


  const dueToday = filteredPayables
    .filter(item => {

      const itemDate = new Date(`${item.date}T00:00:00`);

      itemDate.setHours(0, 0, 0, 0);

      return (
        itemDate.getTime() === today.getTime() &&
        getPayableStatus(item) !== 'Pago'
      );

    })
    .reduce(
      (acc, curr) => acc + Number(curr.amount || 0),
      0
    );


  // ==============================
  // LIMPAR FILTROS
  // ==============================

  const clearFilters = () => {

    setPeriod('Todos os Períodos');
    setStatusFilter('Todos os Status');
    setSupplierQuery('');
    setCategoryFilter('Todas as Categorias');
    setAccountFilter('Todas as Contas');
    setCurrentPage(1);
    setStartDate("")
    setEndDate("")
  };


  return (

    <div className={`${styles.pageContainer} relative`}>

      {/* ==============================
          HEADER
      ============================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <h1 className={typography.headings.pageTitle}>
            {payablesTheme.header.title}
          </h1>

          <p className={typography.headings.pageSubtitle}>
            {payablesTheme.header.subtitle}
          </p>

        </div>


        <div className="flex items-center gap-3">

          <button
            id="btn-novo-pagamento"
            onClick={onOpenNewPayable}
            className={styles.primaryButton}
          >

            <span>
              {payablesTheme.header.actionLabel}
            </span>

          </button>

        </div>

      </div>


      {/* ==============================
          KPIs
      ============================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">


        {/* TOTAL */}

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">

          <div className="flex items-center justify-between">

            <span className="text-xs font-semibold text-slate-600">
              Total a Pagar
            </span>

            <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">

              <Wallet className="w-4 h-4" />

            </div>

          </div>


          <div className="mt-3">

            <p className="text-xl font-bold text-slate-900 tabular-nums">

              {formatCurrency(totalPayable)}

            </p>

            <p className="text-[11px] text-slate-400 mt-1">

              Contas ainda não pagas

            </p>

          </div>

        </div>


        {/* VENCIDAS */}

        <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-rose-600 shadow-xs flex flex-col justify-between">

          <div className="flex items-center justify-between">

            <span className="text-xs font-semibold text-slate-700">

              Contas Vencidas

            </span>

            <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">

              <AlertCircle className="w-4 h-4" />

            </div>

          </div>


          <div className="mt-3">

            <p className="text-xl font-bold text-rose-600 tabular-nums">

              {formatCurrency(overduePayable)}

            </p>

            <p className="text-[11px] text-rose-500 font-medium mt-1">

              {overdueCount} conta(s) vencida(s)

            </p>

          </div>

        </div>


        {/* HOJE */}

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">

          <div className="flex items-center justify-between">

            <span className="text-xs font-semibold text-slate-600">

              Vencendo Hoje

            </span>

            <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">

              <Calendar className="w-4 h-4" />

            </div>

          </div>


          <div className="mt-3">

            <p className="text-xl font-bold text-slate-900 tabular-nums">

              {formatCurrency(dueToday)}

            </p>

            <p className="text-[11px] text-slate-400 mt-1">

              Vencimentos de hoje

            </p>

          </div>

        </div>
      </div>
      {/* ==============================
          FILTROS
      ============================== */}

      <div className={styles.card}>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 border-b border-slate-100 bg-white">


          {/* PERÍODO */}

          <div>

            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">

              Período

            </label>

            <div
              className="inline-flex items-center gap-1.5 px-8 bg-white rounded-xl border border-slate-200/90"
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


          {/* STATUS */}

          <div>

            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">

              Status

            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium"
            >

              <option>Todos os Status</option>
              <option>Vencido</option>
              <option>Pendente</option>
              <option>Pago</option>

            </select>

          </div>


          {/* FORNECEDOR */}

          <div>

            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">

              Fornecedor

            </label>

            <div className="relative">

              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />

              <input
                type="text"
                placeholder="Filtrar por nome..."
                value={supplierQuery}
                onChange={(e) => setSupplierQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none"
              />

            </div>

          </div>


          {/* CATEGORIA */}

          <div>

            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">

              Categoria

            </label>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium"
            >

              <option>Todas as Categorias</option>

              {categories.map((category) => (

                <option key={category} value={category}>

                  {category}

                </option>

              ))}

            </select>

          </div>


          {/* CONTA */}

          <div>

            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">

              Conta

            </label>

            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium"
            >

              <option>Todas as Contas</option>

              {accounts.map((account) => (

                <option key={account} value={account}>

                  {account}

                </option>

              ))}

            </select>

          </div>

        </div>


        {/* LIMPAR */}

        <div className="px-4 py-2 border-b border-slate-100 bg-white flex justify-end">

          <button
            onClick={clearFilters}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >

            Limpar filtros

          </button>

        </div>


        {/* ==============================
            TABELA
        ============================== */}

        <div className="overflow-x-auto">

          <table className="w-full text-left border-collapse">

            <thead>

              <tr className="border-b border-slate-200 bg-white">

                <th className={typography.table.header}>
                  FORNECEDOR
                </th>

                <th className={typography.table.header}>
                  VENCIMENTO
                </th>

                <th className={`${typography.table.header} text-right`}>
                  VALOR
                </th>

                <th className={`${typography.table.header} text-center`}>
                  CATEGORIA
                </th>

                <th className={`${typography.table.header} text-center`}>
                  CONTA SAÍDA
                </th>

                <th className={`${typography.table.header} text-center`}>
                  PARCELA
                </th>

                <th className={`${typography.table.header} text-center`}>
                  STATUS
                </th>

                <th className={`${typography.table.header} text-center`}>
                  AÇÕES
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-slate-100">
              {paginatedPayables.length > 0 ? (
                paginatedPayables.map((item) => {

                  const itemStatus = getPayableStatus(item);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="text-xs font-semibold text-slate-900">
                          {item.supplier}
                        </p>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <p className="text-xs font-semibold text-slate-800 tabular-nums">
                          {item.date}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-right text-xs font-medium text-slate-700 tabular-nums whitespace-nowrap">
                        {formatCurrency(item.amount)}
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
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-block ${
                            itemStatus === 'Vencido'
                              ? 'bg-rose-600 text-white font-bold'
                              : itemStatus === 'Pendente'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}
                        >
                          {itemStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* PAGAR */}
                          <button
                            onClick={() => setPayableToPay(item)}
                            title="Marcar como Pago"
                            className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>

                          {/* EXCLUIR */}

                          <button
                            onClick={() =>
                              onDeletePayable(item.id!)
                            }
                            title="Excluir"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          >

                            <Trash2 className="w-4 h-4" />

                          </button>

                        </div>

                      </td>

                    </tr>

                  );

                })

              ) : (

                <tr >

                  <td
                    colSpan={6}
                    className="py-10 text-center text-sm text-slate-400"
                  >

                    Nenhuma conta encontrada.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* ==============================
            PAGINAÇÃO
        ============================== */}

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">

          <span>

            Mostrando{' '}

            {filteredPayables.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}

            -

            {Math.min(
              currentPage * pageSize,
              filteredPayables.length
            )}

            {' '}de{' '}

            {filteredPayables.length}

            {' '}lançamentos

          </span>


          <div className="flex items-center gap-1">


            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage(p =>
                  Math.max(1, p - 1)
                )
              }
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >

              <ChevronLeft className="w-3.5 h-3.5" />

            </button>


            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            )
              .slice(0, 3)
              .map((p) => (

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
              onClick={() =>
                setCurrentPage(p =>
                  Math.min(totalPages, p + 1)
                )
              }
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >

              <ChevronRight className="w-3.5 h-3.5" />

            </button>

          </div>

        </div>

      </div>


      {/* ==============================
          BOTÃO FLUTUANTE
      ============================== */}

      <button
        id="btn-fab-contas-pagar"
        onClick={onOpenNewPayable}
        className="fixed bottom-6 right-8 w-12 h-12 bg-[#003d9b] hover:bg-[#003080] text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 z-30"
        title="Novo Pagamento"
      >

        <Plus className="w-6 h-6 stroke-[2.5]" />

      </button>


      {payableToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">

          <div className="bg-white rounded-xl shadow-xl w-[360px] p-5">

            <h3 className="text-sm font-semibold text-slate-900">
              Confirmar pagamento
            </h3>

            <p className="text-xs text-slate-500 mt-2">
              Deseja realmente marcar esta conta como paga?
            </p>

            <div className="mt-4 bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-700">
                {payableToPay.supplier}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                {formatCurrency(payableToPay.amount)}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Parcela {payableToPay.installment_number}/
                {payableToPay.installment_total}
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-5">

              <button
                onClick={() => setPayableToPay(null)}
                className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={async () => {
                  if (!payableToPay.id) return;

                  await onUpdateStatus?.(
                    payableToPay.id,
                    "Pago"
                  );

                  setPayableToPay(null);
                }}
                className="px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
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
