import "server-only";
import { GoogleGenAI } from "@google/genai";
import PocketBase from "pocketbase";
import { pbUrl } from "@/lib/server/documentos";
import type {
  QuestionPayload,
  ArchetypeGraphPayload,
  ProblemArchetype,
  DerivativeTangent2DPayload,
  IntegralArea2DPayload,
  LinearTransformationGrid2DPayload,
} from "@/lib/types";

export interface GeneratedQuestionResult {
  generacion_id: string;
  documento_id: string;
  question: QuestionPayload;
  explicacion: string;
}

export interface GeneratedGraphResult {
  generacion_id: string;
  graph: ArchetypeGraphPayload;
}

const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.5-flash",
  "gemini-3.8-flash",
];

const VALID_ARCHETYPES: ProblemArchetype[] = [
  "CALCULUS_DERIVATIVE_TANGENT_2D",
  "CALCULUS_INTEGRAL_AREA_2D",
  "LINEAR_TRANSFORMATION_GRID_2D",
];

const QUESTION_SYSTEM_PROMPT = `Eres el Agente Especialista en Inteligencia Artificial y Evaluación Matemática Socrática (ENEISOFT XVI).
Tu tarea es analizar el documento de estudio proporcionado y generar el PRIMER JSON (JSON #1) con EXACTAMENTE UNA pregunta de opción múltiple rigurosa.

REGLA CRÍTICA DE ARQUETIPO:
El problema planteado y su solución DEBEN encajar estrictamente y poder graficarse en UNO de estos 3 arquetipos matemáticos 2D (elige el que mejor se adapte al tema del PDF subido):
1. "CALCULUS_DERIVATIVE_TANGENT_2D":
   - Tema: Cálculo diferencial (derivadas, recta tangente en un punto x_0, razón de cambio instantánea, pendiente de la curva o aproximación lineal de una función f(x)).
2. "CALCULUS_INTEGRAL_AREA_2D":
   - Tema: Cálculo integral (integrales definidas en un intervalo [0, b], sumas de Riemann con n particiones, área bajo la curva de una función f(x)).
3. "LINEAR_TRANSFORMATION_GRID_2D":
   - Tema: Álgebra lineal (transformaciones lineales con matriz 2x2 sobre un vector v = [x, y], vectores base i/j, deformación de cuadrícula o autovectores en 2D).

Si el PDF trata sobre funciones, física cinemática, optimización o cálculo general, adáptalo a "CALCULUS_DERIVATIVE_TANGENT_2D" o "CALCULUS_INTEGRAL_AREA_2D". Si trata sobre vectores, matrices, sistemas lineales o geometría, adáptalo a "LINEAR_TRANSFORMATION_GRID_2D".

Reglas obligatorias del JSON #1:
1. Genera UNA sola pregunta conceptual o analítica con una función o matriz explícita en el enunciado (por ejemplo $f(x) = 0.5x^2 - x + 1$ en $x_0 = 2$, o integral de $f(x) = \sin(x) + 2$, o matriz $M = \begin{pmatrix} 2 & 1 \\ -1 & 1 \end{pmatrix}$ aplicada a $\vec{v} = (1, 2)$).
2. Exactamente 4 opciones identificadas como "A", "B", "C", "D".
3. Exactamente 1 opción correcta y 3 distractores basados en errores conceptuales reales de estudiantes (ej. derivar mal un coeficiente, evaluar mal los límites o confundir filas/columnas de la matriz).
4. La explicación ("explanation") DEBE ser socrática, concisa y tener entre 30 y 50 palabras.
5. Todas las fórmulas matemáticas en 'question_latex', 'options[].text_latex' y 'explanation' deben ir delimitadas con $...$ en LaTeX válido.

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "schema_version": "1.0",
  "question_id": "q_1",
  "archetype": "CALCULUS_DERIVATIVE_TANGENT_2D" | "CALCULUS_INTEGRAL_AREA_2D" | "LINEAR_TRANSFORMATION_GRID_2D",
  "area": "CALCULO_DIFERENCIAL" | "CALCULO_INTEGRAL" | "ALGEBRA_LINEAL",
  "topic": "string corto del tema",
  "difficulty": "BASICO" | "INTERMEDIO",
  "question_latex": "Enunciado con expresiones matemáticas entre $...$",
  "options": [
    { "id": "A", "text_latex": "string con $...$", "is_correct": boolean },
    { "id": "B", "text_latex": "string con $...$", "is_correct": boolean },
    { "id": "C", "text_latex": "string con $...$", "is_correct": boolean },
    { "id": "D", "text_latex": "string con $...$", "is_correct": boolean }
  ],
  "correct_option_id": "A" | "B" | "C" | "D",
  "explanation": "Explicación socrática de 30 a 50 palabras con $...$"
}`;

