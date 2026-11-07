'use client';

import React, { useEffect, useCallback } from 'react';
import { useStudyStore } from '@/store/useStudyStore';
import { MathFormula } from '@/components/math/MathFormula';
import {
  Brain,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Keyboard,
  Sparkles,
  Zap
} from 'lucide-react';

export const TheaEnginePanel: React.FC = () => {
  const {
    preguntas,
    indicePreguntaActual,
    opcionSeleccionada,
    seleccionarOpcion,
    siguientePregunta,
    preguntaAnterior,
    irAPregunta
  } = useStudyStore();

  const pregunta = preguntas[indicePreguntaActual];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key;
      if (['1', '2', '3', '4'].includes(key)) {
        const index = parseInt(key, 10) - 1;
        if (pregunta && pregunta.opciones[index]) {
          seleccionarOpcion(pregunta.opciones[index]);
        }
      } else if (e.key === 'ArrowRight') {
        siguientePregunta();
      } else if (e.key === 'ArrowLeft') {
        preguntaAnterior();
      }
    },
    [pregunta, seleccionarOpcion, siguientePregunta, preguntaAnterior]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!pregunta) return null;

  const contarPalabras = (texto: string) => {
    return texto.trim().split(/\s+/).filter(Boolean).length;
  };

  return (
    <aside className="w-full h-full flex flex-col bg-white border-r border-slate-300 text-slate-900 select-none overflow-y-auto">
      {/* Header de Lars AI */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-sky-50 border border-sky-200 text-sky-600">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                Lars AI
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono font-semibold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300">
                <Zap className="h-2.5 w-2.5 text-amber-600" /> Zero-Wait
              </span>
            </div>
            <span className="text-[11px] text-slate-600 font-medium">{pregunta.materia}</span>
          </div>
        </div>

        {/* Indicador de Batería de Preguntas */}
        <div className="flex items-center gap-1">
          {preguntas.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => irAPregunta(idx)}
              className={`h-6 w-6 rounded text-xs font-mono font-bold transition-all ${
                idx === indicePreguntaActual
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido Principal de la Pregunta */}
      <div className="flex-1 p-5 space-y-5 overflow-y-auto">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
            <span className="text-sky-700 font-bold">PREGUNTA {pregunta.numero}</span>
            <span>•</span>
            <span className="text-slate-800 font-semibold">{pregunta.titulo}</span>
          </div>

          <div className="text-sm sm:text-base leading-relaxed text-slate-900 font-medium bg-[#F8FAFC] p-3.5 rounded-lg border border-slate-300">
            <MathFormula>{pregunta.enunciado}</MathFormula>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
          <span className="font-bold text-slate-800">Seleccione una alternativa:</span>
          <span className="flex items-center gap-1 text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 font-mono">
            <Keyboard className="h-3 w-3 text-sky-600" /> Atajos: teclas [1] [2] [3] [4]
          </span>
        </div>

        <div className="space-y-2.5">
          {pregunta.opciones.map((opcion) => {
            const esSeleccionada = opcionSeleccionada?.id === opcion.id;
            const esCorrecta = opcion.esCorrecta;

            let contenedorClases =
              'w-full text-left p-3.5 rounded-xl border transition-all duration-150 flex items-start gap-3 cursor-pointer relative group ';

            if (esSeleccionada) {
              if (esCorrecta) {
                contenedorClases +=
                  'bg-teal-50 border-teal-600 text-teal-950 ring-2 ring-teal-500/30 shadow-xs';
              } else {
                contenedorClases +=
                  'bg-rose-50 border-rose-600 text-rose-950 ring-2 ring-rose-500/30 shadow-xs';
              }
            } else {
              contenedorClases +=
                'bg-white hover:bg-sky-50/50 border-slate-300 hover:border-sky-400 text-slate-900 shadow-2xs';
            }

            return (
              <button
                key={opcion.id}
                onClick={() => seleccionarOpcion(opcion)}
                className={contenedorClases}
              >
                <div
                  className={`flex flex-col items-center justify-center shrink-0 w-8 h-8 rounded-lg font-mono font-bold text-xs transition-colors border ${
                    esSeleccionada
                      ? esCorrecta
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-rose-600 text-white border-rose-600'
                      : 'bg-slate-100 text-slate-700 border-slate-300 group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600'
                  }`}
                >
                  <span>{opcion.id}</span>
                </div>

                <div className="flex-1 pt-0.5 text-sm font-medium">
                  <MathFormula>{opcion.texto}</MathFormula>
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  {esSeleccionada && (
                    <span className="text-xs font-semibold mr-1">
                      {esCorrecta ? (
                        <CheckCircle2 className="h-4 w-4 text-teal-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                      )}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded">
                    [{opcion.indice}]
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {opcionSeleccionada && (
          <div
            className={`p-4 rounded-xl border transition-all animate-fade-in-up ${
              opcionSeleccionada.esCorrecta
                ? 'bg-teal-50/90 border-teal-400 text-teal-950'
                : 'bg-rose-50/90 border-rose-400 text-rose-950'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                {opcionSeleccionada.esCorrecta ? (
                  <Sparkles className="h-4 w-4 text-teal-600" />
                ) : (
                  <Brain className="h-4 w-4 text-rose-600" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider">
                  {opcionSeleccionada.esCorrecta
                    ? 'Deducción Socrática Validada'
                    : 'Interrogante Socrática Diagnóstica'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-300 text-slate-700">
                {contarPalabras(opcionSeleccionada.retroalimentacionSocratica)} palabras
              </span>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-slate-800 font-sans">
              <MathFormula>{opcionSeleccionada.retroalimentacionSocratica}</MathFormula>
            </p>

            <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-sky-600 animate-ping" />
                Lienzo 3B1B sincronizado en memoria
              </span>
              <span className="font-mono font-semibold text-sky-700 text-[10px]">Cero latencia local</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer de Navegación de Preguntas */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
        <button
          onClick={preguntaAnterior}
          disabled={indicePreguntaActual === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Anterior</span>
        </button>

        <span className="text-xs font-mono font-bold text-slate-600">
          {indicePreguntaActual + 1} / {preguntas.length}
        </span>

        <button
          onClick={siguientePregunta}
          disabled={indicePreguntaActual === preguntas.length - 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
        >
          <span>Siguiente</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
};

export default TheaEnginePanel;
