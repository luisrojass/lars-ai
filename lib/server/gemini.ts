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

/** Convierte un PDF en Markdown (con fórmulas LaTeX) usando la API de Gemini. */
export async function pdfToMarkdown(pdf: Buffer): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new GeminiConfigError("GEMINI_API_KEY no está configurada");

  const ai = new GoogleGenAI({ apiKey });
  const res = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL ?? "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: "application/pdf", data: pdf.toString("base64") } },
          { text: PROMPT },
        ],
      },
    ],
    config: { temperature: 0, httpOptions: { timeout: 120_000 } },
  });

  let md = (res.text ?? "").trim();
  // Por si el modelo envuelve todo en ```markdown ... ```
  md = md.replace(/^```(?:markdown|md)?\s*\n/i, "").replace(/\n```\s*$/, "").trim();
  if (!md) throw new Error("Gemini devolvió un Markdown vacío");
  return md;
}
