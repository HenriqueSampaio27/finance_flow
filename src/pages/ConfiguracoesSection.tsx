import React, { useState } from 'react';
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
  Ruler
} from 'lucide-react';

export const ConfiguracoesSection: React.FC = () => {
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

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
              Dados da Empresa (Raynex Solutions)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nome Fantasia</label>
              <input
                type="text"
                value={empresa.nome}
                onChange={e => setEmpresa({ ...empresa, nome: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Razão Social</label>
              <input
                type="text"
                value={empresa.razaoSocial}
                onChange={e => setEmpresa({ ...empresa, razaoSocial: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">CNPJ</label>
              <input
                type="text"
                value={empresa.cnpj}
                onChange={e => setEmpresa({ ...empresa, cnpj: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Telefone Comercial</label>
              <input
                type="text"
                value={empresa.telefone}
                onChange={e => setEmpresa({ ...empresa, telefone: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">E-mail Comercial</label>
              <input
                type="email"
                value={empresa.email}
                onChange={e => setEmpresa({ ...empresa, email: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Endereço e Cidade</label>
              <input
                type="text"
                value={`${empresa.endereco} - ${empresa.cidade}`}
                onChange={e => setEmpresa({ ...empresa, endereco: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20"
              />
            </div>
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
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                Portas de Vidro • Janelas • Boxes de Banheiro • Portões de Ferro
              </div>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Texto Padrão de Garantia nas Apresentações</label>
              <textarea
                rows={2}
                value={empresa.garantiaPadrao}
                onChange={e => setEmpresa({ ...empresa, garantiaPadrao: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20"
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
