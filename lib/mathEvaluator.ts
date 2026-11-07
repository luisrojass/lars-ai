import * as math from 'mathjs';

// Cache de expresiones compiladas para garantizar 60 FPS (<16ms por frame)
const compileCache = new Map<string, math.EvalFunction>();

function getCompiled(expression: string): math.EvalFunction | null {
  try {
    let compiled = compileCache.get(expression);
    if (!compiled) {
      compiled = math.compile(expression);
      compileCache.set(expression, compiled);
    }
    return compiled;
  } catch {
    return null;
  }
}

/**
 * Evalúa de forma segura una expresión escalar con Math.js usando variables del scope.
 * Cumple estrictamente con la regla: math.compile(expr).evaluate(scope)
 */
export function evaluateMathFunction(
  expression: string,
  scope: Record<string, unknown>
): number {
  const compiled = getCompiled(expression);
  if (!compiled) {
    const asNum = Number(expression);
    return Number.isFinite(asNum) ? asNum : 0;
  }
  try {
    const result = compiled.evaluate(scope);
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return result;
    }
    return 0;
  } catch {
    return 0;
  }
}

/**
 * Genera una función pura evaluable f(x) compatible con el componente Mafs Plot.OfX
 */
export function createEvaluator(
  expression: string,
  sliderValues: Record<string, number>
): (x: number) => number {
  const compiled = getCompiled(expression);
  if (!compiled) {
    return () => 0;
  }

  return (x: number) => {
    try {
      const scope = { x, ...sliderValues };
      const val = compiled.evaluate(scope);
      if (typeof val === 'number' && isFinite(val)) {
        return val;
      }
      return 0;
    } catch {
      return 0;
    }
  };
}

/**
 * Evalúa una expresión matricial/vectorial 2D con Math.js (ej. "k * (correct_transform * input_vector)")
 * inyectando matrices 2x2, vectores 2D y variables de sliders en el scope.
 */
export function evaluateVector2D(
  expression: string,
  matrices: Record<string, [[number, number], [number, number]]>,
  inputVector: [number, number],
  sliderValues: Record<string, number>
): [number, number] {
  const compiled = getCompiled(expression);
  if (!compiled) return [0, 0];

  try {
    const scope: Record<string, unknown> = {
      ...sliderValues,
      input_vector: math.matrix(inputVector),
    };

    for (const [key, mat] of Object.entries(matrices)) {
      scope[key] = math.matrix(mat);
    }

    const res = compiled.evaluate(scope);

    // Extraer array 2D desde Matrix o Array de mathjs
    if (res && typeof res.toArray === 'function') {
      const arr = res.toArray() as unknown[];
      const x = Number(Array.isArray(arr[0]) ? arr[0][0] : arr[0]);
      const y = Number(Array.isArray(arr[1]) ? arr[1][0] : arr[1]);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        return [x, y];
      }
    } else if (Array.isArray(res) && res.length >= 2) {
      const x = Number(res[0]);
      const y = Number(res[1]);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        return [x, y];
      }
    }
    return [0, 0];
  } catch {
    return [0, 0];
  }
}
