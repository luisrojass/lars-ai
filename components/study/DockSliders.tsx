'use client';

import React from 'react';
import { useStudyStore } from '@/store/useStudyStore';
import { MathFormula } from '@/components/math/MathFormula';
import { Sliders, RotateCcw, Box, Compass } from 'lucide-react';

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
    <div className="w-full bg-white/98 backdrop-blur-md border-t-2 border-slate-300 px-4 py-3.5 sm:px-6 sm:py-4 shadow-xl space-y-3">
      {/* Cabecera del Dock y Controles Rápidos */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-600">
            <Sliders className="h-4 w-4" />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
            Dock Interactivo Math.js
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            60 FPS en Memoria Local
          </span>
        </div>

        {/* Botones de acción del dock */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleMotorGrafico}
            title="Alternar entre motor 2D (Mafs) y 3D (Three.js)"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors border border-slate-300"
          >
            <Box className="h-3.5 w-3.5 text-sky-600" />
            <span>{motorGrafico === 'mafs-2d' ? '3D Three.js' : '2D Mafs'}</span>
          </button>

          <button
            onClick={toggleLineasGuia}
            title="Mostrar u ocultar cuadrícula"
            className={`p-1.5 rounded-lg transition-colors border ${
              mostrarLineasGuia
                ? 'bg-sky-50 border-sky-300 text-sky-700'
                : 'bg-slate-100 border-slate-300 text-slate-600'
            }`}
          >
            <Compass className="h-4 w-4" />
          </button>

          <button
            onClick={reiniciarSliders}
            title="Restablecer valores iniciales"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors border border-slate-300"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
        </div>
      </div>

      {/* Sliders Reactivos Grandes ocupando todo el ancho */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {sliders.map((s) => {
          const valorActual = valoresSliders[s.id] ?? s.valorDefecto;
          const fineStep = Math.min(s.step || 0.01, 0.01);

          return (
            <div
              key={s.id}
              className="w-full flex items-center gap-3.5 bg-slate-50 px-4 py-3 rounded-2xl border-2 border-slate-300 hover:border-sky-400 transition-colors shadow-2xs"
            >
              <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-300 flex items-center justify-center text-sm sm:text-base font-mono font-extrabold text-sky-700 shrink-0 shadow-2xs">
                <MathFormula math={`$${s.simbolo}$`} />
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                    {s.nombre}
                  </span>
                  <span className="font-mono text-xs sm:text-sm text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-lg font-extrabold">
                    {valorActual.toFixed(2)} {s.unidad || ''}
                  </span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={fineStep}
                  value={valorActual}
                  onChange={(e) =>
                    actualizarSlider(s.id, parseFloat(e.target.value))
                  }
                  className="w-full projector-slider focus:outline-none"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DockSliders;
