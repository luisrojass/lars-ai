'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MathFormula } from '@/components/math/MathFormula';
import { useAuthStore } from '@/store/useAuthStore';
import type {
  QuestionPayload,
  ArchetypeGraphPayload,
  OptionId,
  ProblemArchetype,
} from '@/lib/types';
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
  Eye,
  EyeOff,
  Compass,
} from 'lucide-react';

const ArchetypeCanvas2D = dynamic(
  () => import('@/components/study/ArchetypeCanvas2D'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC] text-slate-600 font-mono text-xs">
        Iniciando Motor Mafs 2D...
      </div>
    ),
  }
);

interface QuizItem {
  generacion_id: string;
  documento_id: string;
  question: QuestionPayload;
  explicacion: string;
}

interface QuizWorkspaceProps {
  documentoId: string;
}

const ARCHETYPE_LABELS: Record<ProblemArchetype, string> = {
  CALCULUS_DERIVATIVE_TANGENT_2D: 'Cálculo Diferencial • Recta Tangente 2D',
  CALCULUS_INTEGRAL_AREA_2D: 'Cálculo Integral • Área y Sumas de Riemann 2D',
  LINEAR_TRANSFORMATION_GRID_2D: 'Álgebra Lineal • Transformación de Cuadrícula 2D',
};

