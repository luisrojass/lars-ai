'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import { useAuthStore } from '@/store/useAuthStore';
import { UploadCloud, FileText, CheckCircle, Loader2, Lock, ArrowRight, FileCheck2, AlertCircle, LogIn, RefreshCw } from 'lucide-react';

type Estado = 'inactivo' | 'subiendo' | 'procesando' | 'completado' | 'error';

interface UploadResult {
  document_id: string;
  session_id: string;
  pdf_file: string;
  markdown_chars: number;
}

const MAX_MB = 10;

export const PdfUploader: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, ready, openModal } = useAuthStore();

  const [archivo, setArchivo] = useState<File | null>(null);
  const [estaArrastrando, setEstaArrastrando] = useState(false);
  const [estado, setEstado] = useState<Estado>('inactivo');
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<UploadResult | null>(null);
  const inputArchivoRef = useRef<HTMLInputElement>(null);

  const reiniciar = () => {
    setArchivo(null);
    setEstado('inactivo');
    setProgreso(0);
    setError(null);
    setResultado(null);
  };

  const handleReemplazarPdf = () => {
    reiniciar();
    setTimeout(() => {
      inputArchivoRef.current?.click();
    }, 0);
  };

  const subir = useCallback((file: File) => {
    if (!(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      setError('Sube únicamente archivos en formato PDF.');
      setEstado('error');
      setArchivo(file);
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`El PDF supera el máximo de ${MAX_MB} MB.`);
      setEstado('error');
      setArchivo(file);
      return;
    }

    setArchivo(file);
    setError(null);
    setProgreso(0);
    setEstado('subiendo');

    const body = new FormData();
    body.set('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload-pdf');
    xhr.setRequestHeader('Authorization', `Bearer ${pb.authStore.token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgreso(Math.round((e.loaded / e.total) * 100));
    };
    xhr.upload.onload = () => {
      setProgreso(100);
      setEstado('procesando');
    };
    xhr.onerror = () => {
      setError('No se pudo conectar con el servidor.');
      setEstado('error');
    };
    xhr.onload = () => {
      let data: (UploadResult & { error?: string }) | null = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status === 201 && data) {
        setResultado(data);
        setEstado('completado');
      } else {
        setError(data?.error ?? `Error inesperado (${xhr.status}).`);
        setEstado('error');
      }
    };
    xhr.send(body);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setEstaArrastrando(false);
    const file = e.dataTransfer.files?.[0];
    if (file) subir(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) subir(file);
    e.target.value = '';
  };

  // Sin sesión de PocketBase no se puede subir
  if (!ready || !isAuthenticated) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 rounded-2xl bg-white border border-rose-200 text-center space-y-6 shadow-lg">
        <div className="mx-auto w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
          <Lock className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Inicia sesión para subir material</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            La subida y procesamiento de PDFs en Lars AI requiere una sesión activa.
          </p>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm transition-colors shadow-sm"
        >
          <LogIn className="h-4 w-4" />
          <span>Iniciar sesión</span>
        </button>
      </div>
    );
  }

  const paso = (activo: boolean, hecho: boolean) =>
    `p-3.5 rounded-xl border transition-all ${
      activo
        ? 'bg-sky-50 border-sky-400 text-sky-900 ring-1 ring-sky-400/40'
        : hecho
        ? 'bg-teal-50/70 border-teal-300 text-teal-900'
        : 'bg-slate-50 border-slate-200 text-slate-500'
    }`;

  const subiendo = estado === 'subiendo';
  const procesando = estado === 'procesando';
  const completado = estado === 'completado';

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Input oculto persistente para seleccionar o reemplazar PDF */}
      <input
        ref={inputArchivoRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {estado === 'inactivo' && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setEstaArrastrando(true);
          }}
          onDragLeave={() => setEstaArrastrando(false)}
          onDrop={handleDrop}
          onClick={() => inputArchivoRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 cursor-pointer ${
            estaArrastrando
              ? 'border-sky-500 bg-sky-50 scale-101 shadow-lg shadow-sky-500/15'
              : 'border-slate-300 bg-white hover:bg-slate-50/80 hover:border-sky-400 shadow-xs'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 shadow-xs">
              <UploadCloud className="h-10 w-10 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Arrastra tu archivo PDF o haz clic para seleccionarlo
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Soporta material de estudio: diapositivas, exámenes, sílabos o apuntes
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-300">
              <FileText className="h-3.5 w-3.5 text-sky-600" />
              <span>Formato admitido: PDF (Máx. {MAX_MB} MB)</span>
            </div>
          </div>
        </div>
      )}

      {estado !== 'inactivo' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 truncate max-w-[280px] sm:max-w-md">
                  {archivo?.name}
                </h4>
                <span className="text-[11px] font-mono text-slate-500">
                  {archivo ? `${(archivo.size / 1024 / 1024).toFixed(2)} MB` : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(completado || estado === 'error') && (
                <button
                  type="button"
                  onClick={handleReemplazarPdf}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-sky-700 bg-slate-100 hover:bg-sky-50 px-3 py-1 rounded-full border border-slate-300 hover:border-sky-300 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reemplazar PDF</span>
                </button>
              )}

              {completado ? (
                <span className="flex items-center gap-1 text-xs font-mono font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-300">
                  <CheckCircle className="h-3.5 w-3.5" /> Listo
                </span>
              ) : estado === 'error' ? (
                <span className="flex items-center gap-1 text-xs font-mono font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-300">
                  <AlertCircle className="h-3.5 w-3.5" /> Error
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-mono font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-300">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> {subiendo ? `${progreso}%` : 'Procesando'}
                </span>
              )}
            </div>
          </div>

          {estado === 'error' ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-rose-600" role="alert">{error}</p>
              <button
                onClick={handleReemplazarPdf}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold border border-slate-300 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Seleccionar otro PDF</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={paso(subiendo, procesando || completado)}>
                <div className="flex items-center gap-2 mb-1">
                  {subiendo ? (
                    <Loader2 className="h-4 w-4 text-sky-600 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-teal-600" />
                  )}
                  <span className="text-xs font-bold">1. Subiendo PDF</span>
                </div>
                <p className="text-[10px] text-slate-600">Envío seguro con tu sesión activa.</p>
              </div>

              <div className={paso(procesando, completado)}>
                <div className="flex items-center gap-2 mb-1">
                  {procesando ? (
                    <Loader2 className="h-4 w-4 text-sky-600 animate-spin" />
                  ) : completado ? (
                    <CheckCircle className="h-4 w-4 text-teal-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-slate-400" />
                  )}
                  <span className="text-xs font-bold">2. Convirtiendo y guardando</span>
                </div>
                <p className="text-[10px] text-slate-600">Extracción a Markdown con fórmulas y guardado.</p>
              </div>
            </div>
          )}

          {completado && resultado && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-700 font-medium flex items-center gap-1.5">
                <FileCheck2 className="h-4 w-4 text-teal-600 shrink-0" />
                <span>
                  Documento guardado ({resultado.markdown_chars.toLocaleString('es')} caracteres extraídos).
                </span>
              </span>
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleReemplazarPdf}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm border border-slate-300 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 text-slate-600" />
                  <span>Reemplazar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/clase/${resultado.document_id}`)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 text-white font-bold text-sm shadow-md shadow-sky-600/20 hover:scale-102 transition-transform"
                >
                  <span>Ver preguntas generadas</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfUploader;
