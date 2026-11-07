# Contrato de salida: pregunta + gráfico

Cada generación produce **2 JSON** enlazados por `question_id` / `graph_id`.

| Archivo | Contenido |
|---|---|
| `question.schema.json` | 1 pregunta, 4 opciones (A-D), 1 correcta, 1 explicación de 30-50 palabras |
| `graph.schema.json` | Datos declarativos de graficación: 4 `views` (una por opción) |
| `validate.mjs` | Validación con ajv + reglas cruzadas |
| `../examples/` | Pares de ejemplo válidos |

## Escenarios gráficos

| scenario | Renderer | Qué se grafica | Campos clave |
|---|---|---|---|
| `LIMIT_2D` | Mafs | f(x), punto de aproximación, límite, huecos/asíntotas | `fn`, `approach_x`, `side`, `limit{kind,value}`, `hole` |
| `DERIVATIVE_2D` | Mafs | f(x), tangente/secante en x0, puntos críticos | `fn`, `x0`, `slope`, `show_tangent`, `secant_h` |
| `INTEGRAL_INDEFINITE_2D` | Mafs | integrando y familia F(x)+C | `fn`, `antiderivative`, `constants[]` |
| `INTEGRAL_DEFINITE_2D` | Mafs | área sombreada [a,b], suma de Riemann | `fn`, `a`, `b`, `value`, `riemann` |
| `MATRIX_OPERATION_2D` | Mafs | efecto de la operación sobre el cuadrado unitario (2x2) | `operation`, `matrices{A,B,k}`, `result` |
| `LINEAR_TRANSFORM_2D` | Mafs | v y M·v, base, cuadrado unitario, autovectores | `matrix`, `vectors[]` |
| `LINEAR_TRANSFORM_3D` | Three.js | v y M·v en R3, cubo unitario | `matrix(3x3)`, `vectors[]`, `bounds` |
| `VECTORS_2D` | Mafs | suma, resta, escalar, punto, proyección, componentes | `operation`, `vectors[]`, `result` |
| `VECTORS_3D` | Three.js | igual + producto cruz | igual + `bounds` |

## Expresiones (`expr`)
Sintaxis math.js restringida; variable `x`; constantes `pi`, `e`; funciones `sin cos tan asin acos atan sinh cosh tanh exp log ln sqrt abs`; operadores `+ - * / ^ ( )`. El frontend las evalúa con un parser (nunca `eval`).

## Reglas que JSON Schema no cubre (las verifica `validate.mjs`)
- `graph_id` y `question_id` coinciden entre ambos JSON.
- `area` → `topic` → `scenario` coherentes (ver tabla en `SKILL.md`).
- Exactamente una opción `is_correct`, y `correct_option_id` es esa.
- `explanation` entre 30 y 50 palabras.
- `views[i].is_correct` = `options[i].is_correct`; todas las views con el `scenario` raíz.
- Viewport con min < max; integral definida con `a < b`; campos condicionales de matrices; dimensión de vectores 2D/3D.

## Pendiente de definir
- Tolerancia de `value`/`slope` (¿el backend recalcula y verifica numéricamente la respuesta correcta?).
- Idioma/estilo exacto de las `caption`.
