'use client';

import { useEffect, useState } from 'react';
import { avaService, Section, FullPage, SectionType } from '@/lib/services/ava.service';

// ─── Section type labels ──────────────────────────────────────────

const SECTION_LABELS: Record<SectionType, string> = {
  TEXT: 'Texto',
  VIDEO: 'Vídeo',
  FILE: 'Arquivo',
  SLIDES: 'Slides',
  STORYTELLING: 'Storytelling',
  CASE_STUDY: 'Estudo de caso',
  QUIZ: 'Quiz',
  MINDMAP: 'Visualizador de Imagem',
  FINAL_MESSAGE: 'Mensagem final',
  DASHBOARD: 'Dashboard',
  EXAM_BANK: 'Prova',
};

const DEFAULT_SECTION_TITLE: Record<SectionType, string> = { ...SECTION_LABELS };

// ─── Content editor per section type ────────────────────────────

function ContentEditor({
  section,
  content,
  sectionConfig,
  onContentChange,
  onConfigChange,
}: {
  section: Section;
  content: Record<string, unknown>;
  sectionConfig: Record<string, unknown>;
  onContentChange: (c: Record<string, unknown>) => void;
  onConfigChange: (c: Record<string, unknown>) => void;
}) {
  const field = (key: string, label: string, multiline = false) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      {multiline ? (
        <textarea
          rows={5}
          className="w-full rounded border p-2 text-sm"
          value={(content[key] as string) ?? ''}
          onChange={(e) => onContentChange({ ...content, [key]: e.target.value })}
        />
      ) : (
        <input
          className="w-full rounded border p-2 text-sm"
          value={(content[key] as string) ?? ''}
          onChange={(e) => onContentChange({ ...content, [key]: e.target.value })}
        />
      )}
    </div>
  );

  const configField = (key: string, label: string) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      <input
        className="w-full rounded border p-2 text-sm"
        value={(sectionConfig[key] as string) ?? ''}
        onChange={(e) => onConfigChange({ ...sectionConfig, [key]: e.target.value })}
      />
    </div>
  );

  switch (section.type) {
    case 'TEXT':
    case 'STORYTELLING':
      return field('html', 'Conteúdo HTML', true);
    case 'VIDEO':
      return (
        <div className="space-y-3">
          {field('url', 'URL do vídeo (YouTube ou direto)')}
          {field('title', 'Título do vídeo')}
          {field('description', 'Descrição', true)}
        </div>
      );
    case 'FILE':
    case 'SLIDES':
      return (
        <div className="space-y-3">
          {field('url', 'URL do arquivo')}
          {field('fileName', 'Nome do arquivo')}
          {field('description', 'Descrição')}
        </div>
      );
    case 'CASE_STUDY':
      return (
        <div className="space-y-3">
          {field('scenario', 'Cenário / Contexto', true)}
          {field('question', 'Pergunta')}
          {field('hint', 'Dica (opcional)')}
        </div>
      );
    case 'MINDMAP':
      return (
        <div className="space-y-3">
          {field('imageUrl', 'URL da imagem (direta, Imgur, Google Drive, etc.)')}
          {field('description', 'Descrição')}
        </div>
      );
    case 'FINAL_MESSAGE':
      return (
        <div className="space-y-3">
          {field('emoji', 'Emoji')}
          {field('message', 'Mensagem principal')}
          {field('cta', 'Texto de chamada para ação (opcional)')}
        </div>
      );
    case 'QUIZ':
      return configField('quizId', 'ID do Quiz (UUID)');
    case 'EXAM_BANK':
      return configField('exam_bank_id', 'ID do Banco de Questões');
    case 'DASHBOARD':
      return configField('courseId', 'ID do Curso');
    default:
      return <p className="text-sm text-gray-400">Sem configuração disponível para este tipo.</p>;
  }
}

// ─── Section editor modal ─────────────────────────────────────────

