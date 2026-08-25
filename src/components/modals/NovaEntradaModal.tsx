import React, { useState } from 'react';
import { X, Plus, DollarSign } from 'lucide-react';
import { EntryItem, StatusRecebimento } from '../../types';
import { styles } from '../../theme';

interface NovaEntradaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEntry: (entry: EntryItem) => void;
}

export const NovaEntradaModal: React.FC<NovaEntradaModalProps> = ({
  isOpen,
  onClose,
  onAddEntry,
}) => {
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('SERVIÇOS');
  const [cliente, setCliente] = useState('Tech Solutions Ltda');
  const [recebimento, setRecebimento] = useState('PIX Instantâneo');
  const [conta, setConta] = useState('Itaú PJ');
  const [valor, setValor] = useState('');
  const [status, setStatus] = useState<StatusRecebimento>('Recebido');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor) return;

    const newEntry: EntryItem = {
      id: `ent-${Date.now()}`,
      data: data.split('-').reverse().join('/'),
      descricao,
      categoria,
      cliente,
      recebimento,
      conta,
      valor: parseFloat(valor.replace(',', '.')) || 0,
      status,
    };

    onAddEntry(newEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Nova Entrada Financeira</h3>
              <p className="text-xs text-slate-400">Registre uma nova receita ou faturamento.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Data</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className={styles.input}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Descrição</label>
            <input
              type="text"
              placeholder="Ex: Consultoria em TI - Fatura 891"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Categoria</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className={styles.input}
              >
                <option>SERVIÇOS</option>
                <option>MANUTENÇÃO</option>
                <option>PRODUTOS</option>
                <option>OUTROS</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Cliente</label>
              <input
                type="text"
                placeholder="Ex: Nexus Corp"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Recebimento</label>
              <select
                value={recebimento}
                onChange={(e) => setRecebimento(e.target.value)}
                className={styles.input}
              >
                <option>PIX Instantâneo</option>
                <option>Boleto Bancário</option>
                <option>Cartão de Crédito</option>
                <option>TED/DOC</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Conta de Destino</label>
              <select
                value={conta}
                onChange={(e) => setConta(e.target.value)}
                className={styles.input}
              >
                <option>Itaú PJ</option>
                <option>NuBank PJ</option>
                <option>Caixa Interno</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
            <div className="flex gap-4">
              {(['Recebido', 'Pendente', 'Atrasado'] as StatusRecebimento[]).map((st) => (
                <label key={st} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === st}
                    onChange={() => setStatus(st)}
                    className="text-[#003d9b] focus:ring-[#003d9b]"
                  />
                  <span>{st}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={styles.secondaryButton}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
            >
              Salvar Entrada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
