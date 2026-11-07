'use client';

import React, { useMemo } from 'react';
import { Mafs, Coordinates, Plot, Vector, Point, Theme } from 'mafs';
import { EsquemaGeometrico } from '@/types';
import { createEvaluator } from '@/lib/mathEvaluator';

interface Canvas2DMafsProps {
  esquema: EsquemaGeometrico;
  valoresSliders: Record<string, number>;
  mostrarLineasGuia?: boolean;
}

/**
 * Lienzo 2D 3B1B utilizando Mafs estrictamente configurado en Modo Claro Proyector.
 * Especificaciones de color:
 * - Fondo: #F8FAFC
 * - Ejes principales: #334155
 * - Cuadrícula secundaria: #CBD5E1
 * - Curva/Vector Correcto: Azul Cian (#0284C7) o Teal (#0D9488) con trazo 3.5px
 * - Curva/Vector de Error: Rojo Carmesí (#E11D48) con línea punteada diagnóstica
 */
export const Canvas2DMafs: React.FC<Canvas2DMafsProps> = ({
  esquema,
  valoresSliders,
  mostrarLineasGuia = true
}) => {
  // Evaluadores compilados en memoria con Math.js para 60 FPS garantizados
  const evaluadoresFunciones = useMemo(() => {
    const mapa = new Map<string, (x: number) => number>();
    esquema.elementos.forEach((el) => {
      if (el.tipo === 'funcion' && el.expresion) {
        mapa.set(el.id, createEvaluator(el.expresion, valoresSliders));
      }
    });
    return mapa;
  }, [esquema, valoresSliders]);

  return (
    <div
      className="w-full h-full relative select-none flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: '#F8FAFC',
        // Inyección de variables CSS de Mafs para forzar Modo Claro Proyector
        // @ts-expect-error Mafs custom CSS variables
        '--mafs-bg': '#F8FAFC',
        '--mafs-fg': '#334155',
        '--mafs-origin-color': '#334155',
        '--mafs-line-color': '#CBD5E1',
        '--grid-line-subdivision-color': '#E2E8F0',
        '--mafs-axis-stroke-width': '2px'
      }}
    >
      <Mafs
        viewBox={{
          x: esquema.dominioX,
          y: esquema.dominioY
        }}
        preserveAspectRatio="contain"
        pan={true}
        zoom={{ min: 0.3, max: 4 }}
      >
        {/* Cuadrícula de Alto Contraste para Proyectores */}
        {mostrarLineasGuia && (
          <Coordinates.Cartesian
            subdivisions={2}
            xAxis={{ lines: 1, labels: (x) => (x !== 0 ? `${x}` : '') }}
            yAxis={{ lines: 1, labels: (y) => (y !== 0 ? `${y}` : '') }}
          />
        )}

        {/* Renderizado de Elementos Geométricos */}
        {esquema.elementos.map((el) => {
          if (el.tipo === 'funcion' && el.expresion) {
            const fn = evaluadoresFunciones.get(el.id) || (() => 0);
            const esDiagnostica = el.esDiagnostica || el.estiloLinea === 'punteada';

            return (
              <Plot.OfX
                key={el.id}
                y={fn}
                color={el.color} // #0284C7, #0D9488, o #E11D48
                weight={el.grosor || (esDiagnostica ? 2.5 : 3.5)}
                style={esDiagnostica ? 'dashed' : 'solid'}
              />
            );
          }

          if (el.tipo === 'vector' && el.punto) {
            // Calcular posición del vector afectado por los sliders (ej. lambda o coordenadas)
            const factorLambda = valoresSliders['lambda'] ?? 1;
            const vxBase = valoresSliders['vx'] ?? el.punto[0];
            const vyBase = valoresSliders['vy'] ?? el.punto[1];

            let tipX = el.punto[0];
            let tipY = el.punto[1];

            if (el.id === 'vector-correct') {
              tipX = vxBase * factorLambda;
              tipY = vyBase * factorLambda;
            } else if (el.id === 'vector-v') {
              tipX = vxBase;
              tipY = vyBase;
            }

            const origen: [number, number] = (el.origen as [number, number]) || [0, 0];
            const esDiagnostica = el.esDiagnostica || el.estiloLinea === 'punteada';

            return (
              <React.Fragment key={el.id}>
                <Vector
                  tail={origen}
                  tip={[tipX, tipY]}
                  color={el.color}
                  weight={el.grosor || (esDiagnostica ? 2.5 : 3.5)}
                  style={esDiagnostica ? 'dashed' : 'solid'}
                />
              </React.Fragment>
            );
          }

          if (el.tipo === 'punto' && el.punto) {
            let px = el.punto[0];
            let py = el.punto[1];

            // Ajuste reactivo para el punto de inflexión con sliders si aplica
            if (el.id === 'pt-1' && valoresSliders['a']) {
              const a = valoresSliders['a'];
              const h = valoresSliders['h'] || 2;
              px = 1 / Math.sqrt(2 * a);
              py = h * Math.exp(-a * px * px);
            } else if (el.id === 'pt-2' && valoresSliders['a']) {
              const a = valoresSliders['a'];
              const h = valoresSliders['h'] || 2;
              px = -1 / Math.sqrt(2 * a);
              py = h * Math.exp(-a * px * px);
            }

            return (
              <Point
                key={el.id}
                x={px}
                y={py}
                color={el.color}
                svgCircleProps={{
                  r: el.grosor || 5,
                  stroke: '#334155',
                  strokeWidth: 1.5
                }}
              />
            );
          }

          return null;
        })}
      </Mafs>
    </div>
  );
};

export default Canvas2DMafs;
