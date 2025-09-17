"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/VideoPlayer";
import { SidebarVideos } from "@/components/SidebarVideos";
import { DownloadDocs } from "@/components/DownloadDocs";
import { AppHeader } from "@/components/AppHeader";
import { getVideoById, getTrilhaByVideoId, Video, Trilha } from "@/config/trilhas";
import { useAuthContext } from "@/lib/context";
import { ArrowLeft, Clock, Calendar, AlertCircle } from "lucide-react";

export default function VideoPage() {
  const router = useRouter();
  const params = useParams();
  const videoId = params?.id as string;
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuthContext();

  const [video, setVideo] = useState<Video | null>(null);
  const [trilha, setTrilha] = useState<Trilha | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !currentUser) {
      router.push("/login");
      return;
    }

    // Buscar dados do vídeo e trilha
    const loadVideoData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [videoData, trilhaData] = await Promise.all([
          getVideoById(videoId),
          getTrilhaByVideoId(videoId)
        ]);

        if (!videoData) {
          setError('Vídeo não encontrado');
          return;
        }

        if (!trilhaData) {
          setError('Trilha não encontrada');
          return;
        }

        setVideo(videoData);
        setTrilha(trilhaData);
      } catch (error) {
        console.error('Erro ao carregar dados do vídeo:', error);
        setError('Erro ao carregar dados. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    loadVideoData();
  }, [router, videoId, isAuthenticated, currentUser, authLoading]);

  useEffect(() => {
    if (!isLoading && error) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, error, router]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {authLoading ? 'Carregando autenticação...' : 'Carregando vídeo...'}
          </p>
        </div>
      </div>
    );
  }

  if (error || !video || !trilha) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Erro ao carregar vídeo</h2>
          <p className="text-muted-foreground">{error || 'Vídeo não encontrado'}</p>
          <p className="text-sm text-muted-foreground">Redirecionando para o dashboard...</p>
          <Button onClick={() => router.push("/dashboard")}>
            Ir para Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const videoIndex = trilha.videos.findIndex(v => v.id === videoId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader title="Portal do Corretor">
        <Badge variant="outline">{trilha.title}</Badge>
        <Badge variant="outline">
          Vídeo {videoIndex + 1} de {trilha.videos.length}
        </Badge>
      </AppHeader>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Video Content - 3 columns */}
          <div className="xl:col-span-3 space-y-6">
            {/* Video Player */}
            <div className="space-y-4">
              <VideoPlayer
                youtubeId={video.youtubeId}
                title={video.title}
                className="w-full"
              />

              {/* Video Info */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {video.duration}
                      </Badge>
                      <Badge variant="outline">
                        Vídeo {videoIndex + 1} de {trilha.videos.length}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Trilha: {trilha.title}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {video.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Download Documents */}
            <DownloadDocs documents={video.documents} />
          </div>

          {/* Sidebar - 1 column */}
          <div className="xl:col-span-1">
            <div className="xl:sticky xl:top-24">
              <SidebarVideos videos={trilha.videos} trilhaTitle={trilha.title} />
            </div>
          </div>
        </div>

        {/* Navigation Between Videos */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <div>
            {videoIndex > 0 && (
              <Button
                variant="outline"
                onClick={() => router.push(`/video/${trilha.videos[videoIndex - 1].id}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Vídeo Anterior
              </Button>
            )}
          </div>
          <div>
            {videoIndex < trilha.videos.length - 1 && (
              <Button
                onClick={() => router.push(`/video/${trilha.videos[videoIndex + 1].id}`)}
              >
                Próximo Vídeo
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}