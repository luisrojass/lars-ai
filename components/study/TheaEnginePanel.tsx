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

  // Atajos de teclado: teclas 1, 2, 3, 4
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Evitar capturar si el usuario escribe en un input o textarea
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

  // Contador de palabras del texto socrático
  const contarPalabras = (texto: string) => {
    return texto.trim().split(/\s+/).filter(Boolean).length;
  };

  return (
    <aside className="w-full h-full flex flex-col bg-slate-950 border-r border-slate-800 text-slate-100 select-none overflow-y-auto">
      {/* Header del Thea Engine */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Thea Engine
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800">
                <Zap className="h-2.5 w-2.5 text-amber-400" /> Zero-Wait
              </span>
            </div>
            <span className="text-[11px] text-slate-400">{pregunta.materia}</span>
          </div>
        </div>

        {/* Indicador de Batería de Preguntas */}
        <div className="flex items-center gap-1">
          {preguntas.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => irAPregunta(idx)}
              className={`h-6 w-6 rounded text-xs font-mono font-medium transition-all ${
                idx === indicePreguntaActual
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido Principal de la Pregunta */}
      <div className="flex-1 p-5 space-y-5 overflow-y-auto">
        {/* Título y Enunciado con KaTeX */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-sky-400 font-bold">PREGUNTA {pregunta.numero}</span>
            <span>•</span>
            <span className="text-slate-300">{pregunta.titulo}</span>
          </div>

          <div className="text-sm sm:text-base leading-relaxed text-slate-200 font-normal bg-slate-900/40 p-3.5 rounded-lg border border-slate-800/80">
            <MathFormula>{pregunta.enunciado}</MathFormula>
          </div>
        </div>

        {/* Guía de atajos de teclado */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span className="font-medium text-slate-300">Seleccione una alternativa:</span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            <Keyboard className="h-3 w-3 text-sky-400" /> Atajos: teclas [1] [2] [3] [4]
          </span>
        </div>

        {/* Cuadrícula de 4 Opciones (A, B, C, D) */}
        <div className="space-y-2.5">
          {pregunta.opciones.map((opcion) => {
            const esSeleccionada = opcionSeleccionada?.id === opcion.id;
            const esCorrecta = opcion.esCorrecta;

            let contenedorClases =
              'w-full text-left p-3.5 rounded-xl border transition-all duration-150 flex items-start gap-3 cursor-pointer relative group ';

            if (esSeleccionada) {
              if (esCorrecta) {
                contenedorClases +=
                  'bg-teal-950/40 border-teal-500 text-teal-100 ring-2 ring-teal-500/40 shadow-lg shadow-teal-950/50';
              } else {
                contenedorClases +=
                  'bg-rose-950/40 border-rose-500 text-rose-100 ring-2 ring-rose-500/40 shadow-lg shadow-rose-950/50';
              }
            } else {
              contenedorClases +=
                'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-sky-500/60 text-slate-200 shadow-sm';
            }

            return (
              <button
                key={opcion.id}
                onClick={() => seleccionarOpcion(opcion)}
                className={contenedorClases}
              >
                {/* Badge de Letra y Atajo */}
                <div
                  className={`flex flex-col items-center justify-center shrink-0 w-8 h-8 rounded-lg font-mono font-bold text-xs transition-colors ${
                    esSeleccionada
                      ? esCorrecta
                        ? 'bg-teal-500 text-slate-950'
                        : 'bg-rose-500 text-white'
                      : 'bg-slate-800 text-slate-300 group-hover:bg-sky-500 group-hover:text-slate-950'
                  }`}
                >
                  <span>{opcion.id}</span>
                </div>

                {/* Texto de la opción con notación KaTeX */}
                <div className="flex-1 pt-0.5 text-sm font-medium">
                  <MathFormula>{opcion.texto}</MathFormula>
                </div>

                {/* Tecla rápida visual */}
                <div className="shrink-0 flex items-center gap-1">
                  {esSeleccionada && (
                    <span className="text-xs font-semibold mr-1">
                      {esCorrecta ? (
                        <CheckCircle2 className="h-4 w-4 text-teal-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-rose-400" />
                      )}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-950/60 border border-slate-800 px-1.5 py-0.5 rounded">
                    [{opcion.indice}]
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Panel de Retroalimentación Inmediata (Zero-Wait) */}
        {opcionSeleccionada && (
          <div
            className={`p-4 rounded-xl border transition-all animate-fade-in-up ${
              opcionSeleccionada.esCorrecta
                ? 'bg-gradient-to-br from-teal-950/60 to-slate-950 border-teal-500/50 text-teal-200'
                : 'bg-gradient-to-br from-rose-950/60 to-slate-950 border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                {opcionSeleccionada.esCorrecta ? (
                  <Sparkles className="h-4 w-4 text-teal-400" />
                ) : (
                  <Brain className="h-4 w-4 text-rose-400" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider">
                  {opcionSeleccionada.esCorrecta
                    ? 'Deducción Socrática Validada'
                    : 'Interrogante Socrática Diagnóstica'}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300">
                {contarPalabras(opcionSeleccionada.retroalimentacionSocratica)} palabras
              </span>
            </div>

            {/* Texto de explicación socrática (estrictamente 30-50 palabras) */}
            <p className="text-xs sm:text-sm leading-relaxed text-slate-200 font-sans">
              <MathFormula>{opcionSeleccionada.retroalimentacionSocratica}</MathFormula>
            </p>

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                Lienzo 3B1B sincronizado en memoria
              </span>
              <span className="font-mono text-sky-400 text-[10px]">Cero latencia local</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer de Navegación de Preguntas */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
        <button
          onClick={preguntaAnterior}
          disabled={indicePreguntaActual === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Anterior</span>
        </button>

        <span className="text-xs font-mono text-slate-400">
          {indicePreguntaActual + 1} / {preguntas.length}
        </span>

        <button
          onClick={siguientePregunta}
          disabled={indicePreguntaActual === preguntas.length - 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-950 bg-sky-400 hover:bg-sky-300 disabled:opacity-40 disabled:pointer-events-none font-semibold transition-all shadow-sm shadow-sky-500/20"
        >
          <span>Siguiente</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
};

export default TheaEnginePanel;
