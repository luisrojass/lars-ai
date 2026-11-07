'use client';

import React from 'react';
import PdfUploader from '@/components/class-creation/PdfUploader';
import { Layers } from 'lucide-react';

export default function CrearClasePage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] w-full bg-[#F8FAFC] px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Cabecera */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-300 text-sky-700 text-xs font-mono font-semibold">
            <Layers className="h-3.5 w-3.5 text-sky-600" />
            <span>Crear Clase • Lars AI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Transforma Material de Estudio en Experiencias 3B1B
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Sube documentos PDF para extraer automáticamente expresiones matemáticas,
            modelos analíticos y generar sesiones interactivas con el motor de Lars AI.
          </p>
        </div>

        {/* Zona del Cargador de PDF */}
        <PdfUploader />
      </div>
    </main>
  );
}
