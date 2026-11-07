'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Mafs, Coordinates, Plot, Vector, Point, Polygon, Line, Text } from 'mafs';
import type {
  ArchetypeGraphPayload,
  PlotRenderLayer,
  TangentLineRenderLayer,
  IntegralFillRenderLayer,
  RiemannRectanglesRenderLayer,
  DeformedGridRenderLayer,
  VectorRenderLayer,
} from '@/lib/types';
import {
  createEvaluator,
  evaluateMathFunction,
  evaluateVector2D,
} from '@/lib/mathEvaluator';

interface ArchetypeCanvas2DProps {
  graph: ArchetypeGraphPayload;
  sliderValues: Record<string, number>;
  showErrorLayer?: boolean;
  showGrid?: boolean;
}

function interpolateMatrix2x2(
  mat: [[number, number], [number, number]],
  t: number
): [[number, number], [number, number]] {
  const clampedT = Number.isFinite(t) ? t : 1;
  return [
    [(1 - clampedT) * 1 + clampedT * mat[0][0], clampedT * mat[0][1]],
    [clampedT * mat[1][0], (1 - clampedT) * 1 + clampedT * mat[1][1]],
  ];
}

function applyMatrix2x2(
  mat: [[number, number], [number, number]],
  pt: [number, number]
): [number, number] {
  return [
    mat[0][0] * pt[0] + mat[0][1] * pt[1],
    mat[1][0] * pt[0] + mat[1][1] * pt[1],
  ];
}

