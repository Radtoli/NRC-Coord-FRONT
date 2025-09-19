import { useState, useEffect } from 'react';
import { authService } from '../services';
import { AuthUser } from '../auth';
import { isTokenExpired } from '../utils/jwt-utils';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = () => {
      try {
        const authData = localStorage.getItem('auth');
        if (!authData) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        const userData = JSON.parse(authData);
        if (!userData.token) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        if (isTokenExpired(userData.token)) {
          localStorage.removeItem('auth');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        const user: AuthUser = {
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role
        };

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem('auth');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();

    // Listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth') {
        initAuth();
      }
    };

    // Verificar token expirado a cada minuto
    const tokenCheckInterval = setInterval(() => {
      const authData = localStorage.getItem('auth');
      if (authData) {
        try {
          const user = JSON.parse(authData);
          if (user.token && isTokenExpired(user.token)) {
            authService.logout();
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch {
        }
      }
    }, 60000); // Verificar a cada minuto

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(tokenCheckInterval);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        const user: AuthUser = {
          _id: response.data.user._id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: (response.data.user.roles && response.data.user.roles.length > 0)
            ? response.data.user.roles[0]
            : (response.data.user.role || 'user')
        };

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true, user };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: response.message || 'Erro no login' };
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no servidor'
      };
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const isManager = () => {
    return authState.user?.role === 'manager';
  };

  return {
    ...authState,
    login,
    logout,
    isManager,
  };
};