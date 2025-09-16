import { authService } from './services';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'manager';
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
}

// Mock do estado de autenticação - em uma aplicação real seria gerenciado por contexto/redux
let authState: AuthState = {
  isAuthenticated: false,
  user: null
};

export const login = async (email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
  try {
    const response = await authService.login({ email, password });

    if (response.success && response.data) {
      const { user } = response.data;

      const authUser: AuthUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: (user.roles && user.roles.length > 0)
          ? user.roles[0]
          : (user.role || 'user')
      };

      authState = {
        isAuthenticated: true,
        user: authUser
      };

      return { success: true, user: authUser };
    } else {
      return { success: false, error: response.message || 'Erro no login' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro no servidor'
    };
  }
};

export const logout = (): void => {
  authState = {
    isAuthenticated: false,
    user: null
  };

  authService.logout();
};

export const getCurrentUser = (): AuthUser | null => {
  // Verifica se há dados salvos no localStorage
  if (typeof window !== 'undefined' && !authState.user) {
    const user = authService.getCurrentUser();
    if (user) {
      const authUser: AuthUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: (user.roles && user.roles.length > 0)
          ? user.roles[0]
          : (user.role || 'user')
      };

      authState = {
        isAuthenticated: true,
        user: authUser
      };

      return authUser;
    } else {
      // Se getCurrentUser retornou null (por token expirado), limpar estado
      authState = {
        isAuthenticated: false,
        user: null
      };
    }
  }

  return authState.user;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const hasAdminRole = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'manager';
};

export const requireAuth = (): AuthUser => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Usuário não autenticado');
  }
  return user;
};

export const requireAdmin = (): AuthUser => {
  const user = requireAuth();
  if (user.role !== 'manager') {
    throw new Error('Acesso negado. Apenas administradores podem acessar esta funcionalidade.');
  }
  return user;
};