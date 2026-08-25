import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  CalendarDays, 
  Receipt, 
  TrendingUp, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Building2,
  CreditCard,
  PieChart,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  DollarSign,
  Filter,
  RefreshCw,
  FileText,
  Percent,
  Check,
  ExternalLink
} from 'lucide-react';
import { 
  EntryItem, 
  ExpenseItem, 
  PayableItem, 
  ReceivableItem, 
  NavigationTab,
  BudgetItem
} from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  monthlyCashFlowData, 
  expenseCategoriesData, 
  bankAccountsList, 
  cashFlowEvolutionWeekly,
  initialBudgetItems 
} from '../data/initialData';
import { dashboardTheme, styles, typography } from '../theme';

interface DashboardSectionProps {
  entries: EntryItem[];
  expenses: ExpenseItem[];
  payables: PayableItem[];
  receivables: ReceivableItem[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenNewEntry: () => void;
  onOpenNewExpense: () => void;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  entries,
  expenses,
  payables,
  receivables,
  onNavigate,
  onOpenNewEntry,
  onOpenNewExpense,
}) => {
  // Filters State
  const [selectedPeriod, setSelectedPeriod] = useState<'mes-atual' | 'ultimos-30' | 'semestral' | 'ano-2024'>('mes-atual');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('Todas as Contas');
  const [cashFlowViewMode, setCashFlowViewMode] = useState<'semestral' | 'semanal'>('semestral');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [transactionTab, setTransactionTab] = useState<'todas' | 'entradas' | 'saidas'>('todas');
  const [quickPaidIds, setQuickPaidIds] = useState<string[]>([]);

  // Filtered dataset calculations
  const filteredEntries = entries.filter(e => {
    if (selectedAccountFilter !== 'Todas as Contas' && e.conta !== selectedAccountFilter) return false;
    return true;
  });

  const filteredExpenses = expenses.filter(exp => {
    if (selectedAccountFilter !== 'Todas as Contas' && exp.conta !== selectedAccountFilter) return false;
    return true;
  });

  // KPIs
  const totalRecebido = filteredEntries.filter(e => e.status === 'Recebido').reduce((a, b) => a + b.valor, 0);
  const totalRecebivelPendente = filteredEntries.filter(e => e.status === 'Pendente' || e.status === 'Atrasado').reduce((a, b) => a + b.valor, 0);
  const totalReceitasGerais = totalRecebido + totalRecebivelPendente;

  const totalGasto = filteredExpenses.filter(e => e.status === 'Pago').reduce((a, b) => a + b.valor, 0);
  const totalDespesasPendentes = filteredExpenses.filter(e => e.status === 'Pendente').reduce((a, b) => a + b.valor, 0);

  const saldoLiquido = totalRecebido - totalGasto;
  const margemLucro = totalRecebido > 0 ? ((saldoLiquido / totalRecebido) * 100).toFixed(1) : '0';

  const totalAPagar = payables.filter(p => !quickPaidIds.includes(p.id)).reduce((a, b) => a + b.saldo, 0);
  const totalAReceber = receivables.reduce((a, b) => a + b.saldo, 0);
  const projecao30Dias = totalAReceber - totalAPagar;

  const totalSaldoBancario = bankAccountsList.reduce((acc, curr) => acc + curr.saldo, 0);

  // Urgent Payables & Receivables
  const contasVencidasOuUrgentes = payables
    .filter(p => !quickPaidIds.includes(p.id))
    .slice(0, 4);

  const contasAReceberUrgentes = receivables
    .filter(r => r.status === 'Atrasado' || r.status === 'Pendente')
    .slice(0, 3);

  // Combined recent activities
  const recentCombinedActivities = [
    ...entries.map(e => ({
      id: e.id,
      tipo: 'entrada' as const,
      data: e.data,
      descricao: e.descricao,
      entidade: e.cliente,
      conta: e.conta,
      categoria: e.categoria,
      valor: e.valor,
      status: e.status,
    })),
    ...expenses.map(exp => ({
      id: exp.id,
      tipo: 'saida' as const,
      data: exp.data,
      descricao: exp.obs || exp.categoria,
      entidade: exp.fornecedor,
      conta: exp.conta,
      categoria: exp.categoria,
      valor: exp.valor,
      status: exp.status,
    }))
  ].sort((a, b) => b.id.localeCompare(a.id));

  const filteredActivities = recentCombinedActivities.filter(item => {
    if (transactionTab === 'entradas') return item.tipo === 'entrada';
    if (transactionTab === 'saidas') return item.tipo === 'saida';
    return true;
  }).slice(0, 6);

  const handleQuickPay = (id: string) => {
    setQuickPaidIds(prev => [...prev, id]);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Top Header with Context & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {dashboardTheme.header.title}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sincronizado
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {dashboardTheme.header.subtitle}
          </p>
        </div>

        {/* Global Controls & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Account Filter */}
          <div className="relative">
            <select
              value={selectedAccountFilter}
              onChange={(e) => setSelectedAccountFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 text-slate-700 font-medium rounded-lg px-3 py-2 pr-7 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20 cursor-pointer"
            >
              <option value="Todas as Contas">Todas as Contas</option>
              <option value="Itaú PJ">Itaú PJ</option>
              <option value="NuBank PJ">NuBank PJ</option>
              <option value="Caixa Interno">Caixa Interno</option>
            </select>
          </div>

          {/* Period Selector */}
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="text-xs bg-white border border-slate-200 text-slate-700 font-medium rounded-lg px-3 py-2 pr-7 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20 cursor-pointer"
            >
              <option value="mes-atual">Mês Atual (Maio 2024)</option>
              <option value="ultimos-30">Últimos 30 Dias</option>
              <option value="semestral">1º Semestre 2024</option>
              <option value="ano-2024">Ano Fiscal 2024</option>
            </select>
          </div>

          {/* Buttons */}
          <button
            onClick={onOpenNewEntry}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#003d9b] hover:bg-[#003080] active:bg-[#002566] rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Registrar Nova Receita"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Entrada</span>
          </button>
          
          <button
            onClick={onOpenNewExpense}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            title="Lançar Nova Despesa"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Saída</span>
          </button>
        </div>
      </div>

      {/* Row 1: Executive KPI Cards (5 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Saldo Consolidado */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Saldo Consolidado
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#003d9b] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl lg:text-2xl font-bold text-[#003d9b] tabular-nums tracking-tight">
              {formatCurrency(totalSaldoBancario)}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.8% vs mês ant.</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>3 contas ativas</span>
            <span className="text-emerald-700 font-medium">Conciliado</span>
          </div>
        </div>

        {/* Card 2: Receitas Totais */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Receitas Realizadas
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl lg:text-2xl font-bold text-emerald-600 tabular-nums tracking-tight">
              {formatCurrency(totalRecebido)}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <span className="font-medium">+{formatCurrency(totalRecebivelPendente)} a compensar</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>{filteredEntries.length} transações</span>
            <span className="text-emerald-600 font-semibold">92% recebido</span>
          </div>
        </div>

        {/* Card 3: Despesas Executadas */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Despesas Pagas
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl lg:text-2xl font-bold text-rose-600 tabular-nums tracking-tight">
              {formatCurrency(totalGasto)}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <span>{filteredExpenses.length} saídas registradas</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Dentro do planejado</span>
            <span className="text-slate-700 font-medium">Orçamento 78%</span>
          </div>
        </div>

        {/* Card 4: Resultado Líquido & Margem */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Lucro Operacional
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className={`text-xl lg:text-2xl font-bold tabular-nums tracking-tight ${saldoLiquido >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
              {formatCurrency(saldoLiquido)}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-indigo-700 font-semibold mt-1">
              <span>Margem Líquida: {margemLucro}%</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Status</span>
            <span className="text-indigo-600 font-semibold">Excelente</span>
          </div>
        </div>

        {/* Card 5: Previsão 30 Dias (Contas a Pagar x Receber) */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Projeção 30 Dias
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xl lg:text-2xl font-bold text-slate-900 tabular-nums tracking-tight">
              {formatCurrency(projecao30Dias)}
            </p>
            <div className="flex items-center justify-between text-[11px] mt-1">
              <span className="text-emerald-600 font-medium">Rec: {formatCurrency(totalAReceber)}</span>
              <span className="text-rose-600 font-medium">Pag: {formatCurrency(totalAPagar)}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Superávit previsto</span>
            <span className="text-emerald-600 font-semibold">+Fluxo Livre</span>
          </div>
        </div>
      </div>

      {/* Row 2: Charts Section (Cash Flow Bar Chart + Category Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico 1: Evolução do Fluxo de Caixa (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#003d9b]" />
                <h2 className="text-base font-bold text-slate-900">
                  {dashboardTheme.charts.evolution.title}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {dashboardTheme.charts.evolution.subtitle}
              </p>
            </div>

            {/* Switch Mode: Semestral vs Semanal */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
              <button
                onClick={() => setCashFlowViewMode('semestral')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  cashFlowViewMode === 'semestral'
                    ? 'bg-white text-[#003d9b] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semestral
              </button>
              <button
                onClick={() => setCashFlowViewMode('semanal')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  cashFlowViewMode === 'semanal'
                    ? 'bg-white text-[#003d9b] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semanal
              </button>
            </div>
          </div>

          {/* Dynamic Interactive Chart Area */}
          <div className="relative pt-4 pb-2 border-b border-slate-100">
            {/* Value scale guide lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 text-[10px] text-slate-400">
              <div className="border-b border-slate-300 w-full" />
              <div className="border-b border-slate-300 w-full" />
              <div className="border-b border-slate-300 w-full" />
              <div className="border-b border-slate-300 w-full" />
            </div>

            {/* Bars Rendering */}
            <div className="h-60 flex items-end justify-between gap-3 sm:gap-6 px-2 sm:px-6 relative z-10">
              {cashFlowViewMode === 'semestral' ? (
                monthlyCashFlowData.map((item, idx) => {
                  const maxRef = 110000;
                  const entHeight = (item.entradas / maxRef) * 100;
                  const saidaHeight = (item.saidas / maxRef) * 100;
                  const isHovered = hoveredBarIndex === idx;

                  return (
                    <div 
                      key={item.month} 
                      className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute -top-10 bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded-lg shadow-lg z-30 whitespace-nowrap animate-fadeIn">
                          <span className="font-bold">{item.month}: </span>
                          <span className="text-sky-300 font-semibold">+{formatCurrency(item.entradas)}</span>
                          <span className="text-slate-400 mx-1">|</span>
                          <span className="text-rose-300 font-semibold">-{formatCurrency(item.saidas)}</span>
                        </div>
                      )}

                      <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2 h-48">
                        {/* Entrada Bar */}
                        <div 
                          className="w-3.5 sm:w-6 bg-sky-400 hover:bg-sky-500 rounded-t-sm transition-all duration-300 group-hover:brightness-110 shadow-xs"
                          style={{ height: `${entHeight}%` }}
                        />
                        {/* Saída Bar */}
                        <div 
                          className="w-3.5 sm:w-6 bg-[#003d9b] hover:bg-[#002e75] rounded-t-sm transition-all duration-300 group-hover:brightness-110 shadow-xs"
                          style={{ height: `${saidaHeight}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold transition-colors ${isHovered ? 'text-[#003d9b]' : 'text-slate-600'}`}>
                        {item.month}
                      </span>
                    </div>
                  );
                })
              ) : (
                cashFlowEvolutionWeekly.map((item, idx) => {
                  const maxRef = 40000;
                  const entHeight = (item.entradas / maxRef) * 100;
                  const saidaHeight = (item.saidas / maxRef) * 100;
                  const isHovered = hoveredBarIndex === idx;

                  return (
                    <div 
                      key={item.periodo} 
                      className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {isHovered && (
                        <div className="absolute -top-10 bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded-lg shadow-lg z-30 whitespace-nowrap">
                          <span className="font-bold">{item.periodo}: </span>
                          <span className="text-sky-300">+{formatCurrency(item.entradas)}</span>
                          <span className="text-slate-400 mx-1">|</span>
                          <span className="text-rose-300">-{formatCurrency(item.saidas)}</span>
                        </div>
                      )}

                      <div className="w-full flex items-end justify-center gap-2 h-48">
                        <div 
                          className="w-5 sm:w-8 bg-sky-400 hover:bg-sky-500 rounded-t-sm transition-all duration-300 shadow-xs"
                          style={{ height: `${entHeight}%` }}
                        />
                        <div 
                          className="w-5 sm:w-8 bg-[#003d9b] hover:bg-[#002e75] rounded-t-sm transition-all duration-300 shadow-xs"
                          style={{ height: `${saidaHeight}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{item.periodo}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chart Footer & Summaries */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-2">
            <div className="flex items-center gap-6 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-sky-400 rounded-xs" />
                <span>Entradas / Faturamento</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#003d9b] rounded-xs" />
                <span>Saídas / Despesas</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span>Média Mensal: <strong className="text-slate-800">R$ 51.800</strong></span>
              <span>•</span>
              <button 
                onClick={() => onNavigate('relatorios')}
                className="text-[#003d9b] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Relatório DRE</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Composição de Despesas por Categoria (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#003d9b]" />
                <h2 className="text-base font-bold text-slate-900">
                  {dashboardTheme.charts.categoryDistribution.title}
                </h2>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {dashboardTheme.charts.categoryDistribution.subtitle}
            </p>

            {/* Circular Donut Visualizer with Center Amount */}
            <div className="relative flex items-center justify-center my-4">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="14"
                />
                {/* Operacional 45% (dasharray ~ 107.4) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#003d9b"
                  strokeWidth="14"
                  strokeDasharray="107.4 238.7"
                  strokeDashoffset="0"
                />
                {/* Pessoal 30% (dasharray ~ 71.6) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#535f73"
                  strokeWidth="14"
                  strokeDasharray="71.6 238.7"
                  strokeDashoffset="-107.4"
                />
                {/* Marketing 15% (dasharray ~ 35.8) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#0052cc"
                  strokeWidth="14"
                  strokeDasharray="35.8 238.7"
                  strokeDashoffset="-179"
                />
                {/* Outros 10% (dasharray ~ 23.9) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#94a3b8"
                  strokeWidth="14"
                  strokeDasharray="23.9 238.7"
                  strokeDashoffset="-214.8"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</span>
                <span className="text-lg font-bold text-slate-900 tracking-tight">R$ 57,5k</span>
              </div>
            </div>
          </div>

          {/* Breakdown Legend List */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            {expenseCategoriesData.map((cat) => (
              <div key={cat.categoria} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-700 font-medium">{cat.categoria}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px] font-mono">{formatCurrency(cat.valor)}</span>
                  <span className="font-bold text-slate-900 tabular-nums">{cat.porcentagem}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Bank Liquidity Cards & Budget Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bank Accounts Balance Cards (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#003d9b]" />
                <h2 className="text-base font-bold text-slate-900">
                  {dashboardTheme.charts.liquidity.title}
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                Total: <strong className="text-[#003d9b]">{formatCurrency(totalSaldoBancario)}</strong>
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {dashboardTheme.charts.liquidity.subtitle}
            </p>

            <div className="space-y-3">
              {bankAccountsList.map((acc) => (
                <div 
                  key={acc.id} 
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-2xs"
                      style={{ backgroundColor: acc.color }}
                    >
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{acc.nome}</p>
                      <p className="text-[11px] text-slate-500">
                        Ag: {acc.agencia} • C/C: {acc.conta} • <span className="text-slate-400">{acc.tipo}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 tabular-nums">
                      {formatCurrency(acc.saldo)}
                    </p>
                    <span className={`text-[10px] font-semibold ${acc.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {acc.variacao} este mês
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <ShieldCheck className="w-4 h-4" />
              Open Finance Habilitado
            </span>
            <button 
              onClick={() => onNavigate('entradas')}
              className="text-[#003d9b] hover:underline font-semibold cursor-pointer"
            >
              Extrato Conciliado
            </button>
          </div>
        </div>

        {/* Budget Execution Tracker (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#003d9b]" />
                <h2 className="text-base font-bold text-slate-900">
                  {dashboardTheme.charts.budgetPerformance.title}
                </h2>
              </div>
              <button 
                onClick={() => onNavigate('orcamento')}
                className="text-xs font-semibold text-[#003d9b] hover:text-[#003080] flex items-center gap-1 cursor-pointer"
              >
                <span>Ajustar Metas</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {dashboardTheme.charts.budgetPerformance.subtitle}
            </p>

            {/* Category Budget Bars */}
            <div className="space-y-3.5">
              {initialBudgetItems.slice(0, 4).map((item) => {
                const isOverBudget = item.consumoPercent > 100;
                return (
                  <div key={item.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-800 font-semibold">{item.categoria}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono text-[11px]">
                          {formatCurrency(item.realizado)} / {formatCurrency(item.previsto)}
                        </span>
                        <span className={`font-bold tabular-nums text-[11px] px-1.5 py-0.5 rounded ${
                          isOverBudget 
                            ? 'bg-rose-100 text-rose-700' 
                            : item.consumoPercent > 90 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {item.consumoPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverBudget 
                            ? 'bg-rose-500' 
                            : item.consumoPercent > 90 
                            ? 'bg-amber-500' 
                            : 'bg-[#003d9b]'
                        }`}
                        style={{ width: `${Math.min(item.consumoPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Orçamento Geral Consumido: <strong className="text-slate-900">76.4%</strong></span>
            <span className="text-emerald-600 font-semibold">R$ 38.500 sob controle</span>
          </div>
        </div>
      </div>

      {/* Row 4: Urgent Obligations & Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Urgent Payables & Receivables (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900">Contas a Liquidar & Alertas</h2>
              </div>
              <button 
                onClick={() => onNavigate('contas-pagar')}
                className="text-xs font-semibold text-[#003d9b] hover:text-[#003080] cursor-pointer"
              >
                Ver Todas
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Vencimentos críticos e pendências que exigem ação rápida.
            </p>

            <div className="space-y-2.5">
              {contasVencidasOuUrgentes.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                      {item.avatarLetter}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.fornecedor}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span>Vencimento: {item.vencimento}</span>
                        {item.vencimentoTag && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                            {item.vencimentoTag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs font-bold text-rose-600 tabular-nums">
                        {formatCurrency(item.saldo)}
                      </p>
                      <span className="text-[10px] text-slate-400">{item.parcela}</span>
                    </div>

                    <button
                      onClick={() => handleQuickPay(item.id)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                      title="Dar baixa como pago"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total a liquidar urgente:</span>
            <strong className="text-rose-600 font-bold">{formatCurrency(totalAPagar)}</strong>
          </div>
        </div>

        {/* Recent Transactions & Feed (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Extrato Consolidado Recente</h2>
                <p className="text-xs text-slate-400">Últimas receitas e despesas registradas no caixa</p>
              </div>

              {/* Tabs: Todas, Entradas, Saídas */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                <button
                  onClick={() => setTransactionTab('todas')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    transactionTab === 'todas' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setTransactionTab('entradas')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    transactionTab === 'entradas' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Receitas
                </button>
                <button
                  onClick={() => setTransactionTab('saidas')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    transactionTab === 'saidas' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Despesas
                </button>
              </div>
            </div>

            {/* List of Recent Items */}
            <div className="divide-y divide-slate-100">
              {filteredActivities.map((act) => {
                const isEntrada = act.tipo === 'entrada';
                return (
                  <div key={act.id} className="py-2.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isEntrada ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {isEntrada ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{act.descricao}</p>
                        <p className="text-[11px] text-slate-500">
                          {act.entidade} • <span className="text-slate-400">{act.conta}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-xs font-bold tabular-nums ${
                        isEntrada ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {isEntrada ? '+' : '-'}{formatCurrency(act.valor)}
                      </p>
                      <span className="text-[10px] text-slate-400">{act.data}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Exibindo as 6 movimentações mais recentes</span>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate('entradas')}
                className="text-[#003d9b] hover:underline font-semibold cursor-pointer"
              >
                Ver Todas Entradas
              </button>
              <button 
                onClick={() => onNavigate('saidas')}
                className="text-rose-600 hover:underline font-semibold cursor-pointer"
              >
                Ver Todas Saídas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
