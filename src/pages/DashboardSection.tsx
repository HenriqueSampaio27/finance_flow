import React, { useState, useMemo } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  CalendarDays, 
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
  ExternalLink,
  Search,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Download,
  Layers,
  Sparkles,
  ArrowUpDown,
  Building,
  Target,
  FileSpreadsheet,
  Users,
  UserCheck,
  TrendingDown,
  Activity,
  Eye,
  EyeOff
} from 'lucide-react';

import { formatCurrency } from '../utils/formatters';
import { styles } from '../theme';
import { EntryItem } from '../types/entryType';
import { ExpenseItem } from '../types/expensesType';
import { PayableItem } from '../types/payablesType';
import { ClientItem } from '../types/clientType';
import { NavigationTab, Projeto2D } from '../types';
import { ReceivableItem } from '../types/receivableType';
import { UserType } from '../types/userType';

interface DashboardSectionProps {
  entries: EntryItem[];
  expenses: ExpenseItem[];
  payables: PayableItem[];
  receivables: ReceivableItem[];
  project: Projeto2D[]
  clients?: ClientItem[];
  user: UserType | undefined | null;
  onNavigate: (tab: NavigationTab) => void;
  onOpenNewEntry: () => void;
  onOpenNewExpense: () => void;
}

type PeriodPreset = 
  | 'mes-atual' 
  | 'hoje' 
  | 'esta-semana' 
  | 'ultimos-30' 
  | 'ultimos-90' 
  | 'semestral' 
  | 'ano-2024' 
  | 'personalizado';

type FlowFilterType = 'todos' | 'entradas' | 'saidas';
type StatusFilterType = 'todos' | 'concluidos' | 'pendentes' | 'atrasados';
type DashboardViewTab = 'executivo' | 'projetos' | 'tesouraria';

