// Contratos compartidos entre el backend (Gemini) y el motor gráfico determinista 2D (Mafs.dev)
// Basado estrictamente en problem_types.txt

export type OptionId = "A" | "B" | "C" | "D";

export type ProblemArchetype =
  | "CALCULUS_DERIVATIVE_TANGENT_2D"
  | "CALCULUS_INTEGRAL_AREA_2D"
  | "LINEAR_TRANSFORMATION_GRID_2D";

export interface QuestionOption {
  id: OptionId;
  text_latex: string;
  is_correct: boolean;
}

/**
 * JSON #1: Respuesta inicial con la pregunta, las 4 opciones, la explicación socrática
 * y el arquetipo estricto de problema (problem_types.txt).
 */
export interface QuestionPayload {
  schema_version: "1.0";
  question_id: string;
  graph_id?: string;
  archetype: ProblemArchetype;
  area: "CALCULO_DIFERENCIAL" | "CALCULO_INTEGRAL" | "ALGEBRA_LINEAL";
  topic: string;
  difficulty: "BASICO" | "INTERMEDIO";
  question_latex: string;
  options: [QuestionOption, QuestionOption, QuestionOption, QuestionOption];
  correct_option_id: OptionId;
  explanation: string;
}

// ============================================================================
// JSON #2: Especificación determinista de simulación para Mafs.dev
// ============================================================================

export interface ArchetypeViewConfig {
  x_bounds: [number, number];
  y_bounds: [number, number];
  grid_step: number;
}

export interface ArchetypeSlider {
  id: string;
  symbol: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
}

// Capas de renderizado de los 3 arquetipos
export interface PlotRenderLayer {
  type: "plot";
  fn: string; // Clave en functions (ej. "target") o expresión directa math.js
  color: string;
  style?: "solid" | "dashed";
  weight?: number;
}

export interface TangentLineRenderLayer {
  type: "tangent_line";
  role: "correct" | "error";
  fn_source: string; // ej. "target"
  slope_expr: string; // ej. "correct_derivative" | "error_derivative"
  eval_at: string; // ej. "x_0"
  color: string;
  style?: "solid" | "dashed";
  weight?: number;
  label?: string;
}

export interface IntegralFillRenderLayer {
  type: "integral_fill";
  role: "correct" | "error";
  fn: string; // ej. "target"
  from: string; // ej. "0"
  to: string; // ej. "b"
  fill_color: string;
  border_color: string;
}

export interface RiemannRectanglesRenderLayer {
  type: "riemann_rectangles";
  role: "correct" | "error";
  fn: string; // ej. "target"
  from: string; // ej. "0"
  to: string; // ej. "b"
  partitions: string; // ej. "n"
  method: "left" | "right" | "midpoint";
  fill_color: string;
  border_color: string;
}

export interface DeformedGridRenderLayer {
  type: "deformed_grid";
  matrix_source: string; // ej. "correct_transform"
  interpolation_var: string; // ej. "t"
  line_color: string;
  weight?: number;
}

export interface VectorRenderLayer {
  type: "vector";
  role: "correct" | "error";
  origin: [number, number];
  expr: string; // ej. "k * (correct_transform * input_vector)"
  color: string;
  label?: string;
  style?: "solid" | "dashed";
  weight?: number;
}

export type ArchetypeRenderLayer =
  | PlotRenderLayer
  | TangentLineRenderLayer
  | IntegralFillRenderLayer
  | RiemannRectanglesRenderLayer
  | DeformedGridRenderLayer
  | VectorRenderLayer;

/** Arquetipo 1: CALCULUS_DERIVATIVE_TANGENT_2D */
export interface DerivativeTangent2DPayload {
  archetype: "CALCULUS_DERIVATIVE_TANGENT_2D";
  engine: "mafs";
  view: ArchetypeViewConfig;
  functions: {
    target: string;
    correct_derivative: string;
    error_derivative: string;
    [key: string]: string;
  };
  interactive_point?: {
    symbol: string;
    default_value: number;
  };
  sliders: ArchetypeSlider[];
  render_layers: ArchetypeRenderLayer[];
}

/** Arquetipo 2: CALCULUS_INTEGRAL_AREA_2D */
export interface IntegralArea2DPayload {
  archetype: "CALCULUS_INTEGRAL_AREA_2D";
  engine: "mafs";
  view: ArchetypeViewConfig;
  functions: {
    target: string;
    [key: string]: string;
  };
  interval?: {
    lower_bound: number;
  };
  sliders: ArchetypeSlider[];
  render_layers: ArchetypeRenderLayer[];
}

/** Arquetipo 3: LINEAR_TRANSFORMATION_GRID_2D */
export interface LinearTransformationGrid2DPayload {
  archetype: "LINEAR_TRANSFORMATION_GRID_2D";
  engine: "mafs";
  view: ArchetypeViewConfig;
  matrices: {
    identity: [[number, number], [number, number]];
    correct_transform: [[number, number], [number, number]];
    error_transform: [[number, number], [number, number]];
    [key: string]: [[number, number], [number, number]];
  };
  input_vector: [number, number];
  sliders: ArchetypeSlider[];
  render_layers: ArchetypeRenderLayer[];
}

export type ArchetypeGraphPayload =
  | DerivativeTangent2DPayload
  | IntegralArea2DPayload
  | LinearTransformationGrid2DPayload;

export type GraphPayload = ArchetypeGraphPayload;
