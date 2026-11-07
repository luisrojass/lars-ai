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
    <main className="min-h-[calc(100vh-3.5rem)] w-full bg-[#F8FAFC] text-slate-900 flex flex-col justify-between">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12 flex-1 flex flex-col items-center justify-center text-center space-y-8">
        {/* Badge de Plataforma Lars AI */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-300 text-sky-700 text-xs font-mono font-semibold shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-sky-600" />
          <span>Lars AI • Plataforma de Estudio Activo</span>
        </div>

        {/* Título Principal Minimalista */}
        <div className="space-y-4 max-w-4xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Aprende Matemáticas con{' '}
            <span className="bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
              Lars AI
            </span>{' '}
          </h1>
          <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Aprende con el motor
            de <strong className="text-slate-900 font-semibold">Lars AI</strong> y manipula
            geometría interactiva.
          </p>
        </div>

        {/* Acción principal */}
        <div className="flex items-center justify-center w-full max-w-md pt-2">
          <Link
            href="/crear-clase"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-600 via-teal-600 to-sky-600 text-white font-bold text-sm shadow-lg shadow-sky-600/20 hover:scale-103 hover:shadow-sky-600/30 transition-all"
          >
            <BookOpen className="h-4 w-4" />
            <span>Crear una clase</span>
            <ArrowRight className="h-4 w-4 ml-0.5" />
          </Link>
        </div>

        {/* Cuadrícula de Características Técnicas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-5xl w-full pt-10">
          {/* Tarjeta 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs hover:border-sky-400 transition-colors">
            <div className="flex items-center gap-2 text-sky-600">
              <Brain className="h-4 w-4" />
              <h3 className="text-sm font-bold text-slate-900">Motor Socrático & KaTeX</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Formulación rigurosa en LaTeX y explicaciones
              que guían el razonamiento reflexivo ante cada elección.
            </p>
          </div>

          {/* Tarjeta 2 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs hover:border-teal-400 transition-colors">
            <div className="flex items-center gap-2 text-teal-600">
              <Projector className="h-4 w-4" />
              <h3 className="text-sm font-bold text-slate-900">Lienzo Proyector 3B1B</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ejes de alto contraste, curva de solución continua y trazo diagnóstico.
            </p>
          </div>

          {/* Tarjeta 3 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-xs hover:border-indigo-400 transition-colors">
            <div className="flex items-center gap-2 text-indigo-600">
              <Zap className="h-4 w-4" />
              <h3 className="text-sm font-bold text-slate-900">Cero Latencia & Math.js</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Principio Zero-Wait con cálculo en memoria local y deslizadores
              mediante compilación segura <code className="text-indigo-700 font-semibold">math.compile()</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Minimalista */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-600">
        <p>Lars AI • Active Learning Architecture • Next.js App Router + TypeScript + Zustand + Mafs + Three.js</p>
      </footer>
    </main>
  );
}
