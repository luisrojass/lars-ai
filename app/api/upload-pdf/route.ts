import { GeminiConfigError, pdfToMarkdown } from "@/lib/server/gemini";
import { createDocumento } from "@/lib/server/documentos";

export const maxDuration = 120;

// Límite del envío inline a Gemini (~20 MB en base64 por request).
const MAX_BYTES = 14 * 1024 * 1024;

/**
 * POST /api/upload-pdf  (multipart/form-data)
 *   file:       PDF (obligatorio)
 *   session_id: opcional; si falta se crea una sesión efímera (UUID)
 * Convierte el PDF a Markdown con Gemini y guarda ambos en la misma entrada de `documentos`.
 */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Se esperaba multipart/form-data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Falta el campo 'file'" }, { status: 400 });
  }
  if (file.size === 0) return Response.json({ error: "El archivo está vacío" }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "El PDF supera los 14 MB permitidos" }, { status: 413 });
  }

  const pdf = Buffer.from(await file.arrayBuffer());
  if (pdf.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return Response.json({ error: "El archivo no es un PDF válido" }, { status: 415 });
  }

  const rawSession = form.get("session_id");
  const sessionId =
    typeof rawSession === "string" && /^[\w-]{8,64}$/.test(rawSession) ? rawSession : crypto.randomUUID();

  let markdown: string;
  try {
    markdown = await pdfToMarkdown(pdf);
  } catch (e) {
    if (e instanceof GeminiConfigError) {
      return Response.json({ error: e.message }, { status: 503 });
    }
    console.error("[upload-pdf] Gemini:", e);
    return Response.json({ error: "Falló la conversión del PDF a Markdown" }, { status: 502 });
  }

  try {
    const doc = await createDocumento({ sessionId, fileName: file.name || "documento.pdf", pdf, markdown });
    return Response.json(
      { document_id: doc.id, session_id: sessionId, pdf_file: doc.archivo_pdf, markdown_chars: markdown.length },
      { status: 201 },
    );
  } catch (e) {
    console.error("[upload-pdf] PocketBase:", e);
    return Response.json({ error: "No se pudo guardar el documento en PocketBase" }, { status: 502 });
  }
}
