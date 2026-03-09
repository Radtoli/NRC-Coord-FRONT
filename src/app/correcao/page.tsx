'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/context/AuthContext';
import { avaService, AttemptForCorrection } from '@/lib/services/ava.service';
import { AppHeader } from '@/components/AppHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardCheck, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('pt-BR');
}

export default function CorrecaoPage() {
  const { isAuthenticated, isLoading, isCorretor, isManager } = useAuthContext();
  const router = useRouter();

  const [pendingList, setPendingList] = useState<AttemptForCorrection[]>([]);
  const [allList, setAllList] = useState<AttemptForCorrection[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'pending' | 'all'>('pending');

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
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading]);

  async function loadData() {
    try {
      setLoadingData(true);
      setError(null);
      const [pending, all] = await Promise.all([
        avaService.listCorrections(false),
        avaService.listCorrections(true),
      ]);
      setPendingList(pending);
      setAllList(all);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar provas.');
    } finally {
      setLoadingData(false);
    }
  }

  if (isLoading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  function AttemptRow({ attempt }: { attempt: AttemptForCorrection }) {
    const openQuestions = attempt.questions.filter((q) => q.questionType === 'open');
    const hasPlagiarismIssue = attempt.plagiarismResults?.some((r) => !r.passed);
    const isCorrected = !!attempt.correctorId;

    return (
      <Card
        className="cursor-pointer transition hover:shadow-md"
        onClick={() => router.push(`/correcao/${attempt._id}`)}
      >
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400 font-mono mb-1 truncate">
                ID: {attempt._id}
              </p>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant={isCorrected ? 'default' : 'secondary'}>
                  {isCorrected ? (
                    <><CheckCircle2 className="w-3 h-3 mr-1" /> Corrigida</>
                  ) : (
                    <><Clock className="w-3 h-3 mr-1" /> Pendente</>
                  )}
                </Badge>
                <Badge variant="outline">
                  {openQuestions.length} questão{openQuestions.length !== 1 ? 'ões' : ''} dissertativa{openQuestions.length !== 1 ? 's' : ''}
                </Badge>
                {hasPlagiarismIssue && (
                  <Badge variant="destructive">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Alerta anti-plágio
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <span>Concluída em: {formatDate(attempt.completedAt)}</span>
                {isCorrected && <span>Corrigida em: {formatDate(attempt.correctedAt)}</span>}
              </div>
            </div>
            <Button variant="outline" size="sm" className="flex-shrink-0">
              <ClipboardCheck className="w-4 h-4 mr-1" />
              {isCorrected ? 'Ver correção' : 'Corrigir'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Painel de Correção" />

      <div className="container mx-auto py-6 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Provas para Correção</h2>
          <p className="text-gray-500 mt-1">
            As provas são exibidas anonimamente. Clique em uma para corrigir as questões dissertativas.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'pending' | 'all')}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              Pendentes
              <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {pendingList.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="all">
              Todas as provas
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {allList.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingList.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-green-400" />
                  <p className="font-semibold">Nenhuma prova pendente de correção!</p>
                  <p className="text-sm mt-1">Todas as provas dissertativas já foram corrigidas.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingList.map((a) => (
                  <AttemptRow key={a._id} attempt={a} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            {allList.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-400">
                  <ClipboardCheck className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold">Nenhuma prova com questão dissertativa encontrada.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {allList.map((a) => (
                  <AttemptRow key={a._id} attempt={a} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
