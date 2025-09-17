'use client';

import { useAuthContext } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DocumentManagement } from '@/components/admin/DocumentManagement';
import { TrilhaManagement } from '@/components/admin/TrilhaManagement';
import { VideoManagement } from '@/components/admin/VideoManagement';
import { AppHeader } from '@/components/AppHeader';
import { FileText, Video, Users, BookOpen, Settings, ExternalLink } from 'lucide-react';

export default function AdminPage() {
  const { isAuthenticated, isLoading, isManager } = useAuthContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (!isManager()) {
        router.push('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, isLoading, isManager, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isManager()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader title="Painel Administrativo" />

      {/* Main Content */}
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mt-2">
                Gerencie todos os recursos do sistema
              </p>
            </div>

            <Button
              onClick={() => router.push('/admin/users')}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Gerência Geral
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Vídeos
            </TabsTrigger>
            <TabsTrigger value="trilhas" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Trilhas
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>
                  Visualize, crie, edite e remova usuários do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Gerenciamento Completo de Usuários</h3>
                  <p className="text-muted-foreground mb-4">
                    Acesse a página dedicada para gerenciar usuários com interface completa
                  </p>
                  <Button
                    onClick={() => router.push('/admin/users')}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Ir para Gerência de Usuários
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Vídeos</CardTitle>
                <CardDescription>
                  Visualize, crie, edite e remova vídeos do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VideoManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trilhas" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Trilhas</CardTitle>
                <CardDescription>
                  Visualize, crie, edite e remova trilhas de aprendizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TrilhaManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Documentos</CardTitle>
                <CardDescription>
                  Visualize, crie, edite e remova documentos do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}