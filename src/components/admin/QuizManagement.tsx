'use client';

import { useEffect, useState } from 'react';
import { Quiz, QuizQuestion, avaService } from '@/lib/services/ava.service';

// ── QuizManagement ────────────────────────────────────────────────

export function QuizManagement() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await avaService.listQuizzes();
      setQuizzes(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar questionários.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm('Remover este questionário e todas as suas questões?')) return;
    try {
      await avaService.deleteQuiz(id);
      if (selectedQuiz?.id === id) setSelectedQuiz(null);
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao remover.');
    }
  }

  if (loading) return <p className="text-sm text-gray-500 py-4">Carregando...</p>;
  if (error) return <p className="text-sm text-red-600 py-4">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{quizzes.length} questionário(s) cadastrado(s)</p>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Novo Questionário
        </button>
      </div>

      {showCreate && (
        <CreateQuizForm
          onCreated={(q) => { setQuizzes((prev) => [q, ...prev]); setShowCreate(false); }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <div className="space-y-2">
        {quizzes.map((q) => (
          <div key={q.id} className="rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-gray-900">{q.title}</p>
                {q.description && <p className="text-xs text-gray-500">{q.description}</p>}
                <p className="text-xs text-gray-400 mt-0.5">
                  Aprovação: {q.passingScore}% · Questões a exibir: {q.questionsToShow}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedQuiz(selectedQuiz?.id === q.id ? null : q)}
                  className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
                >
                  {selectedQuiz?.id === q.id ? 'Fechar' : 'Questões'}
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="rounded border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Remover
                </button>
              </div>
            </div>

            {selectedQuiz?.id === q.id && (
              <QuizQuestionsPanel quiz={q} onRefresh={load} />
            )}
          </div>
        ))}

        {quizzes.length === 0 && !showCreate && (
          <p className="text-center text-sm text-gray-400 py-8">
            Nenhum questionário cadastrado. Clique em &quot;+ Novo Questionário&quot; para começar.
          </p>
        )}
      </div>
    </div>
  );
}

// ── CreateQuizForm ────────────────────────────────────────────────

function CreateQuizForm({ onCreated, onCancel }: { onCreated: (q: Quiz) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [questionsToShow, setQuestionsToShow] = useState(10);
  const [randomize, setRandomize] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('Título obrigatório.'); return; }
    try {
      setSaving(true);
      setError(null);
      const quiz = await avaService.createQuiz({
        title: title.trim(),
        description: description.trim() || undefined,
        passingScore,
        questionsToShow,
        randomizeQuestions: randomize,
      });
      onCreated(quiz);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao criar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
      <h4 className="font-medium text-gray-900 text-sm">Novo Questionário</h4>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Título *</label>
        <input
          className="w-full rounded border p-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Quiz de Introdução"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Descrição</label>
        <input
          className="w-full rounded border p-2 text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Opcional"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Nota mínima (%)</label>
          <input
            type="number" min={0} max={100}
            className="w-full rounded border p-2 text-sm"
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Questões a exibir</label>
          <input
            type="number" min={1}
            className="w-full rounded border p-2 text-sm"
            value={questionsToShow}
            onChange={(e) => setQuestionsToShow(Number(e.target.value))}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={randomize} onChange={(e) => setRandomize(e.target.checked)} />
        Randomizar ordem das questões
      </label>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Salvando...' : 'Criar'}
        </button>
      </div>
    </form>
  );
}

// ── QuizQuestionsPanel ─────────────────────────────────────────────

