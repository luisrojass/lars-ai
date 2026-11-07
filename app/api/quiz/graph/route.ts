import { generateGraphForQuestion } from "@/lib/server/quizGenerator";
import type { QuestionPayload } from "@/lib/types";

export const maxDuration = 60;

/**
 * POST /api/quiz/graph
 * Body: { generacion_id: string, question: QuestionPayload }
 * Genera el 2do JSON determinista (Mafs.dev + math.js) según el arquetipo del 1er JSON,
 * lo guarda en PocketBase (generaciones_ia.codigo_grafico) y lo devuelve al frontend.
 */
export async function POST(request: Request) {
  let body: { generacion_id?: string; question?: QuestionPayload };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido en el cuerpo" }, { status: 400 });
  }

  const { generacion_id, question } = body;
  if (!generacion_id || typeof generacion_id !== "string" || !question) {
    return Response.json(
      { error: "Faltan 'generacion_id' o 'question' para generar el 2do JSON" },
      { status: 400 }
    );
  }

  try {
    const result = await generateGraphForQuestion({
      generacionId: generacion_id,
      question,
    });

    return Response.json(result, { status: 200 });
  } catch (e) {
    console.error("[quiz-graph] Error al generar 2do JSON:", e);
    return Response.json(
      { error: "Error al generar la especificación gráfica con la IA" },
      { status: 502 }
    );
  }
}
