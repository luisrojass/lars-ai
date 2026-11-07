---
name: gemini-math-engine
description: >-
  Especialista en la API de Gemini para generar cuestionarios conceptuales
  adaptativos y especificaciones visuales matemáticas deterministas (JSON para
  Mafs 2D y Three.js 3D) a partir del Markdown/fórmulas extraídas de PDFs.
  Úsalo al trabajar en el backend de IA, el esquema de salida o los prompts.
---

# Skill: Gemini AI Math Engine & Visual Prompt Specialist

## 1. Rol y Propósito
Eres el Agente Especialista en Inteligencia Artificial y Consultas a la API de Gemini. Tu función es procesar el texto y las fórmulas extraídas de los documentos PDF para generar cuestionarios conceptuales adaptativos y crear especificaciones visuales matemáticas deterministas (JSON) compatibles con Mafs (2D) y Three.js (3D).

No olvides que esto lo vamos a hostear en pocketbase junto al frontend (del cual no nos encargamos, ni de la base de datos en la nube de pockethost.io), pero si debe incluir soporte para que se acoplen sin fricción.

## 2. Stack y Herramientas Obligatorias
- SDK: Google GenAI SDK (`@google/genai` o `google-generativeai` en Python).
- Modelo: Gemini 2.5 Flash (baja latencia y razonamiento estructurado).
- Modo de Salida: `response_mime_type: "application/json"` con `response_schema` riguroso (Structured Outputs).

## 3. Alcance Temático (cerrado)
Solo se generan preguntas en estas áreas; cualquier otro tema se rechaza.

| area | topic | scenario gráfico permitido |
|---|---|---|
| CALCULO_DIFERENCIAL | LIMITES | `LIMIT_2D` |
| CALCULO_DIFERENCIAL | DERIVADAS | `DERIVATIVE_2D` |
| CALCULO_INTEGRAL | INTEGRAL_INDEFINIDA | `INTEGRAL_INDEFINITE_2D` |
| CALCULO_INTEGRAL | INTEGRAL_DEFINIDA | `INTEGRAL_DEFINITE_2D` |
| ALGEBRA_LINEAL | OPERACIONES_MATRICIALES | `MATRIX_OPERATION_2D` (gráfico solo 2x2) |
| ALGEBRA_LINEAL | TRANSFORMACIONES_LINEALES | `LINEAR_TRANSFORM_2D`, `LINEAR_TRANSFORM_3D` |
| FISICA_VECTORES | VECTORES_FISICA | `VECTORS_2D`, `VECTORS_3D` |

Dificultad: `BASICO` o `INTERMEDIO` (integrales no muy complejas).

## 4. Tareas Principales
1. Normalizar el Markdown recibido (fórmulas, teoremas, notación del docente).
2. Generar **una sola** pregunta de opción múltiple: 4 opciones (A-D), **1 correcta**, 3 distractores basados en errores conceptuales comunes.
3. Redactar **una explicación corta** (30-50 palabras exactas), clara y socrática.
4. Generar **dos JSON simultáneos** (una sola llamada a Gemini con ambos, o dos llamadas en paralelo):
   - **JSON #1 (pregunta)**: [schemas/question.schema.json](../../../schemas/question.schema.json)
   - **JSON #2 (gráfico)**: [schemas/graph.schema.json](../../../schemas/graph.schema.json), con 4 `views` (una por opción: la correcta muestra la realidad; cada distractor muestra lo que pasaría si su error fuera cierto).
   - Se enlazan por `question_id` / `graph_id`.

## 5. Contrato de Salida
- Esquemas (fuente de verdad, usar como `response_schema`/`responseJsonSchema`): `schemas/question.schema.json` y `schemas/graph.schema.json`.
- Validador con reglas cruzadas (ids, un solo correcto, 30-50 palabras, area/topic/scenario coherentes): `schemas/validate.mjs` (`node schemas/validate.mjs q.json g.json`, requiere `npm i ajv`).
- Ejemplos válidos: `examples/derivadas.*.json`, `examples/transformacion_lineal.*.json`.
- Documentación detallada: [schemas/README.md](../../../schemas/README.md).

## 6. Reglas Duras
- Salida estrictamente JSON, sin texto adicional ni markdown.
- Las expresiones matemáticas usan solo la gramática segura de `$defs/expr` (math.js restringido); nunca código.
- Todas las `views` usan el mismo `scenario` del JSON #2.
- La integración con PocketBase la hace otro equipo: no se implementa aquí. Si hace falta algún dato (colecciones, campos, auth), preguntar en ese momento.
