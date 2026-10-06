import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search,  
  Edit3, 
  Eye, 
  Trash2, 
  Copy,  
  DoorClosed, 
  AppWindow, 
  Bath, 
  Fence, 
  User,
  DoorOpen,
  DollarSign,
  CircleDollarSign
} from 'lucide-react';
import { 
  Projeto2D, 
  TipoProjeto, 
  ClientItem,
} from '../types';
import {modelosPorTipo} from '../types/projetos2d'
import { Estrutura2DRenderer } from '../components/projetos2D/Estrutura2DRenderer';
import { ApresentacaoClienteModal } from '../components/modals/ApresentacaoClienteModal'
import { formatCurrency } from '../utils/formatters';
import { SettingProjectModal } from '../components/modals/SettingProjectModal';
import Swal from 'sweetalert2';
import { UserType } from '../types/userType';

interface Projetos2DSectionProps {
  clients?: ClientItem[];
  project: Projeto2D[];
  onDeleteProject: (id: string) => void;
  onAddProject: (project: Projeto2D) => void;
  updateProject: (id: string, projectEdit: Projeto2D) => void;
  loadProject: () => void;
  userName?: UserType | null
}

export const Projetos2DSection: React.FC<Projetos2DSectionProps> = ({ 
  clients = [],
  project,
  onDeleteProject,
  onAddProject,
  loadProject,
  updateProject,
  userName
 }) => {
  
  // Collection of projects
  const [projetos, setProjetos] = useState<Projeto2D[]>(project);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');


  // Editor View State: null means gallery list, non-null means editing/creating that project
  const [editingProjeto, setEditingProjeto] = useState<Projeto2D | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);

  // Presentation modal
  const [presentationProjeto, setPresentationProjeto] = useState<Projeto2D | null>(null);

  // Canvas visual controls
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  useEffect(() => {
  setProjetos(project);
  }, [project]);
  
  // Filter list
  const filteredProjetos = projetos.filter((proj) => {
    if (!proj) return false;
    const clientName = clients.find((client) => client.id === proj.client_id)?.name ?? "Cliente Particular";

    const matchesSearch = 
      proj.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterTipo === 'todos') return matchesSearch;
    return matchesSearch && proj.type === filterTipo;
  });

  // Handler to open editor for a new project
  const handleOpenNewProject = (tipoPadrao: TipoProjeto = 'porta-vidro') => {
    const defaultModel = modelosPorTipo[tipoPadrao][0].nome;
    const newProj: Projeto2D = {
      id: `proj-${Date.now()}`,
      name: tipoPadrao === 'porta-vidro' ? 'Nova Porta de Vidro Residencial' :
            tipoPadrao === 'janela' ? 'Nova Janela 4 Folhas' :
            tipoPadrao === 'box-banheiro' ? 'Novo Box de Banheiro' :
            tipoPadrao === 'portao-ferro'? 'Novo Portão Basculante': 'Nova Porta de Alumínio',
      client_id: 0,
      type: tipoPadrao,
      model: defaultModel,
      width: tipoPadrao === 'portao-ferro' ? 3.00 : tipoPadrao === 'porta-vidro' ? 1.60 : tipoPadrao === 'janela' ? 1.50 : 1.20,
      height: tipoPadrao === 'janela' ? 1.20 : tipoPadrao === 'box-banheiro' ? 1.90 : 2.10,
      glass_thickness: tipoPadrao === 'portao-ferro' ? 'Sem vidro' : '10mm Temperado',
      glass_color: 'incolor',
      profile_color: 'preto',
      handle: tipoPadrao === 'porta-vidro' ? 'tubular-60' : tipoPadrao === 'box-banheiro' ? 'concha' : 'nenhum',
      updated_at: 'Hoje',
      status: 'draft',
      estimated_value: 2800.00,
      notes: 'Desenho 2D para apresentação comercial ao cliente.',
      grid: false,
      door: false
    };
    setEditingProjeto(newProj);
    setIsNewProject(true);
    setCanvasZoom(1);
  };

  // Handler to open editor for existing project
  const handleEditProject = (proj: Projeto2D) => {
    setEditingProjeto({ ...proj });
    setIsNewProject(false);
    setCanvasZoom(1);
  };

  // Handler to delete a project
  const handleDeleteProject = async (id: string) => {
    const result = await Swal.fire({
      title: "Remover projeto?",
      text: "Essa ação não poderá ser desfeita.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, remover",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        confirmButton: "bg-red-800 text-white px-5 py-2.5 rounded-lg ml-2",
        cancelButton: "bg-slate-200 text-slate-700 px-5 py-2.5 rounded-lg",
      },
    });

    if (result.isConfirmed) {
      await onDeleteProject(id);

      await Swal.fire({
        title: "Projeto removido!",
        text: "O projeto foi excluído com sucesso.",
        icon: "success",
        confirmButtonText: "Concluir",
        confirmButtonColor: "#4f46e5",
      });
    }
  };

  const handleUpdateProject = async (projectEdit: Projeto2D) => {
    if (!editingProjeto) return;

    await updateProject(projectEdit.id, projectEdit);
    await loadProject()
    setSaveSuccessMessage(true);
    setTimeout(() => {
      setSaveSuccessMessage(false);
      setEditingProjeto(null);
      setIsNewProject(false);
    }, 3000);
  }

  // Handler to save current project in editor
  const handleSaveCurrentProject = async (projectNow: Projeto2D) => {
    if (!editingProjeto) return;

    await onAddProject(projectNow);
    await loadProject()
    setSaveSuccessMessage(true);
    setTimeout(() => {
      setSaveSuccessMessage(false);
      setEditingProjeto(null);
      setIsNewProject(false);
    }, 3000);
    
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
        return {label: 'Porta de Alumínio', icon: DoorOpen, bg: 'bg-slate-100 text-slate-800 border-slate-300'}
    }
  };


  return (
    <div className="w-full">
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
          {/* Header da Tela */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Projetos 2D
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003d9b] border border-blue-200/80">
                  {projetos.length} projetos
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Crie e visualize projetos personalizados para seus clientes.
              </p>
            </div>

            {/* Botão Novo Projeto Destacado */}
            <div className="flex items-center gap-3">
              <button
                id="btn-novo-projeto-2d"
                onClick={() => handleOpenNewProject('porta-vidro')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#003d9b] hover:bg-[#003080] active:scale-[0.98] rounded-xl shadow-sm transition-all duration-150 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Novo projeto</span>
              </button>
            </div>
          </div>

          {/* Quick Creation Showcase Hero Card */}
          <div className="bg-gradient-to-r from-[#003d9b] to-[#1e40af] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 bg-white/10 px-2.5 py-0.5 rounded-full">
                Módulo Raynex Solutions
              </span>
              <h2 className="text-xl font-bold tracking-tight">
                Desenhos 2D Comerciais para Apresentação
              </h2>
              <p className="text-xs text-blue-100 leading-relaxed">
                Desenvolva projetos de portas de vidro, janelas, boxes e portões de ferro em segundos. Proporções realistas, vidros translúcidos e cotas limpas para fechar orçamentos na hora.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => handleOpenNewProject('porta-vidro')}
                  className="px-1.5 py-1.5 text-xs font-semibold bg-white text-[#003d9b] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  + Porta de Vidro
                </button>
                <button
                  onClick={() => handleOpenNewProject('box-banheiro')}
                  className="px-1.5 py-1.5 text-xs font-semibold bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors cursor-pointer"
                >
                  + Box de Banheiro
                </button>
                <button
                  onClick={() => handleOpenNewProject('janela')}
                  className="px-1.5 py-1.5 text-xs font-semibold bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors cursor-pointer"
                >
                  + Janela
                </button>
                <button
                  onClick={() => handleOpenNewProject('portao-ferro')}
                  className="px-1.5 py-1.5 text-xs font-semibold bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors cursor-pointer"
                >
                  + Portão de Alumínio
                </button>
                <button
                  onClick={() => handleOpenNewProject('porta-aluminio')}
                  className="px-1.5 py-1.5 text-xs font-semibold bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors cursor-pointer"
                >
                  + Porta de Alumínio
                </button>
              </div>
            </div>

            {/* Quick 2D Preview Badge */}
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20 shrink-0 w-64 text-center">
              <span className="text-[10px] uppercase font-bold text-blue-200 block mb-1">
                Visualização Comercial
              </span>
              <p className="text-sm font-bold text-white">Sem CAD Complexo</p>
              <p className="text-[11px] text-blue-100 mt-1">
                Foco no cliente final e na velocidade comercial.
              </p>
            </div>
          </div>

          {/* Search Bar & Type Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome do projeto, cliente ou modelo..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#003d9b]/20 focus:border-[#003d9b]"
              />
            </div>

            {/* Filter by Project Type */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'todos', label: 'Todos os Projetos' },
                { id: 'porta-vidro', label: 'Porta de Vidro' },
                { id: 'janela', label: 'Janela' },
                { id: 'box-banheiro', label: 'Box' },
                { id: 'portao-ferro', label: 'Portão' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterTipo(f.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                    filterTipo === f.id
                      ? 'bg-[#003d9b] text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Cards de Projetos Recentes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjetos.map((proj) => {
              const badge = getTipoBadge(proj.type);
              const Icon = badge.icon;
              const area = (proj.width * proj.height).toFixed(2);
            
              return (
                <div
                  key={proj.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Visual 2D Drawing Thumbnail Area */}
                    <div 
                      onClick={() => handleEditProject(proj)}
                      className="h-56 bg-slate-50 border-b border-slate-100 flex items-center justify-center p-4 relative cursor-pointer group-hover:bg-slate-100/60 transition-colors"
                      title="Clique para editar o projeto"
                    >
                      <Estrutura2DRenderer
                        tipo={proj.type}
                        modelo={proj.model}
                        largura={proj.width}
                        altura={proj.height}
                        corVidro={proj.glass_color}
                        corPerfil={proj.profile_color}
                        puxador={proj.handle}
                        showDimensions={true}
                        showGrid={false}
                        showReflections={true}
                        thumbnailMode={true}
                        className="w-full max-h-48"
                        grid={proj.grid}
                        door={proj.door}
                      />

                      {/* Floating Type Pill on Thumbnail */}
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </div>

                      {/* Dimension Pill on Thumbnail */}
                      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-lg border border-slate-200 text-[11px] font-mono font-bold text-slate-700 shadow-2xs">
                        {proj.width.toFixed(2)}m × {proj.height.toFixed(2)}m
                      </div>
                    </div>

                    {/* Card Content & Details */}
                    <div className="p-5 space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 
                            onClick={() => handleEditProject(proj)}
                            className="text-base font-bold text-slate-900 group-hover:text-[#003d9b] transition-colors cursor-pointer leading-tight"
                          >
                            {proj.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {proj.model}
                        </p>
                      </div>

                      {/* Client Info & Dimension Specs */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-600">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                            {
                            clients.find(
                              (client) => client.id === proj.client_id
                            )?.name ?? "Cliente Particular"
                            }
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px] font-mono">
                          {area} m²
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Atualizado: {new Date(proj.updated_at).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}</span>
                        <span className="text-emerald-700 font-bold font-mono">
                          {formatCurrency(proj.estimated_value || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons: Abrir, Editar, Excluir */}
                  <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPresentationProjeto(proj)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#003d9b] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Abrir no modo apresentação para cliente"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Abrir</span>
                      </button>

                      <button
                        onClick={() => handleEditProject(proj)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                        title="Editar configurações no editor visual"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Editar</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {}}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                        title="Projeto finalizado"
                      >
                        <CircleDollarSign className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Excluir projeto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredProjetos.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#003d9b] mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Nenhum projeto encontrado</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Não encontramos projetos correspondentes à sua pesquisa. Tente outros termos ou crie um novo projeto.
                </p>
              </div>
              <button
                onClick={() => { setSearchTerm(''); setFilterTipo('todos'); }}
                className="px-4 py-2 text-xs font-semibold text-[#003d9b] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      {/* Modal de Apresentação ao Cliente */}
      {presentationProjeto && (
        <ApresentacaoClienteModal
          isOpen={true}
          client={
            clients.find(
              (client) => client.id === presentationProjeto.client_id
            )
          }
          onClose={() => setPresentationProjeto(null)}
          projeto={presentationProjeto}
          userName={userName}
        />
      )}
      
      {editingProjeto && (
        
        <SettingProjectModal
          project={editingProjeto}
          clients={clients}
          onClose={() => {
            setEditingProjeto(null);
            setIsNewProject(false);
          }}
          onSave={(projetoSalvo) => {
            if(isNewProject === true){
              handleSaveCurrentProject(projetoSalvo)
            }else{
              handleUpdateProject(projetoSalvo)
            }

          }}
          userName={userName}
        />
      )}
    </div>
  );
};