function QuizQuestionsPanel({ quiz, onRefresh }: { quiz: Quiz; onRefresh: () => void }) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(quiz.questions ?? []);
  const [showAdd, setShowAdd] = useState(false);

  async function handleDeleteQuestion(id: string) {
    if (!confirm('Remover esta questão?')) return;
    try {
      await avaService.deleteQuizQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao remover questão.');
    }
  }

  return (
    <div className="border-t border-gray-100 px-4 pb-4 pt-3 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Questões ({questions.length})
        </p>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded border border-blue-300 px-3 py-1 text-xs text-blue-700 hover:bg-blue-50"
        >
          + Adicionar
        </button>
      </div>

      {showAdd && (
        <AddQuizQuestionForm
          quizId={quiz.id}
          onAdded={(q) => { setQuestions((prev) => [...prev, q]); setShowAdd(false); }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <div className="space-y-2">
        {questions.map((q, i) => (
          <div key={q.id} className="rounded-md border border-gray-200 bg-white p-3">
            <div className="flex justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-0.5">
                  {i + 1}. {q.questionType === 'open' ? 'Aberta' : q.questionType === 'weighted' ? 'Ponderada' : 'Múltipla Escolha'}
                  {q.axis && ` · ${q.axis}`}
                </p>
                <p className="text-sm text-gray-800">{q.statement}</p>
                {q.options && q.options.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {q.options.map((opt) => (
                      <li key={opt.id} className={`text-xs pl-2 ${opt.isCorrect ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                        {opt.isCorrect ? '✓' : '○'} {opt.text}
                        {q.questionType === 'weighted' && ` (peso ${Number(opt.scoreWeight).toFixed(2)})`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                onClick={() => handleDeleteQuestion(q.id)}
                className="text-xs text-red-500 hover:text-red-700 shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        {questions.length === 0 && !showAdd && (
          <p className="text-xs text-gray-400 text-center py-3">Nenhuma questão ainda.</p>
        )}
      </div>
    </div>
  );
}

// ── AddQuizQuestionForm ───────────────────────────────────────────

type QType = 'open' | 'multiple_choice' | 'weighted';

interface OptionDraft { text: string; isCorrect: boolean; scoreWeight: number }

function AddQuizQuestionForm({
  quizId,
  onAdded,
  onCancel,
}: {
  quizId: string;
  onAdded: (q: QuizQuestion) => void;
  onCancel: () => void;
}) {
  const [statement, setStatement] = useState('');
  const [qType, setQType] = useState<QType>('multiple_choice');
  const [axis, setAxis] = useState('');
  const [options, setOptions] = useState<OptionDraft[]>([
    { text: '', isCorrect: false, scoreWeight: 0 },
    { text: '', isCorrect: false, scoreWeight: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setOption(i: number, patch: Partial<OptionDraft>) {
    setOptions((prev) => prev.map((o, idx) => idx === i ? { ...o, ...patch } : o));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!statement.trim()) { setError('Enunciado obrigatório.'); return; }
    if (qType !== 'open' && options.filter((o) => o.text.trim()).length < 2) {
      setError('Adicione pelo menos 2 alternativas.'); return;
    }
    try {
      setSaving(true);
      setError(null);
      const question = await avaService.addQuizQuestion({
        quizId,
        statement: statement.trim(),
        questionType: qType,
        axis: axis.trim() || undefined,
        options: qType === 'open' ? undefined : options
          .filter((o) => o.text.trim())
          .map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect, scoreWeight: o.scoreWeight })),
      });
      onAdded(question);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao adicionar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-md border border-gray-200 bg-white p-3 mb-3 space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Tipo</label>
        <select
          className="w-full rounded border p-2 text-sm"
          value={qType}
          onChange={(e) => {
            setQType(e.target.value as QType);
            setStatement('');
            setAxis('');
            setError(null);
            setOptions([
              { text: '', isCorrect: false, scoreWeight: 0 },
              { text: '', isCorrect: false, scoreWeight: 0 },
            ]);
          }}
        >
          <option value="multiple_choice">Múltipla Escolha</option>
          <option value="open">Aberta</option>
          <option value="weighted">Ponderada</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Enunciado *</label>
        <textarea
          rows={2}
          className="w-full rounded border p-2 text-sm"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder="Digite a pergunta..."
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Eixo temático</label>
        <input
          className="w-full rounded border p-2 text-sm"
          value={axis}
          onChange={(e) => setAxis(e.target.value)}
          placeholder="Ex: Liderança (opcional)"
        />
      </div>

      {qType !== 'open' && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Alternativas {qType === 'weighted' ? '(defina o peso de cada correta)' : '(marque a(s) correta(s))'}
          </label>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={opt.isCorrect}
                  onChange={(e) => setOption(i, { isCorrect: e.target.checked })}
                  className="shrink-0"
                />
                <input
                  className="flex-1 rounded border p-1.5 text-sm"
                  placeholder={`Alternativa ${i + 1}`}
                  value={opt.text}
                  onChange={(e) => setOption(i, { text: e.target.value })}
                />
                {qType === 'weighted' && (
                  <input
                    type="number" min={0} max={1} step={0.01}
                    className="w-24 rounded border p-1.5 text-sm"
                    title="Peso (0.0 – 1.0)"
                    placeholder="0.00"
                    value={opt.scoreWeight}
                    onChange={(e) => setOption(i, { scoreWeight: parseFloat(e.target.value) ?? 0 })}
                  />
                )}
                {options.length > 2 && (
                  <button type="button" onClick={() => setOptions((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-red-400 hover:text-red-600 text-xs">✕</button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setOptions((prev) => [...prev, { text: '', isCorrect: false, scoreWeight: 0 }])}
              className="text-xs text-blue-600 hover:underline"
            >
              + Alternativa
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="rounded px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Salvando...' : 'Adicionar'}
        </button>
      </div>
    </form>
  );
}
