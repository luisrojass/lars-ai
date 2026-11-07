// Contratos compartidos con el backend. Fuente de verdad: /schemas/*.schema.json

export type OptionId = "A" | "B" | "C" | "D";

export interface QuestionOption {
  id: OptionId;
  text_latex: string;
  is_correct: boolean;
}

export interface QuestionPayload {
  schema_version: "1.0";
  question_id: string;
  graph_id: string;
  area: "CALCULO_DIFERENCIAL" | "CALCULO_INTEGRAL" | "ALGEBRA_LINEAL" | "FISICA_VECTORES";
  topic: string;
  difficulty: "BASICO" | "INTERMEDIO";
  question_latex: string;
  options: [QuestionOption, QuestionOption, QuestionOption, QuestionOption];
  correct_option_id: OptionId;
  explanation: string;
}

export interface GraphView {
  option_id: OptionId;
  is_correct: boolean;
  caption: string;
  /** Unión discriminada por `scenario`; tipar por escenario al implementar el motor gráfico. */
  scene: { scenario: string; renderer: "mafs" | "threejs"; [key: string]: unknown };
}

export interface GraphPayload {
  schema_version: "1.0";
  graph_id: string;
  question_id: string;
  scenario: string;
  views: [GraphView, GraphView, GraphView, GraphView];
}
