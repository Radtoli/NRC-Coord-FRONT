import { useState, useEffect } from 'react';
import { authService } from '../services';
import { AuthUser } from '../auth';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuthSimple = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('[DEBUG SIMPLE] Initializing auth...');

        // Aguardar um pequeno delay para evitar race conditions
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verificar se há dados no localStorage
        const authData = localStorage.getItem('auth');
        console.log('[DEBUG SIMPLE] Auth data:', authData);

        if (!authData) {
          console.log('[DEBUG SIMPLE] No auth data found');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        const userData = JSON.parse(authData);
        console.log('[DEBUG SIMPLE] Parsed user data:', userData);

        if (!userData.token) {
          console.log('[DEBUG SIMPLE] No token found');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        // Verificar se os dados essenciais do usuário estão presentes
        if (!userData._id || !userData.name || !userData.email) {
          console.log('[DEBUG SIMPLE] Incomplete user data found, clearing localStorage');
          localStorage.removeItem('auth');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        // Por agora, não vamos verificar expiração - apenas se o token existe
        const user: AuthUser = {
          _id: userData._id || userData.userId, // Fallback para userId se _id não existir
          name: userData.name,
          email: userData.email,
          role: userData.role
        };

        console.log('[DEBUG SIMPLE] Setting authenticated user:', user);
        console.log('[DEBUG SIMPLE] User has all required fields?', {
          _id: !!user._id,
          name: !!user.name,
          email: !!user.email,
          role: !!user.role
        });

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('[DEBUG SIMPLE] Error initializing auth:', error);
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
        console.log('[DEBUG SIMPLE] Storage changed, reinitializing...');
        initAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      console.log('[DEBUG SIMPLE] Starting login process');
      const response = await authService.login({ email, password });
      console.log('[DEBUG SIMPLE] Login response:', response);
      console.log('[DEBUG SIMPLE] Response data:', response.data);
      console.log('[DEBUG SIMPLE] User object:', response.data?.user);

      if (response.success && response.data) {
        const user: AuthUser = {
          _id: response.data.user._id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.roles && response.data.user.roles.length > 0 
            ? response.data.user.roles[0] 
            : 'user'
        };

        console.log('[DEBUG SIMPLE] Setting authenticated user after login:', user);
        console.log('[DEBUG SIMPLE] Raw user data from response:', response.data.user);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true, user };
      } else {
        console.log('[DEBUG SIMPLE] Login failed:', response.message);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: response.message || 'Erro no login' };
      }
    } catch (error) {
      console.error('[DEBUG SIMPLE] Login error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro no servidor'
      };
    }
  };

  const logout = () => {
    console.log('[DEBUG SIMPLE] Logging out...');
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