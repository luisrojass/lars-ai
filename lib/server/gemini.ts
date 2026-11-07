import "server-only";
import { GoogleGenAI } from "@google/genai";

const PROMPT = `Convierte el PDF adjunto a Markdown legible, fiel al contenido original.
Reglas:
- Conserva títulos, listas, tablas y párrafos con su jerarquía.
- Toda fórmula matemática va en LaTeX: en línea con $...$ y en bloque con $$...$$.
- Conserva teoremas, definiciones y la notación propia del docente.
- Describe brevemente entre corchetes [Figura: ...] las imágenes o gráficos relevantes.
- No inventes ni resumas contenido; no agregues comentarios tuyos.
- Responde SOLO con el Markdown, sin bloques de código envolventes.`;

export class GeminiConfigError extends Error {}

/**
 * Modelos multimodales candidatos compatibles con la API Key en v1beta.
 * Nombre exacto de Gemini Flash 3.8: 'gemini-3.8-flash'.
 * Si 3.8 está en 'high demand' (503) o demora, se hace fallback automático a 3.5 o 3-flash.
 */
const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3-flash-preview"
];

/** Convierte un PDF en Markdown (con fórmulas LaTeX) usando la API de Gemini (v1beta). */
export async function pdfToMarkdown(pdf: Buffer): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiConfigError("GEMINI_API_KEY no está configurada");

  const preferredModel = process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash";
  const modelsToTry = Array.from(new Set([preferredModel, ...CANDIDATE_MODELS]));

  // apiVersion: 'v1beta' es OBLIGATORIO para modelos Gemini 3.x
  const ai = new GoogleGenAI({ apiKey, apiVersion: "v1beta" });

  let lastError: unknown = null;

  for (const model of modelsToTry) {
    try {
      console.log(`[gemini] Intentando extracción con modelo '${model}'...`);
      const res = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: "application/pdf", data: pdf.toString("base64") } },
              { text: PROMPT },
            ],
          },
        ],
        config: { temperature: 0, httpOptions: { timeout: 12_000 } },
      });

      let md = (res.text ?? "").trim();
      md = md.replace(/^```(?:markdown|md)?\s*\n/i, "").replace(/\n```\s*$/, "").trim();
      if (!md) {
        md = "[Documento procesado: no se detectó texto ni fórmulas extraíbles en el PDF]";
      }

      console.log(`[gemini] Extracción completada exitosamente con '${model}' (${md.length} chars)`);
      return md;
    } catch (e: unknown) {
      lastError = e;
      const errMsg = e instanceof Error ? e.message : String(e);
      console.warn(`[gemini] Intento con '${model}' no completó (${errMsg.slice(0, 120)}). Probando alternativa...`);
    }
  }

  throw lastError || new Error("No se pudo convertir el PDF con los modelos disponibles");
}
