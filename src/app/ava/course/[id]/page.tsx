'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { avaService, Course, Module, Page } from '@/lib/services/ava.service';

interface Props {
  params: Promise<{ id: string }>;
}

type ModuleWithPages = Module & { pages: Page[] };

export default function StudentCoursePage({ params }: Props) {
  const { id } = use(params);
  const [course, setCourse] = useState<(Course & { modules: ModuleWithPages[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  useEffect(() => {
    avaService
      .getCourse(id)
      .then((data) => {
        setCourse(data as Course & { modules: ModuleWithPages[] });
        const first = (data as Course & { modules: ModuleWithPages[] }).modules?.[0];
        if (first) setOpenModuleId(first.id);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erro'))
      .finally(() => setLoading(false));
  }, [id]);

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

  if (!course) return null;

  const modules = course.modules ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <Link href="/dashboard" className="mb-4 inline-block text-sm text-blue-200 hover:text-white">← Dashboard</Link>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          {course.description && <p className="mt-2 text-sm text-blue-200">{course.description}</p>}
        </div>
      </div>

      {/* Modules */}
      <div className="mx-auto max-w-3xl px-6 py-8 space-y-4">
        {modules.length === 0 && (
          <p className="text-center text-sm text-gray-400">Este curso ainda não tem conteúdo.</p>
        )}
        {modules.map((mod) => {
          const isOpen = openModuleId === mod.id;
          const pages = mod.pages ?? [];
          return (
            <div key={mod.id} className="rounded-xl border bg-white shadow-sm overflow-hidden">
              <div
                className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-gray-50"
                onClick={() => setOpenModuleId(isOpen ? null : mod.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">{isOpen ? '▼' : '▶'}</span>
                  <div>
                    <p className="font-medium text-gray-900">{mod.title}</p>
                    <p className="text-xs text-gray-400">{pages.length} aula(s)</p>
                  </div>
                </div>
              </div>

              {isOpen && (
                <div className="border-t divide-y">
                  {pages.length === 0 && (
                    <p className="px-5 py-4 text-sm text-gray-400">Nenhuma aula neste módulo.</p>
                  )}
                  {pages.map((page, i) => (
                    <Link
                      key={page.id}
                      href={`/ava/page/${page.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-blue-50 transition"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {i + 1}
                      </span>
                      <p className="text-sm font-medium text-gray-800">{page.title}</p>
                      {!page.isPublished && (
                        <span className="ml-auto text-xs text-gray-400">Rascunho</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
