import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Hourglass } from 'lucide-react';

// Placeholder: aquí se mostrarán las preguntas generadas (pendiente).
async function Contenido({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <p className="text-sm text-slate-400">
      Tu documento <code className="text-sky-300">{id}</code> ya está guardado. Las preguntas generadas aparecerán aquí.
    </p>
  );
}

export default function ClasePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] w-full flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <Hourglass className="h-10 w-10 text-sky-400 mx-auto" />
        <h1 className="text-xl font-bold text-slate-100">Preguntas en preparación</h1>
        <Suspense fallback={null}>
          <Contenido params={params} />
        </Suspense>
        <Link href="/crear-clase" className="inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300">
          <ArrowLeft className="h-4 w-4" /> Volver a Crear Clase
        </Link>
      </div>
    </main>
  );
}
