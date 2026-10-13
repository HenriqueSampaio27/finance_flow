import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Check, 
  Save, 
  Palette, 
  Layers, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Ruler,
  Banknote,
  Trash2,
  Plus,
} from 'lucide-react';
import { title } from '../types/titleFinanceFlow';
import { styles } from '../theme';
import { Bank_account, UserType } from '../types/userType';
import { BankDate } from '../components/modals/BankDate';

interface UserModalProps {
  user: UserType | null | undefined;
  onUpdate: (save: UserType) => void;
}

export const ConfiguracoesSection: React.FC<UserModalProps> = ({
  user,
  onUpdate
}) => {
  const [empresa, setEmpresa] = useState({
    nome: 'Raynex Solutions',
    razaoSocial: 'Raynex Solutions Comércio de Esquadrias e Vidros Eireli',
    cnpj: '45.123.789/0001-90',
    telefone: '(11) 3456-7890',
    email: 'contato@raynex.com.br',
    endereco: 'Av. Industrial das Esquadrias, 1450 - Galpão 3',
    cidade: 'São Paulo - SP',
    unidadePadrao: 'm (metros)',
    garantiaPadrao: '12 meses para ferragens e vedação, 5 anos para vidro temperado'
  });

  const [formData, setFormData] = useState<UserType>({
      name: "",
      cpf: "",
      address: "",
      district: "",
      email: "",
      phone: "",
      razao: "",
      unidade_padrao: "",
      garantia_padrao: "",  
      especialidade: "",
      city: "",
      number: "",
      state: "",
      zip_code: "",
      cash_balance_initial: 0,
      pix_fee: 0,
      debit_fee: 0,
      credit_fee: 0,
    });
  
    useEffect(() => {
          if (user) {
              setFormData({
              name: user.name,
              cpf: user.cpf,
              email: user.email,
              phone: user.phone,
              razao: user.razao,
              unidade_padrao: user.unidade_padrao,
              garantia_padrao: user.garantia_padrao || '12 meses para ferragens e vedação, 5 anos para vidro temperado',  
              especialidade: user.especialidade || "Portas de Vidro • Janelas • Boxes de Banheiro • Portões de Ferro",
              address: user.address,
              district: user.district,
              city: user.city,
              number: user.number,
              state: user.state,
              zip_code: user.zip_code,
              credit_fee: user.credit_fee,
              cash_balance_initial: user.cash_balance_initial,
              pix_fee: user.pix_fee,
              debit_fee: user.debit_fee,
              });
          }
          }, [user]);
  

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

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 14);

    if (numbers.length <= 11) {
      // CPF: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    // CNPJ: 00.000.000/0000-00
    return numbers
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);

    if (numbers.length <= 2) {
      return numbers.length ? `(${numbers}` : "";
    }

    if (numbers.length <= 6) {
      return numbers.replace(/^(\d{2})(\d+)/, "($1) $2");
    }

    if (numbers.length <= 10) {
      return numbers.replace(/^(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
    }

    return numbers.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  };

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData)
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="pb-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Configurações do Sistema
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie os dados da empresa, parâmetros do módulo Projetos 2D e modelos de proposta.
          </p>
        </div>

        {saved && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            Configurações salvas!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Dados da Empresa */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-[#003d9b]" />
            <h2 className="text-sm font-bold text-slate-900">
              Dados da Empresa ({title})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nome Fantasia</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Razão Social</label>
              <input
                type="text"
                value={formData.razao}
                onChange={e => setFormData({ ...formData, razao: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                CNPJ/CPF
              </label>

              <input
                type="text"
                value={formData.cpf}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cpf: formatCpfCnpj(e.target.value),
                  })
                }
                placeholder="CPF ou CNPJ"
                maxLength={18}
                className={styles.input}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Telefone Comercial
              </label>

              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: formatPhone(e.target.value),
                  })
                }
                placeholder="(99) 99999-9999"
                maxLength={15}
                className={styles.input}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">E-mail Comercial</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className={styles.input}
              />
            </div>
            
            <div className="col-span-full flex items-center gap-2.5 pt-2 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                Endereço
              </h3>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">CEP</label>
              <input
                type="text"
                value={formData.zip_code}
                onChange={e => setFormData({ ...formData, zip_code: e.target.value })}
                className={styles.input}
                onBlur={handleCepSearch}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Logradouro</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Bairro</label>
              <input
                type="text"
                value={formData.district}
                onChange={e => setFormData({ ...formData, district: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Número</label>
              <input
                type="text"
                value={formData.number}
                onChange={e => setFormData({ ...formData, number: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Cidade</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">UF</label>
              <input
                type="text"
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
                className={styles.input}
              />
            </div>


          </div>
        </div>

          {/* DADOS BANCÁRIOS */}
          <BankDate/>
          {/* CAIXA INTERNO */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <Banknote className="h-5 w-5 text-emerald-600" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Caixa Interno
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Dinheiro disponível em espécie na empresa.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Saldo Inicial (R$)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.cash_balance_initial ?? 0}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cash_balance_initial:
                      e.target.value === "" ? 0 : Number(e.target.value),
                  }))
                }
                className={styles.input}
                placeholder="0,00"
              />

              <p className="text-xs text-slate-500">
                Informe o saldo inicial em dinheiro utilizado no controle financeiro.
              </p>
            </div>
          </div>

        {/* Parâmetros do Módulo Projetos 2D */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Ruler className="w-5 h-5 text-[#003d9b]" />
            <h2 className="text-sm font-bold text-slate-900">
              Parâmetros do Módulo Projetos 2D
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Unidade de Medida Padrão</label>
              <input
                type="text"
                disabled
                value="Metros (m)"
                className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-slate-600 font-semibold cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400">Padronizado para apresentação visual simplificada ao cliente.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Áreas de Especialidade Ativas</label>
              <input
                type="text"
                value={formData.especialidade}
                onChange={e => setFormData({ ...formData, especialidade: e.target.value })}
                className={styles.input}
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Texto Padrão de Garantia nas Apresentações</label>
              <textarea
                rows={2}
                value={formData.garantia_padrao}
                onChange={e => setFormData({ ...formData, garantia_padrao: e.target.value })}
                className={styles.input}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#003d9b] hover:bg-[#003080] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Configurações</span>
          </button>
        </div>
      </form>
    </div>
  );
};
