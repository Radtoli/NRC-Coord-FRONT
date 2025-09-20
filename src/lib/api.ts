const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

// Interface para erros da API
interface ApiError {
  success: false;
  message: string;
  statusCode?: number;
}

// Classe para gerenciar chamadas à API
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    const authData = localStorage.getItem('auth');
    if (!authData) return null;

    try {
      const parsed = JSON.parse(authData);
      return parsed.token || null;
    } catch {
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Normalizar a baseURL - remover trailing slash se existir
    const normalizedBaseURL = this.baseURL.endsWith('/')
      ? this.baseURL.slice(0, -1)
      : this.baseURL;

    // Normalizar o endpoint - garantir que comece com /
    const normalizedEndpoint = endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;

    const url = `${normalizedBaseURL}${normalizedEndpoint}`;
    const token = this.getAuthToken();

    try {
      new URL(url);
    } catch {
      throw new Error(`URL inválida construída: ${url}`);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Adicionar headers extras se fornecidos
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      const data = await response.json();

      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.get('/users/health');
  }
}

// Instância global da API
export const api = new ApiClient(API_BASE_URL);

// Types para as entidades
export interface User {
  _id: string;
  name: string;
  email: string;
  role?: 'user' | 'manager'; // Para compatibilidade
  roles?: ('user' | 'manager')[]; // Como o backend realmente retorna
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Video {
  _id: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  trilha: string;
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Trilha {
  _id: string;
  title: string;
  description: string;
  videos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  _id: string;
  title: string;
  type: string;
  url: string;
  size: string;
  createdAt: string;
  updatedAt: string;
}

// DTOs para requisições
export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'manager';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'user' | 'manager';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface CreateVideoRequest {
  title: string;
  description: string;
  url: string;
  duration?: number;
  trilhaId: string;
  documents?: string[];
}

export interface UpdateVideoRequest {
  title?: string;
  description?: string;
  url?: string;
  duration?: number;
  trilhaId?: string;
  documents?: string[];
}

export interface CreateTrilhaRequest {
  title: string;
  description: string;
  videos?: string[];
}

export interface UpdateTrilhaRequest {
  title?: string;
  description?: string;
  videos?: string[];
}

export interface CreateDocumentRequest {
  title: string;
  type: string;
  url: string;
  size: string;
  video?: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  type?: string;
  url?: string;
  size?: string;
  video?: string;
}

// DTOs para Embedding/Vector Database
export interface AddDocumentRequest {
  text: string;
  provaId: string;
  tipoProva: string;
  numeroQuestao: number;
}

export interface SearchDocumentRequest {
  query: string;
  provaId: string;
  tipoProva: string;
  numeroQuestao: number;
  limit?: number;
}

export interface EmbeddingDocumentResult {
  success: boolean;
  id: string;
}

export interface SearchResult {
  id: string | number;
  score: number;
}

export type { ApiResponse, ApiError };