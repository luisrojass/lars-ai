import { Pregunta, UsuarioPrueba } from '@/types';

export const USUARIOS_PRUEBA: UsuarioPrueba[] = [
  {
    id: 'usr_docente',
    nombre: 'Dr. Carlos Mendoza',
    email: 'carlos.mendoza@eneisoft.edu.pe',
    rol: 'Profesor',
    avatar: '👨‍🏫',
    descripcion: 'Catedrático de Cálculo Avanzado y Modelado Físico'
  },
  {
    id: 'usr_estudiante',
    nombre: 'Ana Sofía Torres',
    email: 'ana.torres@eneisoft.edu.pe',
    rol: 'Estudiante',
    avatar: '👩‍💻',
    descripcion: 'Estudiante de Ingeniería de Software (Ciclo V)'
  },
  {
    id: 'usr_invitado',
    nombre: 'Demostración ENEISOFT',
    email: 'demo@eneisoft.edu.pe',
    rol: 'Invitado',
    avatar: '🚀',
    descripcion: 'Acceso para evaluadores y público general'
  }
];

export const PREGUNTAS_MOCK: Pregunta[] = [
  {
    id: 'q1',
    numero: 1,
    materia: 'Cálculo Diferencial y Ondas',
    titulo: 'Derivada de una Oscilación Sinusoidal con Escala Angular',
    enunciado: 'Dada la función de posición de una onda armónica $f(x) = \\sin(k \\cdot x)$, determine la función de velocidad instantánea $f\'(x)$ y su impacto geométrico sobre la pendiente de las tangentes:',
    slidersBase: [
      { id: 'k', nombre: 'Frecuencia angular', simbolo: 'k', min: 0.5, max: 4, step: 0.1, valorDefecto: 2, unidad: 'rad/s' },
      { id: 'a', nombre: 'Amplitud base', simbolo: 'a', min: 0.5, max: 3, step: 0.1, valorDefecto: 1.5 }
    ],
    esquemaGeometricoBase: {
      tipoMotor: 'mafs-2d',
      tituloGrafico: 'Oscilación Base: f(x) = a * sin(k * x)',
      descripcionVisual: 'Visualización de la función armónica original y sus tangentes.',
      dominioX: [-6, 6],
      dominioY: [-4, 4],
      elementos: [
        {
          id: 'base-fn',
          tipo: 'funcion',
          expresion: 'a * sin(k * x)',
          color: '#334155',
          estiloLinea: 'solida',
          grosor: 2,
          etiqueta: 'f(x) = \\sin(kx)'
        }
      ],
      sliders: [
        { id: 'k', nombre: 'Frecuencia angular', simbolo: 'k', min: 0.5, max: 4, step: 0.1, valorDefecto: 2 },
        { id: 'a', nombre: 'Amplitud base', simbolo: 'a', min: 0.5, max: 3, step: 0.1, valorDefecto: 1.5 }
      ]
    },
    opciones: [
      {
        id: 'A',
        indice: 1,
        texto: "$f'(x) = \\cos(k \\cdot x)$",
        esCorrecta: false,
        retroalimentacionSocratica: "¿Observaste con atención qué ocurre al diferenciar la función compuesta? Recuerda la regla de la cadena: la velocidad angular $k$ debe ponderar externamente a toda la oscilación. ¿Por qué tu expresión omite dicho factor de escala? Compara la curva diagnóstica punteada con la pendiente real.",
        esquemaGeometrico: {
          tipoMotor: 'mafs-2d',
          tituloGrafico: "Diagnóstico Opción A: Falta el factor de escala 'k'",
          descripcionVisual: 'La curva diagnóstica punteada carece de la amplificación de pendiente requerida.',
          dominioX: [-6, 6],
          dominioY: [-4, 4],
          sliders: [
            { id: 'k', nombre: 'Frecuencia angular', simbolo: 'k', min: 0.5, max: 4, step: 0.1, valorDefecto: 2 },
            { id: 'a', nombre: 'Amplitud base', simbolo: 'a', min: 0.5, max: 3, step: 0.1, valorDefecto: 1.5 }
          ],
          elementos: [
            {
              id: 'base-fn',
              tipo: 'funcion',
              expresion: 'a * sin(k * x)',
              color: '#334155',
              estiloLinea: 'solida',
              grosor: 1.8,
              etiqueta: 'f(x)'
            },
            {
              id: 'err-fn',
              tipo: 'funcion',
              expresion: 'cos(k * x)',
              color: '#E11D48',
              estiloLinea: 'punteada',
              grosor: 2.5,
              etiqueta: "Diagnóstico: cos(kx)",
              esDiagnostica: true
            }
          ]
        }
      },
      {
        id: 'B',
        indice: 2,
        texto: "$f'(x) = k \\cdot \\cos(k \\cdot x)$",
        esCorrecta: true,
        retroalimentacionSocratica: "¡Excelente deducción! Al aplicar la regla de la cadena, la derivada interna $k$ modula la amplitud de la razón de cambio instantánea. Observa cómo la curva cian de 3.5px encaja perfectamente con las tangentes en cada punto. ¿Ves cómo la frecuencia comprime los ciclos de oscilación?",
        esquemaGeometrico: {
          tipoMotor: 'mafs-2d',
          tituloGrafico: "Solución Exacta: Trazo Continuo Cian de 3.5px",
          descripcionVisual: 'La curva derivada reproduce con precisión matemática la razón de cambio armónica.',
          dominioX: [-6, 6],
          dominioY: [-4, 4],
          sliders: [
            { id: 'k', nombre: 'Frecuencia angular', simbolo: 'k', min: 0.5, max: 4, step: 0.1, valorDefecto: 2 },
            { id: 'a', nombre: 'Amplitud base', simbolo: 'a', min: 0.5, max: 3, step: 0.1, valorDefecto: 1.5 }
          ],
          elementos: [
            {
              id: 'base-fn',
              tipo: 'funcion',
              expresion: 'a * sin(k * x)',
              color: '#334155',
              estiloLinea: 'solida',
              grosor: 1.5,
              etiqueta: 'f(x)'
            },
            {
              id: 'correct-fn',
              tipo: 'funcion',
              expresion: 'k * cos(k * x)',
              color: '#0284C7',
              estiloLinea: 'solida',
              grosor: 3.5,
              etiqueta: "f'(x) = k * cos(kx)"
            }
          ]
        }
      },
      {
        id: 'C',
        indice: 3,
        texto: "$f'(x) = -k \\cdot \\sin(k \\cdot x)$",
        esCorrecta: false,
        retroalimentacionSocratica: "¿Por qué asumiste que la derivada de la función seno produce un cambio de signo negativo? Recuerda que al crecer $\\sin(x)$ en el primer cuadrante, su pendiente es estrictamente positiva. ¿Cuál función trigonométrica fundamental refleja valores positivos allí? Examina la gráfica punteada en rojo carmesí.",
        esquemaGeometrico: {
          tipoMotor: 'mafs-2d',
          tituloGrafico: 'Diagnóstico Opción C: Confusión de signo trigonométrico',
          descripcionVisual: 'La curva refleja un desfase de fase erróneo de 180 grados.',
          dominioX: [-6, 6],
          dominioY: [-4, 4],
          sliders: [
            { id: 'k', nombre: 'Frecuencia angular', simbolo: 'k', min: 0.5, max: 4, step: 0.1, valorDefecto: 2 },
            { id: 'a', nombre: 'Amplitud base', simbolo: 'a', min: 0.5, max: 3, step: 0.1, valorDefecto: 1.5 }
          ],
          elementos: [
            {
              id: 'base-fn',
              tipo: 'funcion',
              expresion: 'a * sin(k * x)',
              color: '#334155',
              estiloLinea: 'solida',
              grosor: 1.8,
              etiqueta: 'f(x)'
            },
            {
              id: 'err-fn',
              tipo: 'funcion',
              expresion: '-k * sin(k * x)',
              color: '#E11D48',
              estiloLinea: 'punteada',
              grosor: 2.5,
              etiqueta: "Diagnóstico: -k*sin(kx)",
              esDiagnostica: true
            }
          ]
        }
      },
      {
        id: 'D',
        indice: 4,
        texto: "$f'(x) = k^2 \\cdot \\cos(x)$",
        esCorrecta: false,
        retroalimentacionSocratica: "¿Por qué elevaste al cuadrado la frecuencia y eliminaste el argumento interno? La regla de la cadena multiplica por la derivada interna una sola vez, preservando la escala angular original. Desplaza el slider de frecuencia $k$ en el dock y comprueba cómo responde la forma geométrica.",
        esquemaGeometrico: {
          tipoMotor: 'mafs-2d',
          tituloGrafico: "Diagnóstico Opción D: Potencia incorrecta k² y pérdida de argumento",
          descripcionVisual: 'La curvatura se deforma de manera anómala en la curva punteada carmesí.',
          dominioX: [-6, 6],
          dominioY: [-4, 4],
          sliders: [
            { id: 'k', nombre: 'Frecuencia angular', simbolo: 'k', min: 0.5, max: 4, step: 0.1, valorDefecto: 2 },
            { id: 'a', nombre: 'Amplitud base', simbolo: 'a', min: 0.5, max: 3, step: 0.1, valorDefecto: 1.5 }
          ],
          elementos: [
            {
              id: 'base-fn',
              tipo: 'funcion',
              expresion: 'a * sin(k * x)',
              color: '#334155',
              estiloLinea: 'solida',
              grosor: 1.8,
              etiqueta: 'f(x)'
            },
            {
              id: 'err-fn',
              tipo: 'funcion',
              expresion: '(k * k) * cos(x)',
              color: '#E11D48',
              estiloLinea: 'punteada',
              grosor: 2.5,
              etiqueta: "Diagnóstico: k²*cos(x)",
              esDiagnostica: true
            }
          ]
        }
      }
    ]
  },
  {
    id: 'q2',
    numero: 2,
    materia: 'Álgebra Lineal & Espacios Vectoriales',
    titulo: 'Comportamiento de un Autovector bajo Transformación Lineal',
    enunciado: 'Considere una transformación lineal $T: \\mathbb{R}^2 \\to \\mathbb{R}^2$ representada por la matriz $A$, con autovalor $\\lambda$ y autovector asociado $\\vec{v}$. ¿Cuál es el significado geométrico exacto de la acción de $T$ sobre $\\vec{v}$?',
    slidersBase: [
      { id: 'lambda', nombre: 'Autovalor λ', simbolo: '\\lambda', min: -3, max: 3, step: 0.2, valorDefecto: 1.8 },
      { id: 'vx', nombre: 'Componente v_x', simbolo: 'v_x', min: -3, max: 3, step: 0.5, valorDefecto: 2 },
      { id: 'vy', nombre: 'Componente v_y', simbolo: 'v_y', min: -3, max: 3, step: 0.5, valorDefecto: 1 }
    ],
    esquemaGeometricoBase: {
      tipoMotor: 'mafs-2d',
      tituloGrafico: 'Espacio Vectorial: Vector Original v y Línea Invariante',
      descripcionVisual: 'El vector base v descansa sobre su subespacio propio unidimensional.',
      dominioX: [-5, 5],
      dominioY: [-5, 5],
      elementos: [
        {
          id: 'vector-v',
          tipo: 'vector',
          punto: [2, 1],
          origen: [0, 0],
          color: '#334155',
          estiloLinea: 'solida',
          grosor: 2.5,
          etiqueta: '\\vec{v}'
        }
      ],
      sliders: [
        { id: 'lambda', nombre: 'Autovalor λ', simbolo: '\\lambda', min: -3, max: 3, step: 0.2, valorDefecto: 1.8 },
        { id: 'vx', nombre: 'Componente v_x', simbolo: 'v_x', min: -3, max: 3, step: 0.5, valorDefecto: 2 },
        { id: 'vy', nombre: 'Componente v_y', simbolo: 'v_y', min: -3, max: 3, step: 0.5, valorDefecto: 1 }
      ]
    },
    opciones: [
      {
        id: 'A',
        indice: 1,
        texto: "$\\vec{v}$ rota 90° de manera perpendicular sin variar su longitud",
        esCorrecta: false,
        retroalimentacionSocratica: "¿Una transformación con autovalores reales induce rotación pura en el espacio? Observa cómo un autovector debe mantener su dirección invariante colineal, escalándose únicamente por su factor característico. ¿Por qué un vector rotado perdería dicha colinealidad geométrica? Modifica el deslizador para constatar la dispersión direccional.",
        esquemaGeometrico: {
          tipoMotor: 'mafs-2d',
          tituloGrafico: 'Diagnóstico Opción A: Rotación ortogonal errónea',
          descripcionVisual: 'El vector punteado en rojo carmesí rompe la invariancia direccional requerida.',
          dominioX: [-5, 5],
          dominioY: [-5, 5],
          sliders: [
            { id: 'lambda', nombre: 'Autovalor λ', simbolo: '\\lambda', min: -3, max: 3, step: 0.2, valorDefecto: 1.8 },
            { id: 'vx', nombre: 'Componente v_x', simbolo: 'v_x', min: -3, max: 3, step: 0.5, valorDefecto: 2 },
            { id: 'vy', nombre: 'Componente v_y', simbolo: 'v_y', min: -3, max: 3, step: 0.5, valorDefecto: 1 }
          ],
          elementos: [
            {
              id: 'vector-v',
              tipo: 'vector',
              punto: [2, 1],
              origen: [0, 0],
              color: '#334155',
              estiloLinea: 'solida',
              grosor: 2,
              etiqueta: '\\vec{v}'
            },
            {
              id: 'vector-err',
              tipo: 'vector',
              punto: [-1, 2],
              origen: [0, 0],
              color: '#E11D48',
              estiloLinea: 'punteada',
              grosor: 2.5,
              etiqueta: 'Diagnóstico: Vector Rotado',
              esDiagnostica: true
            }
          ]
        }
      },
      {
        id: 'B',
        indice: 2,
        texto: "$\\vec{v}$ se escala por $\\lambda$ permaneciendo sobre su misma recta directriz: $T(\\vec{v}) = \\lambda \\vec{v}$",
        esCorrecta: true,
        retroalimentacionSocratica: "¡Brillante intuición geométrica! Por definición, un autovector satisface la ecuación $A\\vec{v} = \\lambda\\vec{v}$, preservando intacta su recta de acción y escalando su magnitud por $\\lambda$. Comprueba en el lienzo cian cómo el vector resultante no experimenta rotación alguna respecto al vector generador.",
        esquemaGeometrico: {
          tipoMotor: 'mafs-2d',
          tituloGrafico: 'Comportamiento Exacto: Colinealidad y Escalado por λ',
          descripcionVisual: 'Vector cian de 3.5px colineal sobre la recta directriz del autovector.',
          dominioX: [-6, 6],
          dominioY: [-6, 6],
          sliders: [
            { id: 'lambda', nombre: 'Autovalor λ', simbolo: '\\lambda', min: -3, max: 3, step: 0.2, valorDefecto: 1.8 },
            { id: 'vx', nombre: 'Componente v_x', simbolo: 'v_x', min: -3, max: 3, step: 0.5, valorDefecto: 2 },
            { id: 'vy', nombre: 'Componente v_y', simbolo: 'v_y', min: -3, max: 3, step: 0.5, valorDefecto: 1 }
          ],
          elementos: [
            {
              id: 'vector-v',
              tipo: 'vector',
              punto: [2, 1],
              origen: [0, 0],
              color: '#334155',
              estiloLinea: 'solida',
              grosor: 1.8,
              etiqueta: '\\vec{v}'
            },
            {
              id: 'vector-correct',
              tipo: 'vector',
              punto: [3.6, 1.8],
              origen: [0, 0],
              color: '#0284C7',
              estiloLinea: 'solida',
              grosor: 3.5,
              etiqueta: 'T(v) = \\lambda v'
            }
          ]
        }
      },
      {
        id: 'C',
        indice: 3,
        texto: "El vector colapsa necesariamente al origen $(0,0)$ por pérdida de dimensión",
        esCorrecta: false,
        retroalimentacionSocratica: "¿Un autovector puede ser nulo o colapsar si el autovalor es distinto de cero? Recuerda que el núcleo de la matriz solo captura vectores cuando $\\lambda = 0$. ¿Por qué asumirías anulación cuando el determinante es no singular? Evalúa el vector de error punteado en carmesí.",
        esquemaGeometrico: {
          tipoMotor: 'mafs-2d',
          tituloGrafico: 'Diagnóstico Opción C: Confusión con el núcleo N(A)',
          descripcionVisual: 'El autovector no puede ser el vector nulo ni colapsar si λ ≠ 0.',
          dominioX: [-5, 5],
          dominioY: [-5, 5],
          sliders: [
            { id: 'lambda', nombre: 'Autovalor λ', simbolo: '\\lambda', min: -3, max: 3, step: 0.2, valorDefecto: 1.8 },
            { id: 'vx', nombre: 'Componente v_x', simbolo: 'v_x', min: -3, max: 3, step: 0.5, valorDefecto: 2 },
            { id: 'vy', nombre: 'Componente v_y', simbolo: 'v_y', min: -3, max: 3, step: 0.5, valorDefecto: 1 }
          ],
          elementos: [
            {
              id: 'vector-v',
              tipo: 'vector',
              punto: [2, 1],
              origen: [0, 0],
              color: '#334155',
              estiloLinea: 'solida',
              grosor: 2,
              etiqueta: '\\vec{v}'
            },
            {
              id: 'vector-err',
              tipo: 'punto',
              punto: [0, 0],
              color: '#E11D48',
              estiloLinea: 'punteada',
              grosor: 3,
              etiqueta: 'Colapso nulo (0,0)',
              esDiagnostica: true
            }
          ]
        }
      },
      {
        id: 'D',
        indice: 4,
        texto: "La norma del vector resultante se triplica aleatoriamente sin dirección fija",
        esCorrecta: false,
        retroalimentacionSocratica: "¿El álgebra lineal admite transformaciones indeterminadas o aleatorias? Las aplicaciones lineales son deterministas y homogéneas respecto a escalares. ¿Qué parámetro exacto de la matriz gobierna la dilatación o contracción del espacio vectorial? Ajusta el slider en el dock inferior para comprobar la rigidez de la escala.",
        esquemaGeometrico: {
          tipoMotor: 'mafs-2d',
          tituloGrafico: 'Diagnóstico Opción D: Inexistencia de factores aleatorios',
          descripcionVisual: 'Las aplicaciones lineales preservan rigurosamente el paralelismo.',
          dominioX: [-5, 5],
          dominioY: [-5, 5],
          sliders: [
            { id: 'lambda', nombre: 'Autovalor λ', simbolo: '\\lambda', min: -3, max: 3, step: 0.2, valorDefecto: 1.8 },
            { id: 'vx', nombre: 'Componente v_x', simbolo: 'v_x', min: -3, max: 3, step: 0.5, valorDefecto: 2 },
            { id: 'vy', nombre: 'Componente v_y', simbolo: 'v_y', min: -3, max: 3, step: 0.5, valorDefecto: 1 }
          ],
          elementos: [
            {
              id: 'vector-v',
              tipo: 'vector',
              punto: [2, 1],
              origen: [0, 0],
              color: '#334155',
              estiloLinea: 'solida',
              grosor: 2,
              etiqueta: '\\vec{v}'
            },
            {
              id: 'vector-err',
              tipo: 'vector',
              punto: [1.2, 4.2],
              origen: [0, 0],
              color: '#E11D48',
              estiloLinea: 'punteada',
              grosor: 2.5,
              etiqueta: 'Dirección dislocada errónea',
              esDiagnostica: true
            }
          ]
        }
      }
    ]
  },
  {
    id: 'q3',
    numero: 3,
    materia: 'Cálculo Multivariable & 3D',
    titulo: 'Puntos de Inflexión y Concavidad en Campana Gaussiana',
    enunciado: 'Para el modelo de distribución unimodal $g(x) = e^{-a \\cdot x^2}$ donde $a > 0$, halle las coordenadas críticas de inflexión donde la segunda derivada $g\'\'(x)$ cambia de signo:',
    slidersBase: [
      { id: 'a', nombre: 'Parámetro de dispersión a', simbolo: 'a', min: 0.2, max: 2, step: 0.1, valorDefecto: 0.8 },
      { id: 'h', nombre: 'Altura pico', simbolo: 'h', min: 1, max: 3, step: 0.2, valorDefecto: 2 }
    ],
    esquemaGeometricoBase: {
      tipoMotor: 'mafs-2d',
      tituloGrafico: 'Campana de Gauss: g(x) = h * exp(-a * x²)',
      descripcionVisual: 'Curva suave con simetría par y dos puntos característicos de inflexión.',
      dominioX: [-5, 5],
      dominioY: [-1, 4],
      elementos: [
        {
          id: 'base-gauss',
          tipo: 'funcion',
          expresion: 'h * exp(-a * x^2)',
          color: '#334155',
          estiloLinea: 'solida',
          grosor: 2,
          etiqueta: 'g(x)'
        }
      ],
      sliders: [
        { id: 'a', nombre: 'Parámetro de dispersión a', simbolo: 'a', min: 0.2, max: 2, step: 0.1, valorDefecto: 0.8 },
        { id: 'h', nombre: 'Altura pico', simbolo: 'h', min: 1, max: 3, step: 0.2, valorDefecto: 2 }
      ]
    },
    opciones: [
      {
        id: 'A',
        indice: 1,
        texto: "$x = \\pm \\frac{1}{\\sqrt{2a}}$ con $g''(x) = 0$",
        esCorrecta: true,
        retroalimentacionSocratica: "¡Pensamiento riguroso! Al calcular la segunda derivada $g''(x) = (4a^2 x^2 - 2a)e^{-ax^2} = 0$, se obtienen exactamente las raíces $x = \\pm 1/\\sqrt{2a}$. Observa en el lienzo cian de 3.5px cómo la concavidad cambia de descendente a ascendente en esas coordenadas exactas. ¿Notas la simetría par?",
        esquemaGeometrico: {
          tipoMotor: 'mafs-2d',
          tituloGrafico: 'Inflexión Verificada: x = ± 1 / √(2a)',
          descripcionVisual: 'Curva en Azul Cian (#0284C7) con trazo continuo de 3.5px e inflexiones marcadas.',
          dominioX: [-5, 5],
          dominioY: [-1, 4],
          sliders: [
            { id: 'a', nombre: 'Parámetro de dispersión a', simbolo: 'a', min: 0.2, max: 2, step: 0.1, valorDefecto: 0.8 },
            { id: 'h', nombre: 'Altura pico', simbolo: 'h', min: 1, max: 3, step: 0.2, valorDefecto: 2 }
          ],
          elementos: [
            {
              id: 'base-gauss',
              tipo: 'funcion',
              expresion: 'h * exp(-a * x^2)',
              color: '#0284C7',
              estiloLinea: 'solida',
              grosor: 3.5,
              etiqueta: 'g(x) Inflexión'
            },
            {
              id: 'pt-1',
              tipo: 'punto',
              punto: [0.79, 1.21],
              color: '#0D9488',
              estiloLinea: 'solida',
              grosor: 4,
              etiqueta: '+1/√(2a)'
            },
            {
              id: 'pt-2',
              tipo: 'punto',
              punto: [-0.79, 1.21],
              color: '#0D9488',
              estiloLinea: 'solida',
              grosor: 4,
              etiqueta: '-1/√(2a)'
            }
          ]
        }
      },
      {
        id: 'B',
        indice: 2,
        texto: "$x = \\pm \\frac{1}{a}$ sin factor radical",
        esCorrecta: false,
        retroalimentacionSocratica: "¿Verificaste el paso al derivar el producto por regla de la cadena? Observa la curva punteada diagnóstica en rojo: en esos puntos la concavidad todavía no se anula. ¿Qué factor cuadrático aparece al aplicar la regla del producto sobre la primera derivada? Revisa detenidamente el término $(4a^2 x^2 - 2a)$.",
        esquemaGeometrico: {
          tipoMotor: 'mafs-2d',
          tituloGrafico: 'Diagnóstico Opción B: Falta la raíz en el denominador',
          descripcionVisual: 'Ubicación errónea de los puntos críticos señalada en rojo carmesí punteado.',
          dominioX: [-5, 5],
          dominioY: [-1, 4],
          sliders: [
            { id: 'a', nombre: 'Parámetro de dispersión a', simbolo: 'a', min: 0.2, max: 2, step: 0.1, valorDefecto: 0.8 },
            { id: 'h', nombre: 'Altura pico', simbolo: 'h', min: 1, max: 3, step: 0.2, valorDefecto: 2 }
          ],
          elementos: [
            {
              id: 'base-gauss',
              tipo: 'funcion',
              expresion: 'h * exp(-a * x^2)',
              color: '#334155',
              estiloLinea: 'solida',
              grosor: 2,
              etiqueta: 'g(x)'
            },
            {
              id: 'err-pt',
              tipo: 'punto',
              punto: [1.25, 0.58],
              color: '#E11D48',
              estiloLinea: 'punteada',
              grosor: 4,
              etiqueta: 'Err: ±1/a',
              esDiagnostica: true
            }
          ]
        }
      },
      {
        id: 'C',
        indice: 3,
        texto: "La función carece de puntos de inflexión por decaer asintóticamente hacia cero",
        esCorrecta: false,
        retroalimentacionSocratica: "¿Confundes la existencia de asíntotas horizontales con la curvatura de la función? Aunque la campana gaussiana decae hacia cero en el infinito, su transición de concavidad hacia abajo en el vértice requiere puntos de inflexión obligatorios. Mira el trazo diagnóstico en el lienzo y deduce la concavidad.",
        esquemaGeometrico: {
          tipoMotor: 'mafs-2d',
          tituloGrafico: 'Diagnóstico Opción C: Falacia de curvatura cero',
          descripcionVisual: 'La función posee curvatura no nula en toda la región cercana a la media.',
          dominioX: [-5, 5],
          dominioY: [-1, 4],
          sliders: [
            { id: 'a', nombre: 'Parámetro de dispersión a', simbolo: 'a', min: 0.2, max: 2, step: 0.1, valorDefecto: 0.8 },
            { id: 'h', nombre: 'Altura pico', simbolo: 'h', min: 1, max: 3, step: 0.2, valorDefecto: 2 }
          ],
          elementos: [
            {
              id: 'base-gauss',
              tipo: 'funcion',
              expresion: 'h * exp(-a * x^2)',
              color: '#334155',
              estiloLinea: 'solida',
              grosor: 1.8,
              etiqueta: 'g(x)'
            },
            {
              id: 'asintota-err',
              tipo: 'funcion',
              expresion: '0',
              color: '#E11D48',
              estiloLinea: 'punteada',
              grosor: 2.5,
              etiqueta: 'Asíntota y=0',
              esDiagnostica: true
            }
          ]
        }
      },
      {
        id: 'D',
        indice: 4,
        texto: "El único punto de inflexión ocurre en el vértice simétrico $x = 0$",
        esCorrecta: false,
        retroalimentacionSocratica: "¿Qué ocurre en $x = 0$? La primera derivada se anula, indicando un máximo global donde la concavidad es fuertemente negativa. ¿Puede un máximo local ser simultáneamente un punto donde la curvatura se hace cero? Experimenta variando el parámetro de dispersión $a$ con el deslizador interactivo.",
        esquemaGeometrico: {
          tipoMotor: 'mafs-2d',
          tituloGrafico: 'Diagnóstico Opción D: Confusión entre punto crítico y punto de inflexión',
          descripcionVisual: 'En x = 0 la concavidad es máxima negativa (g"(0) < 0), no cero.',
          dominioX: [-5, 5],
          dominioY: [-1, 4],
          sliders: [
            { id: 'a', nombre: 'Parámetro de dispersión a', simbolo: 'a', min: 0.2, max: 2, step: 0.1, valorDefecto: 0.8 },
            { id: 'h', nombre: 'Altura pico', simbolo: 'h', min: 1, max: 3, step: 0.2, valorDefecto: 2 }
          ],
          elementos: [
            {
              id: 'base-gauss',
              tipo: 'funcion',
              expresion: 'h * exp(-a * x^2)',
              color: '#334155',
              estiloLinea: 'solida',
              grosor: 2,
              etiqueta: 'g(x)'
            },
            {
              id: 'err-apex',
              tipo: 'punto',
              punto: [0, 2],
              color: '#E11D48',
              estiloLinea: 'punteada',
              grosor: 4.5,
              etiqueta: 'Máximo, no Inflexión',
              esDiagnostica: true
            }
          ]
        }
      }
    ]
  }
];
