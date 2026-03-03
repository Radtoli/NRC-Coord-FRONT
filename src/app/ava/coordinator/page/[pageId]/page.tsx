'use client';

import { Suspense, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageBuilder } from '@/components/ava/PageBuilder';
import Link from 'next/link';

interface Props {
  params: Promise<{ pageId: string }>;
}

function CoordinatorPageEditorInner({ pageId }: { pageId: string }) {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

  const backHref = courseId
    ? `/ava/coordinator/course/${courseId}`
    : '/admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <Link href={backHref} className="text-sm text-gray-500 hover:text-gray-800">
            ← Voltar ao curso
          </Link>
          <h1 className="text-sm font-semibold text-gray-700">Editor de Página AVA</h1>
          <span />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <PageBuilder pageId={pageId} />
      </div>
    </div>
  );
}

export default function CoordinatorPageEditor({ params }: Props) {
  const { pageId } = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <CoordinatorPageEditorInner pageId={pageId} />
    </Suspense>
  );
}
