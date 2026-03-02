'use client';

import { Section } from '@/lib/services/ava.service';

interface Props { section: Section }

export function MindmapSection({ section }: Props) {
  const imageUrl = (section.content?.imageUrl as string) ?? (section.config?.imageUrl as string) ?? '';
  const description = (section.content?.description as string) ?? '';

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl">🗺️</span>
        <h3 className="font-bold text-gray-900">Mapa Mental</h3>
      </div>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={section.title}
          className="w-full rounded-lg object-contain max-h-[600px]"
        />
      ) : (
        <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-400">
          Imagem do mapa mental não configurada.
        </div>
      )}
      {description && <p className="mt-3 text-sm text-gray-600">{description}</p>}
    </div>
  );
}