const GRAPH_SYSTEM_PROMPT = `Eres el Motor de Especificación Gráfica Matemática Determinista (Mafs.dev + math.js).
Recibirás una pregunta matemática ya generada y su 'archetype' obligatorio.
Debes responder ÚNICAMENTE con el SEGUNDO JSON (JSON #2) siguiendo ESTRICTAMENTE la estructura del arquetipo indicado para que el frontend lo ejecute directamente con Mafs.dev y math.js.

REGLAS ESTRICTAS DE SINTAXIS MATH.JS:
- En "functions", usa sintaxis evaluable por math.js en variable 'x': ej. "0.5 * x^2 - x + 1", "sin(x) + 2", "2 * x + 1", "cos(x)". NO uses LaTeX dentro de "functions".
- Respeta los colores del Modo Claro Proyector:
  * Función objetivo: "#334155"
  * Capa correcta ("role": "correct"): "#0284C7"
  * Capa de error diagnóstico ("role": "error"): "#E11D48"

PLANTILLAS EXACTAS SEGÚN EL ARQUETIPO:

CASO 1: Si archetype === "CALCULUS_DERIVATIVE_TANGENT_2D":
{
  "archetype": "CALCULUS_DERIVATIVE_TANGENT_2D",
  "engine": "mafs",
  "view": { "x_bounds": [-4, 6], "y_bounds": [-2, 8], "grid_step": 1 },
  "functions": {
    "target": "<función f(x) del problema en sintaxis math.js, ej: 0.5 * x^2 - x + 1>",
    "correct_derivative": "<derivada correcta f'(x) en sintaxis math.js, ej: x - 1>",
    "error_derivative": "<derivada errónea típica del distractor en sintaxis math.js, ej: 0.5 * x - 1>"
  },
  "interactive_point": { "symbol": "x_0", "default_value": 2 },
  "sliders": [
    { "id": "x_0", "symbol": "x_0", "label": "Punto de Tangencia (x₀)", "min": -2.0, "max": 4.0, "step": 0.01, "default": 2.0 },
    { "id": "h", "symbol": "h", "label": "Paso Secante (h)", "min": 0.05, "max": 2.0, "step": 0.01, "default": 0.5 }
  ],
  "render_layers": [
    { "type": "plot", "fn": "target", "color": "#334155", "style": "solid", "weight": 3 },
    { "type": "tangent_line", "role": "correct", "fn_source": "target", "slope_expr": "correct_derivative", "eval_at": "x_0", "color": "#0284C7", "style": "solid", "weight": 3.5, "label": "Derivada Real" },
    { "type": "tangent_line", "role": "error", "fn_source": "target", "slope_expr": "error_derivative", "eval_at": "x_0", "color": "#E11D48", "style": "dashed", "weight": 3, "label": "Tu Hipótesis" }
  ]
}

CASO 2: Si archetype === "CALCULUS_INTEGRAL_AREA_2D":
{
  "archetype": "CALCULUS_INTEGRAL_AREA_2D",
  "engine": "mafs",
  "view": { "x_bounds": [-1, 7], "y_bounds": [-1, 6], "grid_step": 1 },
  "functions": {
    "target": "<función f(x) a integrar en sintaxis math.js, ej: sin(x) + 2>"
  },
  "interval": { "lower_bound": 0 },
  "sliders": [
    { "id": "b", "symbol": "b", "label": "Límite Superior (b)", "min": 1.0, "max": 6.0, "step": 0.01, "default": 4.0 },
    { "id": "n", "symbol": "n", "label": "Particiones Riemann (n)", "min": 2, "max": 40, "step": 1, "default": 8 }
  ],
  "render_layers": [
    { "type": "plot", "fn": "target", "color": "#334155", "style": "solid", "weight": 3 },
    { "type": "integral_fill", "role": "correct", "fn": "target", "from": "0", "to": "b", "fill_color": "rgba(2, 132, 199, 0.25)", "border_color": "#0284C7" },
    { "type": "riemann_rectangles", "role": "error", "fn": "target", "from": "0", "to": "b", "partitions": "n", "method": "left", "fill_color": "rgba(225, 29, 72, 0.2)", "border_color": "#E11D48" }
  ]
}

CASO 3: Si archetype === "LINEAR_TRANSFORMATION_GRID_2D":
{
  "archetype": "LINEAR_TRANSFORMATION_GRID_2D",
  "engine": "mafs",
  "view": { "x_bounds": [-5, 5], "y_bounds": [-5, 5], "grid_step": 1 },
  "matrices": {
    "identity": [[1, 0], [0, 1]],
    "correct_transform": [[2, 1], [-1, 1]],
    "error_transform": [[1, 2], [1, -1]]
  },
  "input_vector": [1, 2],
  "sliders": [
    { "id": "t", "symbol": "t", "label": "Animar Transformación", "min": 0.0, "max": 1.0, "step": 0.005, "default": 1.0 },
    { "id": "k", "symbol": "k", "label": "Escalar Vector (k)", "min": 0.5, "max": 2.5, "step": 0.01, "default": 1.0 }
  ],
  "render_layers": [
    { "type": "deformed_grid", "matrix_source": "correct_transform", "interpolation_var": "t", "line_color": "#CBD5E1", "weight": 1.5 },
    { "type": "vector", "role": "correct", "origin": [0, 0], "expr": "k * (correct_transform * input_vector)", "color": "#0284C7", "label": "T(v) Correcto", "weight": 3.5 },
    { "type": "vector", "role": "error", "origin": [0, 0], "expr": "k * (error_transform * input_vector)", "color": "#E11D48", "label": "Tu Elección", "style": "dashed", "weight": 3 }
  ]
}`;

