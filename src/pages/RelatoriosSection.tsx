import React, { useState } from 'react';
import { 
  FileText, 
  SlidersHorizontal, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  ExternalLink, 
  TrendingUp, 
  ArrowLeftRight, 
  Calendar, 
  MoreVertical,
  Layers
} from 'lucide-react';
import { monthlyCashFlowData, expenseCategoriesData } from '../data/initialData';
import { formatCurrency } from '../utils/formatters';
import { reportsTheme, styles, typography } from '../theme';

interface RelatoriosSectionProps {
  onOpenQuickReport: () => void;
}

export const RelatoriosSection: React.FC<RelatoriosSectionProps> = ({
  onOpenQuickReport
}) => {
  const [period, setPeriod] = useState('Últimos 30 Dias');
  const [category, setCategory] = useState('Todas as Categorias');
  const [account, setAccount] = useState('Todas as Contas');
  const [searchEntity, setSearchEntity] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    alert('Relatório Financeiro FinanceFlow exportado para PDF com sucesso!');
  };

  const handleExportExcel = () => {
    alert('Relatório Financeiro exportado para XLSX com sucesso!');
  };

  return (
    <div className={styles.pageContainer}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={typography.headings.pageTitle}>{reportsTheme.header.title}</h1>
          <p className={typography.headings.pageSubtitle}>{reportsTheme.header.subtitle}</p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>PDF</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Filtros Avançados Card */}
      <div className={styles.cardPadded}>
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="w-4 h-4 text-[#003d9b]" />
          <h2 className="text-sm font-bold text-slate-900">Filtros Avançados</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Período</label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium cursor-pointer"
              >
                <option>Últimos 30 Dias</option>
                <option>Últimos 6 Meses</option>
                <option>Este Ano</option>
                <option>Ano Anterior</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium cursor-pointer"
            >
              <option>Todas as Categorias</option>
              <option>Operacional</option>
              <option>Pessoal</option>
              <option>Marketing</option>
              <option>Infraestrutura</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Conta</label>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium cursor-pointer"
            >
              <option>Todas as Contas</option>
              <option>Itaú PJ</option>
              <option>NuBank PJ</option>
              <option>Caixa Interno</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Cliente/Fornecedor</label>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchEntity}
              onChange={(e) => setSearchEntity(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* 2x2 Grid of Financial Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fluxo de Caixa Mensal (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {reportsTheme.charts.cashFlow.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {reportsTheme.charts.cashFlow.subtitle}
              </p>
            </div>
            <button
              onClick={() => setShowDetailsModal(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#003d9b] hover:text-[#003080] cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Detalhes</span>
            </button>
          </div>

          {/* Bar Chart Visualizer */}
          <div className="h-56 flex items-end justify-between gap-4 pt-6 px-4 border-b border-slate-100 pb-2">
            {monthlyCashFlowData.map((item) => {
              const maxVal = 100000;
              const entradaHeight = (item.entradas / maxVal) * 100;
              const saidaHeight = (item.saidas / maxVal) * 100;
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-44">
                    {/* Entradas bar (light blue) */}
                    <div 
                      className="w-4 sm:w-5 bg-sky-200 hover:bg-sky-300 rounded-t-sm transition-all duration-300 relative group-hover:shadow-xs"
                      style={{ height: `${entradaHeight}%` }}
                      title={`Entradas ${item.month}: ${formatCurrency(item.entradas)}`}
                    />
                    {/* Saídas bar (dark blue #003d9b) */}
                    <div 
                      className="w-4 sm:w-5 bg-[#003d9b] hover:bg-[#003080] rounded-t-sm transition-all duration-300 relative group-hover:shadow-xs"
                      style={{ height: `${saidaHeight}%` }}
                      title={`Saídas ${item.month}: ${formatCurrency(item.saidas)}`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{item.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-sky-200 rounded-xs" />
              <span>Entradas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#003d9b] rounded-xs" />
              <span>Saídas</span>
            </div>
          </div>
        </div>

        {/* Despesas por Categoria (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">
              {reportsTheme.charts.expensesByCategory.title}
            </h2>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Donut graphic */}
          <div className="relative flex items-center justify-center my-4">
            <div className="w-36 h-36 rounded-full border-8 border-[#003d9b] border-t-slate-400 border-l-[#0052cc] border-r-slate-300 flex items-center justify-center">
              <div className="text-center">
                <span className="text-lg font-bold text-slate-900 tracking-tight">R$45k</span>
              </div>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {expenseCategoriesData.map((cat) => (
              <div key={cat.categoria} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-700 font-medium">{cat.categoria}</span>
                </div>
                <span className="font-bold text-slate-900 tabular-nums">{cat.porcentagem}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* DRE Simplificada (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#003d9b] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">{reportsTheme.charts.dre.title}</h2>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-700 font-medium">Receita Bruta</span>
              <span className="font-bold text-slate-900 tabular-nums">R$ 125.000,00</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">(-) Deduções e Impostos</span>
              <span className="font-semibold text-rose-600 tabular-nums">- R$ 15.500,00</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100 font-semibold">
              <span className="text-slate-800">(=) Receita Líquida</span>
              <span className="text-slate-900 tabular-nums">R$ 109.500,00</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600">(-) Custos Operacionais</span>
              <span className="font-semibold text-rose-600 tabular-nums">- R$ 42.000,00</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-blue-50/60 rounded-xl mt-4">
              <span className="text-sm font-bold text-[#003d9b]">Lucro Líquido</span>
              <span className="text-base font-extrabold text-[#003d9b] tabular-nums">
                R$ 67.500,00
              </span>
            </div>
          </div>
        </div>

        {/* Receitas vs Despesas (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#003d9b] flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">{reportsTheme.charts.revenueVsExpenses.title}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600">Total Receitas</span>
                <span className="text-emerald-700 tabular-nums">R$ 125.000,00</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-full" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600">Total Despesas</span>
                <span className="text-rose-600 tabular-nums">R$ 57.500,00</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full w-[46%]" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-6">
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  {reportsTheme.charts.revenueVsExpenses.marginLabel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">54%</span>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Detalhamento de Fluxo de Caixa</h3>
            <p className="text-xs text-slate-500 mb-4">Demonstrativo consolidado semestral da sua empresa.</p>
            <div className="divide-y divide-slate-100 text-xs">
              {monthlyCashFlowData.map(m => (
                <div key={m.month} className="py-2.5 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{m.month}</span>
                  <div className="space-x-4">
                    <span className="text-emerald-600">+{formatCurrency(m.entradas)}</span>
                    <span className="text-rose-600">-{formatCurrency(m.saidas)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#003d9b] rounded-lg cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
