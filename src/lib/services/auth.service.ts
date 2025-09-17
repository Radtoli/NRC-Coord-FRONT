import { api, ApiResponse, LoginRequest, CreateUserRequest, UpdateUserRequest, ChangePasswordRequest, User } from '../api';
import { isTokenExpired } from '../utils/jwt-utils';

interface LoginResponse {
  user: User;
  token: string;
  expiresIn: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post<ApiResponse<LoginResponse>>('/users/auth/login', credentials);

    if (response.success && response.data) {
      const { user, token } = response.data;

      const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'user';

      const userWithToken = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: primaryRole,
        token: token
      };

      localStorage.setItem('auth', JSON.stringify(userWithToken));
    }

    return response;
  },

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> {
    return api.patch<ApiResponse<{ message: string }>>('/users/auth/change-password', data);
  },

  logout(): void {
    localStorage.removeItem('auth');
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const authData = localStorage.getItem('auth');
    if (!authData) return false;

    try {
      const user = JSON.parse(authData);
      if (!user.token || isTokenExpired(user.token)) {
        localStorage.removeItem('auth');
        return false;
      }
      return true;
    } catch {
      localStorage.removeItem('auth');
      return false;
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const authData = localStorage.getItem('auth');

    if (!authData) {
      return null;
    }

    try {
      const user = JSON.parse(authData);

      if (!user.token) {
        localStorage.removeItem('auth');
        return null;
      }

      const isExpired = isTokenExpired(user.token);

      if (isExpired) {
        localStorage.removeItem('auth');
        return null;
      }

      return user;
    } catch {
      localStorage.removeItem('auth');
      return null;
    }
  },

  isManager(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'manager';
  }
};

export const userService = {
  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return api.post<ApiResponse<User>>('/users/users', userData);
  },

  async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    return api.put<ApiResponse<User>>(`/users/users/${id}`, userData);
  },

  async listUsers(): Promise<ApiResponse<User[]>> {
    return api.get<ApiResponse<User[]>>('/users/users');
  },

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return api.get<ApiResponse<User>>(`/users/users/${id}`);
  }
};