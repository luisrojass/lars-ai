'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Projector,
  Zap,
  BookOpen
} from 'lucide-react';

export default function IntroPage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] w-full bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12 flex-1 flex flex-col items-center justify-center text-center space-y-8">
        {/* Badge de Plataforma ENEISOFT XVI */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-sky-500/10 via-teal-500/10 to-indigo-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>ENEISOFT XVI • Plataforma de Estudio Activo</span>
        </div>

        {/* Título Principal Minimalista */}
        <div className="space-y-4 max-w-4xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Aprende Matemáticas y Ciencias con{' '}
            <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              Visualizaciones 3B1B
            </span>{' '}
            y Método Socrático
          </h1>
          <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Plataforma interactiva con pantalla dividida 40/60. Razona con el motor
            socrático <strong className="text-slate-200">Thea Engine</strong> y manipula
            geometría interactiva en alta fidelidad a 60 FPS sin latencia de red.
          </p>
        </div>

        {/* Acción principal */}
        <div className="flex items-center justify-center w-full max-w-md pt-2">
          <Link
            href="/crear-clase"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 via-teal-400 to-sky-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/25 hover:scale-103 hover:shadow-sky-500/40 transition-all"
          >
            <BookOpen className="h-4 w-4" />
            <span>Crear una clase</span>
            <ArrowRight className="h-4 w-4 ml-0.5" />
          </Link>
        </div>

        {/* Cuadrícula de Características Técnicas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-5xl w-full pt-10">
          {/* Tarjeta 1 */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 hover:border-sky-500/30 transition-colors">
            <div className="flex items-center gap-2 text-sky-400">
              <Brain className="h-4 w-4" />
              <h3 className="text-sm font-bold text-slate-100">Thea Engine & KaTeX</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Formulación rigurosa con KaTeX y explicaciones socráticas inmediatas (30-50 palabras)
              que guían el razonamiento reflexivo ante cada elección.
            </p>
          </div>

          {/* Tarjeta 2 */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 hover:border-teal-500/30 transition-colors">
            <div className="flex items-center gap-2 text-teal-400">
              <Projector className="h-4 w-4" />
              <h3 className="text-sm font-bold text-slate-100">Lienzo Proyector 3B1B</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fondo claro <code className="text-teal-300">#F8FAFC</code>, ejes de alto contraste,
              curva solución cian continua (3.5px) y trazo diagnóstico punteado en rojo carmesí.
            </p>
          </div>

          {/* Tarjeta 3 */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 hover:border-indigo-500/30 transition-colors">
            <div className="flex items-center gap-2 text-indigo-400">
              <Zap className="h-4 w-4" />
              <h3 className="text-sm font-bold text-slate-100">Cero Latencia & Math.js</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Principio Zero-Wait con cálculo en memoria local y deslizadores a 60 FPS
              mediante compilación segura <code className="text-indigo-300">math.compile()</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Minimalista */}
      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-500">
        <p>ENEISOFT XVI • Active Learning Architecture • Next.js App Router + TypeScript + Zustand + Mafs + Three.js</p>
      </footer>
    </main>
  );
}
