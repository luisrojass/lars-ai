import PocketBase from "pocketbase";
import { pbUrl } from "@/lib/server/documentos";

export const maxDuration = 30;

/**
 * POST /api/quiz/answer
 * Body: { generacion_id: string, opcion_seleccionada: string, alumno_nombre?: string }
 * Registra la elección del alumno en la colección 'respuestas_alumnos'.
 */
export async function POST(request: Request) {
  let body: {
    generacion_id?: string;
    opcion_seleccionada?: string;
    alumno_nombre?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { generacion_id, opcion_seleccionada, alumno_nombre } = body;
  if (!generacion_id || !opcion_seleccionada) {
    return Response.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  const pb = new PocketBase(pbUrl());
  pb.autoCancellation(false);

  try {
    const record = await pb.collection("respuestas_alumnos").create({
      generacion_id,
      opcion_seleccionada,
      alumno_nombre: alumno_nombre || "Estudiante",
    });

    return Response.json({ success: true, respuesta_id: record.id }, { status: 201 });
  } catch (e) {
    console.error("[quiz-answer] Error al guardar respuesta del alumno:", e);
    return Response.json({ error: "No se pudo registrar la respuesta" }, { status: 500 });
  }
}
