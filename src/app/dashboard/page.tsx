"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoCard } from "@/components/VideoCard";
import { trilhas } from "@/config/trilhas";
import { getCurrentUser, logout, hasAdminRole, AuthUser } from "@/lib/auth";
import { LogOut, Settings, User, Play, BookOpen } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setCurrentUser(user);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleAdminAccess = () => {
    router.push("/admin/users");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const totalVideos = trilhas.reduce((acc, trilha) => acc + trilha.videos.length, 0);
  const isAdmin = hasAdminRole();

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
              </div>
            ))}
          </div>

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