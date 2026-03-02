'use client';

import { Section } from '@/lib/services/ava.service';

interface Props { section: Section }

export function FinalMessageSection({ section }: Props) {
  const message = (section.content?.message as string) ?? '';
  const emoji = (section.content?.emoji as string) ?? '🎉';
  const cta = (section.content?.cta as string) ?? '';

  return (
    <div className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white shadow-lg">
      <div className="mb-3 text-6xl">{emoji}</div>
      <h2 className="mb-3 text-2xl font-bold">
        {message || 'Parabéns! Você concluiu esta página.'}
      </h2>
      {cta && (
        <p className="text-sm text-blue-200">{cta}</p>
      )}
    </div>
  );
}
