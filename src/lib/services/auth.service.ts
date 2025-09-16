import { api, ApiResponse, LoginRequest, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest, User } from '../api';
import { isTokenExpired } from '../utils/jwt-utils';

// Interface para o response do login
interface LoginResponse {
  user: User;
  token: string;
  expiresIn: string;
}

// Serviços de autenticação
export const authService = {
  // Login do usuário
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    console.log('[DEBUG authService] Making login request with:', credentials);

    const response = await api.post<ApiResponse<LoginResponse>>('/users/auth/login', credentials);

    console.log('[DEBUG authService] Raw API response:', response);
    console.log('[DEBUG authService] Response success:', response.success);
    console.log('[DEBUG authService] Response data:', response.data);
    console.log('[DEBUG authService] Response data stringified:', JSON.stringify(response.data, null, 2));

    // Salvar token no localStorage se o login for bem-sucedido
    if (response.success && response.data) {
      const { user, token } = response.data;
      console.log('[DEBUG authService] User data from API:', user);
      console.log('[DEBUG authService] User stringified:', JSON.stringify(user, null, 2));
      console.log('[DEBUG authService] User properties:', {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions
      });
      console.log('[DEBUG authService] Token:', token);

      // Mapear roles array para role string (pegar o primeiro role)
      const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'user';

      // Salvar dados completos do usuário com token
      const userWithToken = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: primaryRole, // Converter array de roles para string
        token: token
      };

      console.log('[DEBUG authService] Saving to localStorage:', userWithToken);
      localStorage.setItem('auth', JSON.stringify(userWithToken));
    }

    return response;
  },

  // Trocar senha
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> {
    return api.patch<ApiResponse<{ message: string }>>('/users/auth/change-password', data);
  },

  // Logout
  logout(): void {
    localStorage.removeItem('auth');
  },

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const authData = localStorage.getItem('auth');
    if (!authData) return false;

    try {
      const user = JSON.parse(authData);
      // Verificar se o token existe e não está expirado
      if (!user.token || isTokenExpired(user.token)) {
        // Token expirado ou inválido, limpar dados
        localStorage.removeItem('auth');
        return false;
      }
      return true;
    } catch {
      localStorage.removeItem('auth');
      return false;
    }
  },

  // Obter usuário atual
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const authData = localStorage.getItem('auth');
    console.log('[DEBUG getCurrentUser] Auth data:', authData);

    if (!authData) {
      console.log('[DEBUG getCurrentUser] No auth data found');
      return null;
    }

    try {
      const user = JSON.parse(authData);
      console.log('[DEBUG getCurrentUser] Parsed user:', user);
      console.log('[DEBUG getCurrentUser] Has token:', !!user.token);

      // Verificar se o token existe e não está expirado
      if (!user.token) {
        console.log('[DEBUG getCurrentUser] No token found, clearing auth');
        localStorage.removeItem('auth');
        return null;
      }

      const isExpired = isTokenExpired(user.token);
      console.log('[DEBUG getCurrentUser] Token is expired:', isExpired);

      if (isExpired) {
        // Token expirado ou inválido, limpar dados
        console.log('[DEBUG getCurrentUser] Token expired, clearing auth');
        localStorage.removeItem('auth');
        return null;
      }

      console.log('[DEBUG getCurrentUser] Returning valid user');
      return user;
    } catch (error) {
      console.error('[DEBUG getCurrentUser] Error parsing auth data:', error);
      localStorage.removeItem('auth');
      return null;
    }
  },

  // Verificar se é manager/admin
  isManager(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'manager';
  }
};

// Serviços de usuário
export const userService = {
  // Criar usuário (apenas managers)
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return api.post<ApiResponse<User>>('/users/users', userData);
  },

  // Atualizar usuário (apenas managers)
  async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    return api.put<ApiResponse<User>>(`/users/users/${id}`, userData);
  },

  // Listar todos os usuários (seria necessário adicionar essa rota no backend)
  async listUsers(): Promise<ApiResponse<User[]>> {
    return api.get<ApiResponse<User[]>>('/users/users');
  },

  // Buscar usuário por ID (seria necessário adicionar essa rota no backend)
  async getUserById(id: string): Promise<ApiResponse<User>> {
    return api.get<ApiResponse<User>>(`/users/users/${id}`);
  }
};