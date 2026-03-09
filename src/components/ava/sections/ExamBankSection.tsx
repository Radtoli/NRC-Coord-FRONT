'use client';

import { useState } from 'react';
import {
  ExamAttempt,
  ExamResult,
  ExamQuestionSnapshot,
  Section,
  avaService,
} from '@/lib/services/ava.service';

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
        Esta seÃ§Ã£o de prova nÃ£o possui banco de questÃµes configurado.
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
      setError(`Responda todas as ${attempt.questions.length} questÃµes antes de enviar.`);
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

  // â”€â”€ Result view â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (result) {
    const hasOpen = result.hasOpenQuestions;

    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
        {!hasOpen ? (
          // â”€â”€ Pure multiple choice: show full result â”€â”€
          <>
            <h3 className="text-lg font-bold text-gray-900">ðŸ Resultado da Prova</h3>
            <div className="flex items-center gap-6">
              <div className={`text-5xl font-black ${result.passed ? 'text-green-600' : 'text-red-500'}`}>
                {result.score.toFixed(1)}%
              </div>
              <div>
                <p className="text-sm text-gray-500">{result.totalQuestions} questÃµes respondidas</p>
                <p className={`mt-1 text-base font-bold ${result.passed ? 'text-green-700' : 'text-red-600'}`}>
                  {result.passed ? 'âœ… Aprovado' : 'âŒ NÃ£o aprovado'}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">Nota mÃ­nima: 60%</p>
              </div>
            </div>
            {Object.entries(result.byAxis).length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-700">Por eixo temÃ¡tico:</h4>
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
          </>
        ) : (
          // â”€â”€ Has open questions: show partial + pending correction notice â”€â”€
          <>
            <h3 className="text-lg font-bold text-gray-900">ðŸ“¬ Prova Enviada com Sucesso</h3>

            {/* Partial MC result (if mixed) */}
            {result.score > 0 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-800 mb-1">
                  Resultado parcial (questÃµes objetivas):
                </p>
                <div className="flex items-center gap-4">
                  <p className="text-3xl font-black text-blue-700">{result.score.toFixed(1)}%</p>
                  <p className="text-xs text-blue-500">Nota mÃ­nima: 60%</p>
                </div>
              </div>
            )}

            {/* Open questions pending notice */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">âœï¸</span>
                <p className="font-semibold text-amber-800">
                  QuestÃµes dissertativas aguardando correÃ§Ã£o
                </p>
              </div>
              <p className="text-sm text-amber-700">
                Suas respostas dissertativas foram enviadas e registradas no banco de anti-plÃ¡gio.
                Um corretor irÃ¡ analisar e fornecer feedback em breve.
              </p>
            </div>
          </>
        )}

        <button
          onClick={() => { setResult(null); setAttempt(null); setAnswers({}); }}
          className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
        >
          Nova tentativa
        </button>
      </div>
    );
  }

  // â”€â”€ Exam in progress â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (attempt) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-600">
            Prova em andamento â€” {attempt.questions.length} questÃµes
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

  // â”€â”€ Start view â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-red-300 bg-red-50 p-10">
      <span className="mb-3 text-5xl">ðŸŽ“</span>
      <h3 className="mb-1 text-lg font-bold text-gray-900">Prova</h3>
      <p className="mb-4 max-w-sm text-center text-sm text-gray-600">
        Esta prova contÃ©m questÃµes aleatÃ³rias do banco. Leia com atenÃ§Ã£o antes de responder.
        QuestÃµes objetivas tÃªm resultado imediato. QuestÃµes dissertativas passarÃ£o por correÃ§Ã£o manual.
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

// â”€â”€ Question Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ExamQuestionCardProps {
  question: ExamQuestionSnapshot;
  index: number;
  answer?: ExamAnswer;
  onAnswer: (ans: ExamAnswer) => void;
}

function ExamQuestionCard({ question, index, answer, onAnswer }: ExamQuestionCardProps) {
  const isOpen = question.questionType === 'open';

  const typeLabel = isOpen
    ? 'QuestÃ£o Dissertativa'
    : question.questionType === 'weighted'
      ? 'MÃºltipla Escolha Ponderada'
      : 'MÃºltipla Escolha';

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${isOpen ? 'border-amber-200 bg-amber-50/50' : 'border-gray-100 bg-white'}`}>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{typeLabel}</p>
        {isOpen && (
          <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">
            CorreÃ§Ã£o manual
          </span>
        )}
      </div>
      <p className="mb-3 font-medium text-gray-800">
        {index + 1}. {question.statement}
      </p>

      {isOpen && (
        <textarea
          rows={5}
          className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-amber-500 focus:outline-none"
          placeholder="Digite sua resposta dissertativa aqui..."
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
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
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
