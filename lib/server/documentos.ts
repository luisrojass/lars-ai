import "server-only";
import PocketBase from "pocketbase";

export interface DocumentoRecord {
  id: string;
  session_id: string;
  archivo_pdf: string;
  contenido_md: string;
}

export function pbUrl() {
  const url = process.env.POCKETBASE_URL ?? process.env.NEXT_PUBLIC_POCKETBASE_URL;
  if (!url) throw new Error("POCKETBASE_URL no está configurada");
  return url.replace(/\/_\/?$/, "").replace(/\/$/, "");
}

/** Verifica el token de sesión de PocketBase (colección users o _superusers). Devuelve el id del usuario o null. */
export async function verifyUser(token: string): Promise<string | null> {
  try {
    const pb = new PocketBase(pbUrl());
    pb.authStore.save(token, null);
    try {
      const { record } = await pb.collection("users").authRefresh();
      return record.id;
    } catch {
      const { record } = await pb.collection("_superusers").authRefresh();
      return record.id;
    }
  } catch {
    return null;
  }
}

function client() {
  const pb = new PocketBase(pbUrl());
  pb.autoCancellation(false);
  return pb;
}

/**
 * Crea una entrada en `documentos` con el PDF y su Markdown.
 * La colección tiene createRule pública, no requiere autenticación.
 */
export async function createDocumento(input: {
  sessionId: string;
  fileName: string;
  pdf: Buffer;
  markdown: string;
}): Promise<DocumentoRecord> {
  const form = new FormData();
  form.set("session_id", input.sessionId);
  form.set("contenido_md", input.markdown);
  form.set("archivo_pdf", new Blob([new Uint8Array(input.pdf)], { type: "application/pdf" }), input.fileName);
  return client().collection("documentos").create<DocumentoRecord>(form);
}
