'use client';

import { useEffect, useState } from 'react';
import { ExamBank, ExamQuestion, avaService } from '@/lib/services/ava.service';

// ── ExamBankManagement ────────────────────────────────────────────

export function ExamBankManagement() {
  const [banks, setBanks] = useState<ExamBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<ExamBank | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await avaService.listBanks();
      setBanks(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar bancos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm('Remover este banco e todas as suas questões?')) return;
    try {
      await avaService.deleteBank(id);
      if (selectedBank?._id === id) setSelectedBank(null);
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
        <p className="text-sm text-gray-500">{banks.length} banco(s) de questões cadastrado(s)</p>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          + Novo Banco de Questões
        </button>
      </div>

      {showCreate && (
        <CreateBankForm
          onCreated={(b) => { setBanks((prev) => [b, ...prev]); setShowCreate(false); }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <div className="space-y-2">
        {banks.map((bank) => (
          <div key={bank._id} className="rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-gray-900">{bank.title}</p>
                {bank.description && <p className="text-xs text-gray-500">{bank.description}</p>}
                <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {bank._id}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedBank(selectedBank?._id === bank._id ? null : bank)}
                  className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
                >
                  {selectedBank?._id === bank._id ? 'Fechar' : 'Questões'}
                </button>
                <button
                  onClick={() => handleDelete(bank._id)}
                  className="rounded border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Remover
                </button>
              </div>
            </div>

            {selectedBank?._id === bank._id && (
              <BankQuestionsPanel bankId={bank._id} />
            )}
          </div>
        ))}

        {banks.length === 0 && !showCreate && (
          <p className="text-center text-sm text-gray-400 py-8">
            Nenhum banco cadastrado. Clique em &quot;+ Novo Banco de Questões&quot; para começar.
          </p>
        )}
      </div>
    </div>
  );
}

// ── CreateBankForm ─────────────────────────────────────────────────

function CreateBankForm({ onCreated, onCancel }: { onCreated: (b: ExamBank) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError('Título obrigatório.'); return; }
    try {
      setSaving(true);
      setError(null);
      const bank = await avaService.createBank({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      onCreated(bank);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao criar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
      <h4 className="font-medium text-gray-900 text-sm">Novo Banco de Questões</h4>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">Título *</label>
        <input
          className="w-full rounded border p-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Banco de Questões — Liderança"
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
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
          {saving ? 'Salvando...' : 'Criar'}
        </button>
      </div>
    </form>
  );
}

// ── BankQuestionsPanel ─────────────────────────────────────────────

function BankQuestionsPanel({ bankId }: { bankId: string }) {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await avaService.listBankQuestions(bankId);
        setQuestions(data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [bankId]);

  async function handleDelete(id: string) {
    if (!confirm('Remover esta questão?')) return;
    try {
      await avaService.deleteExamQuestion(id);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao remover.');
    }
  }

  if (loading) return <div className="border-t px-4 py-3 text-xs text-gray-500">Carregando...</div>;

  return (
    <div className="border-t border-gray-100 px-4 pb-4 pt-3 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Questões no banco ({questions.length})
        </p>
        <button
          onClick={() => setShowAdd(true)}
          className="rounded border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50"
        >
          + Adicionar
        </button>
      </div>

      {showAdd && (
        <AddExamQuestionForm
          bankId={bankId}
          onAdded={(q) => { setQuestions((prev) => [...prev, q]); setShowAdd(false); }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <div className="space-y-2">
        {questions.map((q, i) => (
          <div key={q._id} className="rounded-md border border-gray-200 bg-white p-3">
            <div className="flex justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-0.5">
                  {i + 1}. {q.questionType === 'open' ? 'Aberta' : q.questionType === 'weighted' ? 'Ponderada' : 'Múltipla Escolha'}
                  {q.axis && ` · ${q.axis}`}
                </p>
                <p className="text-sm text-gray-800">{q.statement}</p>
                {q.options && q.options.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {q.options.map((opt, oi) => (
                      <li key={oi} className={`text-xs pl-2 ${opt.isCorrect ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                        {opt.isCorrect ? '✓' : '○'} {opt.text}
                        {q.questionType === 'weighted'
                          ? ` (peso ${opt.scoreWeight})`
                          : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                onClick={() => handleDelete(q._id)}
                className="text-xs text-red-500 hover:text-red-700 shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        {questions.length === 0 && !showAdd && (
          <p className="text-xs text-gray-400 text-center py-3">Nenhuma questão neste banco.</p>
        )}
      </div>
    </div>
  );
}

// ── AddExamQuestionForm ───────────────────────────────────────────

type QType = 'open' | 'multiple_choice' | 'weighted';
interface OptionDraft { text: string; isCorrect: boolean; scoreWeight: number }

function AddExamQuestionForm({
  bankId,
  onAdded,
  onCancel,
}: {
  bankId: string;
  onAdded: (q: ExamQuestion) => void;
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
      const question = await avaService.addExamQuestion({
        bankId,
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
          onChange={(e) => setQType(e.target.value as QType)}
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
          placeholder="Ex: Comunicação (opcional)"
        />
      </div>

      {qType !== 'open' && (
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Alternativas {qType === 'weighted' ? '(peso decimal por opção: 0.0 = errado · 1.0 = correto total; ex: 0.6)' : '(marque a(s) correta(s))'}
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
                    title="Peso decimal (0.0 – 1.0)"
                    placeholder="0.60"
                    value={opt.scoreWeight}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setOption(i, { scoreWeight: isNaN(val) ? 0 : Math.min(1, Math.max(0, val)) });
                    }}
                  />
                )}
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setOptions((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    ✕
                  </button>
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
        <button type="submit" disabled={saving} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50">
          {saving ? 'Salvando...' : 'Adicionar'}
        </button>
      </div>
    </form>
  );
}
