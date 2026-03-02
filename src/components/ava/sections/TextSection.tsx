'use client';

import { Section } from '@/lib/services/ava.service';

interface Props { section: Section }

export function TextSection({ section }: Props) {
  const html = (section.content?.html as string) ?? (section.content?.text as string) ?? '';

  if (!html) {
    return (
      <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-400">
        Conteúdo de texto não configurado.
      </div>
    );
  }

  return (
    <div
      className="prose prose-sm max-w-none text-gray-800"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
