import { GeminiConfigError, pdfToMarkdown } from "@/lib/server/gemini";
import { extractPdfText } from "@/lib/server/pdfExtractor";
import { createDocumento, verifyUser } from "@/lib/server/documentos";

export const maxDuration = 60;

// Límite de archivo admitido (14 MB)
const MAX_BYTES = 14 * 1024 * 1024;

/**
 * POST /api/upload-pdf  (multipart/form-data)
 *   file:       PDF (obligatorio)
 * Header: Authorization: Bearer <token de sesión PocketBase> (obligatorio).
 *
 * Flujo de alto rendimiento y cero fallos (100% compatible con Vercel):
 * 1. Extrae el texto del PDF de forma nativa en Node.js (<300ms) usando unpdf.
 * 2. Si el PDF tiene texto digital, genera el Markdown estructurado inmediatamente sin consumir cuota multimodal ni sufrir timeouts de red.
 * 3. Si es un PDF puramente escaneado/imágenes sin texto, usa Gemini como fallback multimodal.
 * 4. Guarda el documento (archivo binario + Markdown) en PocketBase.
 */
export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const userId = token ? await verifyUser(token) : null;
  if (!userId) {
    return Response.json({ error: "Debes iniciar sesión para subir PDFs" }, { status: 401 });
  }

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

  const sessionId = userId;
  let markdown = "";

  // Paso 1: Extracción local ultrarrápida nativa en JS (funciona en Vercel)
  try {
    const localResult = await extractPdfText(pdf);
    if (localResult.text.trim().length > 40) {
      markdown = `# Material de Estudio: ${file.name}\nTotal páginas: ${localResult.totalPages}\n\n${localResult.text}`;
      console.log(`[upload-pdf] Extracción nativa local completada: ${markdown.length} caracteres extraídos de ${localResult.totalPages} páginas.`);
    }
  } catch (err) {
    console.warn("[upload-pdf] Extracción nativa local no pudo leer texto del PDF, intentando fallback multimodal...", err);
  }

  // Paso 2: Fallback con Gemini multimodal si el PDF no contiene texto digital embebido
  if (!markdown) {
    try {
      console.log("[upload-pdf] Ejecutando fallback multimodal con Gemini...");
      markdown = await pdfToMarkdown(pdf);
    } catch (e) {
      if (e instanceof GeminiConfigError) {
        return Response.json({ error: e.message }, { status: 503 });
      }
      console.error("[upload-pdf] Fallback multimodal Gemini falló:", e);
      return Response.json({ error: "No se pudo extraer texto del PDF (el documento no contiene texto legible)" }, { status: 502 });
    }
  }

  // Paso 3: Guardar en PocketBase (documentos)
  try {
    const doc = await createDocumento({ sessionId, fileName: file.name || "documento.pdf", pdf, markdown });
    return Response.json(
      { document_id: doc.id, session_id: sessionId, pdf_file: doc.archivo_pdf, markdown_chars: markdown.length },
      { status: 201 },
    );
  } catch (e: unknown) {
    const pbErr = e as { data?: unknown; message?: string; status?: number };
    console.error("[upload-pdf] PocketBase:", pbErr.status, JSON.stringify(pbErr.data || pbErr.message));
    return Response.json({ error: "No se pudo guardar el documento en PocketBase" }, { status: 502 });
  }
}
