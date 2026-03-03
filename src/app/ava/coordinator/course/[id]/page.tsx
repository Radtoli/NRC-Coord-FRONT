'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { avaService, Course, Module, Page } from '@/lib/services/ava.service';

type ModuleWithPages = Module & { pages: Page[] };
type CourseWithModules = Course & { modules: ModuleWithPages[] };

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function CoordinatorCoursePage() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithModules | null>(null);
  const [step, setStep] = useState<'picking' | 'managing'>('picking');
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [addingModule, setAddingModule] = useState(false);
  const [savingModule, setSavingModule] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState<Record<string, string>>({});
  const [addingPageFor, setAddingPageFor] = useState<string | null>(null);
  const [savingPage, setSavingPage] = useState(false);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  useEffect(() => {
    avaService
      .listCourses()
      .then(setAllCourses)
      .catch((e: unknown) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, []);

  async function loadCourse(courseId: string) {
    try {
      setCourseLoading(true);
      const data = await avaService.getCourse(courseId);
      setSelectedCourse(data as CourseWithModules);
      const first = (data as CourseWithModules).modules?.[0];
      if (first) setOpenModuleId(first.id);
      setStep('managing');
    } catch (e: unknown) {
      alert(errMsg(e));
    } finally {
      setCourseLoading(false);
    }
  }

  async function handleCreateCourse() {
    if (!newCourseTitle.trim()) return;
    try {
      setCreatingCourse(true);
      const created = await avaService.createCourse({ title: newCourseTitle.trim(), description: '' });
      await loadCourse((created as Course).id);
      setNewCourseTitle('');
    } catch (e: unknown) {
      alert(errMsg(e));
    } finally {
      setCreatingCourse(false);
    }
  }

  async function reloadCourse() {
    if (selectedCourse) await loadCourse(selectedCourse.id);
  }

  async function handleDeleteCourse(courseId: string, courseTitle: string) {
    if (!confirm(`Excluir o curso "${courseTitle}" e todo o seu conteúdo? Esta ação não pode ser desfeita.`)) return;
    try {
      await avaService.deleteCourse(courseId);
      setAllCourses((prev) => prev.filter((c) => c.id !== courseId));
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
        setStep('picking');
      }
    } catch (e: unknown) {
      alert(errMsg(e));
    }
  }

  async function handleAddModule() {
    if (!newModuleTitle.trim() || !selectedCourse) return;
    try {
      setSavingModule(true);
      await avaService.createModule({ courseId: selectedCourse.id, title: newModuleTitle.trim(), description: '' });
      setNewModuleTitle('');
      setAddingModule(false);
      await reloadCourse();
    } catch (e: unknown) {
      alert(errMsg(e));
    } finally {
      setSavingModule(false);
    }
  }

  async function handleAddPage(moduleId: string) {
    const title = newPageTitle[moduleId]?.trim();
    if (!title) return;
    try {
      setSavingPage(true);
      await avaService.createPage({ moduleId, title });
      setNewPageTitle((p) => ({ ...p, [moduleId]: '' }));
      setAddingPageFor(null);
      await reloadCourse();
    } catch (e: unknown) {
      alert(errMsg(e));
    } finally {
      setSavingPage(false);
    }
  }

  async function handleDeleteModule(moduleId: string) {
    if (!confirm('Remover este módulo e todas as suas páginas?')) return;
    try {
      await avaService.deleteModule(moduleId);
      await reloadCourse();
    } catch (e: unknown) {
      alert(errMsg(e));
    }
  }

  async function handleDeletePage(pageId: string) {
    if (!confirm('Remover esta página?')) return;
    try {
      await avaService.deletePage(pageId);
      await reloadCourse();
    } catch (e: unknown) {
      alert(errMsg(e));
    }
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  );

  // ── Step 1: pick or create ────────────────────────────────────────
  if (step === 'picking') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b bg-white shadow-sm">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
            <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-800">← Painel admin</Link>
            <h1 className="text-sm font-semibold text-gray-700">Conteúdo AVA da trilha</h1>
            <span />
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-6 py-10">
          {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}

          <h2 className="mb-1 text-lg font-bold text-gray-900">Selecione o curso AVA</h2>
          <p className="mb-6 text-sm text-gray-500">Escolha um curso existente ou crie um novo.</p>

          {allCourses.length > 0 && (
            <div className="mb-6 space-y-2">
              {allCourses.map((c) => (
                <div
                  key={c.id}
                  className="flex w-full items-center justify-between rounded-xl border bg-white px-5 py-4 shadow-sm hover:border-blue-400 hover:bg-blue-50 gap-3"
                >
                  <button
                    onClick={() => loadCourse(c.id)}
                    disabled={courseLoading}
                    className="flex flex-1 items-center justify-between text-left disabled:opacity-50"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{c.title}</p>
                      {c.description && <p className="mt-0.5 text-xs text-gray-500">{c.description}</p>}
                    </div>
                    <span className={`ml-4 rounded-full px-2 py-0.5 text-xs font-medium ${c.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {c.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteCourse(c.id, c.title); }}
                    title="Excluir curso"
                    className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-400 transition"
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          )}

          {allCourses.length === 0 && (
            <p className="mb-6 text-sm text-gray-400">Nenhum curso AVA cadastrado ainda.</p>
          )}

          <div className="rounded-xl border-2 border-dashed border-gray-300 p-5">
            <p className="mb-3 text-sm font-medium text-gray-700">Criar novo curso AVA</p>
            <div className="flex gap-2">
              <input
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCourse()}
                placeholder="Título do curso..."
                className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <button
                onClick={handleCreateCourse}
                disabled={creatingCourse || !newCourseTitle.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {creatingCourse ? '...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: manage modules & pages ───────────────────────────────
  const modules = selectedCourse?.modules ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <button onClick={() => setStep('picking')} className="text-sm text-gray-500 hover:text-gray-800">
            ← Voltar
          </button>
          <h1 className="text-sm font-semibold text-gray-700">{selectedCourse?.title}</h1>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${selectedCourse?.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
              {selectedCourse?.status === 'published' ? 'Publicado' : 'Rascunho'}
            </span>
            {selectedCourse && (
              <button
                onClick={() => handleDeleteCourse(selectedCourse.id, selectedCourse.title)}
                className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-400 transition"
              >
                Excluir curso
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Módulos e Páginas</h2>
          <button
            onClick={() => setAddingModule(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Novo módulo
          </button>
        </div>

        {/* Add module form */}
        {addingModule && (
          <div className="mb-4 flex gap-2 rounded-xl border bg-white p-4 shadow-sm">
            <input
              autoFocus
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
              placeholder="Nome do módulo..."
              className="flex-1 rounded border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <button
              onClick={handleAddModule}
              disabled={savingModule || !newModuleTitle.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {savingModule ? '...' : 'Salvar'}
            </button>
            <button onClick={() => setAddingModule(false)} className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100">
              Cancelar
            </button>
          </div>
        )}

        {modules.length === 0 && !addingModule && (
          <div className="rounded-xl border-2 border-dashed border-gray-300 p-10 text-center text-sm text-gray-400">
            Nenhum módulo ainda. Crie o primeiro módulo acima.
          </div>
        )}

        <div className="space-y-4">
          {modules.map((mod) => {
            const isOpen = openModuleId === mod.id;
            const pages = mod.pages ?? [];
            return (
              <div key={mod.id} className="rounded-xl border bg-white shadow-sm overflow-hidden">
                {/* Module header */}
                <div
                  className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-gray-50"
                  onClick={() => setOpenModuleId(isOpen ? null : mod.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">{isOpen ? '▼' : '▶'}</span>
                    <div>
                      <p className="font-medium text-gray-800">{mod.title}</p>
                      <p className="text-xs text-gray-400">{pages.length} página(s)</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }}
                    className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-50 hover:text-red-600"
                  >
                    Remover
                  </button>
                </div>

                {/* Pages */}
                {isOpen && (
                  <div className="border-t px-5 py-4 space-y-2">
                    {pages.map((page) => (
                      <div key={page.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{page.title}</p>
                          <p className="text-xs text-gray-400">
                            {page.isPublished ? '✅ Publicada' : '📝 Rascunho'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/ava/coordinator/page/${page.id}?courseId=${selectedCourse?.id}`}
                            className="rounded px-3 py-1 text-xs text-blue-600 hover:bg-blue-50"
                          >
                            Editar conteúdo
                          </Link>
                          <button
                            onClick={() => handleDeletePage(page.id)}
                            className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-50"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add page */}
                    {addingPageFor === mod.id ? (
                      <div className="flex gap-2 pt-1">
                        <input
                          autoFocus
                          value={newPageTitle[mod.id] ?? ''}
                          onChange={(e) => setNewPageTitle((p) => ({ ...p, [mod.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddPage(mod.id)}
                          placeholder="Título da página..."
                          className="flex-1 rounded border px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => handleAddPage(mod.id)}
                          disabled={savingPage}
                          className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                        >
                          {savingPage ? '...' : 'OK'}
                        </button>
                        <button onClick={() => setAddingPageFor(null)} className="text-sm text-gray-400 hover:text-gray-600">
                          ×
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingPageFor(mod.id)}
                        className="mt-1 text-sm text-blue-600 hover:underline"
                      >
                        + Adicionar página
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
