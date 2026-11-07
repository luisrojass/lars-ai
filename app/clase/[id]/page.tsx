import { Suspense } from 'react';
import QuizWorkspace from '@/components/quiz/QuizWorkspace';
import { Loader2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function WorkspaceContainer({ params }: PageProps) {
  const { id } = await params;
  return <QuizWorkspace documentoId={id} />;
}

export default function ClasePage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-3.5rem)] w-full flex items-center justify-center bg-[#F8FAFC] text-slate-900">
          <Loader2 className="h-8 w-8 text-sky-600 animate-spin" />
        </div>
      }
    >
      <WorkspaceContainer params={params} />
    </Suspense>
  );
}
