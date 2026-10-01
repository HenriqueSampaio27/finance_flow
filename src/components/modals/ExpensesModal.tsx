import React, { useState } from 'react';
import { X, Plus, FlaskRound } from 'lucide-react';
import { ExpenseItem } from '../../types/expensesType';
import { styles } from '../../theme';
import { UserType } from '@/src/types/userType';

interface ExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: ExpenseItem) => void;
  user: UserType | undefined | null;
}

export const ExpensesModal: React.FC<ExpensesModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  user
}) => {
  const [formData, setFormData] = useState<Partial<ExpenseItem>>({
        date: "",
        amount: 0,
        supplier: "",
        category: "",
        outgoing_account: "",
        observations: "",
        installment: ""
      });
  
    const initialData = {
        date: "",
        amount: 0,
        supplier: "",
        category: "",
        outgoing_account: "",
        observation: "",
        installment: ""
      }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.date) return;

    const newExpense: ExpenseItem = {
      date: formData.date,
      amount: formData.amount,
      supplier: formData.supplier || "",
      category: formData.category || "Outros",
      outgoing_account: formData.outgoing_account || "Caixa Interno",
      observations: formData.observations || "",
      installment: formData.installment || "1/1"
    };
    
    onAddExpense(newExpense);
    setFormData(initialData)
    onClose();
  };

  const handleInputChange = (
    field: keyof ExpenseItem,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const bankAccounts = [
      user?.bank_account1,
      user?.bank_account2,
      user?.bank_account3,
      user?.bank_account4,
      user?.bank_account5,
    ].filter((account): account is string => 
      !!account && account.trim() !== ""
    );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Nova Saída Financeira</h3>
              <p className="text-xs text-slate-400">Registre uma despesa, custo ou pagamento a fornecedor.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form     className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Data</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
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
                value={formData.amount}
                onChange={(e) => handleInputChange("amount",e.target.value)}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Fornecedor / Favorecido</label>
            <input
              type="text"
              placeholder="Ex: Amazon Web Services"
              value={formData.supplier}
              onChange={(e) => handleInputChange("supplier" ,e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category" ,e.target.value)}
                className={styles.input}
              >
                <option>Cloud Services</option>
                <option>Infraestrutura</option>
                <option>Marketing</option>
                <option>Materiais</option>
                <option>Software</option>
                <option>Outros</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Conta de Saída</label>
              <select
                value={formData.outgoing_account}
                onChange={(e) => handleInputChange("outgoing_account", e.target.value)}
                className={styles.input}
              >
                  {bankAccounts.map((account, index) => (
                    <option key={index} value={account}>
                      {account}
                    </option>
                  ))}

                  <option value="Caixa Interno">
                    Caixa Interno
                  </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Observações</label>
            <input
              type="text"
              placeholder="Ex: Fatura mensal referente a servidores"
              value={formData.observations}
              onChange={(e) => handleInputChange("observations", e.target.value)}
              className={styles.input}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Parcelas</label>
            <input
              type="text"
              placeholder="1/5"
              value={formData.installment}
              onChange={(e) => handleInputChange("installment", e.target.value)}
              className={styles.input}
            />
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
              onClick={handleSubmit}
              className={styles.primaryButton}
            >
              Salvar Saída
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
