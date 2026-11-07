import { generateQuestionFromMarkdown } from "@/lib/server/quizGenerator";
import PocketBase from "pocketbase";
import { pbUrl } from "@/lib/server/documentos";

export const maxDuration = 60;

/**
 * POST /api/quiz/generate
 * Body: { documento_id: string, preguntas_previas?: string[] }
 * Genera 1 pregunta conceptual + 1 configuración gráfica con Gemini y la guarda en PocketBase.
 */
export async function POST(request: Request) {
  let body: { documento_id?: string; preguntas_previas?: string[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido en el cuerpo" }, { status: 400 });
  }

  const { documento_id, preguntas_previas } = body;
  if (!documento_id || typeof documento_id !== "string") {
    return Response.json({ error: "Falta el campo 'documento_id'" }, { status: 400 });
  }

  // Obtener el documento de PocketBase
  const pb = new PocketBase(pbUrl());
  pb.autoCancellation(false);

  let doc: { id: string; contenido_md: string };
  try {
    doc = await pb.collection("documentos").getOne(documento_id);
  } catch {
    return Response.json({ error: "Documento no encontrado en PocketBase" }, { status: 404 });
  }

  if (!doc.contenido_md || doc.contenido_md.trim().length === 0) {
    return Response.json({ error: "El documento no contiene texto para generar preguntas" }, { status: 422 });
  }

  try {
    const result = await generateQuestionFromMarkdown({
      documentoId: doc.id,
      markdownContent: doc.contenido_md,
      preguntasPrevias: preguntas_previas,
    });

    return Response.json(result, { status: 201 });
  } catch (e) {
    console.error("[generate-quiz] Error al generar con Gemini:", e);
    return Response.json(
      { error: "Error al generar la pregunta con la IA. Por favor, reintenta." },
      { status: 502 }
    );
  }
}
