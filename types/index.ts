export type TipoMotorGrafico = 'mafs-2d' | 'three-3d';

export interface ParametroSlider {
  id: string;
  nombre: string;
  simbolo: string; // ej: "a", "k", "\omega", "\phi"
  min: number;
  max: number;
  step: number;
  valorDefecto: number;
  unidad?: string;
  descripcion?: string;
}

export interface ElementoGeometrico {
  id: string;
  tipo: 'funcion' | 'vector' | 'punto' | 'recta-tangente';
  expresion?: string; // Expresión evaluable con Math.js (ej: "a * sin(k * x)")
  punto?: [number, number] | [number, number, number];
  origen?: [number, number] | [number, number, number];
  color: string; // '#0284C7' (Cian), '#0D9488' (Teal), '#E11D48' (Rojo carmesí)
  estiloLinea: 'solida' | 'punteada';
  grosor: number; // 3.5px para curva correcta
  etiqueta?: string;
  esDiagnostica?: boolean;
}

export interface EsquemaGeometrico {
  tipoMotor: TipoMotorGrafico;
  tituloGrafico: string;
  descripcionVisual?: string;
  dominioX: [number, number]; // ej: [-6, 6]
  dominioY: [number, number]; // ej: [-4, 4]
  elementos: ElementoGeometrico[];
  sliders: ParametroSlider[];
}

export interface Opcion {
  id: 'A' | 'B' | 'C' | 'D';
  indice: number; // 1, 2, 3, 4 (atajos de teclado)
  texto: string; // Fórmulas matemáticas con notación KaTeX ($...$)
  esCorrecta: boolean;
  retroalimentacionSocratica: string; // 30-50 palabras estrictas con estilo socrático
  esquemaGeometrico: EsquemaGeometrico; // Payload precargado en memoria local para Zero-Wait
}

export interface Pregunta {
  id: string;
  numero: number;
  materia: string;
  titulo: string;
  enunciado: string; // Notación KaTeX embebida
  opciones: Opcion[];
  slidersBase: ParametroSlider[];
  esquemaGeometricoBase: EsquemaGeometrico;
}

export interface UsuarioPrueba {
  id: string;
  nombre: string;
  email: string;
  rol: 'Profesor' | 'Estudiante' | 'Invitado';
  avatar: string;
  descripcion: string;
}