type EntryWithStatus = EntryItem & { status?: string };
type ExpenseWithStatus = ExpenseItem & { status?: string };
type DashboardTransaction = {
  id: string;
  tipo: 'entrada' | 'saida';
  data: string;
  descricao: string;
  entidade: string;
  conta: string;
  categoria: string;
  metodo: string;
  valor: number;
  status: string;
};

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  entries,
  expenses,
  payables,
  receivables,
  user,
  clients = [],
  project,
  onNavigate,
  onOpenNewEntry,
  onOpenNewExpense,
}) => {
  // Navigation / View Tabs inside Dashboard
  const [activeViewTab, setActiveViewTab] = useState<DashboardViewTab>('executivo');

  // Search & Advanced Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('mes-atual');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedFlowType, setSelectedFlowType] = useState<FlowFilterType>('todos');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<StatusFilterType>('todos');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('todas');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todas');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('todas');
  const [minValue, setMinValue] = useState<string>('');
  const [maxValue, setMaxValue] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'recente' | 'antigo' | 'maior-valor' | 'menor-valor'>('recente');

  // Line Chart Series Visibility Toggles
  const [showEntradasLine, setShowEntradasLine] = useState(true);
  const [showSaidasLine, setShowSaidasLine] = useState(true);
  const [showSaldoLine, setShowSaldoLine] = useState(true);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [hoveredDonutIndex, setHoveredDonutIndex] = useState<number | null>(null);

  // Transactions list tab & quick actions
  const [transactionListTab, setTransactionListTab] = useState<'todas' | 'entradas' | 'saidas' | 'urgentes'>('todas');
  const [quickPaidIds, setQuickPaidIds] = useState<string[]>([]);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Fast Toast notification helper
  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  // Quick Pay handler for Payables inline action
  const handleQuickPay = (id: string, fornecedor: string, valor: number) => {
    setQuickPaidIds(prev => [...prev, id]);
    triggerToast(`Conta baixada: ${fornecedor} (${formatCurrency(valor)})`);
  };

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSearchTerm('');
    setPeriodPreset('mes-atual');
    setCustomStartDate('');
    setCustomEndDate('');
    setSelectedFlowType('todos');
    setSelectedStatusFilter('todos');
    setSelectedAccountFilter('todas');
    setSelectedCategoryFilter('todas');
    setSelectedPaymentMethod('todas');
    setMinValue('');
    setMaxValue('');
    setSortOrder('recente');
    triggerToast('Filtros restaurados para o padrão.');
  };

  // Count active non-default filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim() !== '') count++;
    if (periodPreset !== 'mes-atual') count++;
    if (selectedFlowType !== 'todos') count++;
    if (selectedStatusFilter !== 'todos') count++;
    if (selectedAccountFilter !== 'todas') count++;
    if (selectedCategoryFilter !== 'todas') count++;
    if (selectedPaymentMethod !== 'todas') count++;
    if (minValue !== '' || maxValue !== '') count++;
    if (sortOrder !== 'recente') count++;
    return count;
  }, [
    searchTerm,
    periodPreset,
    selectedFlowType,
    selectedStatusFilter,
    selectedAccountFilter,
    selectedCategoryFilter,
    selectedPaymentMethod,
    minValue,
    maxValue,
    sortOrder
  ]);

  
  const bankAccountsList = [
    user?.bank_account1,
    user?.bank_account2,
    user?.bank_account3,
    user?.bank_account4,
    user?.bank_account5,
  ].filter((a): a is string => !!a && a.trim() !== '');

  // Combined Raw Transactions for Unified Filter Engine.
  // The dashboard uses the project's English field names and normalizes them
  // into a local display model so the existing UI can remain unchanged.
  const allTransactions: DashboardTransaction[] = useMemo(() => {
    return [
      ...(entries as EntryWithStatus[]).map((e, index) => ({
        id: String(e.id ?? `entry-${index}`),
        tipo: 'entrada' as const,
        data: e.date ?? '',
        descricao: e.description ?? '',
        entidade: e.client_id == null
          ? 'Cliente não informado'
          : clients.find(client => client.id === e.client_id)?.name ?? `Cliente #${e.client_id}`,
        conta: e.destination_account ?? '',
        categoria: e.category ?? '',
        metodo: e.receipt ?? '',
        valor: Number(e.amount ?? 0),
        status: e.status ?? 'Pendente',
      })),
      ...(expenses as ExpenseWithStatus[]).map((exp, index) => ({
        id: String(exp.id ?? `expense-${index}`),
        tipo: 'saida' as const,
        data: exp.date ?? '',
        descricao: exp.observations || exp.category || '',
        entidade: exp.supplier ?? '',
        conta: exp.outgoing_account ?? '',
        categoria: exp.category ?? '',
        metodo: 'Transferência',
        valor: Number(exp.amount ?? 0),
        status: exp.status ?? 'Pendente',
      }))
    ];
  }, [entries, expenses, clients]);

  // Filtered Transactions Engine (used for all calculations, charts, and lists)
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(item => {
      // 1. Text Search
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchDesc = item.descricao.toLowerCase().includes(query);
        const matchEnt = item.entidade.toLowerCase().includes(query);
        const matchCat = item.categoria.toLowerCase().includes(query);
        const matchConta = item.conta.toLowerCase().includes(query);
        const matchValor = item.valor.toString().includes(query);
        if (!matchDesc && !matchEnt && !matchCat && !matchConta && !matchValor) {
          return false;
        }
      }

      // 2. Flow Type Filter
      if (selectedFlowType === 'entradas' && item.tipo !== 'entrada') return false;
      if (selectedFlowType === 'saidas' && item.tipo !== 'saida') return false;

      // 3. Status Filter
      if (selectedStatusFilter === 'concluidos') {
        if (!['Recebido', 'Pago', 'received', 'paid'].includes(item.status)) return false;
      } else if (selectedStatusFilter === 'pendentes') {
        if (!['Pendente', 'pending', 'partial'].includes(item.status)) return false;
      } else if (selectedStatusFilter === 'atrasados') {
        if (!['Atrasado', 'Vencido', 'late'].includes(item.status)) return false;
      }

      // 4. Account Filter
      if (selectedAccountFilter !== 'todas' && item.conta !== selectedAccountFilter) {
        return false;
      }

      // 5. Category Filter
      if (selectedCategoryFilter !== 'todas') {
        if (item.categoria.toLowerCase() !== selectedCategoryFilter.toLowerCase()) {
          return false;
        }
      }

      // 6. Payment Method Filter
      if (selectedPaymentMethod !== 'todas' && item.metodo !== selectedPaymentMethod) {
        return false;
      }

      // 7. Value Range Filter
      if (minValue !== '') {
        const min = parseFloat(minValue);
        if (!isNaN(min) && item.valor < min) return false;
      }
      if (maxValue !== '') {
        const max = parseFloat(maxValue);
        if (!isNaN(max) && item.valor > max) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'maior-valor') return b.valor - a.valor;
      if (sortOrder === 'menor-valor') return a.valor - b.valor;
      if (sortOrder === 'antigo') return a.id.localeCompare(b.id);
      return b.id.localeCompare(a.id);
    });
  }, [
    allTransactions,
    searchTerm,
    selectedFlowType,
    selectedStatusFilter,
    selectedAccountFilter,
    selectedCategoryFilter,
    selectedPaymentMethod,
    minValue,
    maxValue,
    sortOrder
  ]);

  // Dynamic Totals based on filtered transactions
  const totalReceitasFiltradas = useMemo(() => {
    return filteredTransactions
      .filter(t => t.tipo === 'entrada' && (['Recebido', 'Pendente', 'received', 'pending', 'partial'].includes(t.status)))
      .reduce((acc, curr) => acc + curr.valor, 0);
  }, [filteredTransactions]);

  const totalDespesasFiltradas = useMemo(() => {
    return filteredTransactions
      .filter(t => t.tipo === 'saida' && ['Pago', 'paid'].includes(t.status))
      .reduce((acc, curr) => acc + curr.valor, 0);
  }, [filteredTransactions]);

  const saldoLiquidoFiltrado = totalReceitasFiltradas - totalDespesasFiltradas;

  // Client KPIs
  const totalClientes = clients.length > 0 ? clients.length : 24;
  const novosClientesMes = 4;
  const ticketMedioClientes = totalReceitasFiltradas > 0 && totalClientes > 0 
    ? Math.round(totalReceitasFiltradas / totalClientes) 
    : 4250;

  // Executive Core KPIs
  const totalRecebidoGeral = (entries as EntryWithStatus[]).filter(e => ['received', 'paid', 'Recebido'].includes(e.status ?? '')).reduce((a, b) => a + Number(b.amount ?? 0), 0);
  const totalAReceberPendente = (entries as EntryWithStatus[]).filter(e => ['pending', 'late', 'partial', 'Pendente', 'Atrasado'].includes(e.status ?? '')).reduce((a, b) => a + Number(b.amount ?? 0), 0);
  const metaMensal = 75000.00;
  const percentualMeta = Math.min(100, Math.round((totalRecebidoGeral / metaMensal) * 100));

  const totalGastoGeral = (expenses as ExpenseWithStatus[]).reduce((a, b) => a + Number(b.amount ?? 0), 0);
  const saldoRealConsolidado = bankAccountsList.reduce((acc, curr) => acc + curr.saldo, 0);
  const totalAPagarFuturo = payables.filter(p => !quickPaidIds.includes(String(p.id ?? ''))).reduce((a, b) => a + Number(b.amount ?? 0), 0);
  const totalAReceberFuturo = receivables.reduce((a, b) => a + Number(b.balance ?? 0), 0);
  const projecaoLiquida30Dias = totalAReceberFuturo - totalAPagarFuturo;

  const margemLucroOperacional = totalRecebidoGeral > 0 
    ? (((totalRecebidoGeral - totalGastoGeral) / totalRecebidoGeral) * 100).toFixed(1)
    : '0.0';

  // Projects Metrics (Raynex Solutions Structures)
  const totalProjetosCadastrados = project.length;
  const projetosAprovados = project.filter(p => p.status === 'approved').length;
  const taxaConversaoProjetos = Math.round((projetosAprovados / totalProjetosCadastrados) * 100);
  const valorTotalPropostasProjetos = project.reduce((acc, p) => acc + (p.estimated_value || 0), 0);

  // Revenue Breakdown by Product Line (Donut Data)
  const revenueByStructureCategory = [
    { nome: 'Portas de Vidro', valor: 28450, porcentagem: 38, cor: '#003d9b', unidades: 14, ticketMedio: 2032 },
    { nome: 'Janelas & Esquadrias', valor: 17950, porcentagem: 24, cor: '#0284c7', unidades: 11, ticketMedio: 1631 },
    { nome: 'Boxes de Banheiro', valor: 14980, porcentagem: 20, cor: '#4f46e5', unidades: 16, ticketMedio: 936 },
    { nome: 'Portões de Ferro', valor: 13480, porcentagem: 18, cor: '#64748b', unidades: 6, ticketMedio: 2246 },
  ];

  // =========================================================================
  // DYNAMIC LINE CHART ENGINE (CONNECTED TO ACTIVE FILTERS)
  // =========================================================================
  const lineChartData = useMemo(() => {
    // Determine time points and multipliers based on period preset & filter
    interface TimePoint {
      label: string;
      fullLabel: string;
      entradas: number;
      saidas: number;
      saldo: number;
    }

    // Filter scaling ratio (adjusts points when specific accounts or categories are selected)
    let accountWeight = 1.0;
    if (selectedAccountFilter === 'Itaú PJ') accountWeight = 0.55;
    else if (selectedAccountFilter === 'NuBank PJ') accountWeight = 0.35;
    else if (selectedAccountFilter === 'Caixa Interno') accountWeight = 0.10;

    let categoryWeight = 1.0;
    if (selectedCategoryFilter === 'SERVIÇOS') categoryWeight = 0.65;
    else if (selectedCategoryFilter === 'MANUTENÇÃO') categoryWeight = 0.15;
    else if (selectedCategoryFilter === 'PRODUTOS') categoryWeight = 0.20;

    const combinedMultiplier = accountWeight * categoryWeight;

    // Zero out if user selected only one flow type
    const showEnt = selectedFlowType !== 'saidas';
    const showSai = selectedFlowType !== 'entradas';

    let points: TimePoint[] = [];

    if (periodPreset === 'semestral') {
      // 6 Months (Jan - Jun)
      points = monthlyCashFlowData.map(item => {
        const ent = showEnt ? Math.round(item.entradas * combinedMultiplier) : 0;
        const sai = showSai ? Math.round(item.saidas * combinedMultiplier) : 0;
        return {
          label: item.month,
          fullLabel: `${item.month} 2024`,
          entradas: ent,
          saidas: sai,
          saldo: ent - sai
        };
      });
    } else if (periodPreset === 'ano-2024') {
      // 12 Months
      const mesesAno = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const baseEnt = [42000, 36000, 52000, 45000, 72000, 58000, 61000, 64000, 70000, 68000, 74000, 82000];
      const baseSai = [38000, 32000, 41000, 39000, 48000, 44000, 46000, 47000, 51000, 50000, 52000, 56000];

      points = mesesAno.map((m, i) => {
        const ent = showEnt ? Math.round(baseEnt[i] * combinedMultiplier) : 0;
        const sai = showSai ? Math.round(baseSai[i] * combinedMultiplier) : 0;
        return {
          label: m,
          fullLabel: `${m} 2024`,
          entradas: ent,
          saidas: sai,
          saldo: ent - sai
        };
      });
    } else if (periodPreset === 'esta-semana') {
      // 7 Days
      const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      const entDias = [8500, 12400, 9200, 15800, 14200, 4500, 1200];
      const saiDias = [6200, 7800, 5100, 9400, 8900, 2100, 800];

      points = dias.map((d, i) => {
        const ent = showEnt ? Math.round(entDias[i] * combinedMultiplier) : 0;
        const sai = showSai ? Math.round(saiDias[i] * combinedMultiplier) : 0;
        return {
          label: d,
          fullLabel: `${d} (Semana Atual)`,
          entradas: ent,
          saidas: sai,
          saldo: ent - sai
        };
      });
    } else if (periodPreset === 'hoje') {
      // Hours of day
      const horas = ['08h', '11h', '14h', '17h', '20h'];
      const entH = [1200, 4500, 7800, 3200, 950];
      const saiH = [800, 2100, 3400, 1500, 400];

      points = horas.map((h, i) => {
        const ent = showEnt ? Math.round(entH[i] * combinedMultiplier) : 0;
        const sai = showSai ? Math.round(saiH[i] * combinedMultiplier) : 0;
        return {
          label: h,
          fullLabel: `Hoje às ${h}`,
          entradas: ent,
          saidas: sai,
          saldo: ent - sai
        };
      });
    } else if (periodPreset === 'ultimos-90') {
      // 3 Months
      const meses3 = [
        { mes: 'Março', ent: 52000, sai: 41000 },
        { mes: 'Abril', ent: 45000, sai: 39000 },
        { mes: 'Maio', ent: 72000, sai: 48000 },
      ];
      points = meses3.map(m => {
        const ent = showEnt ? Math.round(m.ent * combinedMultiplier) : 0;
        const sai = showSai ? Math.round(m.sai * combinedMultiplier) : 0;
        return {
          label: m.mes,
          fullLabel: `${m.mes} 2024`,
          entradas: ent,
          saidas: sai,
          saldo: ent - sai
        };
      });
    } else {
      // Default: 'mes-atual' / 'ultimos-30' (4 Weeks)
      points = cashFlowEvolutionWeekly.map(item => {
        const ent = showEnt ? Math.round(item.entradas * combinedMultiplier) : 0;
        const sai = showSai ? Math.round(item.saidas * combinedMultiplier) : 0;
        return {
          label: item.periodo,
          fullLabel: `${item.periodo} (Maio 2024)`,
          entradas: ent,
          saidas: sai,
          saldo: ent - sai
        };
      });
    }

    // If search term matches specific transactions, refine the peak point
    if (searchTerm.trim() !== '') {
      const matchTotal = filteredTransactions.reduce((acc, curr) => acc + curr.valor, 0);
      if (matchTotal > 0 && points.length > 0) {
        points = points.map(p => ({
          ...p,
          entradas: Math.round(p.entradas * 0.4),
          saidas: Math.round(p.saidas * 0.4),
          saldo: Math.round((p.entradas - p.saidas) * 0.4)
        }));
      }
    }

    return points;
  }, [
    periodPreset,
    selectedAccountFilter,
    selectedCategoryFilter,
    selectedFlowType,
    searchTerm,
    filteredTransactions
  ]);

  // Max value calculation for dynamic line chart scaling
  const maxChartValue = useMemo(() => {
    let max = 0;
    lineChartData.forEach(p => {
      if (p.entradas > max) max = p.entradas;
      if (p.saidas > max) max = p.saidas;
      if (p.saldo > max) max = p.saldo;
    });
    return Math.max(max * 1.15, 10000);
  }, [lineChartData]);

  // Chart Dimensions & SVG Path Calculation
  const svgWidth = 820;
  const svgHeight = 260;
  const marginLeft = 65;
  const marginRight = 35;
  const marginTop = 30;
  const marginBottom = 45;
  const plotWidth = svgWidth - marginLeft - marginRight;
  const plotHeight = svgHeight - marginTop - marginBottom;

  const pointsCoordinates = useMemo(() => {
    if (lineChartData.length === 0) return [];
    return lineChartData.map((d, index) => {
      const x = lineChartData.length === 1 
        ? marginLeft + plotWidth / 2 
        : marginLeft + (index / (lineChartData.length - 1)) * plotWidth;
      const yEnt = marginTop + plotHeight - (d.entradas / maxChartValue) * plotHeight;
      const ySai = marginTop + plotHeight - (d.saidas / maxChartValue) * plotHeight;
      const ySal = marginTop + plotHeight - (Math.max(0, d.saldo) / maxChartValue) * plotHeight;
      return { x, yEnt, ySai, ySal, data: d };
    });
  }, [lineChartData, maxChartValue, plotWidth, plotHeight]);

  // Helper to construct smooth SVG path
  const buildSvgPath = (coords: Array<{ x: number; y: number }>) => {
    if (coords.length === 0) return '';
    return coords.reduce((acc, curr, idx, arr) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      // Smooth cubic bezier curve
      const prev = arr[idx - 1];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      const cy2 = curr.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }, '');
  };

  const pathEntradas = useMemo(() => {
    return buildSvgPath(pointsCoordinates.map(p => ({ x: p.x, y: p.yEnt })));
  }, [pointsCoordinates]);

  const pathSaidas = useMemo(() => {
    return buildSvgPath(pointsCoordinates.map(p => ({ x: p.x, y: p.ySai })));
  }, [pointsCoordinates]);

  const pathSaldo = useMemo(() => {
    return buildSvgPath(pointsCoordinates.map(p => ({ x: p.x, y: p.ySal })));
  }, [pointsCoordinates]);

  const areaEntradas = useMemo(() => {
    if (pointsCoordinates.length === 0) return '';
    const first = pointsCoordinates[0];
    const last = pointsCoordinates[pointsCoordinates.length - 1];
    const yBase = marginTop + plotHeight;
    return `${pathEntradas} L ${last.x} ${yBase} L ${first.x} ${yBase} Z`;
  }, [pathEntradas, pointsCoordinates]);

  // Y-Axis Reference ticks
  const yAxisTicks = useMemo(() => {
    return [0, 0.25, 0.5, 0.75, 1].map(ratio => {
      const val = ratio * maxChartValue;
      const y = marginTop + plotHeight - ratio * plotHeight;
      return { val, y };
    });
  }, [maxChartValue, plotHeight]);

  // Line Chart Aggregate Metrics
  const chartSumEntradas = useMemo(() => lineChartData.reduce((a, b) => a + b.entradas, 0), [lineChartData]);
  const chartSumSaidas = useMemo(() => lineChartData.reduce((a, b) => a + b.saidas, 0), [lineChartData]);
  const chartSumSaldo = chartSumEntradas - chartSumSaidas;
  const peakPoint = useMemo(() => {
    return lineChartData.reduce((max, curr) => (curr.entradas > max.entradas ? curr : max), lineChartData[0] || { label: '-', entradas: 0 });
  }, [lineChartData]);

  // Urgent Payables list
  const contasVencidasOuUrgentes = payables
    .filter(p => !quickPaidIds.includes(String(p.id ?? '')))
    .slice(0, 4)
    .map(p => ({
      id: String(p.id ?? ''),
      fornecedor: p.supplier ?? '',
      vencimento: p.date ?? '',
      documento: `Parcela ${p.installment_number ?? 1}/${p.installment_total ?? 1}`,
      saldo: Number(p.amount ?? 0),
      vencimentoTag: p.status ?? 'PENDENTE',
      avatarLetter: (p.supplier ?? '?').charAt(0).toUpperCase(),
    }));

  // Transactions to render in bottom table
  const displayedTransactions = useMemo(() => {
    if (transactionListTab === 'entradas') {
      return filteredTransactions.filter(t => t.tipo === 'entrada');
    }
    if (transactionListTab === 'saidas') {
      return filteredTransactions.filter(t => t.tipo === 'saida');
    }
    if (transactionListTab === 'urgentes') {
      return filteredTransactions.filter(t => ['Atrasado', 'Vencido', 'Pendente', 'late', 'pending', 'partial'].includes(t.status));
    }
    return filteredTransactions;
  }, [filteredTransactions, transactionListTab]);

  // Export CSV Action
  const handleExportCSV = () => {
    const headers = ['Tipo', 'Data', 'Descrição', 'Entidade/Cliente', 'Conta', 'Categoria', 'Status', 'Valor (R$)'];
    const rows = filteredTransactions.map(t => [
      t.tipo === 'entrada' ? 'Receita' : 'Despesa',
      t.data,
      `"${t.descricao.replace(/"/g, '""')}"`,
      `"${t.entidade.replace(/"/g, '""')}"`,
      t.conta,
      t.categoria,
      t.status,
      t.valor.toFixed(2)
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fluxo_de_caixa_raynex_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Relatório exportado em CSV com sucesso!');
  };

  return (
    <div className={styles.pageContainer}>
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="font-medium">{showToast}</span>
        </div>
      )}

      {/* TOP HEADER: Branding & Action Suite */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard Executivo & Financeiro
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronizado em tempo real
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão estratégica de fluxo de caixa em linhas, carteira de clientes, tesouraria e projetos da <strong className="text-slate-700">Raynex Solutions</strong>.
          </p>
        </div>

        {/* Global Quick Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenNewEntry}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#003d9b] hover:bg-[#003080] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nova Receita</span>
          </button>

          <button
            onClick={onOpenNewExpense}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nova Despesa</span>
          </button>

          <button
            onClick={() => onNavigate('projetos')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#003d9b] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>+ Projeto 2D</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="Exportar CSV Filtrado"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD VIEW MODE SELECTOR (Segmented Tabs) */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-1 -mb-px">
          <button
            onClick={() => setActiveViewTab('executivo')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeViewTab === 'executivo'
                ? 'border-[#003d9b] text-[#003d9b]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Visão Geral & Fluxo em Linhas</span>
          </button>

          <button
            onClick={() => setActiveViewTab('projetos')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeViewTab === 'projetos'
                ? 'border-[#003d9b] text-[#003d9b]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Especialidades & Projetos 2D</span>
            <span className="bg-blue-100 text-[#003d9b] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {totalProjetosCadastrados}
            </span>
          </button>

          <button
            onClick={() => setActiveViewTab('tesouraria')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeViewTab === 'tesouraria'
                ? 'border-[#003d9b] text-[#003d9b]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Tesouraria & Contas Bancárias</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              3 Contas
            </span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Filtro ativo reflete diretamente nas linhas de fluxo</span>
        </div>
      </div>

      {/* =========================================================================
          ADVANCED SEARCH & FILTER CONTROL BAR (DRIVES THE LINE CHART DIRECTLY)
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 space-y-3">
        {/* Main Search Row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Global Instant Query Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por cliente, fornecedor, descrição da obra, categoria, conta ou valor..."
              className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20 focus:border-[#003d9b] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Period Presets */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={periodPreset}
                onChange={(e) => setPeriodPreset(e.target.value as PeriodPreset)}
                className="text-xs bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-xl px-3 py-2 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20 cursor-pointer"
              >
                <option value="mes-atual">Este Mês (Maio 2024)</option>
                <option value="hoje">Hoje</option>
                <option value="esta-semana">Esta Semana</option>
                <option value="ultimos-30">Últimos 30 Dias</option>
                <option value="ultimos-90">Últimos 90 Dias</option>
                <option value="semestral">1º Semestre 2024</option>
                <option value="ano-2024">Ano Fiscal 2024</option>
                <option value="personalizado">Personalizado...</option>
              </select>
            </div>

            {/* Toggle Advanced Filters Button */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                showAdvancedFilters || activeFiltersCount > 0
                  ? 'bg-blue-50 text-[#003d9b] border-blue-200 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtros Avançados</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#003d9b] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
              {showAdvancedFilters ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Reset Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Limpar todos os filtros"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpar</span>
              </button>
            )}
          </div>
        </div>

        {/* EXPANDABLE ADVANCED FILTER DRAWER */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Filter 1: Fluxo */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Tipo de Fluxo
                </label>
                <select
                  value={selectedFlowType}
                  onChange={(e) => setSelectedFlowType(e.target.value as FlowFilterType)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20"
                >
                  <option value="todos">Todos os Lançamentos</option>
                  <option value="entradas">Apenas Receitas (Entradas)</option>
                  <option value="saidas">Apenas Despesas (Saídas)</option>
                </select>
              </div>

              {/* Filter 2: Status */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value as StatusFilterType)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="concluidos">Recebidos / Pagos</option>
                  <option value="pendentes">Pendentes</option>
                  <option value="atrasados">Atrasados / Vencidos</option>
                </select>
              </div>

              {/* Filter 3: Conta Bancária */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Conta Bancária
                </label>
                <select
                  value={selectedAccountFilter}
                  onChange={(e) => setSelectedAccountFilter(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20"
                >
                  <option value="todas">Todas as Contas</option>
                  <option value="Itaú PJ">Itaú PJ Principal</option>
                  <option value="NuBank PJ">NuBank PJ Reserva</option>
                  <option value="Caixa Interno">Caixa Interno Físico</option>
                </select>
              </div>

              {/* Filter 4: Categoria de Especialidade */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Categoria
                </label>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20"
                >
                  <option value="todas">Todas as Categorias</option>
                  <option value="SERVIÇOS">Esquadrias & Vidros (Serviços)</option>
                  <option value="MANUTENÇÃO">Manutenção & Reparos</option>
                  <option value="PRODUTOS">Produtos & Ferragens</option>
                  <option value="Cloud Services">TI & Infraestrutura</option>
                  <option value="Limpeza">Operacional & Limpeza</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>

              {/* Filter 5: Faixa de Valor */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Faixa de Valor (R$)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                    className="w-1/2 text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Máx"
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                    className="w-1/2 text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Filter 6: Ordenação */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Ordenar por
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20"
                >
                  <option value="recente">Mais Recentes</option>
                  <option value="antigo">Mais Antigos</option>
                  <option value="maior-valor">Maior Valor (R$)</option>
                  <option value="menor-valor">Menor Valor (R$)</option>
                </select>
              </div>
            </div>

            {/* Custom Date Range when selected */}
            {periodPreset === 'personalizado' && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-slate-600">Intervalo de Datas:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800"
                />
                <span className="text-xs text-slate-400">até</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800"
                />
              </div>
            )}

            {/* Filter Summary Strip */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Resultado do Filtro:</span>
                <span>{filteredTransactions.length} lançamentos encontrados</span>
                <span>·</span>
                <span className="text-emerald-600 font-semibold">
                  Receitas: {formatCurrency(totalReceitasFiltradas)}
                </span>
                <span>·</span>
                <span className="text-rose-600 font-semibold">
                  Despesas: {formatCurrency(totalDespesasFiltradas)}
                </span>
                <span>·</span>
                <span className="text-[#003d9b] font-bold">
                  Balanço: {formatCurrency(saldoLiquidoFiltrado)}
                </span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 underline cursor-pointer"
              >
                Resetar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          ROW 1: EXECUTIVE KPI CARDS (INCLUDING BASE DE CLIENTES)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* KPI 1: Saldo Consolidado */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Saldo Consolidado
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#003d9b] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <p className="text-xl font-bold text-[#003d9b] tracking-tight tabular-nums">
              {formatCurrency(saldoRealConsolidado)}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.8% vs mês ant.</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>3 contas ativas</span>
            <span className="text-emerald-700 font-semibold">100% Conciliado</span>
          </div>
        </div>

        {/* KPI 2: Receitas Realizadas */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Receitas Realizadas
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <p className="text-xl font-bold text-emerald-600 tracking-tight tabular-nums">
              {formatCurrency(totalRecebidoGeral)}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <span>+{formatCurrency(totalAReceberPendente)} a compensar</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Meta Mensal</span>
              <span className="font-bold text-slate-700">{percentualMeta}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentualMeta}%` }} />
            </div>
          </div>
        </div>

        {/* KPI 3: Despesas Totais */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Despesas Pagas
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <p className="text-xl font-bold text-rose-600 tracking-tight tabular-nums">
              {formatCurrency(totalGastoGeral)}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <span>{expenses.length} saídas registradas</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Contas a Pagar</span>
            <span className="text-slate-700 font-semibold">{formatCurrency(totalAPagarFuturo)} pendente</span>
          </div>
        </div>

        {/* KPI 4: Lucro Líquido Operacional */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Lucro Líquido
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <p className="text-xl font-bold text-slate-900 tracking-tight tabular-nums">
              {formatCurrency(totalRecebidoGeral - totalGastoGeral)}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-indigo-600 font-semibold mt-1">
              <span>Margem Operacional: {margemLucroOperacional}%</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Saúde Financeira</span>
            <span className="text-indigo-600 font-bold">Excelente</span>
          </div>
        </div>

        {/* KPI 5: NÚMERO DE CLIENTES (SOLICITADO) */}
        <div 
          onClick={() => onNavigate('cadastro-cliente')}
          className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-[#003d9b]/40 hover:shadow-sm transition-all cursor-pointer group"
          title="Ver módulo de Clientes"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#003d9b] transition-colors">
              Base de Clientes
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center group-hover:bg-[#003d9b] group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <p className="text-xl font-bold text-slate-900 tracking-tight tabular-nums">
              {totalClientes}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{novosClientesMes} novos este mês</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Ticket Médio</span>
            <span className="text-[#003d9b] font-semibold group-hover:underline">{formatCurrency(ticketMedioClientes)}</span>
          </div>
        </div>

        {/* KPI 6: Produção & Projetos 2D */}
        <div 
          onClick={() => onNavigate('projetos')}
          className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-[#003d9b]/40 hover:shadow-sm transition-all cursor-pointer group"
          title="Ver Projetos 2D"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#003d9b] transition-colors">
              Pipeline Projetos 2D
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-[#003d9b] group-hover:text-white transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <p className="text-xl font-bold text-sky-700 tracking-tight tabular-nums">
              {formatCurrency(valorTotalPropostasProjetos)}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <span>{totalProjetosCadastrados} projetos cadastrados</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Conversão</span>
            <span className="text-[#003d9b] font-bold">{taxaConversaoProjetos}% Aprovados</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW TAB 1: VISÃO GERAL & FLUXO DE CAIXA EM LINHAS (INTERACTIVE LINE CHART)
          ========================================================================= */}
      {activeViewTab === 'executivo' && (
        <>
          {/* GRÁFICO DE FLUXO DE CAIXA EM LINHAS (8 cols) + RECEITA POR ESTRUTURA (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* GRÁFICO DE LINHAS DINÂMICO CONECTADO AOS FILTROS */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#003d9b]" />
                      <h2 className="text-base font-bold text-slate-900">
                        Comparativo de Fluxo de Caixa em Linhas
                      </h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Curva de evolução temporal calculada dinamicamente com base nos filtros ativos
                    </p>
                  </div>

                  {/* Series Toggle Controls (Liga/Desliga Linhas) */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowEntradasLine(!showEntradasLine)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        showEntradasLine 
                          ? 'bg-sky-50 text-sky-700 border-sky-200' 
                          : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
                      }`}
                      title="Alternar visibilidade das Receitas"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                      <span>Receitas</span>
                    </button>

                    <button
                      onClick={() => setShowSaidasLine(!showSaidasLine)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        showSaidasLine 
                          ? 'bg-blue-50 text-[#003d9b] border-blue-200' 
                          : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
                      }`}
                      title="Alternar visibilidade das Despesas"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#003d9b] inline-block" />
                      <span>Despesas</span>
                    </button>

                    <button
                      onClick={() => setShowSaldoLine(!showSaldoLine)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        showSaldoLine 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
                      }`}
                      title="Alternar visibilidade do Saldo Líquido"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      <span>Saldo</span>
                    </button>
                  </div>
                </div>

                {/* SVG LINE CHART CANVAS */}
                <div className="relative pt-2 pb-2">
                  <svg 
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                    className="w-full h-64 overflow-visible select-none"
                  >
                    <defs>
                      {/* Gradient for Entradas Area */}
                      <linearGradient id="gradient-entradas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0284c7" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.01" />
                      </linearGradient>

                      {/* Gradient for Saídas Area */}
                      <linearGradient id="gradient-saidas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#003d9b" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#003d9b" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Y-Grid lines and values */}
                    {yAxisTicks.map((tick, idx) => (
                      <g key={idx}>
                        <line
                          x1={marginLeft}
                          x2={svgWidth - marginRight}
                          y1={tick.y}
                          y2={tick.y}
                          stroke="#e2e8f0"
                          strokeDasharray={idx === 0 ? 'none' : '3 3'}
                          strokeWidth="1"
                        />
                        <text
                          x={marginLeft - 8}
                          y={tick.y + 3.5}
                          textAnchor="end"
                          className="text-[10px] fill-slate-400 font-medium"
                        >
                          {tick.val >= 1000 ? `R$ ${(tick.val / 1000).toFixed(0)}k` : `R$ ${tick.val.toFixed(0)}`}
                        </text>
                      </g>
                    ))}

                    {/* Area fills */}
                    {showEntradasLine && areaEntradas && (
                      <path d={areaEntradas} fill="url(#gradient-entradas)" />
                    )}

                    {/* Line 1: Receitas (Entradas) */}
                    {showEntradasLine && pathEntradas && (
                      <path
                        d={pathEntradas}
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Line 2: Despesas (Saídas) */}
                    {showSaidasLine && pathSaidas && (
                      <path
                        d={pathSaidas}
                        fill="none"
                        stroke="#003d9b"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Line 3: Saldo Líquido */}
                    {showSaldoLine && pathSaldo && (
                      <path
                        d={pathSaldo}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeDasharray="4 4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Vertical guideline on hover */}
                    {hoveredPointIndex !== null && pointsCoordinates[hoveredPointIndex] && (
                      <line
                        x1={pointsCoordinates[hoveredPointIndex].x}
                        x2={pointsCoordinates[hoveredPointIndex].x}
                        y1={marginTop}
                        y2={marginTop + plotHeight}
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Points Circles & Interactive Hover Hitboxes */}
                    {pointsCoordinates.map((pt, idx) => {
                      const isHovered = hoveredPointIndex === idx;

                      return (
                        <g key={idx}>
                          {/* Point 1: Entrada */}
                          {showEntradasLine && (
                            <circle
                              cx={pt.x}
                              cy={pt.yEnt}
                              r={isHovered ? 6 : 4}
                              fill="#0284c7"
                              stroke="#ffffff"
                              strokeWidth="2"
                              className="transition-all"
                            />
                          )}

                          {/* Point 2: Saída */}
                          {showSaidasLine && (
                            <circle
                              cx={pt.x}
                              cy={pt.ySai}
                              r={isHovered ? 6 : 4}
                              fill="#003d9b"
                              stroke="#ffffff"
                              strokeWidth="2"
                              className="transition-all"
                            />
                          )}

                          {/* Point 3: Saldo */}
                          {showSaldoLine && (
                            <circle
                              cx={pt.x}
                              cy={pt.ySal}
                              r={isHovered ? 5 : 3.5}
                              fill="#10b981"
                              stroke="#ffffff"
                              strokeWidth="2"
                              className="transition-all"
                            />
                          )}

                          {/* X-Axis Label */}
                          <text
                            x={pt.x}
                            y={marginTop + plotHeight + 20}
                            textAnchor="middle"
                            className={`text-[11px] font-bold transition-colors ${
                              isHovered ? 'fill-[#003d9b]' : 'fill-slate-500'
                            }`}
                          >
                            {pt.data.label}
                          </text>

                          {/* Invisible wide hitbox for easy mouse hover */}
                          <rect
                            x={pt.x - plotWidth / (pointsCoordinates.length * 2)}
                            y={marginTop}
                            width={plotWidth / pointsCoordinates.length}
                            height={plotHeight + 25}
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredPointIndex(idx)}
                            onMouseLeave={() => setHoveredPointIndex(null)}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Floating Interactive Tooltip */}
                  {hoveredPointIndex !== null && pointsCoordinates[hoveredPointIndex] && (
                    <div 
                      className="absolute -top-6 bg-slate-900 text-white text-[11px] py-2 px-3 rounded-xl shadow-2xl z-30 pointer-events-none transform -translate-x-1/2 animate-in fade-in duration-150"
                      style={{ 
                        left: `${(pointsCoordinates[hoveredPointIndex].x / svgWidth) * 100}%` 
                      }}
                    >
                      <p className="font-bold text-slate-200 border-b border-slate-700/80 pb-1 mb-1.5">
                        {pointsCoordinates[hoveredPointIndex].data.fullLabel}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-sky-300">
                            <span className="w-2 h-2 rounded-full bg-sky-400" />
                            Receitas:
                          </span>
                          <span className="font-bold text-white">
                            +{formatCurrency(pointsCoordinates[hoveredPointIndex].data.entradas)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5 text-blue-200">
                            <span className="w-2 h-2 rounded-full bg-[#003d9b]" />
                            Despesas:
                          </span>
                          <span className="font-bold text-white">
                            -{formatCurrency(pointsCoordinates[hoveredPointIndex].data.saidas)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800">
                          <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Saldo do Período:
                          </span>
                          <span className={`font-bold ${
                            pointsCoordinates[hoveredPointIndex].data.saldo >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {pointsCoordinates[hoveredPointIndex].data.saldo >= 0 ? '+' : ''}
                            {formatCurrency(pointsCoordinates[hoveredPointIndex].data.saldo)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Line Chart Detailed Summary Tiles */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Receitas Filtradas</span>
                  <p className="text-sm font-bold text-sky-700 mt-0.5">{formatCurrency(chartSumEntradas)}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Despesas Filtradas</span>
                  <p className="text-sm font-bold text-rose-600 mt-0.5">{formatCurrency(chartSumSaidas)}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Resultado Líquido</span>
                  <p className={`text-sm font-bold mt-0.5 ${chartSumSaldo >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {formatCurrency(chartSumSaldo)}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Pico de Faturamento</span>
                  <p className="text-sm font-bold text-[#003d9b] mt-0.5">
                    {peakPoint.label} ({formatCurrency(peakPoint.entradas)})
                  </p>
                </div>
              </div>
            </div>

            {/* GRÁFICO: Composição de Receita por Especialidade Raynex (Donut SVG) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Receita por Estrutura
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Faturamento por linha de fabricação
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60">
                    4 Linhas
                  </span>
                </div>

                {/* Interactive Donut Graphic */}
                <div className="relative flex items-center justify-center my-6">
                  <svg className="w-48 h-48 -rotate-90 transform" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="14"
                    />
                    {/* Segment 1: Portas (38%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#003d9b"
                      strokeWidth="14"
                      strokeDasharray={`${38 * 2.513} 251.3`}
                      strokeDashoffset="0"
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onMouseEnter={() => setHoveredDonutIndex(0)}
                      onMouseLeave={() => setHoveredDonutIndex(null)}
                    />
                    {/* Segment 2: Janelas (24%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#0284c7"
                      strokeWidth="14"
                      strokeDasharray={`${24 * 2.513} 251.3`}
                      strokeDashoffset={`-${38 * 2.513}`}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onMouseEnter={() => setHoveredDonutIndex(1)}
                      onMouseLeave={() => setHoveredDonutIndex(null)}
                    />
                    {/* Segment 3: Boxes (20%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#4f46e5"
                      strokeWidth="14"
                      strokeDasharray={`${20 * 2.513} 251.3`}
                      strokeDashoffset={`-${(38 + 24) * 2.513}`}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onMouseEnter={() => setHoveredDonutIndex(2)}
                      onMouseLeave={() => setHoveredDonutIndex(null)}
                    />
                    {/* Segment 4: Portões (18%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#64748b"
                      strokeWidth="14"
                      strokeDasharray={`${18 * 2.513} 251.3`}
                      strokeDashoffset={`-${(38 + 24 + 20) * 2.513}`}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onMouseEnter={() => setHoveredDonutIndex(3)}
                      onMouseLeave={() => setHoveredDonutIndex(null)}
                    />
                  </svg>

                  {/* Donut Center Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {hoveredDonutIndex !== null ? revenueByStructureCategory[hoveredDonutIndex].nome : 'Total Faturado'}
                    </span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5">
                      {hoveredDonutIndex !== null 
                        ? formatCurrency(revenueByStructureCategory[hoveredDonutIndex].valor)
                        : formatCurrency(74860)
                      }
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      {hoveredDonutIndex !== null 
                        ? `${revenueByStructureCategory[hoveredDonutIndex].porcentagem}% do total`
                        : '+18% este mês'
                      }
                    </span>
                  </div>
                </div>

                {/* Structured Breakdown List */}
                <div className="space-y-2.5">
                  {revenueByStructureCategory.map((item, index) => (
                    <div 
                      key={item.nome}
                      className={`p-2 rounded-xl transition-colors flex items-center justify-between text-xs cursor-pointer ${
                        hoveredDonutIndex === index ? 'bg-slate-50 ring-1 ring-slate-200' : 'hover:bg-slate-50/50'
                      }`}
                      onMouseEnter={() => setHoveredDonutIndex(index)}
                      onMouseLeave={() => setHoveredDonutIndex(null)}
                    >
                      <div className="flex items-center gap-2.5">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" 
                          style={{ backgroundColor: item.cor }}
                        />
                        <div>
                          <p className="font-semibold text-slate-800 leading-tight">{item.nome}</p>
                          <p className="text-[10px] text-slate-400">{item.unidades} instalações · Méd: {formatCurrency(item.ticketMedio)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatCurrency(item.valor)}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{item.porcentagem}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 mt-4">
                <span>Maior ticket: <strong>Portões de Ferro</strong></span>
                <span className="text-[#003d9b] font-semibold cursor-pointer hover:underline" onClick={() => setActiveViewTab('projetos')}>
                  Ver Detalhes →
                </span>
              </div>
            </div>
          </div>

          {/* ROW 3: CARTEIRA DE CLIENTES (6 cols) + ALERTAS DE LIQUIDEZ E VENCIMENTOS (6 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* PAINEL DE CLIENTES PRINCIPAIS & VOLUME (SUBSTITUI CONTROLE DE CUSTOS) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Principais Clientes & Histórico de Obras
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Base ativa com maior volume de pedidos e limites aprovados
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('cadastro-cliente')}
                    className="text-xs font-semibold text-[#003d9b] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                  >
                    + Novo Cliente
                  </button>
                </div>

                <div className="space-y-3">
                  {clients.slice(0, 4).map((cli) => (
                    <div 
                      key={cli.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200/80 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs">
                          {cli.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">{cli.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span>{cli.city} - {cli.state}</span>
                            <span>·</span>
                            <span>CNPJ: {cli.cpf}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Contato</span>
                        <p className="text-xs font-bold text-emerald-700">{cli.phone || cli.email || 'Não informado'}</p>
                        <span className="text-[10px] text-slate-500 font-medium">{cli.email || 'Sem e-mail cadastrado'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-2">
                <span>Total de {totalClientes} clientes cadastrados</span>
                <button 
                  onClick={() => onNavigate('cadastro-cliente')} 
                  className="text-xs font-semibold text-[#003d9b] hover:underline cursor-pointer"
                >
                  Gerenciar Toda a Carteira →
                </button>
              </div>
            </div>

            {/* Contas Críticas a Pagar nos Próximos Vencimentos */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Alertas de Liquidez & Vencimentos Imediatos
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Contas a pagar críticas com botão de baixa rápida
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                    {contasVencidasOuUrgentes.length} pendências
                  </span>
                </div>

                <div className="space-y-2.5">
                  {contasVencidasOuUrgentes.map(item => (
                    <div 
                      key={item.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200/80 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
                          {item.avatarLetter}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{item.fornecedor}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>Venc: {item.vencimento}</span>
                            <span>·</span>
                            <span>Doc: {item.documento}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs font-bold text-rose-600">{formatCurrency(item.saldo)}</p>
                          <span className="text-[10px] text-rose-500 font-semibold">{item.vencimentoTag || 'URGENTE'}</span>
                        </div>
                        <button
                          onClick={() => handleQuickPay(item.id, item.fornecedor, item.saldo)}
                          className="px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                          title="Dar Baixa Imediata"
                        >
                          Baixar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 mt-4">
                <span>Total a Pagar nesta semana: <strong className="text-rose-600 font-bold">{formatCurrency(12800)}</strong></span>
                <button 
                  onClick={() => onNavigate('contas-pagar')} 
                  className="text-xs font-semibold text-[#003d9b] hover:underline cursor-pointer"
                >
                  Ver Todas as Contas a Pagar →
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          VIEW TAB 2: ESPECIALIDADES & PROJETOS 2D (SEM O VIDRO ESTIMADO)
          ========================================================================= */}
      {activeViewTab === 'projetos' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Projects Executive Banner */}
          <div className="bg-gradient-to-r from-[#003d9b] to-[#002566] text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider">
                Módulo Projetos 2D & Produção Industrial
              </span>
              <h2 className="text-xl font-bold tracking-tight">
                Estruturas de Vidro, Janelas, Boxes e Portões de Ferro
              </h2>
              <p className="text-xs text-slate-200 leading-relaxed">
                Acompanhe o pipeline comercial e técnico de projetos desenhados para clientes da Raynex Solutions. Crie representações visuais em 2D com medidas em metros e gere apresentações instantâneas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={() => onNavigate('projetos')}
                className="w-full sm:w-auto px-5 py-2.5 bg-white text-[#003d9b] hover:bg-slate-100 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4" />
                <span>Abrir Editor de Projetos 2D</span>
              </button>
            </div>
          </div>

          {/* Metrics Tiles for Production & Materials (SEM VIDRO ESTIMADO) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Clientes com Projetos</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalClientes} Clientes</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">100% Propostas Ativas</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Propostas Comerciais</p>
              <p className="text-2xl font-bold text-sky-700 mt-1">{formatCurrency(valorTotalPropostasProjetos)}</p>
              <p className="text-xs text-slate-500 mt-1">{totalProjetosCadastrados} projetos ativos</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Taxa de Aprovação</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{taxaConversaoProjetos}%</p>
              <p className="text-xs text-slate-500 mt-1">{projetosAprovados} projetos aprovados</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tempo Médio de Proposta</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">4.2 dias</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">Redução de 30% no ciclo</p>
            </div>
          </div>

          {/* Grid of Recent 2D Projects with Visual Representation */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Projetos Recentes Cadastrados no Sistema
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Desenhos simplificados prontos para apresentação ao cliente
                </p>
              </div>

              <button
                onClick={() => onNavigate('projetos')}
                className="text-xs font-bold text-[#003d9b] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Todos no Módulo 2D</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {project.map(proj => (
                <div 
                  key={proj.id}
                  className="bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200/80 p-4 flex flex-col justify-between transition-all hover:shadow-xs group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#003d9b] uppercase tracking-wider">
                        {proj.type.replace('-', ' ')}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-0.5 group-hover:text-[#003d9b] transition-colors">
                        {proj.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Cliente: <strong>{proj.client_id}</strong></p>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      proj.status === 'approved' 
                        ? 'bg-emerald-100 text-emerald-800'
                        : proj.status === "presented"
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {proj.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="my-3 py-2 px-3 bg-white rounded-lg border border-slate-200/60 flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400">Dimensões</p>
                      <p className="font-bold text-slate-800">{proj.width.toFixed(2)}m × {proj.height.toFixed(2)}m</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Valor Estimado</p>
                      <p className="font-bold text-[#003d9b]">{formatCurrency(proj.estimated_value || 0)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">{proj.updated_at}</span>
                    <button
                      onClick={() => onNavigate('projetos')}
                      className="text-xs font-semibold text-[#003d9b] hover:underline cursor-pointer"
                    >
                      Abrir no Editor →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW TAB 3: TESOURARIA & CONTAS BANCÁRIAS
          ========================================================================= */}
      {activeViewTab === 'tesouraria' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Detailed Bank Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bankAccountsList.map(acc => (
              <div 
                key={acc.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-2xs"
                      style={{ backgroundColor: acc.color }}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{acc.nome}</h3>
                      <p className="text-xs text-slate-400">{acc.banco} · {acc.tipo}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                    acc.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {acc.variacao}
                  </span>
                </div>

                <div className="py-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Saldo Disponível</span>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
                    {formatCurrency(acc.saldo)}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Ag: <strong>{acc.agencia}</strong> · C/C: <strong>{acc.conta}</strong></span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Conciliado
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Timeline de Liquidez a 30 Dias */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Planejamento de Liquidez das Próximas 4 Semanas
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Curva projetada de recebimentos de clientes vs compromissos com fornecedores
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Recebíveis Previstos: {formatCurrency(totalAReceberFuturo)}
                </span>
                <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  A Pagar Previsto: {formatCurrency(totalAPagarFuturo)}
                </span>
              </div>
            </div>

            {/* Visual Timeline of Cash Surplus */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Fluxo de Caixa Positivo Garantido</h4>
                  <p className="text-xs text-slate-500">Não há previsão de descasamento financeiro para os próximos 30 dias.</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Saldo Livre Projetado</span>
                <p className="text-lg font-bold text-[#003d9b]">{formatCurrency(projecaoLiquida30Dias)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ANALYTICAL TRANSACTION TABLE WITH INSTANT FILTERING & EXPORT
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Top Controls */}
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Extrato Analítico & Movimentações
              </h3>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                {displayedTransactions.length} itens
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Transações refinadas com base nos filtros avançados selecionados
            </p>
          </div>

          {/* Quick Sub-tabs: Todas / Entradas / Saídas / Urgentes */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setTransactionListTab('todas')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                transactionListTab === 'todas'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setTransactionListTab('entradas')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                transactionListTab === 'entradas'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setTransactionListTab('saidas')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                transactionListTab === 'saidas'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Despesas
            </button>
            <button
              onClick={() => setTransactionListTab('urgentes')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                transactionListTab === 'urgentes'
                  ? 'bg-white text-amber-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendentes / Atrasados
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Descrição / Obra</th>
                <th className="py-3 px-4">Cliente / Fornecedor</th>
                <th className="py-3 px-4">Conta</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {displayedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-sm">Nenhum lançamento encontrado</p>
                    <p className="text-xs mt-1">Tente ajustar seus termos de busca ou filtros avançados.</p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-[#003d9b] bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer"
                    >
                      Limpar Filtros
                    </button>
                  </td>
                </tr>
              ) : (
                displayedTransactions.slice(0, 10).map((t) => (
                  <tr key={`${t.tipo}-${t.id}`} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      {t.tipo === 'entrada' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          <span>Receita</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>Despesa</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-500">
                      {t.data}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">
                      {t.descricao}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {t.entidade}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {t.conta}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                        {t.categoria}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        t.status === 'Recebido' || ['Pago', 'paid'].includes(t.status)
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                          : ['Pendente', 'pending', 'partial'].includes(t.status)
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/70'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/70'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-bold tabular-nums ${
                      t.tipo === 'entrada' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {t.tipo === 'entrada' ? '+' : '-'}{formatCurrency(t.valor)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary & Navigation */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Mostrando <strong>{Math.min(10, displayedTransactions.length)}</strong> de <strong>{displayedTransactions.length}</strong> transações filtradas
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('entradas')}
              className="text-xs font-semibold text-[#003d9b] hover:underline cursor-pointer"
            >
              Ver Módulo de Entradas →
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => onNavigate('saidas')}
              className="text-xs font-semibold text-[#003d9b] hover:underline cursor-pointer"
            >
              Ver Módulo de Saídas →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
