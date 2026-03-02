'use client';

import { useEffect, useState } from 'react';
import { Section, avaService, CourseDashboard } from '@/lib/services/ava.service';

interface Props { section: Section }

export function DashboardSection({ section }: Props) {
  const courseId = (section.config?.courseId as string) ?? '';
  const [dashboard, setDashboard] = useState<CourseDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) { setLoading(false); return; }
    avaService.getCourseDashboard(courseId)
      .then(setDashboard)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Erro'))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (!courseId) return (
    <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-400">
      Dashboard não configurado (courseId ausente).
    </div>
  );

  if (loading) return <div className="animate-pulse rounded-xl bg-gray-100 h-32" />;
  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!dashboard) return null;

  const pct = Math.round(dashboard.progressPct ?? 0);

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 font-bold text-gray-900">📊 Seu Progresso</h3>
      <div className="flex items-center gap-6">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-blue-100">
          <svg className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="48" cy="48" r="44" fill="none" stroke="#dbeafe" strokeWidth="8" />
            <circle
              cx="48" cy="48" r="44"
              fill="none"
              stroke="#2563eb"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <span className="relative text-lg font-black text-blue-700">{pct}%</span>
        </div>
        <div>
          <p className="text-2xl font-black text-gray-900">
            {dashboard.completedPages}/{dashboard.totalPages}
          </p>
          <p className="text-sm text-gray-500">páginas concluídas</p>
          {dashboard.lastAccess && (
            <p className="mt-1 text-xs text-gray-400">
              Último acesso: {new Date(dashboard.lastAccess).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
