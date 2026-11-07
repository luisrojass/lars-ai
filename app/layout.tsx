import type { Metadata } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';
import 'mafs/core.css';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'ENEISOFT XVI - Plataforma de Estudio Activo & Motor Visual 3B1B',
  description:
    'Plataforma de estudio activo con método socrático Thea Engine, notación KaTeX, visualizaciones 3B1B de cero latencia con Mafs y Three.js, y evaluación matemática local Math.js a 60 FPS.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
        <Navbar />
        <div className="flex-1 w-full">{children}</div>
      </body>
    </html>
  );
}