function smoothSliders(sliders: ArchetypeGraphPayload["sliders"]): ArchetypeGraphPayload["sliders"] {
  return sliders.map((s) => {
    if (s.id === "n" || s.symbol === "n") {
      return { ...s, step: 1, max: Math.max(s.max || 30, 40) };
    }
    if (s.id === "t" || s.symbol === "t") {
      return { ...s, step: 0.005 };
    }
    return { ...s, step: 0.01 };
  });
}

/**
 * Garantiza que el JSON #2 cumpla al 100% con problem_types.txt sin campos faltantes
 * y con pasos (step) ultrafinos para animaciones continuas a 60 FPS.
 */
export function normalizeArchetypeGraph(
  raw: Partial<ArchetypeGraphPayload> | null | undefined,
  expectedArchetype: ProblemArchetype
): ArchetypeGraphPayload {
  const archetype =
    raw?.archetype && VALID_ARCHETYPES.includes(raw.archetype)
      ? raw.archetype
      : expectedArchetype;

  if (archetype === "CALCULUS_DERIVATIVE_TANGENT_2D") {
    const r = (raw || {}) as Partial<DerivativeTangent2DPayload>;
    const x0Default = r.interactive_point?.default_value ?? 2.0;
    return {
      archetype: "CALCULUS_DERIVATIVE_TANGENT_2D",
      engine: "mafs",
      view: {
        x_bounds: Array.isArray(r.view?.x_bounds) && r.view.x_bounds.length === 2 ? r.view.x_bounds : [-4, 6],
        y_bounds: Array.isArray(r.view?.y_bounds) && r.view.y_bounds.length === 2 ? r.view.y_bounds : [-2, 8],
        grid_step: typeof r.view?.grid_step === "number" ? r.view.grid_step : 1,
      },
      functions: {
        target: r.functions?.target || "0.5 * x^2 - x + 1",
        correct_derivative: r.functions?.correct_derivative || "x - 1",
        error_derivative: r.functions?.error_derivative || "0.5 * x - 1",
      },
      interactive_point: {
        symbol: "x_0",
        default_value: x0Default,
      },
      sliders: smoothSliders(
        Array.isArray(r.sliders) && r.sliders.length > 0
          ? r.sliders
          : [
              {
                id: "x_0",
                symbol: "x_0",
                label: "Punto de Tangencia (x₀)",
                min: -2.0,
                max: 4.0,
                step: 0.01,
                default: x0Default,
              },
              {
                id: "h",
                symbol: "h",
                label: "Paso Secante (h)",
                min: 0.05,
                max: 2.0,
                step: 0.01,
                default: 0.5,
              },
            ]
      ),
      render_layers:
        Array.isArray(r.render_layers) && r.render_layers.length >= 2
          ? r.render_layers
          : [
              { type: "plot", fn: "target", color: "#334155", style: "solid", weight: 3 },
              {
                type: "tangent_line",
                role: "correct",
                fn_source: "target",
                slope_expr: "correct_derivative",
                eval_at: "x_0",
                color: "#0284C7",
                style: "solid",
                weight: 3.5,
                label: "Derivada Real",
              },
              {
                type: "tangent_line",
                role: "error",
                fn_source: "target",
                slope_expr: "error_derivative",
                eval_at: "x_0",
                color: "#E11D48",
                style: "dashed",
                weight: 3,
                label: "Tu Hipótesis",
              },
            ],
    };
  }

  if (archetype === "CALCULUS_INTEGRAL_AREA_2D") {
    const r = (raw || {}) as Partial<IntegralArea2DPayload>;
    const lower = r.interval?.lower_bound ?? 0;
    return {
      archetype: "CALCULUS_INTEGRAL_AREA_2D",
      engine: "mafs",
      view: {
        x_bounds: Array.isArray(r.view?.x_bounds) && r.view.x_bounds.length === 2 ? r.view.x_bounds : [-1, 7],
        y_bounds: Array.isArray(r.view?.y_bounds) && r.view.y_bounds.length === 2 ? r.view.y_bounds : [-1, 6],
        grid_step: typeof r.view?.grid_step === "number" ? r.view.grid_step : 1,
      },
      functions: {
        target: r.functions?.target || "sin(x) + 2",
      },
      interval: {
        lower_bound: lower,
      },
      sliders: smoothSliders(
        Array.isArray(r.sliders) && r.sliders.length > 0
          ? r.sliders
          : [
              {
                id: "b",
                symbol: "b",
                label: "Límite Superior (b)",
                min: 1.0,
                max: 6.0,
                step: 0.01,
                default: 4.5,
              },
              {
                id: "n",
                symbol: "n",
                label: "Particiones Riemann (n)",
                min: 2,
                max: 40,
                step: 1,
                default: 8,
              },
            ]
      ),
      render_layers:
        Array.isArray(r.render_layers) && r.render_layers.length >= 2
          ? r.render_layers
          : [
              { type: "plot", fn: "target", color: "#334155", style: "solid", weight: 3 },
              {
                type: "integral_fill",
                role: "correct",
                fn: "target",
                from: String(lower),
                to: "b",
                fill_color: "rgba(2, 132, 199, 0.25)",
                border_color: "#0284C7",
              },
              {
                type: "riemann_rectangles",
                role: "error",
                fn: "target",
                from: String(lower),
                to: "b",
                partitions: "n",
                method: "left",
                fill_color: "rgba(225, 29, 72, 0.2)",
                border_color: "#E11D48",
              },
            ],
    };
  }

  // LINEAR_TRANSFORMATION_GRID_2D
  const r = (raw || {}) as Partial<LinearTransformationGrid2DPayload>;
  return {
    archetype: "LINEAR_TRANSFORMATION_GRID_2D",
    engine: "mafs",
    view: {
      x_bounds: Array.isArray(r.view?.x_bounds) && r.view.x_bounds.length === 2 ? r.view.x_bounds : [-5, 5],
      y_bounds: Array.isArray(r.view?.y_bounds) && r.view.y_bounds.length === 2 ? r.view.y_bounds : [-5, 5],
      grid_step: typeof r.view?.grid_step === "number" ? r.view.grid_step : 1,
    },
    matrices: {
      identity: [[1, 0], [0, 1]],
      correct_transform: r.matrices?.correct_transform || [[2, 1], [-1, 1]],
      error_transform: r.matrices?.error_transform || [[1, 2], [1, -1]],
    },
    input_vector:
      Array.isArray(r.input_vector) && r.input_vector.length === 2 ? r.input_vector : [1, 2],
    sliders: smoothSliders(
      Array.isArray(r.sliders) && r.sliders.length > 0
        ? r.sliders
        : [
            {
              id: "t",
              symbol: "t",
              label: "Animar Transformación",
              min: 0.0,
              max: 1.0,
              step: 0.005,
              default: 1.0,
            },
            {
              id: "k",
              symbol: "k",
              label: "Escalar Vector (k)",
              min: 0.5,
              max: 2.5,
              step: 0.01,
              default: 1.0,
            },
          ]
    ),
    render_layers:
      Array.isArray(r.render_layers) && r.render_layers.length >= 2
        ? r.render_layers
        : [
            {
              type: "deformed_grid",
              matrix_source: "correct_transform",
              interpolation_var: "t",
              line_color: "#CBD5E1",
              weight: 1.5,
            },
            {
              type: "vector",
              role: "correct",
              origin: [0, 0],
              expr: "k * (correct_transform * input_vector)",
              color: "#0284C7",
              label: "T(v) Correcto",
              weight: 3.5,
            },
            {
              type: "vector",
              role: "error",
              origin: [0, 0],
              expr: "k * (error_transform * input_vector)",
              color: "#E11D48",
              label: "Tu Elección",
              style: "dashed",
              weight: 3,
            },
          ],
  };
}

