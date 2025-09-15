import { getUserByEmail } from '@/config/users';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
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
  // Simula delay de API
  await new Promise(resolve => setTimeout(resolve, 1000));

  const user = getUserByEmail(email);

  if (!user) {
    return { success: false, error: 'Usuário não encontrado' };
  }

  if (user.password !== password) {
    return { success: false, error: 'Senha incorreta' };
  }

  const authUser: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  authState = {
    isAuthenticated: true,
    user: authUser
  };

  // Em uma aplicação real, salvaria o token no localStorage/cookies
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth', JSON.stringify(authUser));
  }

  return { success: true, user: authUser };
};

export const logout = (): void => {
  authState = {
    isAuthenticated: false,
    user: null
  };

  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth');
  }
};

export const getCurrentUser = (): AuthUser | null => {
  // Verifica se há dados salvos no localStorage
  if (typeof window !== 'undefined' && !authState.user) {
    const saved = localStorage.getItem('auth');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        authState = {
          isAuthenticated: true,
          user
        };
        return user;
      } catch {
        localStorage.removeItem('auth');
      }
    }
  }

  return authState.user;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const hasAdminRole = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
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
  if (user.role !== 'admin') {
    throw new Error('Acesso negado. Apenas administradores podem acessar esta funcionalidade.');
  }
  return user;
};