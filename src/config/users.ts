import { userService, User as ApiUser } from '@/lib/services';

// Interface compatível com o código existente
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Não vem da API por segurança
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin?: string;
}

// Cache simples para usuários
let usersCache: User[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Função para limpar o cache
export const clearUsersCache = () => {
  usersCache = null;
  cacheTimestamp = 0;
};

// Converter usuário da API para o formato local
const convertApiUserToUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser._id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role === 'manager' ? 'admin' : 'user',
    createdAt: apiUser.createdAt
      ? new Date(apiUser.createdAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    lastLogin: apiUser.updatedAt
      ? new Date(apiUser.updatedAt).toISOString().split('T')[0]
      : undefined
  };
};

// Função para buscar usuários da API
export const getUsers = async (): Promise<User[]> => {
  // Verificar se o cache ainda é válido
  const now = Date.now();
  if (usersCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return usersCache;
  }

  try {
    const response = await userService.listUsers();

    if (!response.success || !response.data) {
      console.error('Erro ao buscar usuários:', response.message);
      return [];
    }

    const users = response.data.map(convertApiUserToUser);

    // Atualizar cache
    usersCache = users;
    cacheTimestamp = now;

    return users;
  } catch (error) {
    console.error('Erro ao buscar usuários da API:', error);
    return [];
  }
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  try {
    const response = await userService.getUserById(id);

    if (!response.success || !response.data) {
      return undefined;
    }

    return convertApiUserToUser(response.data);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return undefined;
  }
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  try {
    const users = await getUsers();
    return users.find(user => user.email === email);
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error);
    return undefined;
  }
};

// Dados mockados como fallback para desenvolvimento
export const usersMock: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@empresa.com",
    password: "123456",
    role: "admin",
    createdAt: "2024-01-15",
    lastLogin: "2024-09-15"
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@empresa.com",
    password: "123456",
    role: "user",
    createdAt: "2024-02-20",
    lastLogin: "2024-09-14"
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    email: "pedro.oliveira@empresa.com",
    password: "123456",
    role: "user",
    createdAt: "2024-03-10",
    lastLogin: "2024-09-13"
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana.costa@empresa.com",
    password: "123456",
    role: "admin",
    createdAt: "2024-01-25",
    lastLogin: "2024-09-15"
  },
  {
    id: "5",
    name: "Carlos Ferreira",
    email: "carlos.ferreira@empresa.com",
    password: "123456",
    role: "user",
    createdAt: "2024-04-05",
    lastLogin: "2024-09-12"
  },
  {
    id: "6",
    name: "Lucia Rodrigues",
    email: "lucia.rodrigues@empresa.com",
    password: "123456",
    role: "user",
    createdAt: "2024-05-18",
    lastLogin: "2024-09-11"
  }
];