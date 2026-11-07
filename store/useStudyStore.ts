'use client';

import { create } from 'zustand';
import { Pregunta, Opcion, TipoMotorGrafico, EsquemaGeometrico } from '@/types';
import { PREGUNTAS_MOCK } from '@/data/mockQuestions';

interface StudyState {
  preguntas: Pregunta[];
  indicePreguntaActual: number;
  opcionSeleccionada: Opcion | null;
  valoresSliders: Record<string, number>;
  motorGrafico: TipoMotorGrafico;
  mostrarLineasGuia: boolean;
  
  // Acciones (Principio Zero-Wait)
  seleccionarOpcion: (opcion: Opcion) => void;
  deseleccionarOpcion: () => void;
  irAPregunta: (indice: number) => void;
  siguientePregunta: () => void;
  preguntaAnterior: () => void;
  actualizarSlider: (id: string, valor: number) => void;
  setMotorGrafico: (motor: TipoMotorGrafico) => void;
  toggleMotorGrafico: () => void;
  toggleLineasGuia: () => void;
  reiniciarSliders: () => void;

  // Selectores computados en memoria
  getEsquemaActual: () => EsquemaGeometrico;
}

const inicializarSliders = (pregunta: Pregunta): Record<string, number> => {
  const vals: Record<string, number> = {};
  pregunta.slidersBase.forEach((s) => {
    vals[s.id] = s.valorDefecto;
  });
  return vals;
};

export const useStudyStore = create<StudyState>((set, get) => ({
  preguntas: PREGUNTAS_MOCK,
  indicePreguntaActual: 0,
  opcionSeleccionada: null,
  valoresSliders: inicializarSliders(PREGUNTAS_MOCK[0]),
  motorGrafico: 'mafs-2d',
  mostrarLineasGuia: true,

  seleccionarOpcion: (opcion: Opcion) => {
    // Zero-Wait: Actualización inmediata sin loaders de servidor
    const estado = get();
    const nuevosSliders = { ...estado.valoresSliders };
    // Asegurar que sliders del esquema geométrico de la opción estén presentes
    opcion.esquemaGeometrico.sliders.forEach((s) => {
      if (nuevosSliders[s.id] === undefined) {
        nuevosSliders[s.id] = s.valorDefecto;
      }
    });

    set({
      opcionSeleccionada: opcion,
      valoresSliders: nuevosSliders
    });
  },

  deseleccionarOpcion: () => {
    set({ opcionSeleccionada: null });
  },

  irAPregunta: (indice: number) => {
    const estado = get();
    if (indice < 0 || indice >= estado.preguntas.length) return;
    const nuevaPregunta = estado.preguntas[indice];
    set({
      indicePreguntaActual: indice,
      opcionSeleccionada: null,
      valoresSliders: inicializarSliders(nuevaPregunta),
      motorGrafico: nuevaPregunta.esquemaGeometricoBase.tipoMotor
    });
  },

  siguientePregunta: () => {
    const { indicePreguntaActual, preguntas, irAPregunta } = get();
    if (indicePreguntaActual < preguntas.length - 1) {
      irAPregunta(indicePreguntaActual + 1);
    }
  },

  preguntaAnterior: () => {
    const { indicePreguntaActual, irAPregunta } = get();
    if (indicePreguntaActual > 0) {
      irAPregunta(indicePreguntaActual - 1);
    }
  },

  actualizarSlider: (id: string, valor: number) => {
    // Rendimiento a 60 FPS: Actualización atómica del valor
    set((state) => ({
      valoresSliders: {
        ...state.valoresSliders,
        [id]: valor
      }
    }));
  },

  setMotorGrafico: (motor: TipoMotorGrafico) => {
    set({ motorGrafico: motor });
  },

  toggleMotorGrafico: () => {
    set((state) => ({
      motorGrafico: state.motorGrafico === 'mafs-2d' ? 'three-3d' : 'mafs-2d'
    }));
  },

  toggleLineasGuia: () => {
    set((state) => ({ mostrarLineasGuia: !state.mostrarLineasGuia }));
  },

  reiniciarSliders: () => {
    const { preguntas, indicePreguntaActual } = get();
    const p = preguntas[indicePreguntaActual];
    set({ valoresSliders: inicializarSliders(p) });
  },

  getEsquemaActual: () => {
    const { preguntas, indicePreguntaActual, opcionSeleccionada } = get();
    if (opcionSeleccionada) {
      return opcionSeleccionada.esquemaGeometrico;
    }
    return preguntas[indicePreguntaActual].esquemaGeometricoBase;
  }
}));
