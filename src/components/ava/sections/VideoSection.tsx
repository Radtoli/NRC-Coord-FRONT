'use client';

import { Section } from '@/lib/services/ava.service';

interface Props { section: Section }

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    return u.searchParams.get('v');
  } catch {
    return null;
  }
}

export function VideoSection({ section }: Props) {
  const url = (section.content?.url as string) ?? (section.config?.url as string) ?? '';
  const title = (section.content?.title as string) ?? section.title;
  const description = section.content?.description as string | undefined;

  const youtubeId = getYouTubeId(url);

  if (!url) {
    return (
      <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-400">
        Vídeo não configurado.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {youtubeId ? (
        <div className="aspect-video w-full overflow-hidden rounded-xl">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <video controls className="w-full rounded-xl" src={url}>
          Seu navegador não suporta vídeos HTML5.
        </video>
      )}
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
  );
}
