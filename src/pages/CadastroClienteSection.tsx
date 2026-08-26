import React, { useState } from 'react';
import { 
  User, 
  Users, 
  Contact, 
  MapPin, 
  BadgeDollarSign, 
  Search, 
  ChevronRight, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { ClientItem } from '../types/clientType';
import { clientsTheme, styles, typography } from '../theme';

interface CadastroClienteSectionProps {
  clients: ClientItem[];
  onSaveClient: (client: ClientItem) => void;
  onSelectClient?: (client: ClientItem) => void;
}

export const CadastroClienteSection: React.FC<CadastroClienteSectionProps> = ({
  clients,
  onSaveClient,
  onSelectClient,
}) => {
  const [formData, setFormData] = useState<Partial<ClientItem>>({
    id: 0,
    name: "",
    cpf: "",
    phone: "",
    address: "",
    district: "",
    number: "",
    city: "",
    state: "",
    zip_code: "",
    email: "",
    state_registration: "",
    observation: "",
    complement: ""
  });

  const [searchSaved, setSearchSaved] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const handleInputChange = (field: keyof ClientItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCepLookup = async () => {
    const rawCep = formData.zip_code?.replace(/\D/g, '');
    if (!rawCep || rawCep.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: data.address || prev.address,
          district: data.district || prev.district,
          city: data.city || prev.city,
          state: data.state || prev.state,
        }));
      }
    } catch (e) {
      console.warn('CEP lookup failed, manual entry permitted.');
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newClient: ClientItem = {
      name: formData.name || 'Novo Cliente',
      cpf: formData.cpf || '000.000.000-00',
      state_registration: formData.state_registration || '',
      email: formData.email || '',
      phone: formData.phone || '',
      zip_code: formData.zip_code || '',
      address: formData.address || '',
      number: formData.number || '',
      complement: formData.complement || '',
      district: formData.district || '',
      city: formData.city || 'Santa Inês',
      state: formData.state || 'MA',
      observation: formData.observation || '',
    };

    onSaveClient(newClient);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setFormData({
        id: 0,
        name: "",
        cpf: "",
        phone: "",
        address: "",
        district: "",
        number: "",
        city: "",
        state: "",
        zip_code: "",
        email: "",
        state_registration: "",
        observation: "",
        complement: ""
      });
    }, 1500);
  };

  const handleSelectRecent = (client: ClientItem) => {
    setFormData(client);
    if (onSelectClient) onSelectClient(client);
  };

  const filteredRecent = clients.filter(c => 
    c.name.toLowerCase().includes(searchSaved.toLowerCase()) || 
    c.cpf.includes(searchSaved)
  );

  return (
    <div className={styles.pageContainer}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={typography.headings.pageTitle}>{clientsTheme.header.title}</h1>
          <p className={typography.headings.pageSubtitle}>{clientsTheme.header.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFormData({})}
            className={styles.secondaryButton}
          >
            {clientsTheme.header.cancelLabel}
          </button>
          <button
            id="btn-salvar-cliente"
            type="submit"
            onClick={handleSubmit}
            className={styles.primaryButton}
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Salvo com Sucesso!</span>
              </>
            ) : (
              <span>{clientsTheme.header.saveLabel}</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Form + Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Dados Gerais */}
          <div className={styles.cardPadded}>
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold text-sm">
              <User className="w-4 h-4 text-[#003d9b]" />
              <span>Dados Gerais</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nome / Razão Social <span className="text-rose-500">*</span>
                </label>
                <input
                  id="client-name-input"
                  type="text"
                  placeholder="Ex: Tech Solutions Ltda"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    CPF / CNPJ
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.cpf || ''}
                    onChange={(e) => handleInputChange('cpf', e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Inscrição Estadual
                  </label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={formData.state_registration || ''}
                    onChange={(e) => handleInputChange('state_registration', e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Contato */}
          <div className={styles.cardPadded}>
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold text-sm">
              <Contact className="w-4 h-4 text-[#003d9b]" />
              <span>Contato</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  E-mail Principal
                </label>
                <input
                  type="email"
                  placeholder="contato@empresa.com.br"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="(11) 90000-0000"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Endereço */}
          <div className={styles.cardPadded}>
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold text-sm">
              <MapPin className="w-4 h-4 text-[#003d9b]" />
              <span>Endereço</span>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    CEP
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="00000-000"
                      value={formData.zip_code || ''}
                      onChange={(e) => handleInputChange('zip_code', e.target.value)}
                      onBlur={handleCepLookup}
                      className={styles.input}
                    />
                    <button
                      type="button"
                      onClick={handleCepLookup}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Buscar CEP"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="sm:col-span-8">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Logradouro
                  </label>
                  <input
                    type="text"
                    placeholder="Rua/Avenida"
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Número</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={formData.number || ''}
                    onChange={(e) => handleInputChange('number', e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Complemento</label>
                  <input
                    type="text"
                    placeholder="Sala/Apto"
                    value={formData.complement || ''}
                    onChange={(e) => handleInputChange('complement', e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Bairro</label>
                  <input
                    type="text"
                    placeholder="Centro"
                    value={formData.district || ''}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cidade</label>
                  <input
                    type="text"
                    placeholder="São Paulo"
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">UF</label>
                  <select
                    value={formData.state || 'MA'}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={styles.input}
                  >
                    <option value="MA">MA</option>
                    <option value="SP">SP</option>
                    <option value="RJ">RJ</option>
                    <option value="MG">MG</option>
                    <option value="PR">PR</option>
                    <option value="RS">RS</option>
                    <option value="SC">SC</option>
                    <option value="BA">BA</option>
                    <option value="PE">PE</option>
                    <option value="DF">DF</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Dados Financeiros */}
          <div className={styles.cardPadded}>
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold text-sm">
              <BadgeDollarSign className="w-4 h-4 text-[#003d9b]" />
              <span>Dados Financeiros</span>
            </div>
            <div className="space-y-4">

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Observações
                </label>
                <textarea
                  rows={3}
                  placeholder="Anotações internas sobre o cliente..."
                  value={formData.observation || ''}
                  onChange={(e) => handleInputChange('observation', e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Clientes Recentes (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between h-full min-h-[500px]">
            <div>
              <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold text-sm">
                <Users className="w-4 h-4 text-slate-500" />
                <span>{clientsTheme.recentClients.title}</span>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={clientsTheme.recentClients.searchPlaceholder}
                  value={searchSaved}
                  onChange={(e) => setSearchSaved(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* Client List */}
              <div className="divide-y divide-slate-100">
                {filteredRecent.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectRecent(c)}
                    className="w-full py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-[#003d9b] font-bold text-xs flex items-center justify-center">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 group-hover:text-[#003d9b]">
                          {c.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {c.cpf}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert(`Total de ${clients.length} clientes cadastrados na base FinanceFlow.`)}
              className="w-full py-2 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors mt-6 cursor-pointer"
            >
              {clientsTheme.recentClients.viewAllLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
