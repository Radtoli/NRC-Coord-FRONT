"use client";

import { useAuthContext } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserManagement } from '@/components/admin/UserManagement';
import { ArrowLeft, Users, Settings, Shield, LogOut } from 'lucide-react';

export default function UsersManagementPage() {
  const { isAuthenticated, isLoading, isManager, user, logout } = useAuthContext();
  const router = useRouter();

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

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

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
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Painel Admin
            </Button>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Settings className="h-4 w-4" />
              Admin
              <span>/</span>
              <Users className="h-4 w-4" />
              Usuários
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-medium">{user?.name}</span>
              <Badge variant="default" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Manager
              </Badge>
            </div>

            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
            <p className="text-gray-600 mt-2">
              Visualize, crie, edite e remova usuários do sistema. Gerencie permissões e roles de acesso.
            </p>
          </div>

          {/* Main Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários do Sistema
              </CardTitle>
              <CardDescription>
                Controle total sobre os usuários, suas permissões e status de acesso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>

          {/* Info Section */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Importantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-foreground mb-3">Níveis de Acesso:</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span><strong>Usuário:</strong> Pode assistir vídeos e baixar documentos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      <span><strong>Manager:</strong> Pode gerenciar usuários e acessar área administrativa</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-3">Funcionalidades Disponíveis:</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Criar novos usuários na plataforma</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Editar informações de usuários existentes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Alterar níveis de permissão (user/manager)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Remover usuários do sistema</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}