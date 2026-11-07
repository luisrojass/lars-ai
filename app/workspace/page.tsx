'use client';

import React from 'react';
import TheaEnginePanel from '@/components/study/TheaEnginePanel';
import LienzoProyector from '@/components/study/LienzoProyector';

/**
 * Vista 4: Workspace de Estudio (Pantalla Dividida Fija 100vh)
 * - Panel Izquierdo (40% de ancho): Thea Engine con KaTeX y retroalimentación socrática
 * - Panel Derecho (60% de ancho): Lienzo 3B1B Modo Claro Proyector (#F8FAFC)
 */
export default function WorkspacePage() {
  return (
    <main className="h-[calc(100vh-3.5rem)] w-full overflow-hidden flex flex-col md:flex-row bg-slate-950">
      {/* Panel Izquierdo (40% de ancho - Thea Engine) */}
      <div className="w-full md:w-[40%] h-1/2 md:h-full shrink-0 border-b md:border-b-0 md:border-r border-slate-800 z-10">
        <TheaEnginePanel />
      </div>

      {/* Panel Derecho (60% de ancho - Lienzo 3B1B Modo Claro Proyector) */}
      <div className="w-full md:w-[60%] h-1/2 md:h-full flex-1 overflow-hidden">
        <LienzoProyector />
      </div>
    </main>
  );
}
