import React, { useState } from 'react';
import { 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Grid, 
  Sparkles, 
  Check, 
  ArrowLeft, 
  Download, 
  Sliders, 
  DoorClosed, 
  AppWindow, 
  Bath, 
  Fence, 
  CheckCircle2, 
  RotateCcw,
  Info,
  DoorOpen,
  DownloadCloud,
  DownloadCloudIcon,
  CloudDownload,
  DollarSign,
  DollarSignIcon,
  BadgeDollarSign,
  LucideBadgeDollarSign,
  CircleDollarSign
} from 'lucide-react';
import { 
  Projeto2D, 
  TipoProjeto, 
  CorVidro, 
  CorPerfil, 
  TipoPuxador,
  ClientItem 
} from '../../types';
import { modelosPorTipo } from '../../types/projetos2d';
import { Estrutura2DRenderer } from '../projetos2D/Estrutura2DRenderer';
import { ApresentacaoClienteModal } from './ApresentacaoClienteModal';
import { gerarProjetoPDF } from '../projetos2D/PdfProjeto2D';
import { UserType } from '@/src/types/userType';


interface SettingProjectModal{
    clients?: ClientItem[];
    project: Projeto2D;
    onSave: (projeto: Projeto2D) => void;
    onClose: () => void;
    userName?: UserType | null
}

