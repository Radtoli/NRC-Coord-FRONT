import { api, ApiResponse, LoginRequest, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest, User } from '../api';

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
    const response = await api.post<ApiResponse<LoginResponse>>('/users/auth/login', credentials);

    // Salvar token no localStorage se o login for bem-sucedido
    if (response.success && response.data) {
      const { user, token } = response.data;
      localStorage.setItem('auth', JSON.stringify({ ...user, token }));
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
    return !!authData;
  },

  // Obter usuário atual
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const authData = localStorage.getItem('auth');
    if (!authData) return null;

    try {
      return JSON.parse(authData);
    } catch {
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