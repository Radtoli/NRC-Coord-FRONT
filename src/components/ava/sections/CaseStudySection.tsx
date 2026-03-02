'use client';

import { Section } from '@/lib/services/ava.service';

interface Props { section: Section }

export function CaseStudySection({ section }: Props) {
  const scenario = (section.content?.scenario as string) ?? '';
  const question = (section.content?.question as string) ?? '';
  const hint = (section.content?.hint as string) ?? '';

  return (
    <div className="rounded-xl border-l-4 border-orange-400 bg-orange-50 p-6 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl">📋</span>
        <h3 className="font-bold text-gray-900">Estudo de Caso</h3>
      </div>
      {scenario ? (
        <p className="mb-4 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{scenario}</p>
      ) : (
        <p className="mb-4 text-sm text-gray-400">Cenário não configurado.</p>
      )}
      {question && (
        <div className="rounded-lg bg-white p-4 border border-orange-200">
          <p className="font-medium text-gray-800">❓ {question}</p>
        </div>
      )}
      {hint && (
        <p className="mt-3 text-xs text-orange-600">💡 Dica: {hint}</p>
      )}
    </div>
  );
}
