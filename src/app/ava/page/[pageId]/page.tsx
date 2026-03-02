'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { avaService, FullPage } from '@/lib/services/ava.service';
import { SectionRenderer } from '@/components/ava/SectionRenderer';

interface Props {
  params: Promise<{ pageId: string }>;
}

export default function StudentPageView({ params }: Props) {
  const { pageId } = use(params);
  const [page, setPage] = useState<FullPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    avaService
      .getFullPage(pageId)
      .then(setPage)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erro'))
      .finally(() => setLoading(false));
  }, [pageId]);

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

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-red-500">{error}</p>
    </div>
  );

  if (!page) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-3 gap-4">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">← Voltar</Link>
          <h1 className="text-sm font-semibold text-gray-700">{page.title}</h1>
        </div>
      </div>

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
    </div>
  );
}
