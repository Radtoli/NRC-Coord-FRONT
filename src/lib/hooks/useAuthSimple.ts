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
        await new Promise(resolve => setTimeout(resolve, 100));

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

        if (!userData._id || !userData.name || !userData.email) {
          localStorage.removeItem('auth');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        const user: AuthUser = {
          _id: userData._id || userData.userId,
          name: userData.name,
          email: userData.email,
          role: userData.role
        };

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

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth') {
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

      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        const user: AuthUser = {
          _id: response.data.user._id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.roles && response.data.user.roles.length > 0
            ? response.data.user.roles[0]
            : 'user'
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
      console.error('[DEBUG SIMPLE] Login error:', error);
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