/**
 * PASO 1 (JSON #1): Genera una pregunta conceptual que encaje en uno de los 3 arquetipos de problem_types.txt,
 * la guarda en 'generaciones_ia' y devuelve el 1er JSON al frontend.
 */
export async function generateQuestionFromMarkdown(params: {
  documentoId: string;
  markdownContent: string;
  preguntasPrevias?: string[];
}): Promise<GeneratedQuestionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY no está configurada");

  const trimmedMd = params.markdownContent.slice(0, 25000);
  const prevText =
    params.preguntasPrevias && params.preguntasPrevias.length > 0
      ? `\n\nPreguntas ya realizadas anteriormente (NO REPETIR estos problemas):\n- ${params.preguntasPrevias.join("\n- ")}`
      : "";

  const userPrompt = `Analiza el siguiente material de estudio extraído del PDF y genera el JSON #1 (pregunta, 4 opciones, explicación socrática y arquetipo obligatorio):${prevText}

--- MATERIAL DE ESTUDIO ---
${trimmedMd}
--- FIN MATERIAL ---`;

  const ai = new GoogleGenAI({ apiKey, apiVersion: "v1beta" });
  let question: QuestionPayload | null = null;
  let lastError: unknown = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      console.log(`[quizGenerator] Generando JSON #1 (pregunta) con '${model}'...`);
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: `${QUESTION_SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.35,
          httpOptions: { timeout: 16_000 },
        },
      });

      const text = (res.text ?? "").trim();
      const cleanedJson = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\n```\s*$/, "")
        .trim();

      const parsed = JSON.parse(cleanedJson);
      const qCandidate: QuestionPayload = parsed.question ? parsed.question : parsed;

      if (
        qCandidate &&
        Array.isArray(qCandidate.options) &&
        qCandidate.options.length === 4 &&
        qCandidate.question_latex
      ) {
        if (!VALID_ARCHETYPES.includes(qCandidate.archetype)) {
          if (qCandidate.area === "CALCULO_INTEGRAL") {
            qCandidate.archetype = "CALCULUS_INTEGRAL_AREA_2D";
          } else if (qCandidate.area === "ALGEBRA_LINEAL") {
            qCandidate.archetype = "LINEAR_TRANSFORMATION_GRID_2D";
          } else {
            qCandidate.archetype = "CALCULUS_DERIVATIVE_TANGENT_2D";
          }
        }
        question = qCandidate;
        console.log(
          `[quizGenerator] JSON #1 generado con '${model}' -> Arquetipo: ${question.archetype}`
        );
        break;
      }
    } catch (e) {
      lastError = e;
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[quizGenerator] JSON #1 falló en '${model}': ${msg.slice(0, 100)}`);
    }
  }

  if (!question) {
    throw lastError || new Error("No se pudo generar el JSON #1 de la pregunta con Gemini");
  }

  question.question_id = question.question_id || `q_${Date.now()}`;

  // Guardar registro inicial en PocketBase 'generaciones_ia'
  const pb = new PocketBase(pbUrl());
  pb.autoCancellation(false);

  const record = await pb.collection("generaciones_ia").create({
    documento_id: params.documentoId,
    tipo_problema: question.archetype,
    preguntas: question,
    explicacion: question.explanation || "",
  });

  return {
    generacion_id: record.id,
    documento_id: params.documentoId,
    question,
    explicacion: question.explanation || "",
  };
}

