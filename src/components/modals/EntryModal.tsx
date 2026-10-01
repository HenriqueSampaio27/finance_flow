import React, { useEffect, useRef, useState } from "react";
import { X, Plus, DollarSign } from 'lucide-react';
import { EntryItem } from '../../types/entryType';
import { styles } from '../../theme';
import { UserType } from '@/src/types/userType';
import {ClientItem} from '@/src/types/clientType'

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEntry: (entry: EntryItem) => void;
  user: UserType | null
  client: ClientItem[]
}

export const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  onClose,
  onAddEntry,
  user,
  client
}) => {
  const clientDropdownRef = useRef<HTMLDivElement>(null);
  const [showClients, setShowClients] = useState(false);
  const [errorClient, setErrorClient] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<ClientItem | null>(null);
  const [formData, setFormData] = useState<Partial<EntryItem>>({
      date: "",
      description: "",
      amount: 0,
      category: "",
      client_id: null,
      destination_account: "",
      fee: 0,
      receipt: "",
      installment: "",
    });

  const initialData = {
      date: "",
      description: "",
      amount: 0,
      category: "",
      client_id: null,
      destination_account: "",
      fee: 0,
      receipt: "",
      installment: "",
    }
    
    useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        clientDropdownRef.current &&
        !clientDropdownRef.current.contains(event.target as Node)
      ) {
        setShowClients(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  const feeToCheck = (receipt: string) => {
      if (!user) return 0;
      let fee = 0;

      if (receipt === "PIX") {
        fee = user.pix_fee | 0;
      } else if (receipt === "Cartão de Crédito") {
        fee = user.credit_fee | 0;
      } else if (receipt === "Cartão de Débito") {
        fee = user.debit_fee | 0;
      }else{
        fee = 0;
      }

      
      setFormData(prev => ({
        ...prev,
        fee
      }));
      
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;
    if(!clienteSelecionado && errorClient == ""){
      setErrorClient("Selecione um cliente da lista.");
      return;
    }

      const newEntry: EntryItem = {
      date: formData.date || "",
      description: formData.description ||"",
      amount: formData.amount ||0,
      category: formData.category || "SERVIÇOS",
      client_id: clienteSelecionado?.id || null,
      destination_account: formData.destination_account || "Caixa Interno",
      fee: formData.fee || 0,
      receipt: formData.receipt || "Espécie",
      installment: formData.installment || "1/1",
      };

      onAddEntry(newEntry);
      setFormData(initialData)
      setClienteSelecionado(null)
      setErrorClient("")
      onClose();

  };

  const handleInputChange = (
      field: keyof EntryItem,
      value: string | number
    ) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const filteredClients = client.filter((client: ClientItem) =>
      client.name
        .toLowerCase()
        .includes(clientSearch.toLowerCase())
    );

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

        <form onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          className="space-y-4">
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
                onChange={(e) => handleInputChange("amount", e.target.value)}
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
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className={styles.input}
              >
                <option>SERVIÇOS</option>
                <option>MANUTENÇÃO</option>
                <option>PRODUTOS</option>
                <option>OUTROS</option>
              </select>
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Cliente
              </label>

              <input
                type="text"
                placeholder="Digite o nome do cliente"
                value={clientSearch}
                onFocus={() => setShowClients(true)}
                onChange={(e) => {
                  setErrorClient("");
                  setClientSearch(e.target.value);
                  setShowClients(true);
                }}
                className={styles.input}
              />

              {errorClient && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {errorClient}
                  </p>
                )}

              {showClients && (
                <div ref={clientDropdownRef} className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client: ClientItem) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => {
                          if(!client.id) return 0
                          setClienteSelecionado(client)
                          setClientSearch(client.name);

                          handleInputChange(
                            "client_id",
                            client.id
                          );

                          setShowClients(false);
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="text-sm font-medium text-slate-800">
                          {client.name}
                        </div>

                        {client.cpf && (
                          <div className="text-xs text-slate-400">
                            {client.cpf}
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-sm text-slate-400">
                      Nenhum cliente encontrado
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Recebimento</label>
              <select
                value={formData.receipt}
                onChange={(e) => {
                    const receipt = e.target.value;
                    feeToCheck(receipt)
                    handleInputChange("receipt", e.target.value)
                  }}
                className={styles.input}
              >
                <option>PIX</option>
                <option>Boleto Bancário</option>
                <option>Cartão de Crédito</option>
                <option>Cartão de Débito</option>
                <option>Espécie</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Conta de Destino</label>
              <select
                value={formData.destination_account}
                onChange={(e) =>
                  handleInputChange("destination_account", e.target.value)
                }
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
            <label className="block text-xs font-semibold text-slate-600 mb-1">Parcela</label>
            <div className="flex grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Ex: 1/4"
                    value={formData.installment}
                    onChange={(e) => handleInputChange("installment", e.target.value)}
                    className={styles.input}
                  />
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
              onClick={handleSubmit}
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
