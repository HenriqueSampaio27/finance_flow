import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { jsPDF } from 'jspdf';
import { Projeto2D } from '../../types/projetos2d';
import { ClientItem } from '@/src/types';
import { title as EMPRESA_PADRAO } from '@/src/types/titleFinanceFlow';
import { formatCurrency } from '../../utils/formatters';
import { Estrutura2DRenderer } from './Estrutura2DRenderer';
import { useUser } from '@/src/hooks/useUser';

/* -------------------------------------------------------------------------- */
/*  Tipos                                                                      */
/* -------------------------------------------------------------------------- */

interface GerarProjetoPDFParams {
  projeto: Projeto2D;
  client?: ClientItem;
  empresaNome?: string;
  modo?: 'download' | 'open';
}

type RGB = [number, number, number];

/* -------------------------------------------------------------------------- */
/*  Paleta (equivalente ao Tailwind usado na apresentação)                     */
/* -------------------------------------------------------------------------- */

const COR = {
  azul: '#003d9b',
  azulClaro: '#eff6ff',
  azulBorda: '#bfdbfe',
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate600: '#475569',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  slate50: '#f8fafc',
  verde: '#047857',
  ambar: '#f59e0b',
  branco: '#ffffff',
};

const hexToRgb = (hex: string): RGB => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
};


/* -------------------------------------------------------------------------- */
/*  User                                                                     */
/* -------------------------------------------------------------------------- */
const {
    user
  } = useUser()


/* -------------------------------------------------------------------------- */
/*  Labels                                                                     */
/* -------------------------------------------------------------------------- */

const getTipoLabel = (tipo: string) => {
  switch (tipo) {
    case 'porta-vidro': return 'Porta de Vidro';
    case 'janela': return 'Janela de Vidro/Alumínio';
    case 'box-banheiro': return 'Box de Banheiro';
    case 'portao-ferro': return 'Portão de Alumínio';
    case 'porta-aluminio' : return 'Porta de Alumínio';
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

/* -------------------------------------------------------------------------- */
/*  Utilitários                                                                */
/* -------------------------------------------------------------------------- */

// Remove espaços não-quebráveis (Intl pt-BR usa \u00a0 em "R$ 1.000,00")
const limpar = (s: string) => s.replace(/[\u00a0\u202f]/g, ' ');

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

interface DesenhoRasterizado {
  dataUrl: string;
  largura: number;
  altura: number;
}

/**
 * Renderiza o Estrutura2DRenderer para SVG e converte para PNG em alta
 * resolução. Desenho fiel ao da apresentação.
 */
const rasterizarEstrutura = async (
  projeto: Projeto2D,
  escala = 4
): Promise<DesenhoRasterizado | null> => {
  try {
    const markup = renderToStaticMarkup(
      React.createElement(Estrutura2DRenderer, {
        tipo: projeto.type,
        modelo: projeto.model,
        largura: projeto.width,
        altura: projeto.height,
        corVidro: projeto.glass_color,
        corPerfil: projeto.profile_color,
        puxador: projeto.handle,
        showDimensions: true,
        showGrid: false,
        showReflections: true,
        grid: projeto.grid,
        door: projeto.door,
      } as any)
    );

    const svgMatch = markup.match(/<svg[\s\S]*<\/svg>/i);
    if (!svgMatch) return null;

    const parser = new DOMParser();
    const docSvg = parser.parseFromString(svgMatch[0], 'image/svg+xml');
    const svg = docSvg.documentElement;
    if (!svg || svg.nodeName.toLowerCase() !== 'svg') return null;

    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    // Descobre as dimensões intrínsecas
    let w = 0;
    let h = 0;
    const vb = svg.getAttribute('viewBox');
    if (vb) {
      const p = vb.trim().split(/[\s,]+/).map(Number);
      if (p.length === 4 && p[2] > 0 && p[3] > 0) {
        w = p[2];
        h = p[3];
      }
    }
    if (!w || !h) {
      const aw = parseFloat(svg.getAttribute('width') || '');
      const ah = parseFloat(svg.getAttribute('height') || '');
      if (aw > 0 && ah > 0) {
        w = aw;
        h = ah;
      }
    }
    if (!w || !h) {
      w = 800;
      h = (800 * projeto.height) / Math.max(projeto.width, 0.01);
    }
    if (!vb) svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

    // Tamanho explícito (obrigatório para o <img> desenhar no canvas)
    svg.setAttribute('width', String(w));
    svg.setAttribute('height', String(h));

    const svgString = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Falha ao carregar SVG'));
      i.src = url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w * escala);
    canvas.height = Math.round(h * escala);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      URL.revokeObjectURL(url);
      return null;
    }
    // Fundo igual ao da caixa do desenho no PDF
    ctx.fillStyle = COR.slate100;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    return {
      dataUrl: canvas.toDataURL('image/png'),
      largura: w,
      altura: h,
    };
  } catch (err) {
    console.error('Erro ao rasterizar o desenho 2D:', err);
    return null;
  }
};

