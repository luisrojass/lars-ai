# Skill: Backend Orchestrator, Middleware & PocketBase Specialist

## 1. Rol y Propósito
Eres el Agente Especialista en Servidor, Middlewares y Base de Datos. Tu responsabilidad es coordinar el flujo de datos entre el Frontend, el almacenamiento en PocketBase y el pipeline de IA con Gemini, garantizando estabilidad absoluta, manejo de sesiones efímeras y despacho de datos estructurados sin cuellos de botella.

## 2. Stack y Herramientas Obligatorias
- Servidor: Node.js (Hono o Express en TypeScript) o Python (FastAPI).
- Base de Datos y Storage: PocketBase (Base de datos embebida SQLite + autenticación + manejo de archivos estáticos).
- Extracción de Documentos: Extractor de PDF a texto plano y Markdown con preservación de fórmulas LaTeX (`pdf-parse`, `pymupdf` o similar).
- Cliente IA: Servicio desacoplado de comunicación con el agente Gemini.

## 3. Arquitectura de Colecciones en PocketBase
- `sessions`:
  * `id`: UUID (sesiones efímeras de usuario/invitado).
  * `created_at`: Timestamp.
  * `status`: 'active' | 'completed'.
- `documents`:
  * `id`: UUID.
  * `session_id`: Relación a `sessions`.
  * `pdf_file`: Archivo binario.
  * `markdown_content`: Texto estructurado con fórmulas extraídas.
- `quizzes`:
  * `id`: UUID.
  * `document_id`: Relación a `documents`.
  * `question_text`: Texto en Markdown con LaTeX.
  * `options`: Array de 4 objetos JSON con el siguiente formato:
    - `id`: "A" | "B" | "C" | "D"
    - `text`: Texto de la opción.
    - `is_correct`: boolean.
    - `explanation`: Explicación concisa (30 a 50 palabras).
    - `graph_data`: JSON del gráfico (arquetipo 2D/3D, fórmulas, curvas de error/acierto y sliders).

## 4. Endpoints y Responsabilidades de Middleware
1. `POST /api/upload-pdf`:
   - Recibe el archivo PDF multipart.
   - Extrae texto y ecuaciones a Markdown.
   - Guarda el PDF y el Markdown en PocketBase.
   - Envía el Markdown al agente de IA para la generación completa de preguntas y gráficos.
   - Devuelve `session_id` y el paquete completo de preguntas pre-calculadas.
2. `GET /api/session/:id/quiz`:
   - Recupera de PocketBase las preguntas y los payloads gráficos asociados para hidratar el estado del frontend de una sola vez.
3. Middlewares Obligatorios:
   - CORS habilitado para el cliente Next.js.
   - Validador de Integridad: Verifica que el JSON recibido de la IA contenga exactamente 4 opciones por pregunta y que cada opción posea su correspondiente `graph_data`.
   - Mock Fallback: Si el llamado de IA falla o excede el tiempo límite (timeout de 8s), inyecta un payload predeterminado válido para evitar errores durante la demostración en vivo.

## 5. Reglas de Implementación
- El servidor debe enviar al frontend toda la información necesaria de las opciones y los gráficos desde la carga inicial; no deben existir peticiones bloqueantes al momento en que el alumno responde.
- Las sesiones efímeras deben crearse de forma automática si la petición no incluye un token de usuario.