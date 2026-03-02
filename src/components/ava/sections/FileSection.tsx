'use client';

import { Section } from '@/lib/services/ava.service';

interface Props { section: Section }

export function FileSection({ section }: Props) {
  const url = (section.content?.url as string) ?? (section.config?.url as string) ?? '';
  const fileName = (section.content?.fileName as string) ?? 'Arquivo';
  const description = section.content?.description as string | undefined;

  if (!url) {
    return (
      <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-400">
        Arquivo não configurado.
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-2xl">
        📄
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-800 truncate">{fileName}</p>
        {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Baixar / Abrir
        </a>
      </div>
    </div>
  );
}
