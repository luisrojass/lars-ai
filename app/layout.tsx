import type { Metadata } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';
import 'mafs/core.css';
import { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'Lars AI - Plataforma de Estudio Activo & Motor Visual 3B1B',
  description:
    'Lars AI: Plataforma de estudio activo con método socrático, notación KaTeX, visualizaciones 3B1B de cero latencia con Mafs y Three.js, y evaluación matemática local Math.js a 60 FPS.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased">
        <Suspense fallback={<div className="h-14 bg-white border-b border-slate-200" />}>
          <Navbar />
        </Suspense>
        <div className="flex-1 w-full">{children}</div>
      </body>
    </html>
  );
}
