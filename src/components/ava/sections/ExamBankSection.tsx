'use client';

import { useState } from 'react';
import { ExamAttempt, ExamResult, ExamQuestionSnapshot, Section, avaService } from '@/lib/services/ava.service';

interface Props {
  section: Section;
}

type ExamAnswer =
  | { type: 'option'; index: string }
  | { type: 'open'; text: string };

export function ExamBankSection({ section }: Props) {
  const bankId = (section.config?.exam_bank_id as string) ?? '';

  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, ExamAnswer>>({});
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!bankId) {
    return (
      <div className="rounded border border-dashed border-yellow-400 bg-yellow-50 p-4 text-sm text-yellow-700">
        Esta seção de prova não possui banco de questões configurado.
      </div>
    );
  }

  async function startExam() {
    try {
      setLoading(true);
      setError(null);
      const newAttempt = await avaService.startExam(section.id, bankId);
      setAttempt(newAttempt);
      setAnswers({});
      setResult(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao iniciar prova.');
    } finally {
      setLoading(false);
    }
  }

  async function submitExam() {
    if (!attempt) return;

    const missing = attempt.questions.filter((q) => {
      if (q.questionType === 'open') {
        const ans = answers[q.questionId] as { type: 'open'; text: string } | undefined;
        return !ans || ans.text.trim() === '';
      }
      return !answers[q.questionId];
    });

    if (missing.length > 0) {
      setError(`Responda todas as ${attempt.questions.length} questões antes de enviar.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const payload = attempt.questions.map((q) => {
        const ans = answers[q.questionId];
        if (!ans) return { questionId: q.questionId, answer: '' };
        if (ans.type === 'open') return { questionId: q.questionId, answer: ans.text };
        return { questionId: q.questionId, answer: ans.index };
      });
      const examResult = await avaService.submitExam(attempt._id, payload);
      setResult(examResult);
      setAttempt(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar respostas.');
    } finally {
      setLoading(false);
    }
  }

  // ── Result view ────────────────────────────────────────────────
  if (result) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-gray-900">🏁 Resultado da Prova</h3>
        <div className="mb-6 flex items-center gap-6">
          <div className={`text-5xl font-black ${result.passed ? 'text-green-600' : 'text-red-500'}`}>
            {result.score.toFixed(1)}%
          </div>
          <div>
            <p className="text-sm text-gray-500">{result.totalQuestions} questões respondidas</p>
            <p className={`mt-1 text-base font-bold ${result.passed ? 'text-green-700' : 'text-red-600'}`}>
              {result.passed ? '✅ Aprovado' : '❌ Não aprovado'}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">Nota mínima: 60%</p>
          </div>
        </div>

        {Object.entries(result.byAxis).length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-semibold text-gray-700">Por eixo temático:</h4>
            {Object.entries(result.byAxis).map(([axis, stats]) => (
              <div key={axis} className="mb-3">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{axis === '__geral__' ? 'Geral' : axis}</span>
                  <span>{stats.score.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className={`h-2 rounded-full ${stats.score >= 60 ? 'bg-green-500' : 'bg-red-400'}`}
                    style={{ width: `${Math.min(stats.score, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => { setResult(null); setAttempt(null); setAnswers({}); }}
          className="mt-2 rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
        >
          Nova tentativa
        </button>
      </div>
    );
  }

  // ── Exam in progress ───────────────────────────────────────────
  if (attempt) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-600">
            Prova em andamento — {attempt.questions.length} questões
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="space-y-6">
          {attempt.questions.map((q, idx) => (
            <ExamQuestionCard
              key={q.questionId}
              question={q}
              index={idx}
              answer={answers[q.questionId]}
              onAnswer={(ans) => setAnswers((prev) => ({ ...prev, [q.questionId]: ans }))}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={submitExam}
            disabled={loading}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Finalizar Prova'}
          </button>
        </div>
      </div>
    );
  }

  // ── Start view ─────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-300 bg-red-50 p-10">
      <span className="mb-3 text-5xl">🎓</span>
      <h3 className="mb-1 text-lg font-bold text-gray-900">Prova</h3>
      <p className="mb-4 max-w-sm text-center text-sm text-gray-600">
        Esta prova contém questões aleatórias do banco. Leia com atenção antes de responder.
      </p>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <button
        onClick={startExam}
        disabled={loading}
        className="rounded-md bg-red-600 px-8 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? 'Iniciando...' : 'Iniciar Prova'}
      </button>
    </div>
  );
}

// ── Question Card ──────────────────────────────────────────────

interface ExamQuestionCardProps {
  question: ExamQuestionSnapshot;
  index: number;
  answer?: ExamAnswer;
  onAnswer: (ans: ExamAnswer) => void;
}

function ExamQuestionCard({ question, index, answer, onAnswer }: ExamQuestionCardProps) {
  const typeLabel =
    question.questionType === 'open'
      ? 'Questão Aberta'
      : question.questionType === 'weighted'
        ? 'Múltipla Escolha Ponderada'
        : 'Múltipla Escolha';

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {typeLabel}
      </p>
      <p className="mb-3 font-medium text-gray-800">
        {index + 1}. {question.statement}
      </p>

      {question.questionType === 'open' && (
        <textarea
          rows={4}
          className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="Digite sua resposta aqui..."
          value={(answer as { type: 'open'; text: string } | undefined)?.text ?? ''}
          onChange={(e) => onAnswer({ type: 'open', text: e.target.value })}
        />
      )}

      {(question.questionType === 'multiple_choice' || question.questionType === 'weighted') && (
        <div className="space-y-2">
          {question.options.map((opt) => {
            const selected =
              (answer as { type: 'option'; index: string } | undefined)?.index === String(opt.index);
            return (
              <label
                key={opt.index}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                  selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={question.questionId}
                  value={String(opt.index)}
                  checked={selected}
                  onChange={() => onAnswer({ type: 'option', index: String(opt.index) })}
                  className="text-blue-600"
                />
                <span className="text-sm">{opt.text}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
