interface VideoPlayerProps {
  youtubeId: string;
  title: string;
  className?: string;
}

export function VideoPlayer({ youtubeId, title, className }: VideoPlayerProps) {
  return (
    <div className={`relative aspect-video bg-black rounded-lg overflow-hidden ${className || ''}`}>
      <iframe
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}