import "server-only";
import { GoogleGenAI } from "@google/genai";
import PocketBase from "pocketbase";
import { pbUrl } from "@/lib/server/documentos";
import type { QuestionPayload, GraphPayload } from "@/lib/types";

export interface GeneratedQuizResult {
  generacion_id: string;
  documento_id: string;
  question: QuestionPayload;
  graph: GraphPayload;
  explicacion: string;
}

const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
];

const SYSTEM_PROMPT = `Eres el Agente Especialista en Inteligencia Artificial y Evaluación Matemática Socrática (ENEISOFT XVI).
Tu tarea es analizar el texto de estudio proporcionado y generar exactamente UNA pregunta de opción múltiple rigurosa junto a su especificación gráfica declarativa para el frontend.

Reglas obligatorias:
1. Genera UNA sola pregunta conceptual con 4 opciones identificadas como "A", "B", "C", "D".
2. Debe haber EXACTAMENTE 1 opción correcta y 3 distractores basados en errores conceptuales comunes y típicos de estudiantes.
3. La explicación DEBE ser socrática, concisa y tener EXACTAMENTE entre 30 y 50 palabras.
4. El escenario gráfico debe corresponder a una de estas áreas:
   - CALCULO_DIFERENCIAL: "LIMIT_2D", "DERIVATIVE_2D"
   - CALCULO_INTEGRAL: "INTEGRAL_INDEFINITE_2D", "INTEGRAL_DEFINITE_2D"
   - ALGEBRA_LINEAL: "MATRIX_OPERATION_2D", "LINEAR_TRANSFORM_2D", "LINEAR_TRANSFORM_3D"
   - FISICA_VECTORES: "VECTORS_2D", "VECTORS_3D"
5. Todas las fórmulas matemáticas van en notación LaTeX entre $...$ (ej. $f(x)=x^2$).
6. Las expresiones en 'graph' usan sintaxis restringida segura (ej. "2*x", "sin(x)").
7. El bloque 'graph.views' debe contener exactamente 4 vistas (A, B, C, D) en ese orden, donde la opción correcta muestra el comportamiento real y cada distractor muestra el comportamiento si ese error fuera verdad.

Debes responder ÚNICAMENTE un JSON válido con esta estructura:
{
  "question": {
    "schema_version": "1.0",
    "question_id": "string",
    "graph_id": "string",
    "area": "CALCULO_DIFERENCIAL" | "CALCULO_INTEGRAL" | "ALGEBRA_LINEAL" | "FISICA_VECTORES",
    "topic": "string",
    "difficulty": "BASICO" | "INTERMEDIO",
    "question_latex": "string",
    "options": [
      { "id": "A", "text_latex": "string", "is_correct": boolean },
      { "id": "B", "text_latex": "string", "is_correct": boolean },
      { "id": "C", "text_latex": "string", "is_correct": boolean },
      { "id": "D", "text_latex": "string", "is_correct": boolean }
    ],
    "correct_option_id": "A" | "B" | "C" | "D",
    "explanation": "string (30-50 palabras)"
  },
  "graph": {
    "schema_version": "1.0",
    "graph_id": "string",
    "question_id": "string",
    "scenario": "string",
    "views": [
      { "option_id": "A", "is_correct": boolean, "caption": "string", "scene": { ... } },
      { "option_id": "B", "is_correct": boolean, "caption": "string", "scene": { ... } },
      { "option_id": "C", "is_correct": boolean, "caption": "string", "scene": { ... } },
      { "option_id": "D", "is_correct": boolean, "caption": "string", "scene": { ... } }
    ]
  }
}`;

/**
 * Genera una pregunta conceptual y su especificación gráfica a partir del Markdown del documento,
 * y la almacena en la colección 'generaciones_ia' de PocketBase.
 */
export async function generateQuestionFromMarkdown(params: {
  documentoId: string;
  markdownContent: string;
  preguntasPrevias?: string[];
}): Promise<GeneratedQuizResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY no está configurada");

  // Recortar a un tamaño representativo si el markdown es enorme (>20,000 chars)
  const trimmedMd = params.markdownContent.slice(0, 25000);

  const prevText = params.preguntasPrevias && params.preguntasPrevias.length > 0
    ? `\n\nPreguntas ya realizadas anteriormente (NO REPETIR estos conceptos):\n- ${params.preguntasPrevias.join("\n- ")}`
    : "";

  const userPrompt = `A partir del siguiente material de estudio, formula una pregunta conceptual relevante que no haya sido formulada antes:${prevText}

--- MATERIAL DE ESTUDIO ---
${trimmedMd}
--- FIN MATERIAL ---`;

  const ai = new GoogleGenAI({ apiKey, apiVersion: "v1beta" });
  let parsedPayload: { question: QuestionPayload; graph: GraphPayload } | null = null;
  let lastError: unknown = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      console.log(`[quizGenerator] Generando pregunta con modelo '${model}'...`);
      const res = await ai.models.generateContent({
        model,
        contents: [
          { role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] }
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
          httpOptions: { timeout: 18_000 }
        }
      });

      const text = (res.text ?? "").trim();
      const cleanedJson = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\n```\s*$/, "").trim();
      parsedPayload = JSON.parse(cleanedJson);

      // Verificación básica de estructura
      if (
        parsedPayload &&
        parsedPayload.question &&
        parsedPayload.graph &&
        Array.isArray(parsedPayload.question.options) &&
        parsedPayload.question.options.length === 4
      ) {
        console.log(`[quizGenerator] Pregunta generada con éxito usando '${model}'.`);
        break;
      }
    } catch (e) {
      lastError = e;
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`[quizGenerator] Intento con '${model}' falló (${msg.slice(0, 100)}). Probando alternativa...`);
    }
  }

  if (!parsedPayload) {
    throw lastError || new Error("No se pudo generar la pregunta con la IA");
  }

  const { question, graph } = parsedPayload;

  // Asegurar consistencia de IDs cruzados
  const qId = question.question_id || `q_${Date.now()}`;
  const gId = graph.graph_id || `g_${Date.now()}`;
  question.question_id = qId;
  question.graph_id = gId;
  graph.question_id = qId;
  graph.graph_id = gId;

  // Guardar en PocketBase colección 'generaciones_ia'
  const pb = new PocketBase(pbUrl());
  pb.autoCancellation(false);

  const record = await pb.collection("generaciones_ia").create({
    documento_id: params.documentoId,
    preguntas: question,
    codigo_grafico: graph,
    explicacion: question.explanation || "",
  });

  return {
    generacion_id: record.id,
    documento_id: params.documentoId,
    question,
    graph,
    explicacion: question.explanation || "",
  };
}