export const QuizWorkspace: React.FC<QuizWorkspaceProps> = ({ documentoId }) => {
  const { user } = useAuthStore();

  const [historial, setHistorial] = useState<QuizItem[]>([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [generandoSiguiente, setGenerandoSiguiente] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Almacén en memoria local del 2do JSON (indexado por generacion_id)
  const [graficosPorId, setGraficosPorId] = useState<Record<string, ArchetypeGraphPayload>>({});
  const [cargandoGraficoPorId, setCargandoGraficoPorId] = useState<Record<string, boolean>>({});

  // Valores de sliders por cada generacion_id
  const [slidersPorId, setSlidersPorId] = useState<Record<string, Record<string, number>>>({});

  // Controles de visualización del lienzo
  const [mostrarCapaError, setMostrarCapaError] = useState(true);
  const [mostrarCuadricula, setMostrarCuadricula] = useState(true);

  // Estado de respuesta del usuario por pregunta (indexado por generacion_id)
  const [respuestasUsuario, setRespuestasUsuario] = useState<
    Record<string, { opcionId: OptionId; respondido: boolean }>
  >({});

  // Solicitar el 2do JSON (especificación gráfica determinista) en segundo plano apenas llega el 1er JSON
  const solicitarSegundoJsonGrafico = useCallback(async (item: QuizItem) => {
    await Promise.resolve();
    setCargandoGraficoPorId((prev) => ({ ...prev, [item.generacion_id]: true }));
    try {
      const res = await fetch('/api/quiz/graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generacion_id: item.generacion_id,
          question: item.question,
        }),
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status} al obtener el 2do JSON gráfico`);
      }

      const data: { generacion_id: string; graph: ArchetypeGraphPayload } = await res.json();

      // Inicializar sliders con sus valores por defecto
      const defaults: Record<string, number> = {};
      if (Array.isArray(data.graph.sliders)) {
        data.graph.sliders.forEach((s) => {
          defaults[s.id] = s.default;
        });
      }

      setSlidersPorId((prev) => ({
        ...prev,
        [item.generacion_id]: prev[item.generacion_id] || defaults,
      }));

      setGraficosPorId((prev) => ({
        ...prev,
        [item.generacion_id]: data.graph,
      }));
    } catch (e) {
      console.error('[QuizWorkspace] Error al cargar 2do JSON:', e);
    } finally {
      setCargandoGraficoPorId((prev) => ({ ...prev, [item.generacion_id]: false }));
    }
  }, []);

  // Solicitar el 1er JSON (pregunta + opciones + archetype)
  const obtenerSiguientePregunta = useCallback(
    async (preguntasPreviasTextos: string[] = []) => {
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
    },
    [documentoId]
  );

  useEffect(() => {
    let activo = true;

    obtenerSiguientePregunta([])
      .then((item) => {
        if (activo) {
          setHistorial([item]);
          setIndiceActual(0);
          setCargando(false);
          solicitarSegundoJsonGrafico(item);
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
  }, [obtenerSiguientePregunta, solicitarSegundoJsonGrafico]);

  const itemActual = historial[indiceActual];
  const respuestaActual = itemActual ? respuestasUsuario[itemActual.generacion_id] : null;
  const graficoActual = itemActual ? graficosPorId[itemActual.generacion_id] : null;
  const cargandoGraficoActual = itemActual
    ? !!cargandoGraficoPorId[itemActual.generacion_id]
    : false;
  const slidersActuales = itemActual ? slidersPorId[itemActual.generacion_id] || {} : {};

  // Manejar elección de opción
  const handleSeleccionarOpcion = useCallback(
    async (opcionId: OptionId) => {
      if (!itemActual || respuestaActual?.respondido) return;

      // Registrar en estado local inmediatamente (Zero-Wait: muestra el gráfico de inmediato)
      setRespuestasUsuario((prev) => ({
        ...prev,
        [itemActual.generacion_id]: { opcionId, respondido: true },
      }));

      // Guardar respuesta en PocketBase 'respuestas_alumnos'
      try {
        fetch('/api/quiz/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            generacion_id: itemActual.generacion_id,
            opcion_seleccionada: opcionId,
            alumno_nombre: user?.name || user?.email || 'Estudiante Lars AI',
          }),
        }).catch((e) => console.warn('Error al guardar respuesta en db:', e));
      } catch {}
    },
    [itemActual, respuestaActual?.respondido, user]
  );

  // Atajos de teclado 1, 2, 3, 4 para responder rápido
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!itemActual || respuestaActual?.respondido) return;
      const keyMap: Record<string, OptionId> = {
        '1': 'A',
        '2': 'B',
        '3': 'C',
        '4': 'D',
      };
      const opt = keyMap[e.key];
      if (opt) {
        handleSeleccionarOpcion(opt);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [itemActual, respuestaActual?.respondido, handleSeleccionarOpcion]);

  const handleActualizarSlider = (sliderId: string, val: number) => {
    if (!itemActual) return;
    setSlidersPorId((prev) => ({
      ...prev,
      [itemActual.generacion_id]: {
        ...(prev[itemActual.generacion_id] || {}),
        [sliderId]: val,
      },
    }));
  };

  const handleReiniciarSliders = () => {
    if (!itemActual || !graficoActual) return;
    const defaults: Record<string, number> = {};
    graficoActual.sliders.forEach((s) => {
      defaults[s.id] = s.default;
    });
    setSlidersPorId((prev) => ({
      ...prev,
      [itemActual.generacion_id]: defaults,
    }));
  };

  // Pasar a la siguiente pregunta
  const handleSiguientePregunta = async () => {
    if (indiceActual < historial.length - 1) {
      setIndiceActual((i) => i + 1);
      return;
    }

    setGenerandoSiguiente(true);
    setError(null);
    try {
      const preguntasPrevias = historial.map((h) => h.question.question_latex);
      const nueva = await obtenerSiguientePregunta(preguntasPrevias);
      setHistorial((prev) => [...prev, nueva]);
      setIndiceActual((i) => i + 1);
      solicitarSegundoJsonGrafico(nueva);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'No se pudo generar la siguiente pregunta');
    } finally {
      setGenerandoSiguiente(false);
    }
  };

  const handlePreguntaAnterior = () => {
    if (indiceActual > 0) {
      setIndiceActual((i) => i - 1);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] w-full flex flex-col items-center justify-center p-6 bg-[#F8FAFC] text-slate-900">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <Loader2 className="h-10 w-10 text-sky-600 animate-spin mx-auto" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">Analizando documento en Lars AI...</h2>
            <p className="text-xs text-slate-600">
              Clasificando el problema en uno de los 3 arquetipos matemáticos y generando el 1er JSON...
            </p>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-sky-600 to-teal-500 h-full w-2/3 animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !itemActual) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] w-full flex items-center justify-center p-6 bg-[#F8FAFC] text-slate-900">
        <div className="max-w-md w-full bg-white border border-rose-300 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <XCircle className="h-10 w-10 text-rose-600 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">No se pudo cargar la evaluación</h2>
          <p className="text-xs text-slate-600">{error}</p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/crear-clase"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-800"
            >
              <ArrowLeft className="h-4 w-4" /> Volver a Crear Clase
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-xs font-bold text-white shadow-sm"
            >
              <RotateCcw className="h-4 w-4" /> Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!itemActual) return null;

  const { question, explicacion } = itemActual;
  const yaRespondio = !!respuestaActual?.respondido;
  const esCorrectaSeleccionada = respuestaActual?.opcionId === question.correct_option_id;

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full bg-[#F8FAFC] text-slate-900 flex flex-col lg:flex-row overflow-hidden">
      {/* ============================================================== */}
      {/* PANEL IZQUIERDO: Lars AI (Pregunta, Opciones y Feedback)       */}
      {/* ============================================================== */}
      <div className="w-full lg:w-[44%] xl:w-[42%] h-full flex flex-col border-b lg:border-b-0 lg:border-r border-slate-300 bg-white overflow-y-auto">
        {/* Cabecera del Panel */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/90 sticky top-0 z-10 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/crear-clase"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
              title="Volver a Crear Clase"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-sky-700 font-mono">
                  Pregunta {indiceActual + 1}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 border border-sky-300 text-sky-800 font-mono font-semibold">
                  {question.archetype}
                </span>
              </div>
              <h3 className="text-xs text-slate-600 font-medium truncate max-w-[260px]">
                {question.topic} • {question.difficulty}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {indiceActual > 0 && (
              <button
                onClick={handlePreguntaAnterior}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors"
              >
                Anterior
              </button>
            )}
            <span className="text-xs font-mono font-bold text-slate-500 px-2">
              #{indiceActual + 1}
            </span>
          </div>
        </div>

        {/* Contenido Principal de la Pregunta */}
        <div className="p-5 sm:p-6 space-y-6 flex-1">
          {/* Enunciado Matemático */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-300 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-slate-600 text-xs font-mono font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Brain className="h-3.5 w-3.5 text-sky-600" />
                <span>Planteamiento ({ARCHETYPE_LABELS[question.archetype]}):</span>
              </span>
            </div>
            <div className="text-base sm:text-lg text-slate-900 font-medium leading-relaxed">
              <MathFormula math={question.question_latex} />
            </div>
          </div>

          {/* Selector de 4 Opciones */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-bold text-slate-800">
                Selecciona una alternativa (1-4):
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {yaRespondio ? 'Simulación gráfica activada →' : 'Al marcar se graficará de inmediato'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {question.options.map((opt) => {
                const seleccionada = respuestaActual?.opcionId === opt.id;
                const esLaCorrecta = opt.id === question.correct_option_id;

                let estilo =
                  'bg-white hover:bg-sky-50/50 border-slate-300 hover:border-sky-400 text-slate-900 shadow-2xs';
                let estiloBadge = 'bg-slate-100 text-slate-700 border-slate-300 font-semibold';

                if (yaRespondio) {
                  if (seleccionada) {
                    if (esLaCorrecta) {
                      estilo =
                        'bg-teal-50 border-teal-600 text-teal-950 ring-2 ring-teal-500/30 shadow-xs';
                      estiloBadge = 'bg-teal-600 text-white border-teal-600 font-bold';
                    } else {
                      estilo =
                        'bg-rose-50 border-rose-600 text-rose-950 ring-2 ring-rose-500/30 shadow-xs';
                      estiloBadge = 'bg-rose-600 text-white border-rose-600 font-bold';
                    }
                  } else if (esLaCorrecta) {
                    estilo = 'bg-teal-50/70 border-teal-500 text-teal-900';
                    estiloBadge = 'bg-teal-100 text-teal-800 border-teal-400 font-bold';
                  } else {
                    estilo = 'opacity-60 bg-slate-50 border-slate-200 text-slate-500';
                  }
                } else if (seleccionada) {
                  estilo = 'bg-sky-50 border-sky-600 text-sky-950';
                  estiloBadge = 'bg-sky-600 text-white border-sky-600 font-bold';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSeleccionarOpcion(opt.id)}
                    disabled={yaRespondio}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group ${estilo}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono shrink-0 border ${estiloBadge}`}
                      >
                        {opt.id}
                      </span>
                      <div className="text-sm sm:text-base font-medium">
                        <MathFormula math={opt.text_latex} />
                      </div>
                    </div>

                    {yaRespondio && (
                      <div className="shrink-0 ml-2">
                        {esLaCorrecta ? (
                          <CheckCircle2 className="h-5 w-5 text-teal-600" />
                        ) : seleccionada ? (
                          <XCircle className="h-5 w-5 text-rose-600" />
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Caja de Retroalimentación Socrática Inmediata (Lars AI) */}
          {yaRespondio && (
            <div
              className={`p-4 sm:p-5 rounded-2xl border space-y-2 animate-fade-in-up ${
                esCorrectaSeleccionada
                  ? 'bg-teal-50/90 border-teal-400 text-teal-950'
                  : 'bg-rose-50/90 border-rose-400 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2">
                {esCorrectaSeleccionada ? (
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                ) : (
                  <HelpCircle className="h-4 w-4 text-rose-600" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  {esCorrectaSeleccionada
                    ? '¡Respuesta Correcta!'
                    : 'Error Detectado'}
                </span>
              </div>

              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed pt-1">
                <MathFormula math={explicacion} />
              </div>
            </div>
          )}
        </div>

        {/* Barra de Acciones Inferior */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-600 font-mono font-medium flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-sky-600" />
            <span className="truncate max-w-[200px]">{question.archetype}</span>
          </span>

          <button
            onClick={handleSiguientePregunta}
            disabled={generandoSiguiente}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 hover:scale-102 transition-transform disabled:opacity-50"
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
      {/* PANEL DERECHO: Motor Gráfico Mafs 2D con los 3 Arquetipos      */}
      {/* ============================================================== */}
      <div className="flex-1 h-full bg-[#F8FAFC] flex flex-col relative select-none overflow-hidden">
        {/* Cabecera del Lienzo Proyector */}
        <div className="h-12 border-b border-slate-200 bg-white/95 px-4 flex items-center justify-between backdrop-blur-sm z-10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-sky-600" />
            <span className="text-xs font-bold text-slate-900 font-mono tracking-tight">
              LARS AI • LIENZO PROYECTOR 3B1B
            </span>
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 font-mono font-semibold">
              {question.archetype}
            </span>
          </div>

          {/* Leyenda de Capas */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-700 font-medium">
            <span className="hidden md:flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-[3.5px] rounded-full bg-[#0284C7]" />
              <span>Real</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-[2.5px] border-b-2 border-dashed border-[#E11D48]" />
              <span>Hipótesis Error</span>
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <Layers className="h-3.5 w-3.5 text-sky-600" />
              <span>{graficoActual ? 'Gráfico listo' : 'Preparando gráfico...'}</span>
            </span>
          </div>
        </div>

        {/* Cuerpo del Lienzo */}
        {!yaRespondio ? (
          /* Estado previo a marcar una opción: esperando elección del estudiante */
          <div className="flex-1 w-full h-full relative flex flex-col items-center justify-center p-8 text-center bg-[#F8FAFC]">
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 mx-auto shadow-xs">
                <Sliders className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Simulación Lista.
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Selecciona una de las 4 alternativas para mostrar la simulación interactiva.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1.5 text-[11px] font-mono text-slate-700">
                <div>
                  • Tipo de Gráfico:{' '}
                  <strong className="text-sky-700">{question.archetype}</strong>
                </div>
                <div>
                  • Tema: <strong className="text-slate-900">{ARCHETYPE_LABELS[question.archetype]}</strong>
                </div>
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200">
                  {graficoActual ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-600" />
                      <span className="text-emerald-700 font-semibold">
                        Gráfico listo (Zero-Wait)
                      </span>
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-3.5 w-3.5 text-sky-600 animate-spin" />
                      <span className="text-sky-700">
                        Preparando la simulación en segundo plano...
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : !graficoActual && cargandoGraficoActual ? (
          /* Caso borde si el usuario respondió en <1s y el 2do JSON aún viene en camino */
          <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-[#F8FAFC] p-6 text-center space-y-3">
            <Loader2 className="h-8 w-8 text-sky-600 animate-spin" />
            <p className="text-xs font-mono text-slate-700">
              Ejecutando el motor gráfico...
            </p>
          </div>
        ) : graficoActual ? (
          /* Motor Gráfico Mafs 2D en ejecución + Dock de Sliders Math.js en Modo Claro */
          <>
            {/* Etiqueta flotante superior izquierda con resumen de funciones/matrices */}
            <div className="absolute top-14 left-4 z-10 pointer-events-none max-w-xs sm:max-w-sm">
              <div className="bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-300 shadow-sm space-y-0.5">
                <div className="text-[11px] font-bold text-slate-900 font-mono">
                  {ARCHETYPE_LABELS[graficoActual.archetype]}
                </div>
                {'functions' in graficoActual && graficoActual.functions?.target && (
                  <div className="text-[11px] font-mono text-slate-700">
                    f(x) = <span className="text-slate-900 font-bold">{graficoActual.functions.target}</span>
                  </div>
                )}
                {graficoActual.archetype === 'LINEAR_TRANSFORMATION_GRID_2D' && (
                  <div className="text-[11px] font-mono text-slate-700">
                    Vector entrada v = [{graficoActual.input_vector.join(', ')}]
                  </div>
                )}
              </div>
            </div>

            {/* Lienzo Mafs 2D */}
            <div className="flex-1 w-full relative overflow-hidden">
              <ArchetypeCanvas2D
                graph={graficoActual}
                sliderValues={slidersActuales}
                showErrorLayer={mostrarCapaError}
                showGrid={mostrarCuadricula}
              />
            </div>

            {/* Dock Inferior con Sliders Interactivos Grandes (Ocupando casi toda el área inferior) */}
            <div className="w-full bg-white/98 backdrop-blur-md border-t-2 border-slate-300 px-4 py-3.5 sm:px-6 sm:py-4 shadow-xl z-20 shrink-0 space-y-3">
              {/* Fila superior compacta: Título del Dock + Controles de Capas */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-600">
                    <Sliders className="h-4 w-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
                    Controles Interactivos de Simulación (math.js)
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    60 FPS
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMostrarCapaError((v) => !v)}
                    title="Mostrar u ocultar trazo diagnóstico de error (#E11D48)"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors border ${
                      mostrarCapaError
                        ? 'bg-rose-50 border-rose-300 text-rose-700'
                        : 'bg-slate-100 border-slate-300 text-slate-600'
                    }`}
                  >
                    {mostrarCapaError ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                    <span>Hipótesis Error</span>
                  </button>

                  <button
                    onClick={() => setMostrarCuadricula((v) => !v)}
                    title="Mostrar u ocultar cuadrícula cartesiana"
                    className={`p-1.5 rounded-lg transition-colors border ${
                      mostrarCuadricula
                        ? 'bg-sky-50 border-sky-300 text-sky-700'
                        : 'bg-slate-100 border-slate-300 text-slate-600'
                    }`}
                  >
                    <Compass className="h-4 w-4" />
                  </button>

                  <button
                    onClick={handleReiniciarSliders}
                    title="Restablecer sliders a sus valores iniciales"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors border border-slate-300"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Reiniciar</span>
                  </button>
                </div>
              </div>

              {/* Fila inferior principal: Sliders grandes ocupando todo el ancho disponible */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                {graficoActual.sliders.map((s) => {
                  const val = slidersActuales[s.id] ?? s.default;
                  const fineStep =
                    s.id === 'n' || s.symbol === 'n'
                      ? 1
                      : s.id === 't' || s.symbol === 't'
                      ? Math.min(s.step || 0.005, 0.005)
                      : Math.min(s.step || 0.01, 0.01);
                  const decimals = s.id === 'n' || s.symbol === 'n' ? 0 : 2;

                  return (
                    <div
                      key={s.id}
                      className="w-full flex items-center gap-3.5 bg-slate-50 px-4 py-3 rounded-2xl border-2 border-slate-300 hover:border-sky-400 transition-colors shadow-2xs"
                    >
                      <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-300 flex items-center justify-center text-sm sm:text-base font-mono font-extrabold text-sky-700 shrink-0 shadow-2xs">
                        <MathFormula math={`$${s.symbol}$`} />
                      </div>

                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                            {s.label}
                          </span>
                          <span className="font-mono text-xs sm:text-sm text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-lg font-extrabold">
                            {Number(val).toFixed(decimals)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={s.min}
                          max={s.max}
                          step={fineStep}
                          value={val}
                          onChange={(e) =>
                            handleActualizarSlider(s.id, parseFloat(e.target.value))
                          }
                          className="w-full projector-slider focus:outline-none"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-slate-500">
                          <span>min: {s.min}</span>
                          <span>paso: {fineStep}</span>
                          <span>máx: {s.max}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default QuizWorkspace;