export const SettingProjectModal: React.FC<SettingProjectModal> = ({
    clients = [],
    project,
    onSave,
    onClose,
    userName
}) => {
    
      // Editor View State: null means gallery list, non-null means editing/creating that project
      const [editingProjeto, setEditingProjeto] = useState<Projeto2D | null>(project);
      const clientNameInitial = clients.find((client) => client.id === editingProjeto?.client_id)?.name ?? "Cliente Particular";
      const [clientName, setClientName] = useState(clientNameInitial)
      
      const [presentationProjeto, setPresentationProjeto] = useState<Projeto2D | null>(null);
      
      // Canvas visual controls
      const [canvasZoom, setCanvasZoom] = useState(1);
      const [showGrid, setShowGrid] = useState(true);
      const [showReflections, setShowReflections] = useState(true);
      const [showDimensions, setShowDimensions] = useState(true);
      const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);
      const [showGrades, setShowGrades] = useState(project.grid);
      const [showDoor, setShowDoor] = useState(project.door);

      const [valorEstimado, setValorEstimado] = useState(editingProjeto?.estimated_value || 2800);

      const handleClientChange = (nome: string) => {
        setClientName(nome);

        const cliente = clients.find((c) => c.name === nome);

        setEditingProjeto((prev) => {
            if (!prev) return prev;
            return {
            ...prev,
            client_id: cliente?.id ?? null,
            };
        });
        };

    
      // Handler to save current project in editor
      const handleSaveCurrentProject = () => {
        if (!editingProjeto) return;
    
            
        const projetoAtualizado = {
        ...editingProjeto,
        estimated_value: valorEstimado,
        updated_at: new Date().toISOString(),
        };

        setEditingProjeto(projetoAtualizado);
        onSave(projetoAtualizado);
        //console.log(projetoAtualizado)
        setSaveSuccessMessage(true);
        setTimeout(() => setSaveSuccessMessage(false), 3000);
      };
    
      // Switch type inside editor
      const handleTypeChange = (newTipo: TipoProjeto) => {
        if (!editingProjeto) return;
        const defaultModel = modelosPorTipo[newTipo][0].nome;
        setEditingProjeto({
          ...editingProjeto,
          type: newTipo,
          model: defaultModel,
          width: newTipo === 'portao-ferro' ? 3.00 : newTipo === 'porta-vidro' ? 1.60 : newTipo === 'janela' ? 1.50 : 1.20,
          height: newTipo === 'janela' ? 1.20 : newTipo === 'box-banheiro' ? 1.90 : 2.10,
          handle: newTipo === 'porta-vidro' ? 'tubular-60' : newTipo === 'box-banheiro' ? 'concha' : 'nenhum'
        });
      };

      const handleGerarPDF = () => {
        if (!editingProjeto) return;

        const clienteProjeto = clients.find(
          (client: ClientItem) => client.id === editingProjeto.client_id
        );

        gerarProjetoPDF({
          projeto: editingProjeto,
          client: clienteProjeto,
          modo: 'download',
          user: userName
        });
      };
    
      const getTipoBadge = (tipo: TipoProjeto) => {
        switch (tipo) {
          case 'porta-vidro':
            return { label: 'Porta de Vidro', icon: DoorClosed, bg: 'bg-blue-50 text-[#003d9b] border-blue-200' };
          case 'janela':
            return { label: 'Janela', icon: AppWindow, bg: 'bg-sky-50 text-sky-700 border-sky-200' };
          case 'box-banheiro':
            return { label: 'Box de Banheiro', icon: Bath, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
          case 'portao-ferro':
            return { label: 'Portão de Alumínio', icon: Fence, bg: 'bg-slate-100 text-slate-800 border-slate-300' };
          case 'porta-aluminio':
            return {label: 'Porta de Alumínio', icon: DoorClosed, bg: 'bg-slate-100 text-slate-800 border-slate-300' };

        }
      };

      if (!editingProjeto) return null;

    return(
        <div className="fixed inset-0 z-[9999] bg-black/40">
        <div className="flex flex-col w-full h-full overflow-hidden bg-slate-100 select-none">
          {/* Top Bar of Editor */}
          <div className="bg-white border-b border-slate-200/90 px-6 py-3 flex items-center justify-between shrink-0 shadow-2xs z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar aos Projetos</span>
              </button>

              <div className="h-4 w-px bg-slate-200 mx-1" />

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                    {editingProjeto?.name || 'Novo Projeto 2D'}
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#003d9b] border border-blue-200">
                    {getTipoBadge(editingProjeto.type).label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Cliente: <strong className="text-slate-700">{clientName}</strong> • Dimensões: {editingProjeto.width.toFixed(2)}m × {editingProjeto.height.toFixed(2)}m ({(editingProjeto.width * editingProjeto.height).toFixed(2)} m²)
                </p>
              </div>
            </div>

            {/* Quick Actions in Top Bar */}
            <div className="flex items-center gap-2.5">
              {saveSuccessMessage && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Salvo com sucesso!
                </span>
              )}

              <button
                onClick={() => {setPresentationProjeto({...editingProjeto,
                    estimated_value: valorEstimado,
                    updated_at: new Date().toISOString()})}}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                title="Modo apresentação para o cliente"
              >
                <Eye className="w-3.5 h-3.5 text-[#003d9b]" />
                <span>Visualizar para Cliente</span>
              </button>

              <button
                onClick={handleSaveCurrentProject}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#003d9b] hover:bg-[#003080] active:scale-[0.98] rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Salvar Projeto</span>
              </button>
            </div>
          </div>

          {/* 3-Column Layout: Left Config | Center Canvas | Right Summary */}
          <div className="flex-1 flex flex-row overflow-hidden min-h-0">
            {/* ------------------------------------------------------------- */}
            {/* PAINEL LATERAL ESQUERDO: CONFIGURAÇÕES DO PROJETO             */}
            {/* ------------------------------------------------------------- */}
            <div className="w-80 lg:w-88 bg-white border-r border-slate-200/90 flex flex-col shrink-0 overflow-y-auto">
              <div className="p-5 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#003d9b]" />
                    Configurações da Estrutura
                  </h2>
                </div>

                {/* Nome do Projeto */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Nome do Projeto
                  </label>
                  <input
                    type="text"
                    value={editingProjeto.name}
                    onChange={(e) => setEditingProjeto({ ...editingProjeto, name: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20"
                    placeholder="Ex: Porta de vidro residencial"
                  />
                </div>

                {/* Seleção do Tipo de Projeto */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Tipo de Projeto
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'porta-vidro' as TipoProjeto, label: 'Porta de Vidro', icon: DoorClosed },
                      { id: 'janela' as TipoProjeto, label: 'Janela', icon: AppWindow },
                      { id: 'box-banheiro' as TipoProjeto, label: 'Box de Banheiro', icon: Bath },
                      { id: 'portao-ferro' as TipoProjeto, label: 'Portão de Ferro', icon: Fence },
                      { id: 'porta-aluminio' as TipoProjeto, label: 'Porta de Alumínio', icon: DoorOpen },
                    ].map((t) => {
                      const Icon = t.icon;
                      const isSelected = editingProjeto.type === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleTypeChange(t.id)}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#003d9b] bg-blue-50/70 text-[#003d9b] font-bold shadow-2xs'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#003d9b]' : 'text-slate-400'}`} />
                          <span className="text-[11px] leading-tight">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Seleção do Cliente */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Cliente do Projeto
                  </label>
                  <div className="relative">
                    <input
                        type="text"
                        list="clients-list"
                        value={clientName}
                        onChange={(e) => handleClientChange(e.target.value)}
                        placeholder="Selecione ou digite o cliente"
                        className="w-full rounded-lg border border-slate-300 p-2"
                        />

                        <datalist id="clients-list">
                            <option value={"Cliente Particular"} />
                        {clients.map((c) => (
                            <option key={c.id} value={c.name} />
                        ))}
                        </datalist>
                  </div>
                </div>

                {/* Dimensões Gerais (m) - Simples e sem poluição técnica */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Dimensões Gerais (m)
                    </span>
                    <span className="text-[10px] font-bold text-[#003d9b] bg-blue-100/70 px-2 py-0.5 rounded">
                      Metros (m)
                    </span>
                  </div>

                  {/* Largura (m) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Largura / Comprimento:</span>
                      <span className="font-bold text-slate-900 font-mono">{editingProjeto.width.toFixed(2)} m</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0.6}
                        max={6.0}
                        step={0.05}
                        value={editingProjeto.width}
                        onChange={(e) => setEditingProjeto({ ...editingProjeto, width: parseFloat(e.target.value) || 1 })}
                        className="flex-1 accent-[#003d9b] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                      />
                      <input
                        type="number"
                        min={0.4}
                        max={10.0}
                        step={0.05}
                        value={editingProjeto.width}
                        onChange={(e) => setEditingProjeto({ ...editingProjeto, width: Math.max(0.4, parseFloat(e.target.value) || 0.4) })}
                        className="w-16 text-center text-xs font-mono font-bold bg-white border border-slate-200 rounded py-1"
                      />
                    </div>
                  </div>

                  {/* Altura (m) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Altura Total:</span>
                      <span className="font-bold text-slate-900 font-mono">{editingProjeto.height.toFixed(2)} m</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0.6}
                        max={3.5}
                        step={0.05}
                        value={editingProjeto.height}
                        onChange={(e) => setEditingProjeto({ ...editingProjeto, height: parseFloat(e.target.value) || 1 })}
                        className="flex-1 accent-[#003d9b] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                      />
                      <input
                        type="number"
                        min={0.4}
                        max={5.0}
                        step={0.05}
                        value={editingProjeto.height}
                        onChange={(e) => setEditingProjeto({ ...editingProjeto, height: Math.max(0.4, parseFloat(e.target.value) || 0.4) })}
                        className="w-16 text-center text-xs font-mono font-bold bg-white border border-slate-200 rounded py-1"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Área Total da Superfície:</span>
                    <strong className="text-slate-800 font-mono font-bold">
                      {(editingProjeto.width * editingProjeto.height).toFixed(2)} m²
                    </strong>
                  </div>
                </div>

                {/* Seletor de Modelo Visual */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Modelo Visual da Estrutura
                  </label>
                  <select
                    value={editingProjeto.model}
                    onChange={(e) => setEditingProjeto({ ...editingProjeto, model: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20 cursor-pointer"
                  >
                    {(modelosPorTipo[editingProjeto.type] || []).map((m) => (
                      <option key={m.id} value={m.nome}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Acabamentos Rápidos: Vidro e Perfil */}
                {editingProjeto.type !== 'portao-ferro' && editingProjeto.type !== 'porta-aluminio' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Tonalidade do Vidro
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { id: 'incolor' as CorVidro, label: 'Incolor', bg: 'bg-sky-100 border-sky-300' },
                        { id: 'fume' as CorVidro, label: 'Fumê', bg: 'bg-slate-700 border-slate-800 text-white' },
                        { id: 'verde' as CorVidro, label: 'Verde', bg: 'bg-emerald-200 border-emerald-400' },
                        { id: 'bronze' as CorVidro, label: 'Bronze', bg: 'bg-amber-700 border-amber-800 text-white' },
                        { id: 'jateado' as CorVidro, label: 'Fosco', bg: 'bg-slate-100 border-slate-300' },
                      ].map((cv) => (
                        <button
                          key={cv.id}
                          type="button"
                          onClick={() => setEditingProjeto({ ...editingProjeto, glass_color: cv.id })}
                          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border text-[10px] font-medium transition-all cursor-pointer ${
                            editingProjeto.glass_color === cv.id
                              ? 'ring-2 ring-[#003d9b] font-bold shadow-2xs'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full border ${cv.bg}`} />
                          <span className="truncate">{cv.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cor do Perfil / Ferragens / Ferro */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">
                    {editingProjeto.type === 'portao-ferro' || 'porta-aluminio' ? 'Pintura do Portão' : 'Cor do Perfil / Ferragens'}
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { id: 'preto' as CorPerfil, label: 'Preto', dot: 'bg-slate-900' },
                      { id: 'branco' as CorPerfil, label: 'Branco', dot: 'bg-white border border-slate-300' },
                      { id: 'inox' as CorPerfil, label: 'Inox', dot: 'bg-slate-400' },
                      { id: 'bronze' as CorPerfil, label: 'Bronze', dot: 'bg-amber-900' },
                      { id: 'dourado' as CorPerfil, label: 'Gold', dot: 'bg-amber-500' },
                    ].map((cp) => (
                      <button
                        key={cp.id}
                        type="button"
                        onClick={() => setEditingProjeto({ ...editingProjeto, profile_color: cp.id })}
                        className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border text-[10px] font-medium transition-all cursor-pointer ${
                          editingProjeto.profile_color === cp.id
                            ? 'ring-2 ring-[#003d9b] font-bold shadow-2xs border-[#003d9b]'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full ${cp.dot}`} />
                        <span className="truncate">{cp.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Puxador (para portas e boxes) */}
                {editingProjeto.type !== 'portao-ferro' && editingProjeto.type !== 'janela' && editingProjeto.type !== 'porta-aluminio' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Puxador / Acessório
                    </label>
                    <select
                      value={editingProjeto.handle}
                      onChange={(e) => setEditingProjeto({ ...editingProjeto, handle: e.target.value as TipoPuxador })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20 cursor-pointer"
                    >
                      <option value="tubular-40">Tubular Reto 40cm</option>
                      <option value="tubular-60">Tubular Reto 60cm (Elegance)</option>
                      <option value="inox-h">Puxador Duplo Inox Tipo H</option>
                      <option value="concha">Puxador Concha Embutido</option>
                      <option value="nenhum">Sem puxador</option>
                    </select>
                  </div>
                )}

                {editingProjeto.type == 'janela' && (
                    <button
                    type="button"
                    onClick={() => {
                        setShowGrades((prev) => !prev)
                        setEditingProjeto((prev) => prev ? { ...prev, grid: !prev.grid } : prev);
                    }}
                    className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all ${
                        showGrades
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-white border-slate-200 text-slate-600"
                    }`}
                    >
                    <span className="font-medium text-sm">
                        Grades de alumínio
                    </span>

                    <span
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                        showGrades ? "bg-blue-600" : "bg-slate-300"
                        }`}
                    >
                        <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            showGrades ? "translate-x-1" : "-translate-x-5"
                        }`}
                        />
                    </span>
                    </button>
                )}
                {editingProjeto.type == 'portao-ferro' && (
                    <button
                    type="button"
                    onClick={() => {
                        setShowDoor((prev) => !prev)
                        setEditingProjeto((prev) => prev ? { ...prev, door: !prev.door } : prev);
                    }}
                    className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all ${
                        showDoor
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-white border-slate-200 text-slate-600"
                    }`}
                    >
                    <span className="font-medium text-sm">
                        Porta Social Integrada ao Portão
                    </span>

                    <span
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                        showDoor ? "bg-blue-600" : "bg-slate-300"
                        }`}
                    >
                        <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            showDoor ? "translate-x-1" : "-translate-x-5"
                        }`}
                        />
                    </span>
                    </button>
                )}
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* ÁREA CENTRAL: CANVAS DE DESENHO 2D                            */}
            {/* ------------------------------------------------------------- */}
            <div className="flex-1 flex flex-col bg-slate-100 relative overflow-hidden">
              {/* Canvas Floating Toolbar */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200 shadow-sm">
                <button
                  type="button"
                  onClick={() => setCanvasZoom(prev => Math.max(0.6, prev - 0.1))}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Diminuir Zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-slate-700 px-1.5 min-w-[48px] text-center">
                  {Math.round(canvasZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setCanvasZoom(prev => Math.min(2.0, prev + 0.1))}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Aumentar Zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                <button
                  type="button"
                  onClick={() => setCanvasZoom(1)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Redefinir Zoom (100%)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    showGrid ? 'bg-blue-50 text-[#003d9b]' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Alternar Grade Milimétrica"
                >
                  <Grid className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowReflections(!showReflections)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    showReflections ? 'bg-blue-50 text-[#003d9b]' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Reflexo Realista do Vidro"
                >
                  <Sparkles className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowDimensions(!showDimensions)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    showDimensions ? 'bg-blue-50 text-[#003d9b]' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Exibir Cotas Dimensionais"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Company Watermark in Canvas */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200/60 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-[#003d9b]" />
                <span className="text-[11px] font-bold text-slate-700 tracking-tight">
                  Raynex Solutions • Editor 2D
                </span>
              </div>

              {/* Main Canvas Drawing Stage */}
              <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
                <div className="w-full max-w-3xl flex items-center justify-center">
                 <Estrutura2DRenderer
                    tipo={editingProjeto.type}
                    modelo={editingProjeto.model}
                    largura={editingProjeto.width}
                    altura={editingProjeto.height}
                    corVidro={editingProjeto.glass_color}
                    corPerfil={editingProjeto.profile_color}
                    puxador={editingProjeto.handle}
                    showDimensions={showDimensions}
                    showGrid={showGrid}
                    showReflections={showReflections}
                    zoom={canvasZoom}
                    className="w-full max-h-[560px]"
                    grid={showGrades}
                    door={showDoor}
                  />
                </div>
              </div>

              {/* Bottom Canvas Notice */}
              <div className="p-3 bg-white/80 border-t border-slate-200/80 px-6 flex items-center justify-between text-xs text-slate-500 shrink-0">
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Representação visual simplificada para apresentação comercial ao cliente.</span>
                </div>
                <span>Escala proporcional dinâmica • 2D Vector Canvas</span>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* PAINEL LATERAL DIREITO: VISUALIZAÇÃO E AÇÕES                  */}
            {/* ------------------------------------------------------------- */}
            <div className="w-80 lg:w-84 bg-white border-l border-slate-200/90 flex flex-col justify-between shrink-0 overflow-y-auto">
              <div className="p-5 space-y-5">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Resumo do Projeto
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Pronto p/ Apresentar
                  </span>
                </div>

                {/* Card de Ficha Rápida */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cliente</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{clientName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/70">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Tipo</span>
                      <p className="text-xs font-semibold text-slate-800">{getTipoBadge(editingProjeto.type).label}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Área Total</span>
                      <p className="text-xs font-bold text-[#003d9b] font-mono">
                        {(editingProjeto.width * editingProjeto.height).toFixed(2)} m²
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Modelo</span>
                    <p className="text-xs font-semibold text-slate-800">{editingProjeto.model}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Acabamento</span>
                    {editingProjeto.type != 'portao-ferro' && editingProjeto.type != 'porta-aluminio' ? (
                        <p className="text-xs text-slate-700">
                            Vidro: <strong className="capitalize">{editingProjeto.glass_color}</strong> • Perfil: <strong className="capitalize">{editingProjeto.profile_color}</strong>
                        </p>
                    ): (<p className="text-xs text-slate-700">
                            Perfil: <strong className="capitalize">{editingProjeto.profile_color}</strong>
                        </p>)}
                    
                  </div>
                </div>

                {/* Estimativa de Valor Comercial Base */}
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70 space-y-1">
                  <div className="flex items-center justify-between text-xs text-blue-900 font-semibold">
                    <span>Estimativa Comercial Base:</span>
                  </div>
                  <div className="flex items-center gap-1 text-xl font-bold text-[#003d9b] font-mono">
                    <span>R$</span>

                    <input
                        type="number"
                        className="w-32 text-xl font-bold text-[#003d9b] font-mono outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        value={valorEstimado}
                        onChange={(e) => setValorEstimado(Number(e.target.value))}
                        style={{
                            MozAppearance: "textfield",
                        }}
                    />
                    </div>
                  <p className="text-[11px] text-slate-500">
                    Base sugerida para negociação e proposta inicial.
                  </p>
                </div>

                {/* Observações do Projeto */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Observações Comerciais
                  </label>
                  <textarea
                    rows={3}
                    value={editingProjeto.notes || ''}
                    onChange={(e) => setEditingProjeto({ ...editingProjeto, notes: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20"
                    placeholder="Ex: Entregar com fechadura tetra, vedação com escova dupla..."
                  />
                </div>
              </div>

              {/* Botões de Ação do Painel Direito */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-2.5">
                <button
                  type="button"
                  onClick={() => {}}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-[#003d9b] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Projeto Finalizado</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveCurrentProject}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#003d9b] hover:bg-[#003080] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Salvar Projeto</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGerarPDF()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Exportar Apresentação</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Apresentação ao Cliente */}
        {presentationProjeto && (
        <ApresentacaoClienteModal
            isOpen={true}
            client={clients.find(
              (client) => client.id === presentationProjeto.client_id
            )}
            onClose={() => setPresentationProjeto(null)}
            projeto={presentationProjeto}
            userName={userName}
        />
        )}
    </div>
    )
}
