# Detector de Plágio - Frontend

Esta é a interface do usuário para o sistema de detecção de plágio, permitindo consultas de similaridade e adição de novas questões ao banco de dados.

## 📍 Localização
- **Rota:** `/plagio`
- **Componente:** `src/app/plagio/page.tsx`

## 🎯 Funcionalidades

### 1. **Consultar Plágio**
- Permite verificar se uma questão já existe no banco de dados
- **Critério de Alerta:** Similaridade > 80% (score > 0.8)
- **Exibição:** Mostra apenas quando detecta plágio potencial
- **Campos obrigatórios:**
  - ID da Prova
  - Tipo da Prova
  - Número da Questão
  - Texto da Questão

### 2. **Adicionar Questão**
- Adiciona nova questão ao banco de dados
- **Confirmação:** Mensagem de sucesso após adicionar
- **Limpeza:** Formulário é limpo automaticamente após sucesso
- **Campos obrigatórios:**
  - ID da Prova
  - Tipo da Prova
  - Número da Questão
  - Texto da Questão

## 📋 Tipos de Prova Suportados

### Questões 1-5:
- Capela
- Salem  
- Ex-Templario
- Triade

### Questões 1-10:
- Ebano
- Anon
- Cadencia

## 🎨 Interface

### **Design**
- Layout responsivo com Tailwind CSS
- Componentes UI customizados (shadcn/ui style)
- Tabs para alternar entre Consultar e Adicionar
- Cards informativos para organização

### **Estados Visuais**
- ✅ **Sucesso:** Alert verde com mensagem de confirmação
- ⚠️ **Plágio Detectado:** Alert vermelho com ID da prova similar
- 🔄 **Loading:** Botões com spinner durante processamento
- ❌ **Erro:** Alert vermelho com mensagem de erro

### **Validações**
- Campos obrigatórios marcados com `*`
- Validação antes do envio
- Mensagens de erro claras

## 🔗 Navegação

### **Acesso via Dashboard**
- Seção "Ferramentas" com botão "Detector de Plágio"
- Ícone de busca para identificação visual

### **Header da Página**
- Botão "Dashboard" para voltar
- Título "Detector de Plágio"

## 🔌 Integração com Backend

### **Endpoints Utilizados**
- `POST /embedding/search-documents` - Consultar similaridade
- `POST /embedding/add-document` - Adicionar questão

### **Autenticação**
- Requer usuário logado
- Redirecionamento automático para login se não autenticado
- Token JWT enviado automaticamente via contexto de auth

## 📱 Responsividade

- **Desktop:** Layout com 3 colunas para campos de filtro
- **Mobile:** Layout em coluna única para melhor usabilidade
- **Componentes adaptáveis:** Formulários e botões se ajustam ao tamanho da tela

## 🚀 Como Usar

1. **Acesse o Dashboard**
2. **Clique em "Detector de Plágio"** na seção Ferramentas
3. **Para Consultar:**
   - Preencha todos os campos obrigatórios
   - Cole o texto da questão
   - Clique em "Consultar Plágio"
   - Se houver similaridade > 80%, será exibido alerta
4. **Para Adicionar:**
   - Troque para a aba "Adicionar Questão"
   - Preencha todos os campos obrigatórios
   - Cole o texto da questão
   - Clique em "Adicionar Questão"
   - Mensagem de sucesso será exibida

## 📁 Estrutura de Arquivos

```
src/
├── app/plagio/
│   └── page.tsx              # Página principal do detector
├── components/ui/
│   ├── select.tsx           # Componente Select customizado
│   ├── textarea.tsx         # Componente Textarea
│   └── alert.tsx           # Componente Alert
└── app/dashboard/
    └── page.tsx            # Dashboard atualizado com link
```

## 🎯 Próximas Melhorias

- [ ] Histórico de consultas realizadas
- [ ] Exportação de relatórios de plágio
- [ ] Filtros avançados de busca
- [ ] Bulk upload de questões
- [ ] Configuração de threshold de similaridade