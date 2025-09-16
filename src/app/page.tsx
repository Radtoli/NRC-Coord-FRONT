"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/lib/context";

export default function Home() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuthContext();

  useEffect(() => {
    // Aguardar o carregamento terminar antes de redirecionar
    if (isLoading) {
      console.log('[DEBUG HOME] Still loading, waiting...');
      return;
    }

    console.log('[DEBUG HOME] Loading finished, checking auth state');
    console.log('[DEBUG HOME] isAuthenticated:', isAuthenticated, 'user:', user);

    if (isAuthenticated && user) {
      console.log('[DEBUG HOME] User authenticated, redirecting to dashboard');
      router.push("/dashboard");
    } else {
      console.log('[DEBUG HOME] User not authenticated, redirecting to login');
      // Limpar qualquer dado corrompido antes de ir para login
      localStorage.removeItem('auth');
      router.push("/login");
    }
  }, [router, isAuthenticated, user, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecionando...</p>
      </div>
    </div>
  );
}
