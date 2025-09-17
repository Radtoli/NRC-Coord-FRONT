"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuthContext } from "@/lib/context";
import {
  LogOut,
  Settings,
  User,
  BookOpen,
  Home,
  KeyRound,
  RefreshCw
} from "lucide-react";
import { ChangePasswordForm } from "./ChangePasswordForm";

interface AppHeaderProps {
  title?: string;
  showBackToDashboard?: boolean;
  showRefresh?: boolean;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
  children?: React.ReactNode;
}

export function AppHeader({
  title = "Portal do Corretor",
  showBackToDashboard = true,
  showRefresh = false,
  onRefresh,
  isRefreshing = false,
  children
}: AppHeaderProps) {
  const router = useRouter();
  const { user: currentUser, logout, isManager } = useAuthContext();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handleAdminAccess = () => {
    router.push("/admin/users");
  };

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
  };

  const isAdmin = isManager();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            {title}
          </h1>
          {children && (
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              {children}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {showBackToDashboard && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToDashboard}
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          )}

          {showRefresh && onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          )}

          <div className="hidden md:flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">{currentUser?.name}</span>
            <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
              {isAdmin ? "Admin" : "Usuário"}
            </Badge>
          </div>

          {/* Botão para redefinir senha */}
          <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <KeyRound className="w-4 h-4 mr-2" />
                Alterar Senha
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Alterar Senha</DialogTitle>
                <DialogDescription>
                  Digite sua senha atual e a nova senha que deseja usar.
                </DialogDescription>
              </DialogHeader>
              <ChangePasswordForm
                onSuccess={() => setIsChangePasswordOpen(false)}
                onCancel={() => setIsChangePasswordOpen(false)}
              />
            </DialogContent>
          </Dialog>

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
  );
}