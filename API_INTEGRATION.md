# Integração com API - Portal do Corretor

Este documento descreve a implementação da integração entre o frontend e backend da aplicação Portal do Corretor.

## 📋 Resumo das Mudanças

### 1. Estrutura de Serviços de API

#### Arquivos Criados/Modificados:
- `src/lib/api.ts` - Cliente HTTP base para comunicação com a API
- `src/lib/services/` - Serviços específicos para cada módulo do backend
  - `auth.service.ts` - Autenticação e gerenciamento de usuários
  - `video.service.ts` - Operações com vídeos
  - `trilha.service.ts` - Operações com trilhas
  - `document.service.ts` - Operações com documentos
- `src/lib/adapters.ts` - Conversores entre formatos da API e frontend
- `src/lib/hooks/useAuth.ts` - Hook personalizado para autenticação
- `src/lib/context/AuthContext.tsx` - Contexto React para autenticação global

### 2. Endpoints Implementados

#### Autenticação
- `POST /auth/login` - Login de usuário
- `PATCH /auth/change-password` - Alteração de senha

#### Usuários
- `POST /users` - Criar usuário (apenas managers)
- `PUT /users/:id` - Atualizar usuário (apenas managers)

#### Vídeos
- `GET /videos` - Listar vídeos
- `GET /videos/:id` - Buscar vídeo por ID
- `POST /videos` - Criar vídeo (apenas managers)
- `PUT /videos/:id` - Atualizar vídeo (apenas managers)
- `DELETE /videos/:id` - Deletar vídeo (apenas managers)

#### Trilhas
- `GET /trilhas` - Listar trilhas
- `GET /trilhas/:id` - Buscar trilha por ID
- `POST /trilhas` - Criar trilha (apenas managers)
- `PUT /trilhas/:id` - Atualizar trilha (apenas managers)
- `DELETE /trilhas/:id` - Deletar trilha (apenas managers)

#### Documentos
- `GET /documents` - Listar documentos
- `GET /documents/:id` - Buscar documento por ID
- `POST /documents` - Criar documento (apenas managers)
- `PUT /documents/:id` - Atualizar documento (apenas managers)
- `DELETE /documents/:id` - Deletar documento (apenas managers)

### 3. Funcionalidades de Autenticação

#### Gerenciamento de Token JWT
- Armazenamento automático do token após login
- Inclusão automática do token em todas as requisições autenticadas
- Redirecionamento automático para login em caso de token expirado (401)
- Limpeza automática de dados de autenticação no logout

#### Níveis de Acesso
- **user**: Acesso básico para visualizar conteúdo
- **manager**: Acesso administrativo completo

### 4. Cache e Performance

#### Cache Local
- Cache de trilhas por 5 minutos
- Cache de usuários por 5 minutos
- Funções para limpar cache quando necessário

#### Tratamento de Erros
- Componente `ApiErrorBoundary` para tratar erros de API
- Mensagens específicas para diferentes tipos de erro
- Retry automático em caso de falha de rede

## 🚀 Como Usar

### 1. Configuração do Ambiente

Crie um arquivo `.env.local` na raiz do projeto cliente:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Iniciando o Backend

Certifique-se de que o servidor backend está rodando na porta 3001:

```bash
cd Server
npm run dev
```

### 3. Iniciando o Frontend

```bash
cd Client
npm run dev
```

### 4. Usando os Serviços

#### Exemplo de Uso Básico

```typescript
import { trilhaService, videoService } from '@/lib/services';

// Buscar trilhas
const trilhas = await trilhaService.listTrilhas();

// Buscar vídeo específico
const video = await videoService.getVideoById('video-id');
```

#### Exemplo com Autenticação

```typescript
import { authService } from '@/lib/services';

// Login
const result = await authService.login({
  email: 'user@example.com',
  password: 'password'
});

if (result.success) {
  console.log('Login realizado com sucesso');
} else {
  console.error('Erro no login:', result.message);
}
```

#### Usando o Hook de Autenticação

```typescript
import { useAuth } from '@/lib/hooks';

function MyComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();

  if (isLoading) return <div>Carregando...</div>;
  
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }

  return <Dashboard user={user} onLogout={logout} />;
}
```

## 🔧 Estrutura de Dados

### Usuário (User)
```typescript
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'manager';
  createdAt: string;
  updatedAt: string;
}
```

### Vídeo (Video)
```typescript
interface Video {
  _id: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  trilha: string; // ID da trilha
  documents: string[]; // IDs dos documentos
  createdAt: string;
  updatedAt: string;
}
```

### Trilha (Trilha)
```typescript
interface Trilha {
  _id: string;
  title: string;
  description: string;
  videos: string[]; // IDs dos vídeos
  createdAt: string;
  updatedAt: string;
}
```

### Documento (Document)
```typescript
interface Document {
  _id: string;
  title: string;
  type: string;
  url: string;
  size: string;
  createdAt: string;
  updatedAt: string;
}
```

## 🛠️ Adaptadores

Os adaptadores são responsáveis por converter os dados entre o formato da API (com `_id`) e o formato esperado pelo frontend (com `id`). Isso mantém a compatibilidade com o código existente.

### Exemplo de Conversão
```typescript
// API Response
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Meu Vídeo",
  // ...outros campos
}

// Frontend Format
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Meu Vídeo",
  // ...outros campos
}
```

## ⚡ Melhorias Implementadas

1. **Fallback para Dados Mockados**: Se a API falhar, a aplicação ainda funciona com dados de exemplo
2. **Loading States**: Estados de carregamento em todas as operações assíncronas
3. **Error Handling**: Tratamento robusto de erros com mensagens específicas
4. **Type Safety**: Tipagem TypeScript completa para todos os dados da API
5. **Retry Logic**: Possibilidade de tentar novamente em caso de erro
6. **Cache Management**: Cache inteligente para melhorar performance

## 🔐 Segurança

- Tokens JWT são armazenados de forma segura no localStorage
- Requisições incluem automaticamente headers de autorização
- Redirecionamento automático para login em caso de sessão expirada
- Validação de níveis de acesso antes de operações sensíveis

## 📝 Próximos Passos

1. **Implementar CRUD completo**: Adicionar endpoints de criação/edição no backend se necessário
2. **Upload de Arquivos**: Implementar upload de documentos e imagens
3. **Websockets**: Para atualizações em tempo real
4. **Offline Support**: Para funcionamento sem internet
5. **Progress Tracking**: Para acompanhar progresso dos usuários nos vídeos