function SectionEditorModal({
  section,
  onClose,
  onSaved,
}: {
  section: Section;
  onClose: () => void;
  onSaved: (updated: Section) => void;
}) {
  const [title, setTitle] = useState(section.title);
  const [content, setContent] = useState<Record<string, unknown>>(section.content ?? {});
  const [sectionConfig, setSectionConfig] = useState<Record<string, unknown>>(section.config ?? {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      const updated = await avaService.updateSection(section.id, { title, config: sectionConfig });
      await avaService.updateSectionContent(section.id, content);
      onSaved({ ...updated, content });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="font-semibold text-gray-900">
            Editar — {SECTION_LABELS[section.type] ?? section.type}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Título da seção</label>
            <input
              className="w-full rounded border p-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <ContentEditor
            section={section}
            content={content}
            sectionConfig={sectionConfig}
            onContentChange={setContent}
            onConfigChange={setSectionConfig}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button onClick={onClose} className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add section picker ───────────────────────────────────────────

const SECTION_TYPES = Object.keys(SECTION_LABELS) as SectionType[];

function AddSectionPicker({ onPick, onClose }: { onPick: (t: SectionType) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Adicionar seção</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SECTION_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => onPick(t)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm hover:border-blue-400 hover:bg-blue-50 text-left"
            >
              {SECTION_LABELS[t]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main PageBuilder ─────────────────────────────────────────────

interface Props {
  pageId: string;
}

export function PageBuilder({ pageId }: Props) {
  const [page, setPage] = useState<FullPage | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [addingType, setAddingType] = useState(false);
  const [addingSaving, setAddingSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    avaService
      .getFullPage(pageId)
      .then((p) => {
        setPage(p);
        setSections(p.sections);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Erro'))
      .finally(() => setLoading(false));
  }, [pageId]);

  const DEFAULT_SECTION_TITLE_MAP: Record<SectionType, string> = {
    TEXT: 'Texto',
    VIDEO: 'Vídeo',
    FILE: 'Arquivo',
    SLIDES: 'Slides',
    STORYTELLING: 'Storytelling',
    CASE_STUDY: 'Estudo de caso',
    QUIZ: 'Quiz',
    MINDMAP: 'Visualizador de Imagem',
    FINAL_MESSAGE: 'Mensagem final',
    DASHBOARD: 'Dashboard',
    EXAM_BANK: 'Prova',
  };

  async function addSection(type: SectionType) {
    try {
      setAddingSaving(true);
      const newSection = await avaService.createSection({ pageId, type, title: DEFAULT_SECTION_TITLE_MAP[type] });
      setSections((prev) => [...prev, newSection]);
      setAddingType(false);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao criar seção.');
    } finally {
      setAddingSaving(false);
    }
  }

  async function deleteSection(id: string) {
    if (!confirm('Remover esta seção?')) return;
    try {
      setDeletingId(id);
      await avaService.deleteSection(id);
      setSections((prev) => prev.filter((s) => s.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao remover seção.');
    } finally {
      setDeletingId(null);
    }
  }

  async function saveOrder(newSections: Section[]) {
    try {
      setSavingOrder(true);
      await avaService.reorderSections(pageId, newSections.map((s) => s.id));
    } catch {
      /* silent */
    } finally {
      setSavingOrder(false);
    }
  }

  function onDragStart(idx: number) { setDragIndex(idx); }

  function onDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(idx, 0, moved);
    setSections(reordered);
    setDragIndex(idx);
  }

  function onDragEnd() {
    setDragIndex(null);
    saveOrder(sections);
  }

  function updateSectionInState(updated: Section) {
    setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setEditingSection(null);
  }

  if (loading) return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  );

  if (error) return (
    <div className="rounded-xl bg-red-50 p-6 text-sm text-red-600">{error}</div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{page?.title}</h2>
          <p className="text-xs text-gray-400">{sections.length} seção(ões)</p>
        </div>
        <div className="flex items-center gap-2">
          {savingOrder && <span className="text-xs text-gray-400">Salvando ordem...</span>}
          <button
            onClick={() => setAddingType(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Adicionar seção
          </button>
        </div>
      </div>

      {/* Sections list */}
      {sections.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-10 text-center text-sm text-gray-400">
          Nenhuma seção ainda. Clique em &ldquo;+ Adicionar seção&rdquo; para começar.
        </div>
      ) : (
        <div className="space-y-2">
          {sections.map((section, idx) => (
            <div
              key={section.id}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={(e) => onDragOver(e, idx)}
              onDragEnd={onDragEnd}
              className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm transition ${dragIndex === idx ? 'opacity-50' : ''
                }`}
            >
              <span className="cursor-grab text-gray-300 select-none">⠿</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{section.title}</p>
                <p className="text-xs text-gray-400">{SECTION_LABELS[section.type] ?? section.type}</p>
              </div>
              <button
                onClick={() => setEditingSection(section)}
                className="rounded px-3 py-1 text-xs text-blue-600 hover:bg-blue-50"
              >
                Editar
              </button>
              <button
                onClick={() => deleteSection(section.id)}
                disabled={deletingId === section.id}
                className="rounded px-3 py-1 text-xs text-red-500 hover:bg-red-50 disabled:opacity-40"
              >
                {deletingId === section.id ? '...' : 'Remover'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {addingType && (
        <AddSectionPicker
          onPick={addSection}
          onClose={() => setAddingType(false)}
        />
      )}
      {addingSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      )}
      {editingSection && (
        <SectionEditorModal
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSaved={updateSectionInState}
        />
      )}
    </div>
  );
}
