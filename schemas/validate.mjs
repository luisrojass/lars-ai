// Uso: node schemas/validate.mjs <question.json> <graph.json>
// Requiere: ajv (npm i ajv). Valida ambos JSON contra su esquema + reglas cruzadas
// que JSON Schema no puede expresar.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const Ajv2020 = require("ajv/dist/2020");

const load = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
const vQ = ajv.compile(load("./question.schema.json"));
const vG = ajv.compile(load("./graph.schema.json"));

const AREA_TOPICS = {
  CALCULO_DIFERENCIAL: { LIMITES: ["LIMIT_2D"], DERIVADAS: ["DERIVATIVE_2D"] },
  CALCULO_INTEGRAL: {
    INTEGRAL_INDEFINIDA: ["INTEGRAL_INDEFINITE_2D"],
    INTEGRAL_DEFINIDA: ["INTEGRAL_DEFINITE_2D"],
  },
  ALGEBRA_LINEAL: {
    OPERACIONES_MATRICIALES: ["MATRIX_OPERATION_2D"],
    TRANSFORMACIONES_LINEALES: ["LINEAR_TRANSFORM_2D", "LINEAR_TRANSFORM_3D"],
  },
  FISICA_VECTORES: { VECTORES_FISICA: ["VECTORS_2D", "VECTORS_3D"] },
};

export function validatePair(q, g) {
  const errors = [];
  if (!vQ(q)) errors.push(...vQ.errors.map((e) => `question${e.instancePath} ${e.message}`));
  if (!vG(g)) errors.push(...vG.errors.map((e) => `graph${e.instancePath} ${e.message}`));
  if (errors.length) return errors;

  if (q.graph_id !== g.graph_id) errors.push("graph_id no coincide");
  if (q.question_id !== g.question_id) errors.push("question_id no coincide");

  const allowed = AREA_TOPICS[q.area]?.[q.topic];
  if (!allowed) errors.push(`topic ${q.topic} no pertenece a area ${q.area}`);
  else if (!allowed.includes(g.scenario))
    errors.push(`scenario ${g.scenario} no permitido para ${q.topic} (${allowed})`);

  const correct = q.options.filter((o) => o.is_correct);
  if (correct.length !== 1) errors.push("debe haber exactamente 1 opción correcta");
  else if (correct[0].id !== q.correct_option_id) errors.push("correct_option_id no coincide");

  const words = q.explanation.trim().split(/\s+/).length;
  if (words < 30 || words > 50) errors.push(`explanation tiene ${words} palabras (30-50)`);

  g.views.forEach((v, i) => {
    if (v.is_correct !== q.options[i].is_correct) errors.push(`views[${i}].is_correct no coincide`);
    if (v.scene.scenario !== g.scenario) errors.push(`views[${i}].scene.scenario != ${g.scenario}`);
    const s = v.scene;
    if (s.viewport && (s.viewport.domain[0] >= s.viewport.domain[1] || s.viewport.range[0] >= s.viewport.range[1]))
      errors.push(`views[${i}] viewport inválido (min<max)`);
    if (s.scenario === "INTEGRAL_DEFINITE_2D" && s.a >= s.b) errors.push(`views[${i}] requiere a<b`);
    if (s.scenario === "MATRIX_OPERATION_2D") {
      if (["ADD", "MULTIPLY"].includes(s.operation) && !s.matrices.B) errors.push(`views[${i}] falta matrices.B`);
      if (s.operation === "SCALAR_MULTIPLY" && s.matrices.k === undefined) errors.push(`views[${i}] falta matrices.k`);
    }
    if (s.scenario === "VECTORS_2D" && s.vectors.some((x) => x.components && x.components.length !== 2))
      errors.push(`views[${i}] VECTORS_2D requiere componentes de longitud 2`);
    if (s.scenario === "VECTORS_3D" && s.vectors.some((x) => x.components && x.components.length !== 3))
      errors.push(`views[${i}] VECTORS_3D requiere componentes de longitud 3`);
  });
  return errors;
}

if (process.argv[2]) {
  const errs = validatePair(
    JSON.parse(readFileSync(process.argv[2], "utf8")),
    JSON.parse(readFileSync(process.argv[3], "utf8")),
  );
  if (errs.length) { console.error("INVÁLIDO:\n- " + errs.join("\n- ")); process.exit(1); }
  console.log("OK");
}
