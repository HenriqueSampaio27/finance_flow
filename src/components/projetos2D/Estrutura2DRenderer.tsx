import React from 'react';
import { TipoProjeto, CorVidro, CorPerfil, TipoPuxador } from '../../types';

interface Estrutura2DRendererProps {
  tipo: TipoProjeto;
  modelo: string;
  largura: number; // metros
  altura: number;  // metros
  corVidro: CorVidro;
  corPerfil: CorPerfil;
  puxador: TipoPuxador;
  showDimensions?: boolean;
  showGrid?: boolean;
  showReflections?: boolean;
  zoom?: number;
  className?: string;
  thumbnailMode?: boolean;
  grid: boolean,
  door: boolean
}

export const Estrutura2DRenderer: React.FC<Estrutura2DRendererProps> = ({
  tipo,
  modelo,
  largura,
  altura,
  corVidro,
  corPerfil,
  puxador,
  showDimensions = true,
  showGrid = true,
  showReflections = true,
  zoom = 1,
  className = '',
  thumbnailMode = false,
  grid,
  door
}) => {
  // Color mappings
  const vidroColors: Record<CorVidro, { fill: string; stroke: string; opacity: number }> = {
    incolor: { fill: 'rgba(215, 238, 252, 0.45)', stroke: 'rgba(125, 185, 222, 0.75)', opacity: 0.8 },
    fume: { fill: 'rgba(75, 85, 99, 0.55)', stroke: 'rgba(55, 65, 81, 0.9)', opacity: 0.85 },
    verde: { fill: 'rgba(167, 243, 208, 0.45)', stroke: 'rgba(52, 211, 153, 0.8)', opacity: 0.8 },
    bronze: { fill: 'rgba(217, 119, 6, 0.35)', stroke: 'rgba(180, 83, 9, 0.75)', opacity: 0.8 },
    jateado: { fill: 'rgba(241, 245, 249, 0.8)', stroke: 'rgba(203, 213, 225, 0.9)', opacity: 0.9 },
  };

  const perfilColors: Record<CorPerfil, { fill: string; stroke: string; highlight: string }> = {
    preto: { fill: '#1e293b', stroke: '#0f172a', highlight: '#334155' },
    branco: { fill: '#f8fafc', stroke: '#cbd5e1', highlight: '#cbd5e1' },
    inox: { fill: '#94a3b8', stroke: '#64748b', highlight: '#cbd5e1' },
    bronze: { fill: '#78350f', stroke: '#451a03', highlight: '#92400e' },
    dourado: { fill: '#d97706', stroke: '#b45309', highlight: '#fcd34d' },
  };

  const currentVidro = vidroColors[corVidro] || vidroColors.incolor;
  const currentPerfil = perfilColors[corPerfil] || perfilColors.preto;
  const currentPerfilTwo = perfilColors[corPerfil] 

  // Compute SVG viewBox dimensions to fit width and height with margin for dimension lines
  const baseWidth = Math.max(0.6, largura || 1.6);
  const baseHeight = Math.max(0.6, altura || 2.1);
  const aspectRatio = baseWidth / baseHeight;

  //arrow
    const slidingArrow = (
      x: number,
      y: number,
      direction: "left" | "right"
    ) => {
      const arrowSize = drawWidth * 0.05;

      return (
        <line
          x1={direction === "left" ? x + arrowSize : x - arrowSize}
          y1={y}
          x2={direction === "left" ? x - arrowSize : x + arrowSize}
          y2={y}
          stroke="#2563eb"
          strokeWidth="2"
          markerStart="url(#arrow-end)"
          opacity="0.9"
        />
      );
    };

  // Internal SVG coordinate units
  const marginX = thumbnailMode ? 20 : 70;
  const marginY = thumbnailMode ? 20 : 65;
  const drawWidth = 320 * (aspectRatio >= 1 ? 1 : Math.max(0.65, aspectRatio));
  const drawHeight = drawWidth / aspectRatio;

  const svgWidth = drawWidth + marginX * 2;
  const svgHeight = drawHeight + marginY * 2;
  const startX = marginX;
  const startY = marginY;

  // Render specific structural types
  const renderStructure = () => {
    switch (tipo) {
      case 'porta-vidro':
        return renderPortaVidro();
      case 'janela':
        return renderJanela();
      case 'box-banheiro':
        return renderBoxBanheiro();
      case 'portao-ferro':
        return renderPortaoFerro();
      case 'porta-aluminio':
        return renderPortaSocialFerro();
      default:
        return renderPortaVidro();
    }
  };

  // 1. Porta de Vidro
  const renderPortaVidro = () => {
    const isPivotante = modelo.toLowerCase().includes('pivo');
    const isBandeira = modelo.toLowerCase().includes('bandeira');
    const is4Folhas = modelo.toLowerCase().includes('4 folhas') || modelo.toLowerCase().includes('4f');
    const is2Folhas = modelo.toLowerCase().includes('2 folhas (1f + 1m)') || modelo.toLowerCase().includes('2f-d');
    const is2FolhasE = modelo.toLowerCase().includes('2 folhas (1m + 1f)') || modelo.toLowerCase().includes('2f-e');
    const isPivotante2Folhas = modelo.toLowerCase().includes('pivotante 2');
    const isAbrir2Folhas = modelo.toLowerCase().includes('abrir 2 folhas');
    const is2FolhasMoveis = modelo.toLowerCase().includes('2 folhas mo');

    const frameThick = thumbnailMode ? 3 : 5;
    const bandeiraHeight = isBandeira ? drawHeight * 0.22 : 0;
    const doorHeight = drawHeight - bandeiraHeight;
    const doorStartY = startY + bandeiraHeight;

    return (
      <g>
        {/* Outer Perimeter Frame (Alumínio) */}
        {/* Moldura externa: sem a parte inferior na porta de abrir */}
        {isAbrir2Folhas  || isPivotante2Folhas || isPivotante? (
          <path
            d={`M ${startX} ${startY + drawHeight}
                V ${startY}
                H ${startX + drawWidth}
                V ${startY + drawHeight}`}
            fill="none"
            stroke={currentPerfil.fill}
            strokeWidth={frameThick * 1.5}
          />
        ) : !is2FolhasMoveis ? 
          (<rect
            x={startX}
            y={startY}
            width={drawWidth}
            height={drawHeight}
            fill="none"
            stroke={currentPerfil.fill}
            strokeWidth={frameThick * 1.5}
            rx={2}
          />) : null
        }

        {/* Bandeira Superior se houver */}
        {isBandeira && (
          <g>
            <rect
              x={startX + frameThick}
              y={startY + frameThick}
              width={drawWidth - frameThick * 2}
              height={bandeiraHeight - frameThick}
              fill={currentVidro.fill}
              stroke={currentVidro.stroke}
              strokeWidth={1}
            />
            {/* Divisória da bandeira */}
            <rect
              x={startX}
              y={startY + bandeiraHeight - frameThick / 2}
              width={drawWidth}
              height={frameThick}
              fill={currentPerfil.fill}
            />
          </g>
        )}


        {/* Corpo Principal da Porta */}
        {is4Folhas ? (
          // 4 Folhas: 2 Fixas externas + 2 Móveis centrais
          (() => {
            const leafW = (drawWidth - frameThick * 2) / 4;
            return (
              <g>
                {/* Trilho Superior e Inferior */}
                <rect x={startX} y={doorStartY} width={drawWidth} height={frameThick * 1.8} fill={currentPerfil.fill} />
                <rect x={startX} y={doorStartY + doorHeight - frameThick * 1.8} width={drawWidth} height={frameThick * 1.8} fill={currentPerfil.fill} />

                {/* 4 Painéis */}
                {[0, 1, 2, 3].map((idx) => {
                  const leafX = startX + frameThick + idx * leafW;
                  const isCentral = idx === 1 || idx === 2;
                  return (
                    <g key={idx}>
                      <rect
                        x={leafX + 1.5}
                        y={doorStartY + frameThick * 1.8}
                        width={leafW - 3}
                        height={doorHeight - frameThick * 3.6}
                        fill={currentVidro.fill}
                        stroke={currentVidro.stroke}
                        strokeWidth={1.5}
                        rx={1}
                      />
                      {slidingArrow(
                        startX + leafW + 30,
                        doorStartY + doorHeight / 2,
                        "right"
                      )}

                      {slidingArrow(
                        startX + leafW * 2.7,
                        doorStartY + doorHeight / 2,
                        "left"
                      )}
                      {/* Borda do painel */}
                      <rect
                        x={leafX + 1.5}
                        y={doorStartY + frameThick * 1.8}
                        width={leafW - 3}
                        height={doorHeight - frameThick * 3.6}
                        fill="none"
                        stroke={currentPerfil.stroke}
                        strokeWidth={frameThick * 0.7}
                      />

                      {/* Puxadores nas folhas centrais */}
                      {isCentral && renderHandle(leafX + (idx === 1 ? leafW - 12 : 12), doorStartY + doorHeight / 2 - 20, 40, currentPerfil)}
                    </g>
                  );
                })}
              </g>
            );
          })()
        ) : is2Folhas ? (
          // 2 Folhas: 1 Fixa + 1 Móvel
          (() => {
            const leafW = (drawWidth - frameThick * 2) / 2;
            return (
              <g>
                {/* Trilho superior com roldanas discretas */}
                <rect x={startX} y={doorStartY} width={drawWidth} height={frameThick * 1.8} fill={currentPerfil.fill} />
                <rect x={startX} y={doorStartY + doorHeight - frameThick * 1.8} width={drawWidth} height={frameThick * 1.8} fill={currentPerfil.fill} />

                {/* Folha Fixa (Esquerda) */}
                <rect
                  x={startX + frameThick}
                  y={doorStartY + frameThick * 1.8}
                  width={leafW}
                  height={doorHeight - frameThick * 3.6}
                  fill={currentVidro.fill}
                  stroke={currentPerfil.stroke}
                  strokeWidth={frameThick * 0.8}
                />

                {/* Folha Móvel (Direita, com leve sobreposição) */}
                <rect
                  x={startX + leafW - 4}
                  y={doorStartY + frameThick * 1.8}
                  width={leafW + 4}
                  height={doorHeight - frameThick * 3.6}
                  fill={currentVidro.fill}
                  stroke={currentPerfil.fill}
                  strokeWidth={frameThick}
                />

                {slidingArrow(
                  startX + leafW + 12 + leafW / 2,
                  doorStartY + doorHeight / 2,
                  "right"
                )}

                {/* Puxador da porta móvel */}
                {renderHandle(startX + 2 * leafW - 18, doorStartY + doorHeight / 2 - 25, 50, currentPerfil)}
              </g>
            );
          })()
          ) : is2FolhasMoveis ? (
            // PORTA DE CORRER 2 FOLHAS ATRÁS DA PAREDE
            (() => {
              const frame = frameThick;
              const innerX = startX + frame;
              const innerY = doorStartY + frame * 1.8;
              const innerW = drawWidth - frame * 2;
              const innerH = doorHeight - frame * 3.6;
              const leafW = innerW / 2;
              const centerX = startX + drawWidth / 2;
              const overlap = frame * 0.8;
              const pocketW = leafW * 0.7;

              return (
                <g>

                  {/* PAREDE À ESQUERDA, À FRENTE DA FOLHA */}
                  <rect
                    x={startX - 87}
                    y={innerY-10}
                    width={pocketW}
                    height={innerH +20}
                    fill="#d1d5db"
                    stroke="none"
                  />

                  {/* PAREDE À DIREITA, À FRENTE DA FOLHA */}
                  <rect
                    x={startX + drawWidth }
                    y={innerY - 10}
                    width={pocketW}
                    height={innerH +20}
                    fill="#d1d5db"
                    stroke="none"
                  />

                  {/* TRILHO SUPERIOR */}
                  <rect
                    x={startX - pocketW}
                    y={doorStartY}
                    width={drawWidth + pocketW *2}
                    height={frame * 1.8}
                    fill={currentPerfil.fill}
                    stroke={currentPerfil.stroke}
                    strokeWidth={1}
                  />

                  {/* GUIA INFERIOR */}
                  <rect
                    x={startX - pocketW + 3}
                    y={doorStartY + doorHeight - frame * 1.8}
                    width={pocketW}
                    height={frame * 1.8}
                    fill={currentPerfil.fill}
                    stroke={currentPerfil.stroke}
                    strokeWidth={1}
                  />

                  <rect
                    x={startX + drawWidth}
                    y={doorStartY + doorHeight - frame * 1.8}
                    width={pocketW}
                    height={frame * 1.8}
                    fill={currentPerfil.fill}
                    stroke={currentPerfil.stroke}
                    strokeWidth={1}
                  />

                  {/* FOLHA ESQUERDA */}
                  <rect
                    x={innerX}
                    y={innerY}
                    width={leafW + overlap -5}
                    height={innerH}
                    fill={currentVidro.fill}
                    stroke={currentPerfil.stroke}
                    strokeWidth={frame * 0.8}
                  />

                  {/* FOLHA DIREITA */}
                  <rect
                    x={innerX + leafW }
                    y={innerY}
                    width={leafW + overlap}
                    height={innerH}
                    fill={currentVidro.fill}
                    stroke={currentPerfil.stroke}
                    strokeWidth={frame * 0.8}
                  />
                  {/* Roldanas da folha esquerda */}
                  <g>
                    <circle
                      cx={innerX + 15}
                      cy={innerY - frame * 0.5}
                      r={5}
                      fill="#6b7280"
                      stroke="#374151"
                      strokeWidth={1.5}
                    />
                    <circle
                      cx={innerX + leafW - 15}
                      cy={innerY - frame * 0.5}
                      r={5}
                      fill="#6b7280"
                      stroke="#374151"
                      strokeWidth={1.5}
                    />
                  </g>

                  {/* Roldanas da folha direita */}
                  <g>
                    <circle
                      cx={innerX + leafW + 15}
                      cy={innerY - frame * 0.5}
                      r={5}
                      fill="#6b7280"
                      stroke="#374151"
                      strokeWidth={1.5}
                    />
                    <circle
                      cx={innerX + 2 * leafW - 15}
                      cy={innerY - frame * 0.5}
                      r={5}
                      fill="#6b7280"
                      stroke="#374151"
                      strokeWidth={1.5}
                    />
                  </g>

                  {/* PUXADORES PRÓXIMOS AO CENTRO */}
                  {renderHandle(
                    centerX - 30,
                    innerY + innerH / 2 - 20,
                    30,
                    currentPerfil
                  )}

                  {renderHandle(
                    centerX + 20,
                    innerY + innerH / 2 - 20,
                    30,
                    currentPerfil
                  )}

                  {/* INDICAÇÃO DE DESLIZAMENTO PARA A ESQUERDA */}
                  {slidingArrow(
                    innerX + leafW * 0.55,
                    innerY + innerH / 2 - 10,
                    "right"
                  )}

                  {/* INDICAÇÃO DE DESLIZAMENTO PARA A DIREITA */}
                  {slidingArrow(
                    innerX + leafW * 1.45,
                    innerY + innerH / 2 - 10,
                    "left"
                  )}

                </g>
              );
            })()
        ) : is2FolhasE ? (
          // 2 Folhas: 1 Móvel + 1 Fixa
          (() => {
            const leafW = (drawWidth - frameThick * 2) / 2;
            return (
              <g>
                {/* Trilho superior com roldanas discretas */}
                <rect x={startX} y={doorStartY} width={drawWidth} height={frameThick * 1.8} fill={currentPerfil.fill} />
                <rect x={startX} y={doorStartY + doorHeight - frameThick * 1.8} width={drawWidth} height={frameThick * 1.8} fill={currentPerfil.fill} />


                {/* Folha Móvel (Direita, com leve sobreposição) */}
                <rect
                  x={startX + frameThick + 5}
                  y={doorStartY + frameThick * 1.8}
                  width={leafW}
                  height={doorHeight - frameThick * 3.6}
                  fill={currentVidro.fill}
                  stroke={currentPerfil.stroke}
                  strokeWidth={frameThick * 0.8}
                />

                {/* Folha Fixa (Esquerda) */}
                <rect
                  x={startX + leafW}
                  y={doorStartY + frameThick * 1.8}
                  width={leafW + 4}
                  height={doorHeight - frameThick * 3.6}
                  fill={currentVidro.fill}
                  stroke={currentPerfil.fill}
                  strokeWidth={frameThick}
                />

                {slidingArrow(
                  startX + frameThick - 10 + leafW / 2,
                  doorStartY + doorHeight / 2,
                  "left"
                )}

                {/* Puxador da porta móvel */}
                {renderHandle(startX + 2 * frameThick + 12, doorStartY + doorHeight / 2 - 25, 50, currentPerfil)}
              </g>
            );
          })()
        ) : isAbrir2Folhas ? (
          // Porta de abrir de 2 folhas (duplo giro)
          (() => {
            const leafW = (drawWidth - frameThick * 2) / 2;
            const leafY = doorStartY + frameThick * 1.8;
            const leafH = doorHeight - frameThick * 3.6;
            const centerX = startX + frameThick + leafW;

            return (
              <g>
                {/* Folha esquerda */}
                <rect
                  x={startX + frameThick}
                  y={leafY -5}
                  width={leafW - 1}
                  height={leafH+10}
                  fill={currentVidro.fill}
                  stroke={currentPerfil.stroke}
                  strokeWidth={frameThick * 0.8}
                />

                {/* Folha direita */}
                <rect
                  x={centerX + 1}
                  y={leafY -5}
                  width={leafW - 1}
                  height={leafH + 10}
                  fill={currentVidro.fill}
                  stroke={currentPerfil.stroke}
                  strokeWidth={frameThick * 0.8}
                />

                {/* Dobradiças da folha esquerda */}
                {[0.15, 0.85].map((pos, i) => (
                  <rect
                    key={`hinge-left-${i}`}
                    x={startX + frameThick - 2}
                    y={leafY + leafH * pos - 5}
                    width={5}
                    height={10}
                    rx={1}
                    fill={currentPerfil.fill}
                  />
                ))}

                {/* Dobradiças da folha direita */}
                {[0.15, 0.85].map((pos, i) => (
                  <rect
                    key={`hinge-right-${i}`}
                    x={centerX + leafW - 3}
                    y={leafY + leafH * pos - 5}
                    width={5}
                    height={10}
                    rx={1}
                    fill={currentPerfil.fill}
                  />
                ))}

                {/* Puxador da folha esquerda */}
                {renderHandle(
                  centerX - 18,
                  doorStartY + doorHeight / 2 - 20,
                  40,
                  currentPerfil
                )}

                {/* Puxador da folha direita */}
                {renderHandle(
                  centerX + 8,
                  doorStartY + doorHeight / 2 - 20,
                  40,
                  currentPerfil
                )}
              </g>
            );
          })()
        ) : isPivotante2Folhas ? (
          // PORTA PIVOTANTE DE 2 FOLHAS
          (() => {
            const leafW = (drawWidth - frameThick * 2) / 2;
            const leafY = doorStartY + frameThick + 2;
            const leafH = doorHeight - (frameThick + 2) * 2;
            const centerX = startX + drawWidth / 2;


            return (
              <g>
                {/* =========================
                    FOLHA ESQUERDA
                  ========================= */}
                <rect
                  x={startX + frameThick}
                  y={leafY}
                  width={leafW}
                  height={leafH}
                  fill={currentVidro.fill}
                  stroke={currentVidro.stroke}
                  strokeWidth={1.5}
                  rx={1}
                />

                {/* =========================
                    FOLHA DIREITA
                  ========================= */}
                <rect
                  x={centerX}
                  y={leafY}
                  width={leafW}
                  height={leafH}
                  fill={currentVidro.fill}
                  stroke={currentVidro.stroke}
                  strokeWidth={1.5}
                  rx={1}
                />

                {/* =========================
                    PIVÔ DA FOLHA ESQUERDA
                  ========================= */}

                <rect
                  x={startX + drawWidth * 0.15 - 24}
                  y={doorStartY}
                  width={10}
                  height={14}
                  fill={currentPerfil.fill}
                  stroke={currentPerfil.highlight}
                  strokeWidth={1}
                  rx={1}
                />
                <rect
                  x={startX + drawWidth * 0.15 - 24}
                  y={doorStartY + doorHeight - 14}
                  width={10}
                  height={14}
                  fill={currentPerfil.fill}
                  stroke={currentPerfil.highlight}
                  strokeWidth={1}
                  rx={1}
                />
                {/* Indicador de mola de piso */}
                <ellipse
                  cx={startX + drawWidth * 0.15 - 18.5}
                  cy={doorStartY + doorHeight + 4}
                  rx={7}
                  ry={3}
                  fill={currentPerfil.stroke}
                />

                {/* =========================
                    PIVÔ DA FOLHA DIREITA
                  ========================= */}

                <rect
                  x={centerX + leafW - 18}
                  y={doorStartY}
                  width={10}
                  height={14}
                  fill={currentPerfil.fill}
                  stroke={currentPerfil.highlight}
                  strokeWidth={1}
                  rx={1}
                />
                <rect
                  x={centerX + leafW - 18}
                  y={doorStartY + doorHeight - 14}
                  width={10}
                  height={14}
                  fill={currentPerfil.fill}
                  stroke={currentPerfil.highlight}
                  strokeWidth={1}
                  rx={1}
                />
                {/* Indicador de mola de piso */}
                <ellipse
                  cx={centerX + leafW - 13}
                  cy={doorStartY + doorHeight + 4}
                  rx={7}
                  ry={3}
                  fill={currentPerfil.stroke}
                />

                {/* =========================
                    PUXADOR DA FOLHA ESQUERDA
                  ========================= */}
                {renderHandle(
                  centerX - 18,
                  doorStartY + doorHeight / 2 - 20,
                  40,
                  currentPerfil
                )}

                {/* =========================
                    PUXADOR DA FOLHA DIREITA
                  ========================= */}
                {renderHandle(
                  centerX + 13,
                  doorStartY + doorHeight / 2 - 20,
                  40,
                  currentPerfil
                )}

                {/* Linha central de encontro */}
                <line
                  x1={centerX}
                  y1={leafY}
                  x2={centerX}
                  y2={leafY + leafH}
                  stroke={currentPerfil.stroke}
                  strokeWidth={1}
                />
              </g>
            );
          })()
          ) : (
          // Pivotante 1 Folha
          <g>
            {/* Vidro da Folha */}
            <rect
              x={startX + frameThick + 2}
              y={doorStartY + frameThick + 2}
              width={drawWidth - (frameThick + 2) * 2}
              height={doorHeight - (frameThick + 2) * 2}
              fill={currentVidro.fill}
              stroke={currentVidro.stroke}
              strokeWidth={1.5}
              rx={2}
            />

            {/* Ferragens Pivotantes (Pino Superior e Inferior) */}
            <rect
              x={startX + drawWidth * 0.15 - 4}
              y={doorStartY}
              width={10}
              height={14}
              fill={currentPerfil.fill}
              stroke={currentPerfil.highlight}
              strokeWidth={1}
              rx={1}
            />
            <rect
              x={startX + drawWidth * 0.15 - 4}
              y={doorStartY + doorHeight - 14}
              width={10}
              height={14}
              fill={currentPerfil.fill}
              stroke={currentPerfil.highlight}
              strokeWidth={1}
              rx={1}
            />
            {/* Indicador de mola de piso */}
            <ellipse
              cx={startX + drawWidth * 0.15 + 1}
              cy={doorStartY + doorHeight + 4}
              rx={7}
              ry={3}
              fill={currentPerfil.stroke}
            />

            {/* Puxador Pivotante Elegante */}
            {renderHandle(startX + drawWidth * 0.82, doorStartY + doorHeight / 2 - 35, 70, currentPerfil)}

          </g>
        )}

        {/* Reflexo de Vidro Elegante (Diagonal Light Sheen) */}
        {showReflections && (
          <path
            d={`M ${startX + 15} ${doorStartY + 10} L ${startX + drawWidth * 0.35} ${doorStartY + 10} L ${startX + 10} ${doorStartY + doorHeight * 0.65} Z`}
            fill="rgba(255, 255, 255, 0.28)"
          />
        )}
      </g>
    );
  };

  // 2. Janela
  const renderJanela = () => {
    const is4Folhas = modelo.toLowerCase().includes('4 folhas') || modelo.toLowerCase().includes('4f');
    const isMaximAr = modelo.toLowerCase().includes('maxim') || modelo.toLowerCase().includes('basculante');
    const is2Folhas = modelo.toLowerCase().includes('2 folhas (1f + 1m)') || modelo.toLowerCase().includes('2f-d');
    const is2FolhasE = modelo.toLowerCase().includes('2 folhas (1m + 1f)') || modelo.toLowerCase().includes('2f-e');
    const frameThick = thumbnailMode ? 4 : 6;

    return (
      <g>
        {/* Marco Perimetral */}
        <rect
          x={startX}
          y={startY}
          width={drawWidth}
          height={drawHeight}
          fill="none"
          stroke={currentPerfil.fill}
          strokeWidth={frameThick * 1.4}
          rx={2}
        />

        {isMaximAr ? (
          // Maxim-Ar / Basculante
          <g>
            <rect
              x={startX + frameThick + 2}
              y={startY + frameThick + 2}
              width={drawWidth - (frameThick + 2) * 2}
              height={drawHeight - (frameThick + 2) * 2}
              fill={currentVidro.fill}
              stroke={currentPerfil.stroke}
              strokeWidth={frameThick * 0.8}
            />
            {/* Braço articulado mecânico */}
            <line
              x1={startX + frameThick + 8}
              y1={startY + drawHeight * 0.4}
              x2={startX + frameThick + 22}
              y2={startY + drawHeight * 0.65}
              stroke={currentPerfil.highlight}
              strokeWidth={2}
            />
            <line
              x1={startX + drawWidth - frameThick - 8}
              y1={startY + drawHeight * 0.4}
              x2={startX + drawWidth - frameThick - 22}
              y2={startY + drawHeight * 0.65}
              stroke={currentPerfil.highlight}
              strokeWidth={2}
            />
            {/* Fecho central inferior */}
            <rect
              x={startX + drawWidth / 2 - 8}
              y={startY + drawHeight - frameThick - 14}
              width={16}
              height={8}
              fill={currentPerfil.fill}
              rx={1}
            />
          </g>
        ) : is4Folhas ? (
          // Janela 4 Folhas (2 fixas laterais + 2 de correr centrais)
          (() => {
            const leafW = (drawWidth - frameThick * 2) / 4;
            return (
              <g>
                {[0, 1, 2, 3].map((idx) => {
                  const leafX = startX + frameThick + idx * leafW;
                  const isCenter = idx === 1 || idx === 2;
                  return (
                    <g key={idx}>
                      <rect
                        x={leafX + 1}
                        y={startY + frameThick + 1}
                        width={leafW - 2}
                        height={drawHeight - frameThick * 2 - 2}
                        fill={currentVidro.fill}
                        stroke={currentPerfil.stroke}
                        strokeWidth={frameThick * 0.75}
                      />

                      {slidingArrow(
                        startX + leafW + 46,
                        startY + drawHeight/2,
                        "right"
                      )}

                      {slidingArrow(
                        startX + leafW * 2.55,
                        startY + drawHeight/2,
                        "left"
                      )}
                      {/* Fecho concha nas folhas centrais */}
                      {isCenter && (
                        <rect
                          x={leafX + (idx === 1 ? leafW - 9 : 3)}
                          y={startY + drawHeight / 2 - 8}
                          width={6}
                          height={16}
                          fill={currentPerfil.fill}
                          rx={1.5}
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })()
        ) : is2Folhas ? (
          // Janela 2 Folhas (1 Fixa + 1 Móvel)
          (() => {
            const leafW = (drawWidth - frameThick * 2) / 2;
            return (
              <g>
                {/* Folha 1 */}
                <rect
                  x={startX + frameThick}
                  y={startY + frameThick}
                  width={leafW}
                  height={drawHeight - frameThick * 2}
                  fill={currentVidro.fill}
                  stroke={currentPerfil.stroke}
                  strokeWidth={frameThick * 0.8}
                />
                {/* Folha 2 */}
                <rect
                  x={startX + frameThick + leafW - 2}
                  y={startY + frameThick}
                  width={leafW}
                  height={drawHeight - frameThick * 2}
                  fill={currentVidro.fill}
                  stroke={currentPerfil.fill}
                  strokeWidth={frameThick * 0.9}
                />

                {slidingArrow(
                  startX + leafW +50,
                  startY + drawHeight/2,
                  "right"
                )}

                {/* Fecho Central */}
                <rect
                  x={startX + frameThick + leafW + 4}
                  y={startY + drawHeight / 2 - 10}
                  width={7}
                  height={20}
                  fill={currentPerfil.fill}
                  rx={2}
                />
              </g>
            );
          })()
        ): (
          // Janela 2 Folhas (1 Móvel + 1 Fixa)
          (() => {
            const leafW = (drawWidth - frameThick * 2) / 2;
            return (
              <g>
                
                <rect
                  x={startX + frameThick + leafW}
                  y={startY + frameThick}
                  width={leafW}
                  height={drawHeight - frameThick * 2}
                  fill={currentVidro.fill}
                  stroke={currentPerfil.fill}
                  strokeWidth={frameThick * 0.9}
                />
                <rect
                  x={startX + frameThick + 2}
                  y={startY + frameThick}
                  width={leafW}
                  height={drawHeight - frameThick * 2}
                  fill={currentVidro.fill}
                  stroke={currentPerfil.stroke}
                  strokeWidth={frameThick * 0.8}
                />
            
                {slidingArrow(
                  startX + leafW -40,
                  startY + drawHeight/2,
                  "left"
                )}
                {/* Fecho Central */}
                <rect
                  x={startX + frameThick + leafW - 14}
                  y={startY + drawHeight / 2 - 10}
                  width={7}
                  height={20}
                  fill={currentPerfil.fill}
                  rx={2}
                />
              </g>
            );
          })()
          )
          }

          {/* Grades de alumínio */}
            {grid && (
            <g>
              {(() => {
                const gradeX = startX + frameThick + 3;
                const gradeY = startY + frameThick + 3;
                const gradeW = drawWidth - frameThick * 2 - 6;
                const gradeH = drawHeight - frameThick * 2 - 6;
                

                const barrasVerticais = 7;
                const espessura = thumbnailMode ? 4 : 10;

                return (
                  <g>
                    {/* Barras verticais */}
                    {Array.from({ length: barrasVerticais }).map((_, i) => {
                      const x =
                        gradeX + (gradeW / (barrasVerticais + 1)) * (i + 1);

                      return (
                        <rect
                          key={`grade-v-${i}`}
                          x={x - espessura / 2}
                          y={gradeY -5}
                          width={espessura}
                          height={gradeH + 10}
                          fill={currentPerfil.fill}
                          stroke={currentPerfil.stroke}
                          strokeWidth={0.5}
                        />
                      );
                    })}
                    
                    {/* Barras horizontais */}
                    <rect
                      x={gradeX -13}
                      y={gradeY - espessura / 2 - frameThick -2}
                      width={gradeW +26}
                      height={espessura}
                      fill={currentPerfil.fill}
                      stroke={currentPerfil.stroke}
                      strokeWidth={0.5}
                    />
                    <rect
                      x={gradeX -13}
                      y={gradeY + drawHeight - frameThick *2 }
                      width={gradeW + 26}
                      height={espessura}
                      fill={currentPerfil.fill}
                      stroke={currentPerfil.stroke}
                      strokeWidth={0.5}
                    />
                  </g>
                );
              })()}
            </g>
            )}

        {/* Reflexo */}
        {showReflections && (
          <path
            d={`M ${startX + 10} ${startY + 8} L ${startX + drawWidth * 0.3} ${startY + 8} L ${startX + 8} ${startY + drawHeight * 0.65} Z`}
            fill="rgba(255, 255, 255, 0.25)"
          />
        )}
      </g>
    );
  };

  // 3. Box de Banheiro
  const renderBoxBanheiro = () => {
    const isCanto = modelo.toLowerCase().includes('canto')
    const frameThick = thumbnailMode ? 3 : 5;

    return (
      <g>
        {/* Trilho Superior Tubular (Elegance / Tradicional) */}
        <rect
          x={startX - 4}
          y={startY}
          width={drawWidth + 8}
          height={frameThick * 2.2}
          fill={currentPerfil.fill}
          stroke={currentPerfil.highlight}
          strokeWidth={1}
          rx={2}
        />
        {/* Guia Inferior */}
        <rect
          x={startX}
          y={startY + drawHeight - frameThick * 1.5}
          width={drawWidth}
          height={frameThick * 1.5}
          fill={currentPerfil.fill}
          rx={1}
        />

        {isCanto ? (
          // Box de Canto em L com perspectiva frontal
          (() => {
            const sideW = (drawWidth - frameThick) / 2;
            const leafW = drawWidth / 2;

            return (
              <g>
                {/* Lado A */}
                <rect
                  x={startX}
                  y={startY + frameThick * 2.2}
                  width={sideW - 34}
                  height={drawHeight - frameThick * 3.7}
                  fill={currentVidro.fill}
                  stroke={currentVidro.stroke}
                  strokeWidth={1.5}
                />
                <rect
                  x={startX+60}
                  y={startY + frameThick * 2.2}
                  width={sideW - 37}
                  height={drawHeight - frameThick * 3.7}
                  fill={currentVidro.fill}
                  stroke={currentVidro.stroke}
                  strokeWidth={1.5}
                />
                {slidingArrow(
                  startX + leafW - 10,
                  startY + drawHeight/2,
                  "right"
                )}

                {/* Lado B */}
                <rect
                  x={startX + sideW + 34}
                  y={startY + frameThick * 2.2}
                  width={sideW - 34}
                  height={drawHeight - frameThick * 3.7}
                  fill={currentVidro.fill}
                  stroke={currentVidro.stroke}
                  strokeWidth={1.5}
                />
                {/* Junção Angular 90 graus */}
                <line
                  x1={startX + sideW + 30}
                  y1={startY + frameThick * 2.2}
                  x2={startX + sideW +30}
                  y2={startY + drawHeight - frameThick * 1.5}
                  stroke={currentPerfil.fill}
                  strokeWidth={frameThick}
                  strokeDasharray="4 2"
                />

                {/* Puxador Concha ou Ponto */}
                <circle
                  cx={startX + leafW + 10}
                  cy={startY + drawHeight / 2}
                  r={5}
                  fill={currentPerfil.fill}
                  stroke={currentPerfil.highlight}
                  strokeWidth={1.5}
                />
              </g>
            );
          })()
        ) : (
          // Box Frontal (1 Fixo + 1 Móvel)
          (() => {
            const leafW = drawWidth / 2;
            return (
              <g>
                {/* Painel Fixo (Esquerdo com batedor e perfis de vedação) */}
                <rect
                  x={startX}
                  y={startY + frameThick * 2.2}
                  width={leafW}
                  height={drawHeight - frameThick * 3.7}
                  fill={currentVidro.fill}
                  stroke={currentVidro.stroke}
                  strokeWidth={1.5}
                />
                {/* Perfil U de fixação na parede */}
                <rect
                  x={startX}
                  y={startY + frameThick * 2.2}
                  width={frameThick}
                  height={drawHeight - frameThick * 3.7}
                  fill={currentPerfil.fill}
                />

                {/* Porta Móvel de Correr (Direita com sobreposição) */}
                <rect
                  x={startX + leafW - 8}
                  y={startY + frameThick * 2.2 + 2}
                  width={leafW + 8}
                  height={drawHeight - frameThick * 3.7 - 2}
                  fill={currentVidro.fill}
                  stroke={currentVidro.stroke}
                  strokeWidth={1.8}
                />

                {slidingArrow(
                  startX + leafW + 58,
                  startY + drawHeight/2 - 1,
                  "right"
                )}

                {/* Roldanas Aparentes Estilo Elegance no Trilho */}
                <circle cx={startX + leafW + 12} cy={startY + frameThick} r={4.5} fill={currentPerfil.highlight} stroke={currentPerfil.fill} strokeWidth={1.5} />
                <circle cx={startX + drawWidth - 16} cy={startY + frameThick} r={4.5} fill={currentPerfil.highlight} stroke={currentPerfil.fill} strokeWidth={1.5} />

                {/* Puxador Concha ou Ponto */}
                <circle
                  cx={startX + leafW + 90}
                  cy={startY + drawHeight / 2}
                  r={5}
                  fill={currentPerfil.fill}
                  stroke={currentPerfil.highlight}
                  strokeWidth={1.5}
                />
              </g>
            );
          })()
        )}

        {/* Reflexo */}
        {showReflections && (
          <path
            d={`M ${startX + 10} ${startY + 15} L ${startX + drawWidth * 0.28} ${startY + 15} L ${startX + 8} ${startY + drawHeight * 0.7} Z`}
            fill="rgba(255, 255, 255, 0.24)"
          />
        )}
      </g>
    );
  };

  // 4. Portão de Ferro
  const renderPortaoFerro = () => {
  const modeloLower = modelo.toLowerCase();

  const isBasculante = modeloLower.includes('basculante');
  const isVertical = modeloLower.includes('vertical') || modeloLower.includes('gradil');
  const isVeneziana = modeloLower.includes('veneziana');
  const isChapaLisa = modeloLower.includes('chapa-lisa') || modeloLower.includes('chapa lisa');
  const isPortaSocial = modeloLower.includes('porta-social') || modeloLower.includes('porta social');
  const isPortaTubular = modeloLower.includes('tubular');
  const isPortaGradil = modeloLower.includes('gradil');
  const isPortaVeneziana = modeloLower.includes('veneziana');

    const frameThick = thumbnailMode ? 5 : 8;

    return (
      <g>
        {/* Coluna / Caixa de Contrapeso Lateral (Basculante) */}
        {isBasculante && (
          <g>
            <rect
              x={startX - 18}
              y={startY - 6}
              width={14}
              height={drawHeight + 12}
              fill={currentPerfil.fill}
              stroke={currentPerfil.stroke}
              strokeWidth={1.5}
              rx={1}
            />
            {/* Friso da coluna */}
            <line x1={startX - 11} y1={startY + 10} x2={startX - 11} y2={startY + drawHeight - 10} stroke={currentPerfil.stroke} strokeWidth={1} />
          </g>
        )}

        {/* Quadro Principal do Portão */}
        <rect
          x={startX}
          y={startY}
          width={drawWidth}
          height={drawHeight}
          fill={currentPerfil.fill}
          stroke={currentPerfil.fill}
          strokeWidth={frameThick}
          rx={2}
        />

        {/* Preenchimento das Barras ou Chapas */}
        {isChapaLisa ? (
        // Portão de Chapa Lisa
        <g>
          {/* Chapa principal */}
          <rect
            x={startX + frameThick}
            y={startY + frameThick}
            width={drawWidth - frameThick * 2}
            height={drawHeight - frameThick * 2}
            fill={currentPerfil.fill}
            stroke={currentPerfil.stroke}
            strokeWidth={1}
          />

          {/* Frisos horizontais decorativos */}
          {Array.from({ length: 5 }).map((_, i) => {
            const frisoY =
              startY + frameThick +
              ((drawHeight - frameThick * 2) / 6) * (i + 1);

            return (
              <line
                key={i}
                x1={startX + frameThick + 4}
                y1={frisoY}
                x2={startX + drawWidth - frameThick - 4}
                y2={frisoY}
                stroke={currentPerfil.highlight}
                strokeWidth={1}
              />
            );
          })}
        </g>
      ) : isVeneziana ? (
          // Venezianas Fechadas
          (() => {
            const count = 14;
            const slatH = (drawHeight - frameThick * 2) / count;
            return (
              <g>
                {Array.from({ length: count }).map((_, i) => (
                  <g key={i}>
                    <rect
                      x={startX + frameThick}
                      y={startY + frameThick + i * slatH}
                      width={drawWidth - frameThick * 2}
                      height={slatH - 1.5}
                      fill={i % 2 === 0 ? currentPerfil.fill : currentPerfil.stroke}
                    />
                    <line
                      x1={startX + frameThick}
                      y1={startY + frameThick + i * slatH + slatH - 1.5}
                      x2={startX + drawWidth - frameThick}
                      y2={startY + frameThick + i * slatH + slatH - 1.5}
                      stroke={currentPerfil.highlight}
                      strokeWidth={1}
                    />
                  </g>
                ))}
              </g>
            );
          })()
        ) : isVertical ? (
          // Gradil Vertical
          (() => {
            const count = 16;
            const slatW = (drawWidth - frameThick * 2) / count;
            return (
              <g>
                {Array.from({ length: count }).map((_, i) => (
                  <rect
                    key={i}
                    x={startX + frameThick + i * slatW + slatW * 0.25}
                    y={startY + frameThick}
                    width={slatW * 0.5}
                    height={drawHeight - frameThick * 2}
                    fill={currentPerfil.fill}
                    stroke={currentPerfil.stroke}
                    strokeWidth={0.5}
                  />
                ))}
              </g>
            );
          })()
        ) : (
          // Tubular Horizontal Moderno
          (() => {
            const count = 12;
            const slatH = (drawHeight - frameThick * 2) / count;
            const widthDoor = door ? (drawWidth - frameThick * 13.4) : (drawWidth - frameThick * 2.5) 
            return (
              <g>
                {Array.from({ length: count }).map((_, i) => (
                  <rect
                    key={i}
                    x={startX + frameThick}
                    y={startY + frameThick + i * slatH + 2}
                    width={widthDoor}
                    height={slatH - 4}
                    fill={currentPerfil.fill}
                    stroke={currentPerfil.stroke}
                    strokeWidth={1}
                    rx={1}
                  />
                ))}
              </g>
            );
          })()
        )}

        
        {/* Porta Social integrada ao portão */}
        {door && (
          () => {
          const doorX = startX + drawWidth * 0.7;
          const doorY = startY + frameThick - 6;
          const doorW = drawWidth * 0.28;
          const doorH = drawHeight - frameThick /2;
          const doorFrame = frameThick * 0.65;

          const innerX = doorX + doorFrame;
          const innerY = doorY + doorFrame;
          const innerW = doorW - doorFrame * 2;
          const innerH = doorH - doorFrame * 2;

          const count = isVertical ? 5 : 12;
          const countVeneziana = 14

          return (
            <g>
              {/* Fundo da porta */}
              <rect
                x={doorX}
                y={doorY}
                width={doorW}
                height={doorH}
                fill={currentPerfil.fill}
                stroke={currentPerfil.stroke}
                strokeWidth={doorFrame}
                rx={1}
              />

              {/* Preenchimento conforme o modelo do portão */}
              {isChapaLisa ? (
                <g>
                  <rect
                    x={innerX}
                    y={innerY}
                    width={innerW}
                    height={innerH}
                    fill={currentPerfil.fill}
                    stroke={currentPerfil.stroke}
                    strokeWidth={0.8}
                  />
                  {Array.from({ length: 5 }).map((_, i) => {
                    const y = innerY + (innerH / 6) * (i + 1);
                    return (
                      <line
                        key={i}
                        x1={innerX + 2}
                        y1={y}
                        x2={innerX + innerW - 2}
                        y2={y}
                        stroke={currentPerfil.highlight}
                        strokeWidth={1}
                      />
                    );
                  })}
                </g>
              ) : isVeneziana ? (
                // Porta com lâminas venezianas
                <g>
                  {Array.from({ length: countVeneziana }).map((_, i) => {
                    const slatH = innerH / countVeneziana;
                    return (
                      <g key={i}>
                        <rect
                          x={innerX}
                          y={innerY + i * slatH - 1}
                          width={innerW}
                          height={slatH - 1}
                          fill={i % 2 === 0 ? currentPerfil.fill : currentPerfil.stroke}
                        />
                        <line
                          x1={innerX}
                          y1={innerY + (i + 1) * slatH - 2}
                          x2={innerX + innerW}
                          y2={innerY + (i + 1) * slatH - 2}
                          stroke={currentPerfil.highlight}
                          strokeWidth={1}
                        />
                      </g>
                    );
                  })}
                </g>
              ) : isVertical ? (
                // Porta com barras verticais
                <g>
                  {Array.from({ length: count }).map((_, i) => {
                    const barW = innerW / count;
                    return (
                      <rect
                        key={i}
                        x={innerX + i * barW + barW * 0.25}
                        y={innerY}
                        width={barW * 0.5}
                        height={innerH}
                        fill={currentPerfil.fill}
                        stroke={currentPerfil.stroke}
                        strokeWidth={0.5}
                      />
                    );
                  })}
                </g>
              ) : (
                // Porta com barras tubulares horizontais
                <g>
                  {Array.from({ length: count }).map((_, i) => {
                    const slatH = innerH / count;
                    return (
                      <rect
                        key={i}
                        x={innerX}
                        y={innerY + i * slatH + 1}
                        width={innerW}
                        height={Math.max(1, slatH - 3)}
                        fill={currentPerfil.fill}
                        stroke={currentPerfil.stroke}
                        strokeWidth={1}
                        rx={1}
                      />
                    );
                  })}
                </g>
              )}

              {/* Reforço da moldura da porta */}
              <rect
                x={doorX}
                y={doorY}
                width={doorW}
                height={doorH}
                fill="none"
                stroke={currentPerfil.fill}
                strokeWidth={doorFrame}
                rx={1}
              />

              {/* Dobradiças laterais */}
              {[0.25, 0.75].map((pos, i) => (
                <g key={i}>
                  <rect
                    x={doorX + 1}
                    y={doorY + doorH * pos - 5}
                    width={doorFrame * 0.8}
                    height={10}
                    fill={currentPerfil.fill}
                    stroke={currentPerfil.stroke}
                    strokeWidth={0.8}
                    rx={1}
                  />
                </g>
              ))}

              {/* Fechadura e maçaneta */}
              <rect
                x={doorX + doorW - doorFrame * 2.2}
                y={doorY + doorH * 0.48}
                width={doorFrame * 0.8}
                height={doorH * 0.09}
                fill="#94a3b8"
                stroke="#94a3b8"
                strokeWidth={0.8}
                rx={1}
              />
              <circle
                cx={doorX + doorW - doorFrame * 2.5}
                cy={doorY + doorH * 0.53}
                r={thumbnailMode ? 2 : 3}
                fill="#94a3b8"
                stroke="#475569"
                strokeWidth={0.8}
              />
            </g>
          );
        })()}
        
        
      </g>
    );
  };

  const renderPortaSocialFerro = () => {
    const modeloLower = modelo.toLowerCase();

    const isChapaLisa = modeloLower.includes('chapa-lisa') ||
      modeloLower.includes('chapa lisa');

    const isVertical = modeloLower.includes('gradil') ||
      modeloLower.includes('vertical');

    const isVeneziana = modeloLower.includes('veneziana');

    const frameThick = thumbnailMode ? 5 : 8;
    const doorFrame = frameThick * 0.8;

    const innerX = startX + doorFrame;
    const innerY = startY + doorFrame;
    const innerW = drawWidth - doorFrame * 2;
    const innerH = drawHeight - doorFrame * 2;

    const count = isChapaLisa ? 0 : isVeneziana ? 12 : isVertical ? 7 : 8;

    return (
      <g>
        {/* Estrutura externa da porta */}
        <rect
          x={startX}
          y={startY}
          width={drawWidth}
          height={drawHeight}
          fill={currentPerfil.fill}
          stroke={currentPerfil.stroke}
          strokeWidth={frameThick}
          rx={2}
        />

        {/* CHAPA LISA */}
        {isChapaLisa && (
          <g>
            <rect
              x={innerX}
              y={innerY}
              width={innerW}
              height={innerH}
              fill={currentPerfil.fill}
              stroke={currentPerfil.stroke}
              strokeWidth={1}
            />

            {/* Frisos decorativos */}
            {Array.from({ length: 5 }).map((_, i) => {
              const y = innerY + (innerH / 6) * (i + 1);

              return (
                <line
                  key={i}
                  x1={innerX + 2}
                  y1={y}
                  x2={innerX + innerW - 2}
                  y2={y}
                  stroke={currentPerfil.highlight}
                  strokeWidth={1}
                />
              );
            })}
          </g>
        )}

        {/* GRADIL VERTICAL */}
        {isVertical && !isChapaLisa && (
          <g>
            {Array.from({ length: count }).map((_, i) => {
              const barW = innerW / count;

              return (
                <rect
                  key={i}
                  x={innerX + i * barW + barW * 0.25}
                  y={innerY}
                  width={barW * 0.5}
                  height={innerH}
                  fill={currentPerfil.fill}
                  stroke={currentPerfil.stroke}
                  strokeWidth={0.8}
                />
              );
            })}
          </g>
        )}

        {/* VENEZIANA */}
        {isVeneziana && (
          <g>
            {Array.from({ length: count }).map((_, i) => {
              const slatH = innerH / count;

              return (
                <g key={i}>
                  <rect
                    x={innerX}
                    y={innerY + i * slatH + 1}
                    width={innerW}
                    height={Math.max(1, slatH - 2)}
                    fill={
                      i % 2 === 0
                        ? currentPerfil.fill
                        : currentPerfil.stroke
                    }
                  />

                  <line
                    x1={innerX}
                    y1={innerY + (i + 1) * slatH}
                    x2={innerX + innerW}
                    y2={innerY + (i + 1) * slatH}
                    stroke={currentPerfil.highlight}
                    strokeWidth={1}
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* TUBULAR HORIZONTAL */}
        {!isChapaLisa && !isVertical && !isVeneziana && (
          <g>
            {Array.from({ length: count }).map((_, i) => {
              const slatH = innerH / count;

              return (
                <rect
                  key={i}
                  x={innerX}
                  y={innerY + i * slatH + 1}
                  width={innerW}
                  height={Math.max(1, slatH - 3)}
                  fill={currentPerfil.fill}
                  stroke={currentPerfil.stroke}
                  strokeWidth={1}
                  rx={1}
                />
              );
            })}
          </g>
        )}

        {/* Reforço da moldura */}
        <rect
          x={startX}
          y={startY}
          width={drawWidth}
          height={drawHeight}
          fill="none"
          stroke={currentPerfil.fill}
          strokeWidth={doorFrame}
          rx={2}
        />

        {/* Dobradiças */}
        {[0.25, 0.75].map((pos, i) => (
          <g key={i}>
            <rect
              x={startX - 1}
              y={startY + drawHeight * pos - 5}
              width={doorFrame}
              height={10}
              fill={currentPerfil.fill}
              stroke={currentPerfil.stroke}
              strokeWidth={0.8}
              rx={1}
            />
          </g>
        ))}

        {/* Fechadura */}
        <rect
          x={startX + drawWidth - doorFrame * 1.5}
          y={startY + drawHeight * 0.48}
          width={doorFrame * 0.8}
          height={Math.max(4, drawHeight * 0.09)}
          fill="#94a3b8"
          stroke="#475569"
          strokeWidth={0.8}
          rx={1}
        />

        {/* Maçaneta */}
        <circle
          cx={startX + drawWidth - doorFrame * 2}
          cy={startY + drawHeight * 0.53}
          r={thumbnailMode ? 2 : 3}
          fill="#94a3b8"
          stroke="#475569"
          strokeWidth={0.8}
        />
      </g>
    );
  };

  // Helper to render handles
  const renderHandle = (hx: number, hy: number, hlen: number, perfil: { fill: string; stroke: string; highlight: string }) => {
    if (puxador === 'nenhum') return null;

    if (puxador === 'concha') {
      return (
        <rect
          x={hx - 4}
          y={hy + hlen * 0.3}
          width={8}
          height={24}
          fill={perfil.fill}
          stroke={perfil.highlight}
          strokeWidth={1.5}
          rx={3}
        />
      );
    }

    if (puxador === 'inox-h') {
      return (
        <g>
          <line x1={hx} y1={hy} x2={hx} y2={hy + hlen} stroke={perfil.stroke} strokeWidth={4} strokeLinecap="round" />
          <line x1={hx + 5} y1={hy} x2={hx + 5} y2={hy + hlen} stroke={perfil.fill} strokeWidth={3} strokeLinecap="round" />
          <circle cx={hx + 2.5} cy={hy + 8} r={3} fill={perfil.highlight} />
          <circle cx={hx + 2.5} cy={hy + hlen - 8} r={3} fill={perfil.highlight} />
        </g>
      );
    }

    // Tubular 40 / 60
    const length = puxador === 'tubular-60' ? Math.max(hlen, 65) : Math.max(hlen * 0.7, 42);
    const topY = hy + (hlen - length) / 2;

    return (
      <g>
        {/* Suportes fixadores */}
        <rect x={hx - 2} y={topY + 6} width={10} height={5} fill={perfil.highlight} rx={1} />
        <rect x={hx - 2} y={topY + length - 11} width={10} height={5} fill={perfil.highlight} rx={1} />
        {/* Barra Tubular Vertical */}
        <rect
          x={hx + 2}
          y={topY}
          width={5}
          height={length}
          fill={perfil.fill}
          stroke={perfil.highlight}
          strokeWidth={1}
          rx={2.5}
        />
      </g>
    );
  };

  return (
    <div
      className={`relative flex items-center justify-center select-none overflow-hidden ${className}`}
      style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
    >
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-full max-h-[520px] drop-shadow-sm transition-all"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle Grid Pattern */}
          <pattern id="grid-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(226, 232, 240, 0.7)" strokeWidth="0.8" />
          </pattern>

          {/* Dimension Arrowhead Markers */}
          <marker id="arrow-start" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 5 L 10 1 L 7 5 L 10 9 z" fill="#003d9b" />
          </marker>
          <marker id="arrow-end" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 5 L 10 1 L 7 5 L 10 9 z" fill="#003d9b" />
          </marker>
        </defs>

        {/* Grid Background */}
        {showGrid && (
          <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="url(#grid-pattern)" />
        )}

        {/* Architectural Ground / Floor Line */}
        <line
          x1={startX - 25}
          y1={startY + drawHeight + 1}
          x2={startX + drawWidth + 25}
          y2={startY + drawHeight + 1}
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeDasharray="6 3"
        />

        {/* 2D Structure Rendering */}
        {renderStructure()}

        {/* Clean, Non-intrusive Architectural Dimensions */}
        {showDimensions && !thumbnailMode && (
          <g className="text-xs font-semibold select-none font-sans">
            {/* Top Dimension: Largura (m) */}
            <g>
              {/* Extension lines */}
              <line x1={startX} y1={startY - 6} x2={startX} y2={startY - 26} stroke="#cbd5e1" strokeWidth="1" />
              <line x1={startX + drawWidth} y1={startY - 6} x2={startX + drawWidth} y2={startY - 26} stroke="#cbd5e1" strokeWidth="1" />
              {/* Dimension line with arrows */}
              <line
                x1={startX + 5}
                y1={startY - 18}
                x2={startX + drawWidth - 5}
                y2={startY - 18}
                stroke="#003d9b"
                strokeWidth="1.2"
                markerStart="url(#arrow-start)"
                markerEnd="url(#arrow-end)"
              />
              {/* Dimension label badge */}
              <rect
                x={startX + drawWidth / 2 - 28}
                y={startY - 28}
                width="56"
                height="19"
                fill="#ffffff"
                rx="4"
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={startX + drawWidth / 2}
                y={startY - 15}
                textAnchor="middle"
                fill="#003d9b"
                fontSize="11"
                fontWeight="700"
              >
                {largura.toFixed(2)} m
              </text>
            </g>

            {/* Left Dimension: Altura (m) */}
            <g>
              {/* Extension lines */}
              <line x1={startX - 6} y1={startY} x2={startX - 26} y2={startY} stroke="#cbd5e1" strokeWidth="1" />
              <line x1={startX - 6} y1={startY + drawHeight} x2={startX - 26} y2={startY + drawHeight} stroke="#cbd5e1" strokeWidth="1" />
              {/* Dimension line with arrows */}
              <line
                x1={startX - 18}
                y1={startY + 5}
                x2={startX - 18}
                y2={startY + drawHeight - 5}
                stroke="#003d9b"
                strokeWidth="1.2"
                markerStart="url(#arrow-start)"
                markerEnd="url(#arrow-end)"
              />
              {/* Dimension label badge */}
              <rect
                x={startX - 48}
                y={startY + drawHeight / 2 - 10}
                width="56"
                height="19"
                fill="#ffffff"
                rx="4"
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={startX - 20}
                y={startY + drawHeight / 2 + 3}
                textAnchor="middle"
                fill="#003d9b"
                fontSize="11"
                fontWeight="700"
              >
                {altura.toFixed(2)} m
              </text>
            </g>

            {/* Area indicator in bottom corner */}
            <g>
              <rect
                x={startX + drawWidth - 75}
                y={startY + drawHeight + 12}
                width="75"
                height="18"
                fill="#f8fafc"
                rx="3"
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={startX + drawWidth - 37}
                y={startY + drawHeight + 24}
                textAnchor="middle"
                fill="#475569"
                fontSize="10"
                fontWeight="600"
              >
                {(largura * altura).toFixed(2)} m²
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
