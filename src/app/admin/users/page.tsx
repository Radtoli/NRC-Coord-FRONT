"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserTable } from "@/components/UserTable";
import { users as initialUsers, User } from "@/config/users";
import { getCurrentUser, logout, requireAdmin, AuthUser } from "@/lib/auth";
import { ArrowLeft, LogOut, User as UserIcon, Shield, AlertCircle } from "lucide-react";

export default function AdminUsersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    try {
      const user = getCurrentUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Verifica se é admin
      requireAdmin();
      setCurrentUser(user);
      setIsLoading(false);
    } catch {
      setError("Acesso negado. Apenas administradores podem acessar esta página.");
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    }
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleCreateUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: (users.length + 1).toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, newUser]);
  };

  const handleUpdateUser = (id: string, userData: Partial<User>) => {
    setUsers(users.map(user =>
      user.id === id ? { ...user, ...userData } : user
    ));
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            Redirecionando para o dashboard...
          </p>
        </div>
      </div>
    );
  }

  const adminCount = users.filter(user => user.role === 'admin').length;
  const userCount = users.filter(user => user.role === 'user').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold">Administração</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{currentUser?.name}</span>
              <Badge variant="default" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Admin
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
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">Painel de Administração</h2>
            <p className="text-muted-foreground max-w-2xl">
              Gerencie usuários da plataforma, altere permissões e controle o acesso aos conteúdos.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <UserIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <div className="text-sm text-muted-foreground">Total de Usuários</div>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-3 rounded-lg">
                  <UserIcon className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{userCount}</div>
                  <div className="text-sm text-muted-foreground">Usuários Comuns</div>
                </div>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <Shield className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{adminCount}</div>
                  <div className="text-sm text-muted-foreground">Administradores</div>
                </div>
              </div>
            </div>
          </div>

          {/* User Management Table */}
          <div className="bg-card border rounded-lg p-6">
            <UserTable
              users={users}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          </div>

          {/* Info Section */}
          <div className="bg-muted/50 border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Informações Importantes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <h4 className="font-medium text-foreground mb-2">Níveis de Acesso:</h4>
                <ul className="space-y-1">
                  <li>• <strong>Usuário:</strong> Pode assistir vídeos e baixar documentos</li>
                  <li>• <strong>Administrador:</strong> Pode gerenciar usuários e acessar esta área</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Funcionalidades:</h4>
                <ul className="space-y-1">
                  <li>• Criar novos usuários na plataforma</li>
                  <li>• Editar informações de usuários existentes</li>
                  <li>• Alterar níveis de permissão</li>
                  <li>• Remover usuários do sistema</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}