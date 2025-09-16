'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAuthContext } from '@/lib/context/AuthContext';

interface User {
  _id: string;
  name: string;
  email: string;
  demolayId: number;
  roles: ('user' | 'manager')[];
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  demolayId: number;
  roles: ('user' | 'manager')[];
}

interface UpdateUserData {
  name?: string;
  email?: string;
  demolayId?: number;
  roles?: ('user' | 'manager')[];
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [createForm, setCreateForm] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    demolayId: 0,
    roles: ['user']
  });

  const [editForm, setEditForm] = useState<UpdateUserData>({
    name: '',
    email: '',
    demolayId: 0,
    roles: ['user']
  });

  const { user } = useAuthContext();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth');
      if (!token) {
        setError('Token não encontrado');
        return;
      }

      const authData = JSON.parse(token);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${authData.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      } else {
        setError('Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    try {
      const token = localStorage.getItem('auth');
      if (!token) {
        setError('Token não encontrado');
        return;
      }

      const authData = JSON.parse(token);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.token}`
        },
        body: JSON.stringify({
          ...createForm,
          createdBy: user?._id
        })
      });

      if (response.ok) {
        setIsCreateDialogOpen(false);
        setCreateForm({
          name: '',
          email: '',
          password: '',
          demolayId: 0,
          roles: ['user']
        });
        fetchUsers();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao criar usuário');
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setError('Erro ao conectar com o servidor');
    }
  };

  const updateUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('auth');
      if (!token) {
        setError('Token não encontrado');
        return;
      }

      const authData = JSON.parse(token);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.token}`
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        setIsEditDialogOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao atualizar usuário');
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      setError('Erro ao conectar com o servidor');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;

    try {
      const token = localStorage.getItem('auth');
      if (!token) {
        setError('Token não encontrado');
        return;
      }

      const authData = JSON.parse(token);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authData.token}`
        }
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao deletar usuário');
      }
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      setError('Erro ao conectar com o servidor');
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      demolayId: user.demolayId,
      roles: user.roles
    });
    setIsEditDialogOpen(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-4">Carregando usuários...</div>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError('')}
          >
            <span className="sr-only">Fechar</span>
            ×
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lista de Usuários</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="demolayId">DeMolay ID</Label>
                <Input
                  id="demolayId"
                  type="number"
                  value={createForm.demolayId}
                  onChange={(e) => setCreateForm({ ...createForm, demolayId: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="roles">Funções</Label>
                <select
                  id="roles"
                  value={createForm.roles[0]}
                  onChange={(e) => setCreateForm({ ...createForm, roles: [e.target.value as 'user' | 'manager'] })}
                  className="w-full p-2 border rounded"
                >
                  <option value="user">Usuário</option>
                  <option value="manager">Administrador</option>
                </select>
              </div>
              <Button onClick={createUser} className="w-full">
                Criar Usuário
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>DeMolay ID</TableHead>
            <TableHead>Funções</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.demolayId}</TableCell>
              <TableCell>
                {user.roles.map((role) => (
                  <Badge key={role} variant={role === 'manager' ? 'default' : 'secondary'}>
                    {role === 'manager' ? 'Admin' : 'Usuário'}
                  </Badge>
                ))}
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString('pt-BR')}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteUser(user._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-demolayId">DeMolay ID</Label>
              <Input
                id="edit-demolayId"
                type="number"
                value={editForm.demolayId}
                onChange={(e) => setEditForm({ ...editForm, demolayId: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="edit-roles">Funções</Label>
              <select
                id="edit-roles"
                value={editForm.roles?.[0] || 'user'}
                onChange={(e) => setEditForm({ ...editForm, roles: [e.target.value as 'user' | 'manager'] })}
                className="w-full p-2 border rounded"
              >
                <option value="user">Usuário</option>
                <option value="manager">Administrador</option>
              </select>
            </div>
            <Button onClick={updateUser} className="w-full">
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}