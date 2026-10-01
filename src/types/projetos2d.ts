export type TipoProjeto = 'porta-vidro' | 'janela' | 'box-banheiro' | 'portao-ferro' | 'porta-aluminio';

export type CorVidro = 'incolor' | 'fume' | 'verde' | 'bronze' | 'jateado';

export type CorPerfil = 'preto' | 'branco' | 'inox' | 'bronze' | 'dourado';

export type TipoPuxador = 'tubular-40' | 'tubular-60' | 'inox-h' | 'concha' | 'nenhum';

export interface Projeto2D {
  id: string;
  name: string;
  client_id?: number | null;
  type: TipoProjeto;
  model: string;
  width: number; // em metros (ex: 1.60)
  height: number; // em metros (ex: 2.10)
  glass_thickness?: string; // ex: "10mm Tempered"
  glass_color: CorVidro;
  profile_color: CorPerfil;
  handle: TipoPuxador;
  updated_at: string;
  status: "draft" | "presented" | "approved";
  estimated_value?: number;
  notes?: string;
  grid: boolean;
  door: boolean;
}

export const modelosPorTipo: Record<string, ModeloOpcao[]> = {
  'porta-vidro': [   
    { id: 'porta-pivo', nome: 'Pivotante 1 Folha', descricao: 'Abertura pivotante moderna com mola de piso', tipo: 'porta-vidro' },
    { id: 'porta-pivotante-2f', nome: 'Pivotante 2 Folhas', descricao: 'Duas portas pivotante com mola de piso', tipo: 'porta-vidro' },
    { id: 'porta-pivo-bandeira', nome: 'Pivotante com Bandeira', descricao: 'Folha pivotante com vidro fixo superior', tipo: 'porta-vidro' },
    { id: 'porta-abrir-2f', nome: 'Abrir 2 Folhas C/Moldura', descricao: 'Duas portas de abrir com moldura de aluminio', tipo: 'porta-vidro' },
    { id: 'porta-correr-2f-movel', nome: 'Correr 2 Folhas Moveis', descricao: 'Duas folhas móveis que se escondem atrás da parede', tipo: 'porta-vidro' },
    { id: 'porta-correr-2f-direita', nome: 'Correr 2 Folhas (1F + 1M)', descricao: 'Uma folha fixa e uma folha móvel de correr do lado direito', tipo: 'porta-vidro' },
    { id: 'porta-correr-2f-esquerda', nome: 'Correr 2 Folhas (1M + 1F)', descricao: 'Uma folha móvel de correr e uma folha fixa do lado esquerdo', tipo: 'porta-vidro' },
    { id: 'porta-correr-4f', nome: 'Correr 4 Folhas (2F + 2M)', descricao: 'Duas folhas móveis centrais e duas fixas laterais', tipo: 'porta-vidro' },
  ],
  'janela': [
    { id: 'janela-correr-2f-d', nome: 'Correr 2 Folhas (1F + 1M)', descricao: 'Janela tradicional de duas folhas', tipo: 'janela' },
    { id: 'janela-correr-2f-e', nome: 'Correr 2 Folhas (1M + 1F)', descricao: 'Janela tradicional de duas folhas', tipo: 'janela' },
    { id: 'janela-correr-4f', nome: 'Correr 4 Folhas (2F + 2M)', descricao: 'Abertura central ampla com duas folhas corrediças', tipo: 'janela' },
    { id: 'janela-maximar', nome: 'Maxim-Ar Basculante', descricao: 'Projeção para fora com braço articulado', tipo: 'janela' },
  ],
  'box-banheiro': [
    { id: 'box-frontal-correr', nome: 'Frontal Correr (1F + 1M)', descricao: 'Painel fixo e porta deslizante com trilho', tipo: 'box-banheiro' },
    { id: 'box-canto-l', nome: 'Canto em L (2F + 1M)', descricao: 'Encontro em 90 graus para banheiros compactos', tipo: 'box-banheiro' },
  ],
  'portao-ferro': [
    { id: 'portao-basculante-tubular', nome: 'Basculante Tubular Horizontal', descricao: 'Barras tubulares horizontais com design limpo', tipo: 'portao-ferro' },
    { id: 'portao-gradil-vertical', nome: 'Gradil Vertical Moderno', descricao: 'Tubos verticais com vãos simétricos de segurança', tipo: 'portao-ferro' },
    { id: 'portao-veneziana', nome: 'Veneziana Fechada com Friso', descricao: 'Chapas fechadas para total privacidade', tipo: 'portao-ferro' },
    { id: 'portao-chapa-lisa', nome: 'Portão de Chapa Lisa', descricao: 'Fechamento em chapas metálicas lisas para privacidade', tipo: 'portao-ferro' },
    
  ],
  'porta-aluminio': [
    { id: 'porta-social-tubular', nome: 'Porta Social Tubular Horizontal', descricao: 'Porta de abrir com barras tubulares horizontais', tipo: 'portao-ferro' },
    { id: 'porta-social-gradil', nome: 'Porta Social Gradil Vertical', descricao: 'Porta de abrir com barras verticais e estrutura reforçada', tipo: 'portao-ferro' },
    { id: 'porta-social-veneziana', nome: 'Porta Social Veneziana', descricao: 'Porta de abrir com chapas venezianas para privacidade e ventilação', tipo: 'portao-ferro' },
    { id: 'porta-chapa-lisa', nome: 'Porta de Chapa Lisa', descricao: 'Fechamento em chapas metálicas lisas para privacidade', tipo: 'porta-aluminio' },
  ]
};

export interface ModeloOpcao {
  id: string;
  nome: string;
  descricao: string;
  tipo: TipoProjeto;
}
