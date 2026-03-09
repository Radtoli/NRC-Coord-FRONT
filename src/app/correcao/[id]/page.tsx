'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthContext } from '@/lib/context/AuthContext';
import {
  avaService,
  AttemptForCorrection,
  CorrectorFeedback,
  PlagiarismResult,
} from '@/lib/services/ava.service';
import { AppHeader } from '@/components/AppHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle2, ChevronLeft, Send, Loader2 } from 'lucide-react';

// ── Plagiarism badge component ────────────────────────────────────

function PlagiarismBadge({ result }: { result?: PlagiarismResult }) {
  if (!result) {
    return (
      <span
        title="Anti-plágio não verificado"
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400 text-lg"
      >
        ⬜
      </span>
    );
  }

  if (result.passed) {
    return (
      <span
        title="Anti-plágio: Sem similaridade detectada"
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 text-lg cursor-default"
      >
        ✅
      </span>
    );
  }

  return (
    <div className="relative group">
      <span
        title="Anti-plágio: Similaridade detectada"
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 text-lg cursor-pointer"
      >
        🚨
      </span>
      {/* Tooltip with similar attempt IDs */}
      <div className="absolute left-0 top-10 z-10 hidden group-hover:block bg-white border border-red-300 rounded-lg shadow-lg p-3 w-72 text-xs">
        <div className="flex items-center gap-1 mb-2 text-red-700 font-semibold">
          <AlertTriangle className="w-3 h-3" />
          Possível plágio detectado
        </div>
        <p className="text-gray-500 mb-2">IDs de provas com respostas similares:</p>
        <ul className="space-y-1">
          {result.similarAttemptIds.map((id) => (
            <li key={id} className="font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded break-all">
              {id}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────

export default function CorrecaoDetailPage() {
  const { isAuthenticated, isLoading, isCorretor, isManager } = useAuthContext();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const attemptId = params.id;

  const [attempt, setAttempt] = useState<AttemptForCorrection | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Feedback state per open question
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [generalFeedback, setGeneralFeedback] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (!isCorretor() && !isManager()) {
        router.push('/dashboard');
        return;
      }
      loadAttempt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, attemptId]);

  async function loadAttempt() {
    try {
      setLoadingData(true);
      setError(null);
      const data = await avaService.getAttemptForCorrection(attemptId);
      setAttempt(data);

      // Pre-fill existing feedbacks if already corrected
      if (data.correctorFeedbacks) {
        const existing: Record<string, string> = {};
        data.correctorFeedbacks.forEach((f) => { existing[f.questionId] = f.feedback; });
        setFeedbacks(existing);
      }
      if (data.generalFeedback) {
        setGeneralFeedback(data.generalFeedback);
      }
      if (data.correctorId) {
        setSubmitted(true);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar prova.');
    } finally {
      setLoadingData(false);
    }
  }

  async function handleSubmitCorrection() {
    if (!attempt) return;

    const openQuestions = attempt.questions.filter((q) => q.questionType === 'open');
    const missing = openQuestions.filter((q) => !feedbacks[q.questionId]?.trim());
    if (missing.length > 0) {
      setError('Por favor, forneça feedback para todas as questões dissertativas antes de enviar.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const feedbackPayload: CorrectorFeedback[] = openQuestions.map((q) => ({
        questionId: q.questionId,
        feedback: feedbacks[q.questionId] ?? '',
      }));

      await avaService.submitCorrection(attempt._id, feedbackPayload, generalFeedback || undefined);
      setSubmitted(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao enviar correção.');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error && !attempt) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Correção" />
        <div className="container mx-auto py-10 max-w-3xl">
          <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-red-700">
            <p className="font-semibold mb-2">Erro ao carregar a prova</p>
            <p className="text-sm">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!attempt) return null;

  const openQuestions = attempt.questions.filter((q) => q.questionType === 'open');
  const mcQuestions = attempt.questions.filter((q) => q.questionType !== 'open');

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Correção de Prova" />

      <div className="container mx-auto py-6 max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/correcao')}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
          <div>
            <p className="text-xs text-gray-400 font-mono">Prova ID: {attempt._id}</p>
            <div className="flex items-center gap-2 mt-1">
              {submitted ? (
                <Badge className="bg-green-600 text-white">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Corrigida
                </Badge>
              ) : (
                <Badge variant="secondary">
                  Pendente de correção
                </Badge>
              )}
              <span className="text-xs text-gray-500">
                {openQuestions.length} questão{openQuestions.length !== 1 ? 'ões' : ''} dissertativa{openQuestions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {submitted && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">
              Esta prova já foi corrigida. Você pode visualizar os feedbacks abaixo.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Objective questions summary (read-only) */}
        {mcQuestions.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Questões Objetivas</CardTitle>
              <p className="text-xs text-gray-500">Resultados automáticos (não requerem correção)</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {mcQuestions.map((q, idx) => {
                const ans = attempt.answers.find((a) => a.questionId === q.questionId);
                return (
                  <div key={q.questionId} className="rounded-lg border border-gray-100 p-3 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">
                      {q.questionType === 'weighted' ? 'Múltipla Escolha Ponderada' : 'Múltipla Escolha'}
                    </p>
                    <p className="text-sm font-medium text-gray-800">{idx + 1}. {q.statement}</p>
                    {ans && (
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <span className="text-gray-500">Nota: {ans.scoreObtained}%</span>
                        <Badge variant={ans.scoreObtained >= 60 ? 'default' : 'destructive'} className="text-xs">
                          {ans.scoreObtained >= 60 ? 'Correto' : 'Incorreto'}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Open questions with feedback */}
        <div className="space-y-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900">Questões Dissertativas</h3>
          {openQuestions.map((q, idx) => {
            const ans = attempt.answers.find((a) => a.questionId === q.questionId);
            const plagResult = attempt.plagiarismResults?.find((r) => r.questionId === q.questionId);

            return (
              <Card key={q.questionId}>
                <CardContent className="pt-4 space-y-4">
                  {/* Question header */}
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold uppercase text-gray-400 mb-1">
                        Questão Dissertativa {idx + 1}
                        {q.axis && ` — Eixo: ${q.axis}`}
                      </p>
                      <p className="text-sm font-medium text-gray-800">{q.statement}</p>
                    </div>
                    {/* Plagiarism badge */}
                    <div className="flex-shrink-0 pt-1">
                      <PlagiarismBadge result={plagResult} />
                    </div>
                  </div>

                  {/* Student answer */}
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                    <p className="text-xs font-semibold text-blue-600 mb-1 uppercase">Resposta do aluno:</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {ans?.answer || <span className="italic text-gray-400">Sem resposta</span>}
                    </p>
                  </div>

                  {/* Corrector feedback */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Feedback do corretor
                      <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <Textarea
                      rows={4}
                      placeholder="Descreva o feedback para esta resposta dissertativa..."
                      value={feedbacks[q.questionId] ?? ''}
                      onChange={(e) =>
                        setFeedbacks((prev) => ({ ...prev, [q.questionId]: e.target.value }))
                      }
                      disabled={submitted}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* General feedback */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Feedback geral da prova
            </label>
            <Textarea
              rows={4}
              placeholder="Comentários gerais sobre o desempenho do aluno nesta prova (opcional)..."
              value={generalFeedback}
              onChange={(e) => setGeneralFeedback(e.target.value)}
              disabled={submitted}
              className="resize-none"
            />
          </CardContent>
        </Card>

        {/* Submit button */}
        {!submitted && (
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.push('/correcao')}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitCorrection}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Correção
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
