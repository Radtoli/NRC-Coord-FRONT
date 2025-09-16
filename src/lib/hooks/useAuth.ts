import { useState, useEffect } from 'react';
import { authService } from '../services';
import { AuthUser } from '../auth';

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
        const user = authService.getCurrentUser();
        setAuthState({
          user: user ? {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          } : null,
          isAuthenticated: !!user,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
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

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
          role: response.data.user.role
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
      console.error('Login error:', error);
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