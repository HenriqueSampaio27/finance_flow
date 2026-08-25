import React from 'react';
import { X, FileSpreadsheet, Download, Printer, CheckCircle, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface RelatorioRapidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalRecebido: number;
  totalGasto: number;
}

export const RelatorioRapidoModal: React.FC<RelatorioRapidoModalProps> = ({
  isOpen,
  onClose,
  totalRecebido,
  totalGasto,
}) => {
  if (!isOpen) return null;

  const saldo = totalRecebido - totalGasto;
  const margem = totalRecebido > 0 ? Math.round((saldo / totalRecebido) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#003d9b] text-white flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Relatório Rápido Executivo</h3>
              <p className="text-xs text-slate-400">Resumo financeiro instantâneo do período atual.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 my-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
            <span className="text-slate-600 font-medium">Entradas Consolidadas:</span>
            <span className="font-bold text-emerald-600 tabular-nums">{formatCurrency(totalRecebido)}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
            <span className="text-slate-600 font-medium">Despesas & Saídas:</span>
            <span className="font-bold text-rose-600 tabular-nums">{formatCurrency(totalGasto)}</span>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between">
            <span className="font-bold text-[#003d9b]">Resultado Operacional:</span>
            <span className="font-extrabold text-[#003d9b] text-sm tabular-nums">{formatCurrency(saldo)}</span>
          </div>

          <div className="flex items-center justify-between pt-2 px-1 text-slate-500">
            <span>Margem Operacional Estimada:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              {margem}%
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#003d9b] hover:bg-[#003080] rounded-lg shadow-xs cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
