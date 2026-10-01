import React, {useRef} from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  Building2, 
  Layers, 
  Calendar, 
  User, 
  Phone, 
  Sparkles,
  Maximize2
} from 'lucide-react';
import { Projeto2D } from '../../types/projetos2d';
import { Estrutura2DRenderer } from '../projetos2D/Estrutura2DRenderer';
import { formatCurrency } from '../../utils/formatters';
import { title } from '@/src/types/titleFinanceFlow';
import { ClientItem } from '@/src/types';
import { gerarProjetoPDF } from '../projetos2D/PdfProjeto2D';

interface ApresentacaoClienteModalProps {
  isOpen: boolean;
  client? : ClientItem;
  onClose: () => void;
  projeto: Projeto2D;
}

export const ApresentacaoClienteModal: React.FC<ApresentacaoClienteModalProps> = ({
  isOpen,
  onClose,
  projeto,
  client
}) => {
  if (!isOpen) return null;

  // const handlePrint = () => {
  //   window.print();
  // };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'porta-vidro': return 'Porta de Vidro';
      case 'janela': return 'Janela de Vidro/Alumínio';
      case 'box-banheiro': return 'Box de Banheiro';
      case 'portao-ferro': return 'Portão de Alumínio';
      case 'porta-aluminio' : return 'Porta de Alumínio'
      default: return tipo;
    }
  };

  const getCorVidroLabel = (cor: string) => {
    switch (cor) {
      case 'incolor': return 'Vidro Incolor Cristal';
      case 'fume': return 'Vidro Fumê Especial';
      case 'verde': return 'Vidro Verde Temperado';
      case 'bronze': return 'Vidro Bronze Refletivo';
      case 'jateado': return 'Vidro Fosco / Jateado';
      default: return cor;
    }
  };

  const getCorPerfilLabel = (cor: string) => {
    switch (cor) {
      case 'preto': return 'Alumínio Preto Fosco (Black)';
      case 'branco': return 'Alumínio Branco Neve';
      case 'inox': return 'Aço Inox Escovado';
      case 'bronze': return 'Alumínio Bronze Nobre';
      case 'dourado': return 'Gold Dourado Especial';
      default: return cor;
    }
  };

  const areaTotal = (projeto.width * projeto.height).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Action Bar (Non-printable) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Modo de Apresentação ao Cliente
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                gerarProjetoPDF({
                  projeto,
                  client,
                  modo: 'open'
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Imprimir Proposta</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          className="overflow-y-auto p-8 space-y-6"
          style={{
            backgroundColor: '#ffffff',
            color: '#1e293b',
          }}
        >
          {/* Header Raynex Solutions Brand */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#003d9b] flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                R
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    {title}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#003d9b] border border-blue-200">
                    Vidros & Esquadrias
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Projetos personalizados • Portas de vidro, janelas, boxes e portões
                </p>
              </div>
            </div>

            <div className="sm:text-right text-xs text-slate-600">
              <p className="font-semibold text-slate-900">Proposta Técnica Comercial</p>
              <p className="text-slate-500">Emitido em: {new Date(projeto.updated_at).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}</p>
              <p className="text-[#003d9b] font-medium font-mono">Ref: #{projeto.id}</p>
            </div>
          </div>

          {/* Client & Project Info Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Projeto
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {projeto.name}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Cliente
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {client?.name ?? 'Cliente Particular'}
              </p>

              {client?.phone && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {client.phone}
                </p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Dimensões Gerais
              </span>
              <p className="text-sm font-bold text-[#003d9b] mt-0.5">
                {projeto.width.toFixed(2)}m (L) × {projeto.height.toFixed(2)}m (A)
              </p>
              <p className="text-xs text-slate-500">
                Área: {areaTotal} m²
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Investimento Estimado
              </span>
              <p className="text-sm font-bold text-emerald-700 mt-0.5">
                {formatCurrency(projeto.estimated_value || 0)}
              </p>
              <span className="text-[10px] text-slate-400">
                Material + Instalação
              </span>
            </div>

            {/* Endereço do cliente */}
            <div className="sm:col-span-2 md:col-span-4 pt-3 border-t border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Endereço de Instalação
              </span>

              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {client
                  ? `${client.address || ''}${client.number ? `, ${client.number}` : ''}${client.complement ? ` - ${client.complement}` : ''}`
                  : 'Cliente Particular'}
              </p>

              {client && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {client.district && `${client.district} • `}
                  {client.city && `${client.city}`}
                  {client.state && ` - ${client.state}`}
                  {client.zip_code && ` • CEP: ${client.zip_code}`}
                </p>
              )}
            </div>

          </div>

          {/* Center 2D Drawing Area */}
          <div className="p-6 bg-slate-100/50 rounded-2xl border border-slate-200/90 flex flex-col items-center justify-center min-h-[360px]">
            <Estrutura2DRenderer
              tipo={projeto.type}
              modelo={projeto.model}
              largura={projeto.width}
              altura={projeto.height}
              corVidro={projeto.glass_color}
              corPerfil={projeto.profile_color}
              puxador={projeto.handle}
              showDimensions={true}
              showGrid={false}
              showReflections={true}
              className="w-full max-w-xl"
              grid={projeto.grid}
              door={projeto.door}
            />
          </div>

          {/* Detailed Technical Specifications Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#003d9b]" />
                Especificações dos Materiais
              </h3>
              <ul className="text-xs space-y-1.5 text-slate-600">
                <li className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Estrutura:</span>
                  <span className="font-semibold text-slate-800">{getTipoLabel(projeto.type)}</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Modelo Selecionado:</span>
                  <span className="font-semibold text-slate-800">{projeto.model}</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">Vidro / Chapa:</span>
                  <span className="font-semibold text-slate-800">{getCorVidroLabel(projeto.glass_color)} ({projeto.glass_thickness || 'Temperado'})</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500">Perfil / Ferragens:</span>
                  <span className="font-semibold text-slate-800">{getCorPerfilLabel(projeto.profile_color)}</span>
                </li>
              </ul>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-2 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Observações e Garantia
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {projeto.notes || 'Projeto desenvolvido sob medida com vidro de segurança e perfis de alta durabilidade. Garantia de 1 ano para ferragens e vedação.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{title}</span>
                <span>Aprovação do Cliente: __________________</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500">
            Pressione Esc ou clique em Fechar para voltar ao editor.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Fechar Apresentação
          </button>
        </div>
      </div>
    </div>
  );
};
