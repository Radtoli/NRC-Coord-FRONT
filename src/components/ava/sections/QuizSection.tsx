'use client';

import { useState } from 'react';
import { Section, avaService, QuizQuestion, QuizOption } from '@/lib/services/ava.service';

interface QuizResult {
  score: number;
  passed?: boolean;
  totalQuestions?: number;
}

interface Props { section: Section }

export function QuizSection({ section }: Props) {
  const quizId = (section.config?.quizId as string) ?? '';
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!quizId) {
    return (
      <div className="rounded border border-dashed border-yellow-400 bg-yellow-50 p-4 text-sm text-yellow-700">
        Quiz não configurado nesta seção.
      </div>
    );
  }

  async function startQuiz() {
    try {
      setLoading(true);
      setError(null);
      const quiz = await avaService.startQuiz(quizId);
      setQuestions(quiz.questions ?? []);
      setStarted(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar quiz.');
    } finally {
      setLoading(false);
    }
  }

  async function submitQuiz() {
    try {
      setLoading(true);
      setError(null);
      const answersArr = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      }));
      const res = await avaService.submitQuiz({ quizId, answers: answersArr });
      setResult(res as QuizResult);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar respostas.');
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm text-center">
        <p className="text-4xl font-black text-blue-600">{result.score ?? '—'}%</p>
        <p className="mt-2 text-gray-600">Quiz concluído!</p>
        <button
          onClick={() => { setResult(null); setStarted(false); setAnswers({}); }}
          className="mt-4 rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-blue-300 bg-blue-50 p-8">
        <span className="mb-3 text-4xl">🧠</span>
        <h3 className="mb-2 font-bold text-gray-900">Quiz</h3>
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <button
          onClick={startQuiz}
          disabled={loading}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Iniciar Quiz'}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
      {questions.map((q: QuizQuestion, i: number) => (
        <div key={q.id} className="space-y-2">
          <p className="font-medium text-gray-800">{i + 1}. {q.statement}</p>
          <div className="space-y-1">
            {q.options?.map((opt: QuizOption) => (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition ${answers[q.id] === opt.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <input
                  type="radio"
                  name={q.id}
                  value={opt.id}
                  checked={answers[q.id] === opt.id}
                  onChange={() => setAnswers((p) => ({ ...p, [q.id]: opt.id }))}
                />
                {opt.text}
              </label>
            ))}
          </div>
        </div>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end">
        <button
          onClick={submitQuiz}
          disabled={loading}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Finalizar Quiz'}
        </button>
      </div>
    </div>
  );
}
