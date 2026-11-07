'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Mafs, Coordinates, Plot, Vector, Point } from 'mafs';
import { EsquemaGeometrico } from '@/types';
import { createEvaluator } from '@/lib/mathEvaluator';

interface Canvas2DMafsProps {
  esquema: EsquemaGeometrico;
  valoresSliders: Record<string, number>;
  mostrarLineasGuia?: boolean;
}

export const Canvas2DMafs: React.FC<Canvas2DMafsProps> = ({
  esquema,
  valoresSliders,
  mostrarLineasGuia = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 600,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height),
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
      ref={containerRef}
      className="w-full h-full relative select-none overflow-hidden"
      style={{
        backgroundColor: '#F8FAFC',
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
        width={dimensions.width}
        height={dimensions.height}
        viewBox={{
          x: esquema.dominioX,
          y: esquema.dominioY,
          padding: 0.4,
        }}
        preserveAspectRatio={false}
        pan={true}
        zoom={{ min: 0.3, max: 4 }}
      >
        {mostrarLineasGuia && (
          <Coordinates.Cartesian
            subdivisions={2}
            xAxis={{ lines: 1, labels: (x) => (x !== 0 ? `${x}` : '') }}
            yAxis={{ lines: 1, labels: (y) => (y !== 0 ? `${y}` : '') }}
          />
        )}

        {esquema.elementos.map((el) => {
          if (el.tipo === 'funcion' && el.expresion) {
            const fn = evaluadoresFunciones.get(el.id) || (() => 0);
            const esDiagnostica = el.esDiagnostica || el.estiloLinea === 'punteada';

            return (
              <Plot.OfX
                key={el.id}
                y={fn}
                color={el.color}
                weight={el.grosor || (esDiagnostica ? 2.5 : 3.5)}
                style={esDiagnostica ? 'dashed' : 'solid'}
              />
            );
          }

          if (el.tipo === 'vector' && el.punto) {
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
