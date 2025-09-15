export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin?: string;
}

export const users: User[] = [
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

export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const getUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};