/**
 * PASO 2 (JSON #2): Genera la especificación gráfica determinista en base al arquetipo del JSON #1
 * y actualiza el campo 'codigo_grafico' en PocketBase 'generaciones_ia'.
 */
export async function generateGraphForQuestion(params: {
  generacionId: string;
  question: QuestionPayload;
}): Promise<GeneratedGraphResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY no está configurada");

  const archetype: ProblemArchetype = VALID_ARCHETYPES.includes(params.question.archetype)
    ? params.question.archetype
    : "CALCULUS_DERIVATIVE_TANGENT_2D";

  const userPrompt = `Genera el JSON #2 de simulación gráfica para la siguiente pregunta:
- Arquetipo obligatorio: "${archetype}"
- Enunciado: ${params.question.question_latex}
- Opciones: ${JSON.stringify(params.question.options)}
- Opción correcta: ${params.question.correct_option_id}
- Explicación: ${params.question.explanation}

Recuerda devolver ÚNICAMENTE el JSON correspondiente a "${archetype}" con expresiones válidas en math.js.`;

  const ai = new GoogleGenAI({ apiKey, apiVersion: "v1beta" });
  let rawGraph: Partial<ArchetypeGraphPayload> | null = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      console.log(`[quizGenerator] Generando JSON #2 (${archetype}) con '${model}'...`);
      const res = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: `${GRAPH_SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
          httpOptions: { timeout: 16_000 },
        },
      });

      const text = (res.text ?? "").trim();
      const cleanedJson = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\n```\s*$/, "")
        .trim();

      const parsed = JSON.parse(cleanedJson);
      rawGraph = parsed.graph ? parsed.graph : parsed;
      if (rawGraph) {
        console.log(`[quizGenerator] JSON #2 generado con éxito usando '${model}'.`);
        break;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[quizGenerator] JSON #2 falló en '${model}': ${msg.slice(0, 100)}`);
    }
  }

  // Normalizar/sanitizar para garantizar que nunca falle en Mafs.dev + math.js
  const graph = normalizeArchetypeGraph(rawGraph, archetype);

  // Actualizar el registro en PocketBase 'generaciones_ia' con el 2do JSON
  try {
    const pb = new PocketBase(pbUrl());
    pb.autoCancellation(false);
    await pb.collection("generaciones_ia").update(params.generacionId, {
      tipo_problema: archetype,
      codigo_grafico: graph,
    });
  } catch (e) {
    console.warn("[quizGenerator] No se pudo actualizar codigo_grafico en PocketBase:", e);
  }

  return {
    generacion_id: params.generacionId,
    graph,
  };
}
