'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { MathFormula } from '@/components/math/MathFormula';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  Loader2,
  Lock,
  ArrowRight,
  Sparkles,
  Layers,
  FileCheck2
} from 'lucide-react';

type EstadoProceso = 'inactivo' | 'cargando' | 'extrayendo' | 'generando' | 'completado';

export const PdfUploader: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, loginAs, usuariosDisponibles } = useAuthStore();

  const [archivo, setArchivo] = useState<File | null>(null);
  const [estaArrastrando, setEstaArrastrando] = useState(false);
  const [estado, setEstado] = useState<EstadoProceso>('inactivo');
  const [progreso, setProgreso] = useState(0);

  const formulasExtraidas = [
    'f(x) = \\sin(k \\cdot x)',
    'T(\\vec{v}) = A\\vec{v} = \\lambda \\vec{v}',
    'g(x) = e^{-a x^2} \\implies g\'\'(x) = 0'
  ];

  const iniciarProcesamiento = useCallback((file: File) => {
    setArchivo(file);
    setEstado('cargando');
    setProgreso(15);

    // Etapa 1: Cargando PDF
    setTimeout(() => {
      setProgreso(35);
      setEstado('extrayendo');

      // Etapa 2: Extrayendo texto y fórmulas
      setTimeout(() => {
        setProgreso(75);
        setEstado('generando');

        // Etapa 3: Generando preguntas
        setTimeout(() => {
          setProgreso(100);
          setEstado('completado');
        }, 1200);
      }, 1400);
    }, 1000);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setEstaArrastrando(true);
  };

  const handleDragLeave = () => {
    setEstaArrastrando(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setEstaArrastrando(false);
    if (!isAuthenticated) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        iniciarProcesamiento(file);
      } else {
        alert('Por favor suba únicamente archivos en formato PDF.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      iniciarProcesamiento(file);
    }
  };

  // Bloqueo de sesión efímera
  if (!isAuthenticated || !user) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 rounded-2xl bg-slate-900/90 border border-rose-500/30 text-center space-y-6 shadow-2xl backdrop-blur-md">
        <div className="mx-auto w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400">
          <Lock className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-100">
            Acceso Restringido a Carga de Material
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Por política de seguridad de ENEISOFT XVI, la subida y procesamiento
            de PDFs requiere una sesión activa. Seleccione un usuario de prueba:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {usuariosDisponibles.map((u) => (
            <button
              key={u.id}
              onClick={() => loginAs(u)}
              className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-sky-500 transition-all text-left group"
            >
              <div className="text-2xl mb-1">{u.avatar}</div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-sky-400">
                {u.nombre}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">{u.rol}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Zona Drag & Drop */}
      {estado === 'inactivo' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer ${
            estaArrastrando
              ? 'border-sky-400 bg-sky-500/10 scale-101 shadow-lg shadow-sky-500/20'
              : 'border-slate-700 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-600'
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 shadow-md">
              <UploadCloud className="h-10 w-10 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-200">
                Arrastra tu archivo PDF o haz clic para seleccionarlo
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Soporta material de estudio: diapositivas, exámenes, sílabos o apuntes
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
              <FileText className="h-3.5 w-3.5 text-sky-400" />
              <span>Formato admitido: PDF (Máx. 50 MB)</span>
            </div>
          </div>
        </div>
      )}

      {/* Indicadores de Estado de Procesamiento */}
      {estado !== 'inactivo' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          {/* Header del archivo cargado */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-500/10 text-rose-400 border border-rose-500/30">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200 truncate max-w-[280px] sm:max-w-md">
                  {archivo ? archivo.name : 'Material_Calculo_Vectorial_2026.pdf'}
                </h4>
                <span className="text-[11px] font-mono text-slate-400">
                  {archivo ? `${(archivo.size / 1024 / 1024).toFixed(2)} MB` : '3.42 MB'} • Procesado por Thea Engine
                </span>
              </div>
            </div>

            {estado === 'completado' ? (
              <span className="flex items-center gap-1 text-xs font-mono text-teal-400 bg-teal-950 px-2.5 py-1 rounded-full border border-teal-800">
                <CheckCircle className="h-3.5 w-3.5" /> Listo
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-mono text-sky-400 bg-sky-950 px-2.5 py-1 rounded-full border border-sky-800">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> {progreso}%
              </span>
            )}
          </div>

          {/* Barra de Progreso */}
          <div className="space-y-1.5">
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 via-teal-400 to-indigo-500 transition-all duration-300"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>

          {/* Los 3 Indicadores de Estado Requeridos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Estado 1: Cargando PDF */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                estado === 'cargando'
                  ? 'bg-sky-500/15 border-sky-400 ring-1 ring-sky-500/30'
                  : estado === 'extrayendo' || estado === 'generando' || estado === 'completado'
                  ? 'bg-slate-950 border-teal-500/40 text-teal-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {estado === 'cargando' ? (
                  <Loader2 className="h-4 w-4 text-sky-400 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-teal-400" />
                )}
                <span className="text-xs font-bold">1. Cargando PDF</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Lectura y verificación de integridad de documento.
              </p>
            </div>

            {/* Estado 2: Extrayendo texto y fórmulas */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                estado === 'extrayendo'
                  ? 'bg-sky-500/15 border-sky-400 ring-1 ring-sky-500/30'
                  : estado === 'generando' || estado === 'completado'
                  ? 'bg-slate-950 border-teal-500/40 text-teal-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {estado === 'extrayendo' ? (
                  <Loader2 className="h-4 w-4 text-sky-400 animate-spin" />
                ) : estado === 'generando' || estado === 'completado' ? (
                  <CheckCircle className="h-4 w-4 text-teal-400" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-slate-600" />
                )}
                <span className="text-xs font-bold">2. Extrayendo texto y fórmulas</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Segmentación KaTeX y modelos matemáticos.
              </p>
            </div>

            {/* Estado 3: Generando preguntas */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                estado === 'generando'
                  ? 'bg-sky-500/15 border-sky-400 ring-1 ring-sky-500/30'
                  : estado === 'completado'
                  ? 'bg-slate-950 border-teal-500/40 text-teal-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {estado === 'generando' ? (
                  <Loader2 className="h-4 w-4 text-sky-400 animate-spin" />
                ) : estado === 'completado' ? (
                  <CheckCircle className="h-4 w-4 text-teal-400" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-slate-600" />
                )}
                <span className="text-xs font-bold">3. Generando preguntas</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Ensamblado con esquemas 3B1B de cero latencia.
              </p>
            </div>
          </div>

          {/* Vista previa en vivo de fórmulas extraídas */}
          {(estado === 'extrayendo' || estado === 'generando' || estado === 'completado') && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-sky-400" /> Fórmulas detectadas en el documento:
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {formulasExtraidas.map((tex, i) => (
                  <div
                    key={i}
                    className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-sky-300"
                  >
                    <MathFormula math={`$${tex}$`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botón de Entrada al Workspace al Completar */}
          {estado === 'completado' && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in-up">
              <span className="text-xs text-slate-300 flex items-center gap-1.5">
                <FileCheck2 className="h-4 w-4 text-teal-400" />
                Batería generada con 3 preguntas interactivas y retroalimentación socrática.
              </span>
              <button
                onClick={() => router.push('/workspace')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/20 hover:scale-102 transition-transform"
              >
                <span>Entrar al Workspace de Estudio</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfUploader;
