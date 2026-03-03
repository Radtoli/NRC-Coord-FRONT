'use client';

import { Suspense, use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { avaService, FullPage, Page } from '@/lib/services/ava.service';
import { SectionRenderer } from '@/components/ava/SectionRenderer';

interface Props {
  params: Promise<{ pageId: string }>;
}

// ─── Inner component (needs Suspense boundary for useSearchParams) ─

function StudentPageViewInner({ pageId }: { pageId: string }) {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  const moduleId = searchParams.get('moduleId');

  const [page, setPage] = useState<FullPage | null>(null);
  const [modulePages, setModulePages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    avaService
      .getFullPage(pageId)
      .then(setPage)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erro'))
      .finally(() => setLoading(false));
  }, [pageId]);

  // Load sibling pages to enable prev/next navigation
  useEffect(() => {
    if (!moduleId) return;
    avaService.listPages(moduleId).then(setModulePages).catch(() => { });
  }, [moduleId]);

  // Track time spent on this page
  useEffect(() => {
    if (!pageId) return;
    const start = Date.now();
    return () => {
      const seconds = Math.round((Date.now() - start) / 1000);
      if (seconds > 5) {
        avaService.recordPageProgress(pageId, seconds).catch(() => { });
      }
    };
  }, [pageId]);

  // Determine prev/next pages within the same module
  const currentIndex = modulePages.findIndex((p) => p.id === pageId);
  const prevPage = currentIndex > 0 ? modulePages[currentIndex - 1] : null;
  const nextPage =
    currentIndex >= 0 && currentIndex < modulePages.length - 1
      ? modulePages[currentIndex + 1]
      : null;

  // Back: to the course page if we know courseId, otherwise to dashboard
  const backHref = courseId ? `/ava/course/${courseId}` : '/dashboard';

  function buildPageHref(p: Page): string {
    const qs = new URLSearchParams();
    if (courseId) qs.set('courseId', courseId);
    if (moduleId) qs.set('moduleId', moduleId);
    const query = qs.toString();
    return `/ava/page/${p.id}${query ? `?${query}` : ''}`;
  }

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );

  if (!page) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-3 gap-4">
          <Link href={backHref} className="text-sm text-gray-500 hover:text-gray-800 shrink-0">
            ← Voltar
          </Link>
          <h1 className="text-sm font-semibold text-gray-700 flex-1 truncate">{page.title}</h1>
          {modulePages.length > 1 && currentIndex >= 0 && (
            <span className="text-xs text-gray-400 shrink-0">
              {currentIndex + 1} / {modulePages.length}
            </span>
          )}
        </div>
      </div>

      {/* Content sections */}
      <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        {page.sections.length === 0 && (
          <p className="text-center text-sm text-gray-400">Esta página não tem conteúdo ainda.</p>
        )}
        {page.sections.map((section) => (
          <div key={section.id}>
            {section.title && (
              <h2 className="mb-2 text-base font-semibold text-gray-900">{section.title}</h2>
            )}
            <SectionRenderer section={section} />
          </div>
        ))}
      </div>

      {/* Prev / Next page navigation */}
      {modulePages.length > 0 && (prevPage || nextPage) && (
        <div className="mx-auto max-w-3xl px-6 pb-12">
          <div className="flex items-center gap-4 border-t pt-6">
            {prevPage ? (
              <Link
                href={buildPageHref(prevPage)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:border-blue-300 hover:bg-blue-50 transition max-w-[46%]"
              >
                <span className="shrink-0">←</span>
                <span className="truncate">{prevPage.title}</span>
              </Link>
            ) : (
              <span />
            )}

            {nextPage ? (
              <Link
                href={buildPageHref(nextPage)}
                className="flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition max-w-[46%] ml-auto"
              >
                <span className="truncate">{nextPage.title}</span>
                <span className="shrink-0">→</span>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page export: wrap in Suspense (required by useSearchParams) ──

export default function StudentPageView({ params }: Props) {
  const { pageId } = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <StudentPageViewInner pageId={pageId} />
    </Suspense>
  );
}
