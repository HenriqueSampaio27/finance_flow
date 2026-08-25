import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  CreditCard, 
  PiggyBank, 
  Download, 
  Megaphone, 
  Server, 
  Users, 
  Plane, 
  Building, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  TrendingDown
} from 'lucide-react';
import { BudgetItem } from '../types';
import { formatCurrency, exportToCSV } from '../utils/formatters';
import { budgetTheme, styles, typography } from '../theme';

interface OrcamentoSectionProps {
  budgetItems: BudgetItem[];
}

export const OrcamentoSection: React.FC<OrcamentoSectionProps> = ({
  budgetItems,
}) => {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const months = ['Novembro 2023', 'Dezembro 2023', 'Janeiro 2024', 'Fevereiro 2024'];

  const totalPrevisto = budgetItems.reduce((acc, curr) => acc + curr.previsto, 0);
  const totalRealizado = budgetItems.reduce((acc, curr) => acc + curr.realizado, 0);
  const totalDisponivel = totalPrevisto - totalRealizado;
  const percentTotal = Math.round((totalRealizado / totalPrevisto) * 100);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Megaphone': return <Megaphone className="w-4 h-4 text-blue-600" />;
      case 'Server': return <Server className="w-4 h-4 text-rose-600" />;
      case 'Users': return <Users className="w-4 h-4 text-indigo-600" />;
      case 'Plane': return <Plane className="w-4 h-4 text-slate-600" />;
      default: return <Building className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleExport = () => {
    exportToCSV('planejamento_orcamentario', budgetItems);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Top Header & Month Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={typography.headings.pageTitle}>{budgetTheme.header.title}</h1>
          <p className={typography.headings.pageSubtitle}>{budgetTheme.header.subtitle}</p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-xs">
          <button
            onClick={() => setCurrentMonthIndex(prev => Math.max(0, prev - 1))}
            disabled={currentMonthIndex === 0}
            className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{months[currentMonthIndex]}</span>
          </div>
          <button
            onClick={() => setCurrentMonthIndex(prev => Math.min(months.length - 1, prev + 1))}
            disabled={currentMonthIndex === months.length - 1}
            className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Previsto */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
              Orçado
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs text-slate-500 font-medium">Total Previsto</span>
            <p className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
              {formatCurrency(totalPrevisto || 150000.00)}
            </p>
          </div>
        </div>

        {/* Card 2: Realizado */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-[#003d9b]">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
              Gasto
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500 font-medium">Total Realizado</span>
              <span className="text-xs font-semibold text-slate-700">{percentTotal}% do total</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
              {formatCurrency(totalRealizado || 128450.00)}
            </p>
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-[#003d9b] h-full rounded-full transition-all duration-500" 
                style={{ width: `${percentTotal}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Card 3: Saldo Disponível (Blue accent left border) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 border-l-4 border-l-[#003d9b] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <PiggyBank className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
              Saldo
            </span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Disponível</span>
              <p className="text-2xl font-bold text-slate-900 tabular-nums mt-1">
                {formatCurrency(totalDisponivel || 21550.00)}
              </p>
            </div>
            <div className="bg-blue-50 text-[#003d9b] text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              <span>Dentro do limite</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detalhamento por Categoria */}
      <div className={styles.card}>
        <div className="p-4 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#003d9b]" />
            <h2 className="text-sm font-bold text-slate-900">Detalhamento por Categoria</h2>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-white">
                <th className={typography.table.header}>CATEGORIA</th>
                <th className={`${typography.table.header} text-right`}>PREVISTO</th>
                <th className={`${typography.table.header} text-right`}>REALIZADO</th>
                <th className={`${typography.table.header} text-right`}>DIFERENÇA</th>
                <th className={`${typography.table.header} min-w-[200px]`}>CONSUMO</th>
                <th className={`${typography.table.header} text-center`}>STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgetItems.map((item) => {
                const isOverBudget = item.diferenca < 0;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                          {getCategoryIcon(item.iconName)}
                        </div>
                        <span className="text-xs font-semibold text-slate-900">
                          {item.categoria}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right text-xs font-medium text-slate-700 tabular-nums whitespace-nowrap">
                      {formatCurrency(item.previsto)}
                    </td>
                    <td className="py-4 px-4 text-right text-xs font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      {formatCurrency(item.realizado)}
                    </td>
                    <td className="py-4 px-4 text-right text-xs font-bold tabular-nums whitespace-nowrap">
                      <span className={isOverBudget ? 'text-rose-600' : 'text-[#003d9b]'}>
                        {isOverBudget ? '- ' : '+ '}
                        {formatCurrency(Math.abs(item.diferenca))}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isOverBudget ? 'bg-rose-600' : 'bg-[#003d9b]'
                            }`}
                            style={{ width: `${Math.min(100, item.consumoPercent)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold tabular-nums ${
                          isOverBudget ? 'text-rose-600' : 'text-slate-700'
                        }`}>
                          {item.consumoPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {item.statusType === 'alert' || isOverBudget ? (
                        <span className="inline-flex p-1 text-rose-600 bg-rose-50 rounded-full" title="Orçamento Ultrapassado">
                          <AlertTriangle className="w-4 h-4" />
                        </span>
                      ) : item.statusType === 'info' ? (
                        <span className="inline-flex p-1 text-slate-400 bg-slate-50 rounded-full" title="Quase no limite">
                          <Info className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="inline-flex p-1 text-emerald-600 bg-emerald-50 rounded-full" title="Orçamento Saudável">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