/* -------------------------------------------------------------------------- */
/*  Gerador principal                                                          */
/* -------------------------------------------------------------------------- */

export const gerarProjetoPDF = async ({
  projeto,
  client,
  empresaNome,
  modo,
}: GerarProjetoPDFParams): Promise<void> => {
  const empresa = empresaNome || String(EMPRESA_PADRAO || 'Raynex Solutions');

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  const PAGE_W = 210;
  const PAGE_H = 297;
  const M = 14; // margem lateral
  const CW = PAGE_W - M * 2; // largura útil
  const BOTTOM = PAGE_H - 20; // limite inferior (reserva para rodapé)

  let y = M;

  /* ------------------------------ helpers ------------------------------ */

  const setText = (hex: string) => doc.setTextColor(...hexToRgb(hex));
  const setFill = (hex: string) => doc.setFillColor(...hexToRgb(hex));
  const setDraw = (hex: string) => doc.setDrawColor(...hexToRgb(hex));

  const font = (size: number, style: 'normal' | 'bold' | 'italic' = 'normal') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
  };

  const wrap = (text: string, width: number): string[] =>
    doc.splitTextToSize(limpar(text), width) as string[];

  const novaPaginaSe = (alturaNecessaria: number) => {
    if (y + alturaNecessaria > BOTTOM) {
      doc.addPage();
      y = M;
    }
  };

  const caixa = (
    x: number,
    yy: number,
    w: number,
    h: number,
    opts: { fill?: string; border?: string; raio?: number; lw?: number }
  ) => {
    const { fill, border, raio = 2.5, lw = 0.3 } = opts;
    doc.setLineWidth(lw);
    if (fill) setFill(fill);
    if (border) setDraw(border);
    const style = fill && border ? 'FD' : fill ? 'F' : 'S';
    doc.roundedRect(x, yy, w, h, raio, raio, style);
  };

  const linha = (x1: number, y1: number, x2: number, y2: number, hex = COR.slate200, lw = 0.3) => {
    setDraw(hex);
    doc.setLineWidth(lw);
    doc.line(x1, y1, x2, y2);
  };

  /* ------------------------------ dados ------------------------------- */

  const largura = Number(projeto.width) || 0;
  const altura = Number(projeto.height) || 0;
  const areaTotal = (largura * altura).toFixed(2);

  const dataEmissao = new Date(projeto.updated_at || Date.now()).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const valor = limpar(formatCurrency(projeto.estimated_value || 0));

  const desenho = await rasterizarEstrutura(projeto);

  /* ====================================================================== */
  /*  1. CABEÇALHO                                                            */
  /* ====================================================================== */

  // Logo
  caixa(M, y, 13, 13, { fill: COR.azul, raio: 3 });
  font(16, 'bold');
  setText(COR.branco);
  doc.text('F', M + 6.5, y + 8.9, { align: 'center' });

  // Nome da empresa + badge
  const xTitulo = M + 17;
  font(15, 'bold');
  setText(COR.slate900);
  doc.text(limpar(empresa), xTitulo, y + 5.4);
  const larguraEmpresa = doc.getTextWidth(limpar(empresa));

  font(6.5, 'bold');
  const badgeTxt = 'Vidros & Esquadrias';
  const badgeW = doc.getTextWidth(badgeTxt) + 5;
  const badgeX = xTitulo + larguraEmpresa + 3;
  caixa(badgeX, y + 1.6, badgeW, 4.8, {
    fill: COR.azulClaro,
    border: COR.azulBorda,
    raio: 1,
    lw: 0.2,
  });
  setText(COR.azul);
  doc.text(badgeTxt, badgeX + badgeW / 2, y + 4.9, { align: 'center' });

  font(7.5);
  setText(COR.slate500);
  doc.text(
    'Projetos personalizados  •  Portas de vidro, janelas, boxes e portões',
    xTitulo,
    y + 10.8
  );

  // Bloco da direita
  const xDir = PAGE_W - M;
  font(9, 'bold');
  setText(COR.slate900);
  doc.text('Proposta Técnica Comercial', xDir, y + 3.8, { align: 'right' });
  font(7.5);
  setText(COR.slate500);
  doc.text(`Emitido em: ${dataEmissao}`, xDir, y + 8, { align: 'right' });
  font(7.5, 'bold');
  setText(COR.azul);
  doc.text(`Ref: #${projeto.id}`, xDir, y + 12, { align: 'right' });

  y += 17;
  linha(M, y, PAGE_W - M, y);
  y += 6;

  /* ====================================================================== */
  /*  2. BANNER CLIENTE / PROJETO                                             */
  /* ====================================================================== */

  const PAD = 5;
  const GAP = 4;
  const colW = (CW - PAD * 2 - GAP * 3) / 4;

  interface Coluna {
    label: string;
    principal: string[];
    corPrincipal: string;
    sub: string[];
  }

  font(9.5, 'bold');
  const colunas: Coluna[] = [
    {
      label: 'PROJETO',
      principal: wrap(projeto.name || '-', colW),
      corPrincipal: COR.slate900,
      sub: [],
    },
    {
      label: 'CLIENTE',
      principal: wrap(client?.name ?? 'Cliente Particular', colW),
      corPrincipal: COR.slate900,
      sub: client?.phone ? [limpar(String(client.phone))] : [],
    },
    {
      label: 'DIMENSÕES GERAIS',
      principal: wrap(`${largura.toFixed(2)}m (L) × ${altura.toFixed(2)}m (A)`, colW),
      corPrincipal: COR.azul,
      sub: [`Área: ${areaTotal} m²`],
    },
    {
      label: 'INVESTIMENTO ESTIMADO',
      principal: wrap(valor, colW),
      corPrincipal: COR.verde,
      sub: ['Material + Instalação'],
    },
  ];

  const alturaColuna = (c: Coluna) => 3.6 + c.principal.length * 4.4 + c.sub.length * 3.8;
  const alturaColunas = Math.max(...colunas.map(alturaColuna));

  // Endereço
  const enderecoLinha1 = client
    ? `${client.address || ''}${client.number ? `, ${client.number}` : ''}${
        client.complement ? ` - ${client.complement}` : ''
      }`.trim() || '-'
    : 'Cliente Particular';

  const enderecoLinha2 = client
    ? [
        client.district ? `${client.district}` : '',
        client.city ? `${client.city}${client.state ? ` - ${client.state}` : ''}` : client.state || '',
        client.zip_code ? `CEP: ${client.zip_code}` : '',
      ]
        .filter(Boolean)
        .join('  •  ')
    : '';

  font(9, 'bold');
  const end1 = wrap(enderecoLinha1, CW - PAD * 2);
  const end2 = enderecoLinha2 ? wrap(enderecoLinha2, CW - PAD * 2) : [];
  const alturaEndereco = 3.6 + end1.length * 4.2 + end2.length * 3.8;

  const alturaBanner = PAD + alturaColunas + 3 + 0.3 + 3 + alturaEndereco + PAD - 1;

  novaPaginaSe(alturaBanner);
  caixa(M, y, CW, alturaBanner, { fill: COR.slate50, border: COR.slate200 });

  let cy = y + PAD;
  colunas.forEach((c, i) => {
    const cx = M + PAD + i * (colW + GAP);
    let ly = cy;

    font(6.5, 'bold');
    setText(COR.slate400);
    doc.text(c.label, cx, ly + 2);
    ly += 3.6;

    font(9.5, 'bold');
    setText(c.corPrincipal);
    c.principal.forEach((t) => {
      ly += 4.4;
      doc.text(t, cx, ly - 0.8);
    });

    font(7.5);
    setText(COR.slate500);
    c.sub.forEach((t) => {
      ly += 3.8;
      doc.text(t, cx, ly - 0.8);
    });
  });

  cy += alturaColunas + 3;
  linha(M + PAD, cy, M + CW - PAD, cy);
  cy += 3;

  font(6.5, 'bold');
  setText(COR.slate400);
  doc.text('ENDEREÇO DE INSTALAÇÃO', M + PAD, cy + 2);
  cy += 3.6;

  font(9, 'bold');
  setText(COR.slate800);
  end1.forEach((t) => {
    cy += 4.2;
    doc.text(t, M + PAD, cy - 0.8);
  });

  font(7.5);
  setText(COR.slate500);
  end2.forEach((t) => {
    cy += 3.8;
    doc.text(t, M + PAD, cy - 0.8);
  });

  y += alturaBanner + 6;

  /* ====================================================================== */
  /*  3. DESENHO 2D                                                           */
  /* ====================================================================== */

  const maxImgW = CW - 16;
  const maxImgH = 95;
  let imgW = maxImgW;
  let imgH = maxImgH;

  if (desenho) {
    const ratio = desenho.largura / desenho.altura;
    imgW = maxImgW;
    imgH = imgW / ratio;
    if (imgH > maxImgH) {
      imgH = maxImgH;
      imgW = imgH * ratio;
    }
  } else {
    imgH = 40;
  }

  const alturaDesenho = Math.max(imgH + 14, 70);
  novaPaginaSe(alturaDesenho);

  caixa(M, y, CW, alturaDesenho, { fill: COR.slate100, border: COR.slate200, raio: 3.5 });

  if (desenho) {
    doc.addImage(
      desenho.dataUrl,
      'PNG',
      M + (CW - imgW) / 2,
      y + (alturaDesenho - imgH) / 2,
      imgW,
      imgH,
      undefined,
      'FAST'
    );
  } else {
    font(9);
    setText(COR.slate400);
    doc.text('Desenho indisponível', M + CW / 2, y + alturaDesenho / 2, { align: 'center' });
  }

  y += alturaDesenho + 6;

  /* ====================================================================== */
  /*  4. ESPECIFICAÇÕES + OBSERVAÇÕES                                         */
  /* ====================================================================== */

  const boxGap = 5;
  const boxW = (CW - boxGap) / 2;
  const innerW = boxW - 8;

  const specs: { label: string; valor: string }[] = [
    { label: 'Estrutura:', valor: getTipoLabel(projeto.type) },
    { label: 'Modelo Selecionado:', valor: String(projeto.model ?? '-') },
    {
      label: 'Vidro / Chapa:',
      valor: `${getCorVidroLabel(projeto.glass_color)} (${projeto.glass_thickness || 'Temperado'})`,
    },
    { label: 'Perfil / Ferragens:', valor: getCorPerfilLabel(projeto.profile_color) },
  ];

  // Pré-calcula as linhas de cada spec
  font(7.5, 'bold');
  const specsCalc = specs.map((s) => {
    font(7.5);
    const lw = doc.getTextWidth(s.label) + 3;
    font(7.5, 'bold');
    const linhas = wrap(s.valor, innerW - lw);
    return { ...s, linhas, lw, h: Math.max(linhas.length * 3.8, 3.8) + 3.4 };
  });

  const alturaSpecs = 4 + 6 + specsCalc.reduce((acc, s) => acc + s.h, 0) + 3;

  const textoNotas =
    projeto.notes ||
    'Projeto desenvolvido sob medida com vidro de segurança e perfis de alta durabilidade. Garantia de 1 ano para ferragens e vedação.';
  font(7.5);
  const notasLinhas = wrap(textoNotas, innerW);
  const alturaNotas = 4 + 6 + notasLinhas.length * 3.9 + 4;

  const alturaBoxes = Math.max(alturaSpecs, alturaNotas, 45);
  novaPaginaSe(alturaBoxes);

  // Caixa esquerda
  caixa(M, y, boxW, alturaBoxes, { border: COR.slate200, raio: 3 });
  // Ícone (círculo azul com check)
  setFill(COR.azul);
  doc.circle(M + 6.2, y + 6, 1.7, 'F');
  setDraw(COR.branco);
  doc.setLineWidth(0.35);
  doc.line(M + 5.4, y + 6, M + 6, y + 6.6);
  doc.line(M + 6, y + 6.6, M + 7.1, y + 5.3);

  font(7.5, 'bold');
  setText(COR.slate900);
  doc.text('ESPECIFICAÇÕES DOS MATERIAIS', M + 10, y + 6.6);

  let sy = y + 12;
  specsCalc.forEach((s, i) => {
    font(7.5);
    setText(COR.slate500);
    doc.text(s.label, M + 4, sy + 2.6);

    font(7.5, 'bold');
    setText(COR.slate800);
    s.linhas.forEach((t, k) => {
      doc.text(t, M + boxW - 4, sy + 2.6 + k * 3.8, { align: 'right' });
    });

    sy += s.h;
    if (i < specsCalc.length - 1) {
      linha(M + 4, sy - 1.2, M + boxW - 4, sy - 1.2, COR.slate100, 0.25);
    }
  });

  // Caixa direita
  const xR = M + boxW + boxGap;
  caixa(xR, y, boxW, alturaBoxes, { border: COR.slate200, raio: 3 });

  setFill(COR.ambar);
  doc.circle(xR + 6.2, y + 6, 1.7, 'F');
  font(7.5, 'bold');
  setText(COR.slate900);
  doc.text('OBSERVAÇÕES E GARANTIA', xR + 10, y + 6.6);

  font(7.5);
  setText(COR.slate600);
  notasLinhas.forEach((t, k) => {
    doc.text(t, xR + 4, y + 13 + k * 3.9);
  });

  y += alturaBoxes + 10;

  /* ====================================================================== */
  /*  5. ASSINATURAS                                                          */
  /* ====================================================================== */

  novaPaginaSe(26);
  y += 10;
  const sigW = (CW - 20) / 2;

  linha(M, y, M + sigW, y, COR.slate400, 0.3);
  linha(M + sigW + 20, y, M + CW, y, COR.slate400, 0.3);

  font(7.5, 'bold');
  setText(COR.slate800);
  doc.text(limpar(client?.name ?? 'Cliente'), M + sigW / 2, y + 4.5, { align: 'center' });
  doc.text(limpar(client?.cpf ?? '111.111.111-11'), M + sigW / 2, y + 8.2, { align: 'center' });
  doc.text(limpar(user?.cpf ?? '111.111.111-11'), M + sigW + 20 + sigW / 2, y + 4.5, { align: 'center' });
  doc.text(limpar(client?.cpf ?? '111.111.111-11'), M + sigW + 20 + sigW / 2, y + 8.2, { align: 'center' });

  font(6.5);
  setText(COR.slate400);
  doc.text('Aprovação do Cliente', M + sigW / 2, y + 11.9, { align: 'center' });
  doc.text('Responsável Técnico', M + sigW + 20 + sigW / 2, y + 11.9, { align: 'center' });

  /* ====================================================================== */
  /*  6. RODAPÉ EM TODAS AS PÁGINAS                                           */
  /* ====================================================================== */

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    const fy = PAGE_H - 11;
    linha(M, fy - 3.5, PAGE_W - M, fy - 3.5, COR.slate200, 0.25);

    font(7);
    setText(COR.slate400);
    doc.text(`${limpar(empresa)}  •  Proposta Ref #${projeto.id}`, M, fy);
    doc.text(`Página ${p} de ${total}`, PAGE_W - M, fy, { align: 'right' });
    doc.text('Proposta válida por 15 dias a partir da data de emissão.', PAGE_W / 2, fy, {
      align: 'center',
    });
  }

  /* ------------------------------ saída -------------------------------- */

  const nomeArquivo = `proposta-${slug(projeto.name || 'projeto')}-${projeto.id}.pdf`;

  if (modo === 'open') {
    const url = doc.output('bloburl');
    window.open(url.toString(), '_blank');
  } else {
    doc.save(nomeArquivo);
  }
};