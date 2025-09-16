import React from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ApiErrorBoundaryProps {
  error?: string | null;
  isLoading?: boolean;
  onRetry?: () => void;
  fallbackComponent?: React.ReactNode;
  showConnectivity?: boolean;
}

export const ApiErrorBoundary: React.FC<ApiErrorBoundaryProps> = ({
  error,
  isLoading = false,
  onRetry,
  fallbackComponent,
  showConnectivity = true
}) => {
  if (!error) return null;

  const isNetworkError = error.toLowerCase().includes('network') ||
    error.toLowerCase().includes('fetch') ||
    error.toLowerCase().includes('connection');

  const isAuthError = error.toLowerCase().includes('auth') ||
    error.toLowerCase().includes('token') ||
    error.toLowerCase().includes('unauthorized');

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      {isNetworkError ? (
        <WifiOff className="w-16 h-16 text-muted-foreground" />
      ) : (
        <AlertCircle className="w-16 h-16 text-destructive" />
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">
          {isNetworkError ? 'Problema de Conexão' :
            isAuthError ? 'Problema de Autenticação' :
              'Erro na Aplicação'}
        </h3>

        <p className="text-muted-foreground max-w-md">
          {isNetworkError ?
            'Verifique sua conexão com a internet e tente novamente.' :
            isAuthError ?
              'Sua sessão pode ter expirado. Faça login novamente.' :
              error}
        </p>
      </div>

      {showConnectivity && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {navigator.onLine ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <span>Conectado à internet</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-500" />
              <span>Sem conexão com a internet</span>
            </>
          )}
        </div>
      )}

      {onRetry && (
        <Button
          onClick={onRetry}
          disabled={isLoading}
          className="min-w-32"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Tentando...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </>
          )}
        </Button>
      )}

      {fallbackComponent}
    </div>
  );
};