export const ArchetypeCanvas2D: React.FC<ArchetypeCanvas2DProps> = ({
  graph,
  sliderValues,
  showErrorLayer = true,
  showGrid = true,
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

  const xBounds: [number, number] = graph.view?.x_bounds || [-5, 5];
  const yBounds: [number, number] = graph.view?.y_bounds || [-5, 5];
  const gridStep = graph.view?.grid_step || 1;

  // Compilación en memoria de las funciones declaradas en graph.functions (para Arquetipos 1 y 2)
  const compiledFunctions = useMemo(() => {
    const map: Record<string, (x: number) => number> = {};
    if ('functions' in graph && graph.functions) {
      for (const [key, expr] of Object.entries(graph.functions)) {
        if (typeof expr === 'string') {
          map[key] = createEvaluator(expr, sliderValues);
        }
      }
    }
    return map;
  }, [graph, sliderValues]);

  const resolveFn = (fnKeyOrExpr: string): ((x: number) => number) => {
    if (compiledFunctions[fnKeyOrExpr]) {
      return compiledFunctions[fnKeyOrExpr];
    }
    return createEvaluator(fnKeyOrExpr, sliderValues);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative select-none overflow-hidden"
      style={{
        backgroundColor: '#F8FAFC',
        // Variables CSS de Mafs forzadas a Modo Claro Proyector (#F8FAFC)
        // @ts-expect-error Mafs custom CSS variables
        '--mafs-bg': '#F8FAFC',
        '--mafs-fg': '#334155',
        '--mafs-origin-color': '#334155',
        '--mafs-line-color': '#CBD5E1',
        '--grid-line-subdivision-color': '#E2E8F0',
        '--mafs-axis-stroke-width': '2px',
      }}
    >
      <Mafs
        width={dimensions.width}
        height={dimensions.height}
        viewBox={{
          x: xBounds,
          y: yBounds,
          padding: 0.4,
        }}
        preserveAspectRatio={false}
        pan={true}
        zoom={{ min: 0.4, max: 3.5 }}
      >
        {/* Cuadrícula Cartesiana de Alto Contraste */}
        {showGrid && (
          <Coordinates.Cartesian
            subdivisions={2}
            xAxis={{
              lines: gridStep,
              labels: (x) => (x !== 0 ? `${x}` : ''),
            }}
            yAxis={{
              lines: gridStep,
              labels: (y) => (y !== 0 ? `${y}` : ''),
            }}
          />
        )}

        {/* Renderizado determinista por capas (render_layers) */}
        {graph.render_layers.map((layer, idx) => {
          // Ocultar capa diagnóstica de error si el usuario la desactiva
          if ('role' in layer && layer.role === 'error' && !showErrorLayer) {
            return null;
          }

          // ------------------------------------------------------------------
          // CAPA 1: PLOT DE FUNCIÓN 2D (Arquetipos 1 y 2)
          // ------------------------------------------------------------------
          if (layer.type === 'plot') {
            const l = layer as PlotRenderLayer;
            const fn = resolveFn(l.fn);
            return (
              <Plot.OfX
                key={`plot-${idx}`}
                y={fn}
                color={l.color || '#334155'}
                style={l.style === 'dashed' ? 'dashed' : 'solid'}
                weight={l.weight ?? 3}
              />
            );
          }

          // ------------------------------------------------------------------
          // CAPA 2: RECTA TANGENTE + SECANTE INTERACTIVA (Arquetipo 1)
          // ------------------------------------------------------------------
          if (layer.type === 'tangent_line' && graph.archetype === 'CALCULUS_DERIVATIVE_TANGENT_2D') {
            const l = layer as TangentLineRenderLayer;
            const x0Var = l.eval_at || graph.interactive_point?.symbol || 'x_0';
            const x0 =
              sliderValues[x0Var] ??
              graph.interactive_point?.default_value ??
              2;

            const targetFn = resolveFn(l.fn_source || 'target');
            const slopeFn = resolveFn(l.slope_expr);

            const y0 = targetFn(x0);
            const m = slopeFn(x0);

            const tangentY = (x: number) => y0 + m * (x - x0);
            const hVal = sliderValues['h'];

            return (
              <React.Fragment key={`tangent-${l.role}-${idx}`}>
                <Plot.OfX
                  y={tangentY}
                  color={l.color || (l.role === 'correct' ? '#0284C7' : '#E11D48')}
                  style={l.style === 'dashed' || l.role === 'error' ? 'dashed' : 'solid'}
                  weight={l.weight ?? (l.role === 'correct' ? 3.5 : 3)}
                />

                {/* Si es la capa correcta, dibujamos también el punto de tangencia y la secante con paso h */}
                {l.role === 'correct' && (
                  <>
                    {typeof hVal === 'number' && Math.abs(hVal) > 0.01 && (
                      <>
                        <Line.Segment
                          point1={[x0, y0]}
                          point2={[x0 + hVal, targetFn(x0 + hVal)]}
                          color="#0D9488"
                          style="dashed"
                          weight={2}
                        />
                        <Point
                          x={x0 + hVal}
                          y={targetFn(x0 + hVal)}
                          color="#0D9488"
                        />
                      </>
                    )}
                    <Point x={x0} y={y0} color="#0284C7" />
                    <Text
                      x={x0}
                      y={y0 + 0.55}
                      size={13}
                      color="#0F172A"
                    >
                      {`(${x0.toFixed(2)}, ${y0.toFixed(2)})`}
                    </Text>
                  </>
                )}
              </React.Fragment>
            );
          }

          // ------------------------------------------------------------------
          // CAPA 3: ÁREA BAJO LA CURVA / INTEGRAL DEFINIDA (Arquetipo 2)
          // ------------------------------------------------------------------
          if (layer.type === 'integral_fill') {
            const l = layer as IntegralFillRenderLayer;
            const fn = resolveFn(l.fn || 'target');
            const a = evaluateMathFunction(String(l.from ?? '0'), sliderValues);
            const b = evaluateMathFunction(String(l.to ?? 'b'), sliderValues);

            if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(b - a) < 1e-4) {
              return null;
            }

            const steps = 72;
            const dx = (b - a) / steps;
            const pts: [number, number][] = [[a, 0]];
            for (let i = 0; i <= steps; i++) {
              const x = a + i * dx;
              pts.push([x, fn(x)]);
            }
            pts.push([b, 0]);

            return (
              <Polygon
                key={`integral-fill-${idx}`}
                points={pts}
                color={l.border_color || '#0284C7'}
                fillOpacity={0.25}
                weight={2.5}
              />
            );
          }

          // ------------------------------------------------------------------
          // CAPA 4: RECTÁNGULOS DE RIEMANN (Arquetipo 2)
          // ------------------------------------------------------------------
          if (layer.type === 'riemann_rectangles') {
            const l = layer as RiemannRectanglesRenderLayer;
            const fn = resolveFn(l.fn || 'target');
            const a = evaluateMathFunction(String(l.from ?? '0'), sliderValues);
            const b = evaluateMathFunction(String(l.to ?? 'b'), sliderValues);
            const rawN = evaluateMathFunction(String(l.partitions ?? 'n'), sliderValues);
            const n = Math.max(1, Math.min(50, Math.round(rawN || 8)));

            if (!Number.isFinite(a) || !Number.isFinite(b) || Math.abs(b - a) < 1e-4) {
              return null;
            }

            const dx = (b - a) / n;
            const rects: React.ReactNode[] = [];

            for (let i = 0; i < n; i++) {
              const xLeft = a + i * dx;
              const xRight = xLeft + dx;
              let xSample = xLeft;
              if (l.method === 'right') xSample = xRight;
              else if (l.method === 'midpoint') xSample = xLeft + 0.5 * dx;

              const height = fn(xSample);
              rects.push(
                <Polygon
                  key={`riemann-${idx}-${i}`}
                  points={[
                    [xLeft, 0],
                    [xLeft, height],
                    [xRight, height],
                    [xRight, 0],
                  ]}
                  color={l.border_color || '#E11D48'}
                  fillOpacity={0.18}
                  weight={1.5}
                />
              );
            }

            return <React.Fragment key={`riemann-group-${idx}`}>{rects}</React.Fragment>;
          }

          // ------------------------------------------------------------------
          // CAPA 5: CUADRÍCULA DEFORMADA POR MATRIZ 2x2 (Arquetipo 3)
          // ------------------------------------------------------------------
          if (layer.type === 'deformed_grid' && graph.archetype === 'LINEAR_TRANSFORMATION_GRID_2D') {
            const l = layer as DeformedGridRenderLayer;
            const baseMat =
              graph.matrices[l.matrix_source] ||
              graph.matrices.correct_transform || [
                [1, 0],
                [0, 1],
              ];
            const tVar = l.interpolation_var || 't';
            const tVal = sliderValues[tVar] ?? 1.0;
            const currentMat = interpolateMatrix2x2(baseMat, tVal);

            const gridRange = 5;
            const lines: React.ReactNode[] = [];

            for (let c = -gridRange; c <= gridRange; c++) {
              const vStart = applyMatrix2x2(currentMat, [c, -gridRange]);
              const vEnd = applyMatrix2x2(currentMat, [c, gridRange]);
              const hStart = applyMatrix2x2(currentMat, [-gridRange, c]);
              const hEnd = applyMatrix2x2(currentMat, [gridRange, c]);

              const isAxis = c === 0;
              lines.push(
                <Line.Segment
                  key={`dgrid-v-${c}`}
                  point1={vStart}
                  point2={vEnd}
                  color={isAxis ? '#64748B' : l.line_color || '#CBD5E1'}
                  weight={isAxis ? 2 : l.weight ?? 1.25}
                />,
                <Line.Segment
                  key={`dgrid-h-${c}`}
                  point1={hStart}
                  point2={hEnd}
                  color={isAxis ? '#64748B' : l.line_color || '#CBD5E1'}
                  weight={isAxis ? 2 : l.weight ?? 1.25}
                />
              );
            }

            // Vectores base transformados i_hat y j_hat
            const iHat = applyMatrix2x2(currentMat, [1, 0]);
            const jHat = applyMatrix2x2(currentMat, [0, 1]);

            return (
              <React.Fragment key={`deformed-grid-${idx}`}>
                {lines}
                <Vector tail={[0, 0]} tip={iHat} color="#0D9488" weight={2.5} />
                <Vector tail={[0, 0]} tip={jHat} color="#64748B" weight={2.5} />
              </React.Fragment>
            );
          }

          // ------------------------------------------------------------------
          // CAPA 6: VECTORES TRANSFORMADOS CON MATH.JS (Arquetipo 3)
          // ------------------------------------------------------------------
          if (layer.type === 'vector' && graph.archetype === 'LINEAR_TRANSFORMATION_GRID_2D') {
            const l = layer as VectorRenderLayer;
            const tVal = sliderValues['t'] ?? 1.0;

            // Interpolamos las matrices según el slider temporal 't' para que el vector se anime junto a la cuadrícula
            const interpolatedMatrices: Record<string, [[number, number], [number, number]]> = {};
            for (const [mKey, mat] of Object.entries(graph.matrices)) {
              interpolatedMatrices[mKey] =
                mKey === 'identity' ? mat : interpolateMatrix2x2(mat, tVal);
            }

            const tip = evaluateVector2D(
              l.expr,
              interpolatedMatrices,
              graph.input_vector,
              sliderValues
            );

            const origin: [number, number] =
              Array.isArray(l.origin) && l.origin.length === 2 ? l.origin : [0, 0];

            return (
              <React.Fragment key={`vec-${l.role}-${idx}`}>
                <Vector
                  tail={origin}
                  tip={tip}
                  color={l.color || (l.role === 'correct' ? '#0284C7' : '#E11D48')}
                  style={l.style === 'dashed' || l.role === 'error' ? 'dashed' : 'solid'}
                  weight={l.weight ?? (l.role === 'correct' ? 3.5 : 3)}
                />
                {l.label && (
                  <Text
                    x={tip[0] + (tip[0] >= 0 ? 0.35 : -0.35)}
                    y={tip[1] + (tip[1] >= 0 ? 0.35 : -0.35)}
                    size={12}
                    color={l.role === 'correct' ? '#0284C7' : '#E11D48'}
                  >
                    {`${l.label} (${tip[0].toFixed(1)}, ${tip[1].toFixed(1)})`}
                  </Text>
                )}
              </React.Fragment>
            );
          }

          return null;
        })}
      </Mafs>
    </div>
  );
};

export default ArchetypeCanvas2D;
