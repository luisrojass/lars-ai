import * as math from 'mathjs';

// Cache de expresiones compiladas para garantizar 60 FPS sin recompilación en cada frame
const compileCache = new Map<string, math.EvalFunction>();

/**
 * Evalúa de forma segura una función f(x) con Math.js usando variables de sliders.
 * Cumple estrictamente con la regla: math.compile(fn).evaluate({ x, ...variables })
 */
export function evaluateMathFunction(
  expression: string,
  scope: Record<string, number>
): number {
  try {
    let compiled = compileCache.get(expression);
    if (!compiled) {
      compiled = math.compile(expression);
      compileCache.set(expression, compiled);
    }
    const result = compiled.evaluate(scope);
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return result;
    }
    return 0;
  } catch (error) {
    // Retornar 0 en caso de singularidades o expresiones incompletas
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
  let compiled: math.EvalFunction;
  try {
    if (compileCache.has(expression)) {
      compiled = compileCache.get(expression)!;
    } else {
      compiled = math.compile(expression);
      compileCache.set(expression, compiled);
    }
  } catch {
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
