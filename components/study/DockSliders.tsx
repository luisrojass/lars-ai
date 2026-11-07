'use client';

import React from 'react';
import { useStudyStore } from '@/store/useStudyStore';
import { MathFormula } from '@/components/math/MathFormula';
import { Sliders, RotateCcw, Box, Compass, Eye } from 'lucide-react';

export const DockSliders: React.FC = () => {
  const {
    getEsquemaActual,
    valoresSliders,
    actualizarSlider,
    reiniciarSliders,
    motorGrafico,
    toggleMotorGrafico,
    mostrarLineasGuia,
    toggleLineasGuia
  } = useStudyStore();

  const esquema = getEsquemaActual();
  const sliders = esquema.sliders || [];

  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 sm:px-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Cabecera del Dock y Controles Rápidos */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-sky-500/20 text-sky-400">
              <Sliders className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-200 tracking-wide">
                Dock Interactivo Math.js
              </span>
              <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                60 FPS en Memoria Local
              </span>
            </div>
          </div>

          {/* Botones de acción del dock */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleMotorGrafico}
              title="Alternar entre motor 2D (Mafs) y 3D (Three.js)"
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors border border-slate-700"
            >
              <Box className="h-3 w-3 text-sky-400" />
              <span>{motorGrafico === 'mafs-2d' ? '3D Three.js' : '2D Mafs'}</span>
            </button>

            <button
              onClick={toggleLineasGuia}
              title="Mostrar u ocultar cuadrícula"
              className={`p-1.5 rounded transition-colors border ${
                mostrarLineasGuia
                  ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={reiniciarSliders}
              title="Restablecer valores iniciales"
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Sliders Reactivos */}
        <div className="flex-1 w-full flex flex-wrap items-center justify-end gap-3 sm:gap-6">
          {sliders.map((s) => {
            const valorActual = valoresSliders[s.id] ?? s.valorDefecto;

            return (
              <div
                key={s.id}
                className="flex items-center gap-2.5 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800 min-w-[210px] sm:min-w-[230px]"
              >
                {/* Símbolo Matemático con KaTeX */}
                <div className="w-7 text-xs font-mono font-bold text-sky-400 text-center">
                  <MathFormula math={`$${s.simbolo}$`} />
                </div>

                {/* Slider Input */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                    <span className="truncate max-w-[100px]">{s.nombre}</span>
                    <span className="font-mono text-slate-200 font-semibold">
                      {valorActual.toFixed(1)} {s.unidad || ''}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={valorActual}
                    onChange={(e) =>
                      actualizarSlider(s.id, parseFloat(e.target.value))
                    }
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DockSliders;
