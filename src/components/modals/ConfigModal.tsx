import React, { useEffect, useState } from 'react';
import { X, Plus, Settings } from 'lucide-react';
import { UserType } from '../../types/userType';
import { styles } from '../../theme';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null | undefined
  onUpdate: (save: UserType) => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate
}) => {
    
  const [formData, setFormData] = useState<Partial<UserType>>({
    name: "",
    cpf: "",
    address: "",
    district: "",
    city: "",
    number: "",
    state: "",
    zip_code: "",
    credit_fee: 0,
    bank_account1: "",
    bank_account2: "",
    bank_account3: "",
    bank_account4: "",
    bank_account5: "",
    pix_fee: 0,
    debit_fee: 0
  });

  useEffect(() => {
        if (user) {
            setFormData({
            name: user.name,
            cpf: user.cpf,
            address: user.address,
            district: user.district,
            city: user.city,
            number: user.number,
            state: user.state,
            zip_code: user.zip_code,
            credit_fee: user.credit_fee,
            bank_account1: user.bank_account1 || "",
            bank_account2: user.bank_account2 || "",
            bank_account3: user.bank_account3 || "",
            bank_account4: user.bank_account4 || "",
            bank_account5: user.bank_account5 || "",
            pix_fee: user.pix_fee,
            debit_fee: user.debit_fee,
            });
        }
        }, [user]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) return;

    const newUser: UserType = {
      name: formData.name,
      cpf: formData.cpf || "",
      address: formData.address || "",
      district: formData.district || "",
      city: formData.city || "",
      number: formData.number || "",
      state: formData.state || "",
      zip_code: formData.zip_code || "",
      credit_fee: formData.credit_fee || 0,
      bank_account1: formData.bank_account1 || "",
      bank_account2: formData.bank_account2 || "",
      bank_account3: formData.bank_account3 || "",
      bank_account4: formData.bank_account4 || "",
      bank_account5: formData.bank_account5 || "",
      pix_fee: formData.pix_fee || 0,
      debit_fee: formData.debit_fee || 0
    };

    onUpdate(newUser);
    onClose();
  };

  const handleCepSearch = async () => {
    const cep = formData.zip_code?.replace(/\D/g, "");

    if (!cep || cep.length !== 8) {
        return;
    }

    try {
        const response = await fetch(
        `https://viacep.com.br/ws/${cep}/json/`
        );

        const data = await response.json();

        if (data.erro) {
        alert("CEP não encontrado.");
        return;
        }

        setFormData((prev) => ({
        ...prev,
        address: data.logradouro || "",
        district: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
        }));

    } catch (error) {
        console.error("Erro ao consultar CEP:", error);
        alert("Não foi possível consultar o CEP.");
    }
    };

  const handleInputChange = (
    field: keyof UserType,
    value: string | number
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">

      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">

          <div className="flex items-center gap-2">

            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-gray-600 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Configurações
              </h3>

              <p className="text-xs text-slate-400">
                Configurações do usuário
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NOME / CPF */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nome
              </label>

              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  handleInputChange("name", e.target.value)
                }
                className={styles.input}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                CPF
              </label>

              <input
                type="text"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) =>
                  handleInputChange("cpf", e.target.value)
                }
                className={styles.input}
              />
            </div>

          </div>

          {/* ENDEREÇO */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Endereço
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                handleInputChange("address", e.target.value)
              }
              className={styles.input}
            />
          </div>

          {/* BAIRRO / NÚMERO */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Bairro
              </label>

              <input
                type="text"
                value={formData.district}
                onChange={(e) =>
                  handleInputChange("district", e.target.value)
                }
                className={styles.input}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Número
              </label>

              <input
                type="text"
                value={formData.number}
                onChange={(e) =>
                  handleInputChange("number", e.target.value)
                }
                className={styles.input}
              />
            </div>

          </div>

          {/* CIDADE / ESTADO / CEP */}
          <div className="grid grid-cols-3 gap-4">

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Cidade
              </label>

              <input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  handleInputChange("city", e.target.value)
                }
                className={styles.input}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Estado
              </label>

              <input
                type="text"
                maxLength={2}
                placeholder="UF"
                value={formData.state}
                onChange={(e) =>
                  handleInputChange(
                    "state",
                    e.target.value.toUpperCase()
                  )
                }
                className={styles.input}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                CEP
              </label>

              <input
                type="text"
                placeholder="00000-000"
                value={formData.zip_code}
                onChange={(e) =>
                  handleInputChange("zip_code", e.target.value)
                }
                className={styles.input}
                onBlur={handleCepSearch}
              />
            </div>

          </div>

          {/* TAXAS */}
          <div className="pt-3 border-t border-slate-100">

            <p className="text-xs font-bold text-slate-700 mb-3">
              Taxas de pagamento
            </p>

            <div className="grid grid-cols-3 gap-4">

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Crédito (%)
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.credit_fee ?? 0}
                  onChange={(e) =>
                    handleInputChange(
                      "credit_fee",
                      Number(e.target.value)
                    )
                  }
                  className={styles.input}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  PIX (%)
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.pix_fee ?? 0}
                  onChange={(e) =>
                    handleInputChange(
                      "pix_fee",
                      Number(e.target.value)
                    )
                  }
                  className={styles.input}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Débito (%)
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.debit_fee ?? 0}
                  onChange={(e) =>
                    handleInputChange(
                      "debit_fee",
                      Number(e.target.value)
                    )
                  }
                  className={styles.input}
                />
              </div>

            </div>

          </div>

          {/* CONTAS BANCÁRIAS */}
          <div className="pt-3 border-t border-slate-100">

            <p className="text-xs font-bold text-slate-700 mb-3">
              Contas bancárias
            </p>

            <div className="grid grid-cols-2 gap-4">

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Conta bancária 1
                </label>

                <input
                  type="text"
                  value={formData.bank_account1}
                  onChange={(e) =>
                    handleInputChange(
                      "bank_account1",
                      e.target.value
                    )
                  }
                  className={styles.input}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Conta bancária 2
                </label>

                <input
                  type="text"
                  value={formData.bank_account2}
                  onChange={(e) =>
                    handleInputChange(
                      "bank_account2",
                      e.target.value
                    )
                  }
                  className={styles.input}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Conta bancária 3
                </label>

                <input
                  type="text"
                  value={formData.bank_account3}
                  onChange={(e) =>
                    handleInputChange(
                      "bank_account3",
                      e.target.value
                    )
                  }
                  className={styles.input}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Conta bancária 4
                </label>

                <input
                  type="text"
                  value={formData.bank_account4}
                  onChange={(e) =>
                    handleInputChange(
                      "bank_account4",
                      e.target.value
                    )
                  }
                  className={styles.input}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Conta bancária 5
                </label>

                <input
                  type="text"
                  value={formData.bank_account5}
                  onChange={(e) =>
                    handleInputChange(
                      "bank_account5",
                      e.target.value
                    )
                  }
                  className={styles.input}
                />
              </div>

            </div>

          </div>

          {/* BOTÕES */}
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
              Salvar Configurações
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};