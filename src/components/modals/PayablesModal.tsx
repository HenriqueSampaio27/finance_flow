import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { PayableItem } from '../../types/payablesType';
import { styles } from '../../theme';
import { UserType } from '@/src/types/userType';

interface PayableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPayable: (expense: PayableItem) => void;
  user: UserType | undefined | null;
}

export const PayableModal: React.FC<PayableModalProps> = ({
  isOpen,
  onClose,
  onAddPayable,
  user
}) => {
  const [formData, setFormData] = useState<Partial<PayableItem>>({
        date: "",
        amount: 0,
        supplier: "",
        category: "",
        outgoing_account: "",
        observation: "",
        installment_total: 1,
        installment_number: 1,
        installment_interval: 30,
        status: "PENDENTE"
      });
  
    const initialData = {
        date: "",
        amount: 0,
        supplier: "",
        category: "",
        outgoing_account: "",
        observation: "",
        installment_total: 1,
        installment_number: 1,
        installment_interval: 30,
        status: "PENDENTE"
      }

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.date) return;

    const newPayable: PayableItem = {
      date: formData.date,
      amount: formData.amount,
      supplier: formData.supplier || "",
      category: formData.category || "Outros",
      outgoing_account: formData.outgoing_account || "Caixa Interno",
      observation: formData.observation || "",
      installment_total: formData.installment_total || 1,
      installment_number: 1,
      installment_interval:30,
      status: formData.status || "PENDENTE"
    };
    
    onAddPayable(newPayable);
    setFormData(initialData)
    onClose();
  };

  const handleInputChange = (
    field: keyof PayableItem,
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
              <label className="block text-xs font-semibold text-slate-600 mb-1">Data Pagamento</label>
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
              value={formData.observation}
              onChange={(e) => handleInputChange("observation", e.target.value)}
              className={styles.input}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
            Parcelas
            </label>

            <input
            type="number"
            min="1"
            value={formData.installment_total ?? 1}
            onChange={(e) =>
                handleInputChange(
                "installment_total",
                Number(e.target.value)
                )
            }
            className={styles.input}
            placeholder="Ex: 3"
            />
            </div>

            {Number(formData.installment_total) > 1 && (
                <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Intervalo entre parcelas
                    </label>

                    <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min="1"
                        value={formData.installment_interval ?? 30}
                        onChange={(e) =>
                        handleInputChange(
                            "installment_interval",
                            Number(e.target.value)
                        )
                        }
                        className={styles.input}
                        placeholder="Ex: 30"
                    />

                    <span className="text-sm text-slate-500">
                        dias
                    </span>
                    </div>
                </div>
                )}

            <div className="flex gap-5">
                {["Pendente", "Pago"].map((status) => (
                    <label
                    key={status}
                    className="flex items-center gap-2 cursor-pointer"
                    >
                    <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={formData.status === status}
                        onChange={(e) =>
                        handleInputChange("status", e.target.value)
                        }
                        className="w-4 h-4"
                    />

                    <span className="text-sm text-slate-700">
                        {status}
                    </span>
                    </label>
                ))}
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
              Salvar Conta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
