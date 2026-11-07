'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useStudyStore } from '@/store/useStudyStore';
import { DockSliders } from '@/components/study/DockSliders';
import { Projector, Info, ShieldAlert } from 'lucide-react';

// Carga dinámica para evitar problemas de SSR con Three.js y SVG de Mafs
const Canvas2DMafs = dynamic(() => import('@/components/study/Canvas2DMafs'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC] text-slate-500 font-mono text-xs">
      Iniciando Motor Visual Mafs 2D...
    </div>
  )
});

const Canvas3DThree = dynamic(() => import('@/components/study/Canvas3DThree'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#F8FAFC] text-slate-500 font-mono text-xs">
      Iniciando Motor Visual Three.js 3D...
    </div>
  )
});

export const LienzoProyector: React.FC = () => {
  const {
    getEsquemaActual,
    valoresSliders,
    motorGrafico,
    mostrarLineasGuia,
    opcionSeleccionada
  } = useStudyStore();

  const esquema = getEsquemaActual();

  return (
    <section className="w-full h-full flex flex-col relative bg-[#F8FAFC] overflow-hidden">
      {/* Barra superior de especificación de lienzo (Modo Claro Proyector) */}
      <div className="h-10 px-4 bg-[#F1F5F9] border-b border-[#CBD5E1] flex items-center justify-between z-10 select-none shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#E2E8F0] text-[#334155]">
            <Projector className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold text-[#334155] tracking-tight">
            Lienzo 3B1B
          </span>
          <span className="text-[10px] font-mono font-semibold bg-[#E2E8F0] text-[#0F172A] px-1.5 py-0.5 rounded border border-[#CBD5E1]">
            Modo Claro Proyector (#F8FAFC)
          </span>
        </div>

        {/* Leyenda Técnica Obligatoria */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-4 h-[3.5px] rounded-full"
              style={{ backgroundColor: '#0284C7' }}
            />
            <span className="text-[#334155] font-mono text-[10px]">
              Solución (3.5px Cian)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-4 h-[2.5px] border-b-2 border-dashed"
              style={{ borderColor: '#E11D48' }}
            />
            <span className="text-[#334155] font-mono text-[10px]">
              Diagnóstico (Punteada Carmesí)
            </span>
          </div>

          <span className="text-[10px] text-amber-700 font-mono bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-300">
            Modo oscuro prohibido
          </span>
        </div>
      </div>

      {/* Título de la escena gráfica actual */}
      <div className="absolute top-12 left-4 z-10 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#CBD5E1] shadow-xs">
          <h4 className="text-xs font-bold text-[#1E293B]">
            {esquema.tituloGrafico}
          </h4>
          {esquema.descripcionVisual && (
            <p className="text-[10px] text-[#475569] font-medium">
              {esquema.descripcionVisual}
            </p>
          )}
        </div>
      </div>

      {/* Contenedor del Lienzo Gráfico Interactivo */}
      <div className="flex-1 w-full relative">
        {motorGrafico === 'mafs-2d' ? (
          <Canvas2DMafs
            esquema={esquema}
            valoresSliders={valoresSliders}
            mostrarLineasGuia={mostrarLineasGuia}
          />
        ) : (
          <Canvas3DThree
            esquema={esquema}
            valoresSliders={valoresSliders}
          />
        )}
      </div>

      {/* Dock Inferior Interactivo Math.js */}
      <div className="z-20 shrink-0">
        <DockSliders />
      </div>
    </section>
  );
};

export default LienzoProyector;
