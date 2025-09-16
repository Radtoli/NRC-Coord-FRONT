"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoCard } from "@/components/VideoCard";
import { Trilha, getTrilhas } from "@/config/trilhas";
import { useAuthContext } from "@/lib/context";
import { LogOut, Settings, User, Play, BookOpen, AlertCircle, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user: currentUser, isAuthenticated, logout, isManager, isLoading: authLoading } = useAuthContext();
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [isLoadingTrilhas, setIsLoadingTrilhas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Esperar o loading de auth terminar antes de verificar autenticação
    if (authLoading) {
      console.log('[DEBUG DASHBOARD] Auth still loading...');
      return;
    }

    if (!isAuthenticated || !currentUser) {
      console.log('[DEBUG DASHBOARD] Not authenticated, redirecting to login');
      router.push("/login");
      return;
    }

    console.log('[DEBUG DASHBOARD] User authenticated:', currentUser);

    const loadTrilhas = async () => {
      try {
        setIsLoadingTrilhas(true);
        setError(null);
        console.log('[DEBUG DASHBOARD] Loading trilhas...');
        const trilhasData = await getTrilhas();
        console.log('[DEBUG DASHBOARD] Trilhas loaded:', trilhasData);
        setTrilhas(trilhasData);
      } catch (error) {
        console.error('Erro ao carregar trilhas:', error);
        setError('Erro ao carregar dados. Tente novamente.');
      } finally {
        setIsLoadingTrilhas(false);
      }
    };

    loadTrilhas();
  }, [router, isAuthenticated, currentUser, authLoading]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleAdminAccess = () => {
    router.push("/admin/users");
  };

  const handleRefreshTrilhas = async () => {
    try {
      setIsLoadingTrilhas(true);
      setError(null);
      const trilhasData = await getTrilhas();
      setTrilhas(trilhasData);
    } catch (error) {
      console.error('Erro ao carregar trilhas:', error);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setIsLoadingTrilhas(false);
    }
  };

  if (authLoading || isLoadingTrilhas) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {authLoading ? 'Carregando autenticação...' : 'Carregando trilhas...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Erro ao carregar dados</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={handleRefreshTrilhas}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const totalVideos = trilhas.reduce((acc, trilha) => acc + trilha.videos.length, 0);
  const isAdmin = isManager();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              Portal do Corretor
            </h1>
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="outline">
                {trilhas.length} trilha{trilhas.length !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline">
                <Play className="w-3 h-3 mr-1" />
                {totalVideos} vídeo{totalVideos !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshTrilhas}
              disabled={isLoadingTrilhas}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingTrilhas ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>

            <div className="hidden md:flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">{currentUser?.name}</span>
              <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
                {isAdmin ? "Admin" : "Usuário"}
              </Badge>
            </div>

            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdminAccess}
                className="hidden md:flex"
              >
                <Settings className="w-4 h-4 mr-2" />
                Administração
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">
              Bem-vindo, {currentUser?.name}!
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore os treinamentos e possibilidades de se aprofundar e melhorar sua trajetória como corretor do NRC.
            </p>
            <div className="flex justify-center gap-4 md:hidden">
              <Badge variant="outline">
                {trilhas.length} trilha{trilhas.length !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="outline">
                <Play className="w-3 h-3 mr-1" />
                {totalVideos} vídeo{totalVideos !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>

          {/* Trilhas Section */}
          {trilhas.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma trilha encontrada</h3>
              <p className="text-muted-foreground">
                Não há trilhas de treinamento disponíveis no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {trilhas.map((trilha) => (
                <div key={trilha.id} className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold">{trilha.title}</h3>
                      <Badge variant="secondary">
                        {trilha.videos.length} vídeo{trilha.videos.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {trilha.description}
                    </p>
                  </div>

                  {/* Videos Horizontais */}
                  {trilha.videos.length === 0 ? (
                    <div className="text-center py-8 bg-muted/50 rounded-lg">
                      <Play className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Nenhum vídeo disponível nesta trilha.
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="w-full whitespace-nowrap">
                      <div className="flex gap-4 pb-4">
                        {trilha.videos.map((video) => (
                          <VideoCard
                            key={video.id}
                            video={video}
                            className="w-80 flex-shrink-0"
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t">
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{trilhas.length}</div>
              <div className="text-sm text-muted-foreground">
                Trilha{trilhas.length !== 1 ? 's' : ''} Disponível{trilhas.length !== 1 ? 'eis' : ''}
              </div>
            </div>
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{totalVideos}</div>
              <div className="text-sm text-muted-foreground">
                Vídeo{totalVideos !== 1 ? 's' : ''} de Treinamento
              </div>
            </div>
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {trilhas.reduce((acc, trilha) =>
                  acc + trilha.videos.reduce((docAcc, video) => docAcc + video.documents.length, 0), 0
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Documentos para Download
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}