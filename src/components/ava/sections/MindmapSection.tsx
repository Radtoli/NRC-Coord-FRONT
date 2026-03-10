'use client';

import { Section } from '@/lib/services/ava.service';

interface Props { section: Section }

/**
 * Converts a Google Drive share URL to a direct image URL.
 * Input:  https://drive.google.com/file/d/FILE_ID/view
 * Output: https://drive.google.com/uc?export=view&id=FILE_ID
 */
function convertImageUrl(url: string): string {
  const driveShare = url.match(
    /https:\/\/drive\.google\.com\/file\/d\/([^/?#]+)/
  );
  if (driveShare) {
    return `https://drive.google.com/uc?export=view&id=${driveShare[1]}`;
  }
  return url;
}

export function MindmapSection({ section }: Props) {
  const rawUrl =
    (section.content?.imageUrl as string) ??
    (section.config?.imageUrl as string) ??
    '';
  const imageUrl = rawUrl ? convertImageUrl(rawUrl.trim()) : '';
  const description = (section.content?.description as string) ?? '';

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl">🖼️</span>
        <h3 className="font-bold text-gray-900">Visualizador de Imagem</h3>
      </div>

      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={section.title || 'Imagem'}
          className="w-full rounded-lg object-contain max-h-[600px]"
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = 'none';
            const parent = el.parentElement;
            if (parent) {
              const msg = document.createElement('p');
              msg.className = 'text-sm text-red-500 text-center py-6';
              msg.textContent =
                'Não foi possível carregar a imagem. Verifique se o link está correto e acessível publicamente.';
              parent.appendChild(msg);
            }
          }}
        />
      ) : (
        <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-400">
          Nenhuma imagem configurada. Cole uma URL de imagem direta ou link do Google Drive na edição da seção.
        </div>
      )}

      {description && <p className="mt-3 text-sm text-gray-600">{description}</p>}
    </div>
  );
}
