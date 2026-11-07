'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MathFormula } from '@/components/math/MathFormula';
import { useAuthStore } from '@/store/useAuthStore';
import type { QuestionPayload, GraphPayload, OptionId } from '@/lib/types';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  Brain,
  Layers,
  RotateCcw,
  Sliders,
  Eye
} from 'lucide-react';

interface QuizItem {
  generacion_id: string;
  documento_id: string;
  question: QuestionPayload;
  graph: GraphPayload;
  explicacion: string;
}

interface QuizWorkspaceProps {
  documentoId: string;
}

export const QuizWorkspace: React.FC<QuizWorkspaceProps> = ({ documentoId }) => {
  const { user } = useAuthStore();

  const [historial, setHistorial] = useState<QuizItem[]>([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [generandoSiguiente, setGenerandoSiguiente] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado de respuesta por cada pregunta (indexada por generacion_id)
  const [respuestasUsuario, setRespuestasUsuario] = useState<
    Record<string, { opcionId: OptionId; respondido: boolean }>
  >({});

  // Cargar primera pregunta
  const obtenerSiguientePregunta = useCallback(async (preguntasPreviasTextos: string[] = []) => {
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documento_id: documentoId,
          preguntas_previas: preguntasPreviasTextos,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${res.status} al generar pregunta`);
      }

      const item: QuizItem = await res.json();
      return item;
    } catch (e) {
      console.error('[QuizWorkspace] Error:', e);
      throw e;
    }
  }, [documentoId]);

  useEffect(() => {
    let activo = true;

    obtenerSiguientePregunta([])
      .then((item) => {
        if (activo) {
          setHistorial([item]);
          setIndiceActual(0);
          setCargando(false);
        }
      })
      .catch((err) => {
        if (activo) {
          setError(err.message || 'No se pudo cargar la evaluación');
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [obtenerSiguientePregunta]);

  const itemActual = historial[indiceActual];
  const respuestaActual = itemActual ? respuestasUsuario[itemActual.generacion_id] : null;

  // Manejar elección de opción
  const handleSeleccionarOpcion = async (opcionId: OptionId) => {
    if (!itemActual || respuestaActual?.respondido) return;

    // Registrar en estado local inmediatamente (Zero-Wait)
    setRespuestasUsuario((prev) => ({
      ...prev,
      [itemActual.generacion_id]: { opcionId, respondido: true },
    }));

    // Registrar en PocketBase 'respuestas_alumnos'
    try {
      fetch('/api/quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generacion_id: itemActual.generacion_id,
          opcion_seleccionada: opcionId,
          alumno_nombre: user?.name || user?.email || 'Estudiante ENEISOFT',
        }),
      }).catch((e) => console.warn('Error al guardar respuesta en db:', e));
    } catch {}
  };

  // Pasar a la siguiente pregunta
  const handleSiguientePregunta = async () => {
    // Si ya existe la siguiente pregunta en el historial, avanzamos
    if (indiceActual < historial.length - 1) {
      setIndiceActual((i) => i + 1);
      return;
    }

    // Si es la última, generamos una nueva con Gemini
    setGenerandoSiguiente(true);
    setError(null);
    try {
      const preguntasPrevias = historial.map((h) => h.question.question_latex);
      const nueva = await obtenerSiguientePregunta(preguntasPrevias);
      setHistorial((prev) => [...prev, nueva]);
      setIndiceActual((i) => i + 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'No se pudo generar la siguiente pregunta');
    } finally {
      setGenerandoSiguiente(false);
    }
  };

  // Volver a pregunta anterior del historial
  const handlePreguntaAnterior = () => {
    if (indiceActual > 0) {
      setIndiceActual((i) => i - 1);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] w-full flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <Loader2 className="h-10 w-10 text-sky-400 animate-spin mx-auto" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-100">Analizando documento con Gemini...</h2>
            <p className="text-xs text-slate-400">
              Extrayendo teoremas y generando la primera pregunta conceptual adaptativa y su especificación gráfica.
            </p>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-sky-400 to-teal-400 h-full w-2/3 animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !itemActual) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] w-full flex items-center justify-center p-6 bg-slate-950 text-slate-100">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <XCircle className="h-10 w-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-100">No se pudo cargar la evaluación</h2>
          <p className="text-xs text-slate-400">{error}</p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/crear-clase"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
            >
              <ArrowLeft className="h-4 w-4" /> Volver a Crear Clase
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-bold text-slate-950"
            >
              <RotateCcw className="h-4 w-4" /> Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!itemActual) return null;

  const { question, graph, explicacion } = itemActual;
  const esCorrectaSeleccionada = respuestaActual?.opcionId === question.correct_option_id;
  const vistaSeleccionada = respuestaActual?.opcionId
    ? graph.views.find((v) => v.option_id === respuestaActual.opcionId)
    : null;

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full bg-slate-950 text-slate-100 flex flex-col lg:flex-row overflow-hidden">
      {/* ============================================================== */}
      {/* PANEL IZQUIERDO: Thea Engine (Pregunta, Opciones y Feedback)   */}
      {/* ============================================================== */}
      <div className="w-full lg:w-[48%] xl:w-[45%] h-full flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950 overflow-y-auto">
        {/* Cabecera del Panel */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 sticky top-0 z-10 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/crear-clase"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Volver a Crear Clase"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-sky-400 font-mono">
                  Pregunta {indiceActual + 1}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 font-mono uppercase">
                  {question.area.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-xs text-slate-400 truncate max-w-[240px]">
                {question.topic} • Dificultad {question.difficulty}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {indiceActual > 0 && (
              <button
                onClick={handlePreguntaAnterior}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Anterior
              </button>
            )}
            <span className="text-xs font-mono text-slate-500 px-2">
              #{indiceActual + 1}
            </span>
          </div>
        </div>

        {/* Contenido Principal de la Pregunta */}
        <div className="p-5 sm:p-6 space-y-6 flex-1">
          {/* Enunciado Matemático */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-inner">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono mb-1">
              <Brain className="h-3.5 w-3.5 text-sky-400" />
              <span>Planteamiento conceptual:</span>
            </div>
            <div className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed">
              <MathFormula math={question.question_latex} />
            </div>
          </div>

          {/* Selector de 4 Opciones */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Selecciona una alternativa:</span>
              <span className="text-[11px] font-mono text-slate-500">
                {respuestaActual?.respondido ? 'Respuesta registrada' : '1 respuesta correcta'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {question.options.map((opt) => {
                const seleccionada = respuestaActual?.opcionId === opt.id;
                const yaRespondio = !!respuestaActual?.respondido;
                const esLaCorrecta = opt.id === question.correct_option_id;

                let estilo = 'bg-slate-900/60 hover:bg-slate-850 border-slate-800 text-slate-200';
                let estiloBadge = 'bg-slate-950 text-slate-400 border-slate-800';

                if (yaRespondio) {
                  if (seleccionada) {
                    if (esLaCorrecta) {
                      estilo = 'bg-teal-500/15 border-teal-500 text-teal-100 ring-1 ring-teal-500/30';
                      estiloBadge = 'bg-teal-500 text-slate-950 font-bold';
                    } else {
                      estilo = 'bg-rose-500/15 border-rose-500 text-rose-100 ring-1 ring-rose-500/30';
                      estiloBadge = 'bg-rose-500 text-white font-bold';
                    }
                  } else if (esLaCorrecta) {
                    estilo = 'bg-teal-500/10 border-teal-500/40 text-teal-200';
                    estiloBadge = 'bg-teal-500/30 text-teal-300 border-teal-500/40';
                  } else {
                    estilo = 'opacity-50 bg-slate-900/30 border-slate-850 text-slate-500';
                  }
                } else if (seleccionada) {
                  estilo = 'bg-sky-500/15 border-sky-400 text-sky-200';
                  estiloBadge = 'bg-sky-500 text-slate-950 font-bold';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSeleccionarOpcion(opt.id)}
                    disabled={yaRespondio}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${estilo}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono shrink-0 border ${estiloBadge}`}>
                        {opt.id}
                      </span>
                      <div className="text-sm sm:text-base font-normal">
                        <MathFormula math={opt.text_latex} />
                      </div>
                    </div>

                    {yaRespondio && (
                      <div className="shrink-0 ml-2">
                        {esLaCorrecta ? (
                          <CheckCircle2 className="h-5 w-5 text-teal-400" />
                        ) : seleccionada ? (
                          <XCircle className="h-5 w-5 text-rose-400" />
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Caja de Retroalimentación Socrática Inmediata (Thea Engine) */}
          {respuestaActual?.respondido && (
            <div
              className={`p-4 sm:p-5 rounded-2xl border space-y-2 animate-fade-in ${
                esCorrectaSeleccionada
                  ? 'bg-teal-950/40 border-teal-500/40 text-teal-100'
                  : 'bg-rose-950/30 border-rose-500/30 text-rose-100'
              }`}
            >
              <div className="flex items-center gap-2">
                {esCorrectaSeleccionada ? (
                  <CheckCircle2 className="h-4 w-4 text-teal-400" />
                ) : (
                  <HelpCircle className="h-4 w-4 text-rose-400" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  {esCorrectaSeleccionada
                    ? '¡Respuesta Correcta! • Razonamiento Socrático'
                    : 'Error Conceptual Detectado • Diagnóstico Thea'}
                </span>
              </div>

              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed pt-1">
                <MathFormula math={explicacion} />
              </div>
            </div>
          )}
        </div>

        {/* Barra de Acciones Inferior */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/70 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span>Escenario: {graph.scenario}</span>
          </span>

          <button
            onClick={handleSiguientePregunta}
            disabled={generandoSiguiente}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-sky-500/20 hover:scale-102 transition-transform disabled:opacity-50"
          >
            {generandoSiguiente ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generando siguiente...</span>
              </>
            ) : (
              <>
                <span>Siguiente pregunta</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PANEL DERECHO: Espacio en blanco reservado para el gráfico     */}
      {/* ============================================================== */}
      <div className="flex-1 h-full bg-[#F8FAFC] flex flex-col relative select-none">
        {/* Cabecera del Lienzo */}
        <div className="h-12 border-b border-slate-200 bg-white/80 px-4 flex items-center justify-between backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-teal-500" />
            <span className="text-xs font-bold text-slate-800 font-mono tracking-tight">
              LIENZO PROYECTOR 3B1B
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono">
              Modo Claro Alto Contraste
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            <span>{graph.scenario}</span>
          </div>
        </div>

        {/* Lienzo en Blanco / Espacio de Simulación Reservado */}
        <div className="flex-1 w-full h-full relative flex flex-col items-center justify-center p-8 text-center bg-[#F8FAFC]">
          {/* Cuadrícula sutil de fondo que simula papel milimetrado/lienzo 3B1B */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mx-auto shadow-sm">
              <Sliders className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                Espacio Reservado para Simulación Gráfica
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Este lienzo en blanco renderizará el gráfico dinámico matemático en Mafs (2D) o Three.js (3D) con controles y sliders interactivos a 60 FPS.
              </p>
            </div>

            {/* Información del Payload Gráfico Generado en segundo plano */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block uppercase font-mono">
                Datos listos en JSON #2:
              </span>
              <div className="text-[11px] font-mono text-slate-600 space-y-1">
                <div>• Escenario: <strong className="text-sky-700">{graph.scenario}</strong></div>
                <div>• Vistas generadas: <strong className="text-slate-800">{graph.views.length} alternativas (A-D)</strong></div>
                {vistaSeleccionada && (
                  <div className="pt-1 text-slate-700 border-t border-slate-200">
                    • Vista seleccionada ({vistaSeleccionada.option_id}):{' '}
                    <span className="italic text-slate-900">{vistaSeleccionada.caption}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
              <Eye className="h-3.5 w-3.5" />
              <span>El motor visual se acoplará aquí en la siguiente etapa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizWorkspace;
