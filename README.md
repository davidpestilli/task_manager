# 🚀 Task Manager - Sistema Colaborativo de Gerenciamento de Tarefas

Um sistema moderno e colaborativo para gerenciamento de projetos e tarefas, focado na transparência, colaboração em tempo real e visualização de progresso.

![Task Manager](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Task+Manager+Screenshot)

## ✨ Principais Funcionalidades

### 🎯 **Gestão de Projetos**
- Criação e organização de projetos
- Sistema de membros com diferentes níveis de acesso
- Dashboard pessoal com métricas e progresso

### 👥 **Gestão de Pessoas**
- Visualização de todas as pessoas e suas tarefas
- Sistema de atribuição flexível
- Transferência de tarefas via drag & drop

### ✅ **Gestão de Tarefas**
- Tarefas compostas por etapas granulares
- Sistema de dependências com visualização em fluxograma
- Comentários aninhados com threads
- Progresso calculado automaticamente

### 🔗 **Sistema de Dependências**
- Visualização gráfica de dependências
- Validação de dependências circulares
- Bloqueio automático baseado em dependências

### 🔔 **Notificações em Tempo Real**
- Atualizações instantâneas via Supabase Realtime
- Centro de notificações completo
- Notificações de desktop

### 🔍 **Busca Global Avançada**
- Busca em projetos, pessoas e tarefas
- Resultados categorizados
- Highlighting de termos

### 📊 **Dashboard e Métricas**
- Métricas pessoais de produtividade
- Gráficos de progresso
- Timeline de atividades

### 📤 **Exportação e Integrações**
- Exportação em PDF e CSV
- Sistema de webhooks para integrações
- APIs para automações

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **React 18** - Biblioteca principal
- **Vite** - Build tool e dev server
- **Tailwind CSS 3.3.5** - Framework CSS
- **React Query** - Cache e sincronização de dados
- **React Router** - Roteamento
- **React Hook Form** - Gerenciamento de formulários
- **Lucide React** - Ícones
- **React Hot Toast** - Notificações

### **Backend & Database**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Database principal
- **Row Level Security (RLS)** - Segurança de dados
- **Supabase Auth** - Autenticação
- **Supabase Realtime** - Atualizações em tempo real

### **Deploy & CI/CD**
- **GitHub Pages** - Hospedagem
- **GitHub Actions** - CI/CD automatizado
- **PWA** - Progressive Web App

## 🚀 Começando

### **Pré-requisitos**
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### **Instalação**

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/task-manager.git
cd task-manager
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. **Configure o banco de dados**

Execute os scripts SQL na pasta `supabase_tablecreations_and_policiescreations/`:
- `create_task_manager_schema_with_enums.sql`
- `task_manager_rls_full_access.sql`

5. **Execute o projeto**
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── auth/            # Componentes de autenticação
│   ├── dashboard/       # Dashboard e métricas
│   ├── projects/        # Gestão de projetos
│   ├── tasks/           # Gestão de tarefas
│   ├── people/          # Gestão de pessoas
│   ├── shared/          # Componentes compartilhados
│   └── comments/        # Sistema de comentários
├── pages/               # Páginas da aplicação
├── hooks/               # Custom hooks
├── services/            # Serviços e APIs
├── context/             # Context providers
├── utils/               # Utilitários e helpers
├── types/               # Definições de tipos
└── styles/              # Estilos CSS
```

## 🔐 Sistema de Permissões

### **Níveis de Acesso**
- **Owner** - Controle total do projeto
- **Admin** - Gerenciamento de membros e tarefas
- **Member** - Criação e edição de tarefas
- **Viewer** - Apenas visualização

### **Modelo Colaborativo**
- Todos os membros podem criar tarefas
- Transferência de tarefas facilitada
- Transparência total de progresso

## 🌟 Funcionalidades Avançadas

### **Drag & Drop**
- Transferência de tarefas entre pessoas
- Reordenação de etapas
- Validações automáticas

### **Tempo Real**
- Sincronização instantânea
- Indicadores de usuários online
- Resolução de conflitos automática

### **Progressive Web App (PWA)**
- Funciona offline
- Instalável em dispositivos
- Notificações push

### **Responsividade**
- Design mobile-first
- Adaptação para tablets
- Interface otimizada para desktop

## 📊 Métricas e Analytics

### **Métricas Pessoais**
- Tarefas concluídas por período
- Taxa de conclusão
- Tempo médio de execução
- Distribuição por status

### **Métricas de Projeto**
- Progresso geral
- Atividade da equipe
- Dependências críticas
- Relatórios exportáveis

## 🔌 Integrações

### **Webhooks Disponíveis**
- `task.created` - Nova tarefa criada
- `task.updated` - Tarefa modificada
- `task.completed` - Tarefa concluída
- `comment.added` - Novo comentário
- `project.updated` - Projeto modificado

### **Formatos de Exportação**
- **PDF** - Relatórios profissionais
- **CSV** - Dados tabulares para análise

## 🎨 Design System

### **Cores por Status**
- 🔵 **Em Andamento** - Azul (#3B82F6)
- 🟢 **Concluída** - Verde (#10B981)
- 🟡 **Pausada** - Amarelo (#F59E0B)
- ⚪ **Não Iniciada** - Cinza (#6B7280)

### **Tipografia**
- **Headers** - Font weight 600-700
- **Body** - Font weight 400
- **Metadata** - Font size pequeno, cor cinza

## 🧪 Testes

```bash
# Executar testes
npm run test

# Executar testes com coverage
npm run test:coverage

# Executar testes e2e
npm run test:e2e
```

## 🚀 Deploy

### **Automático via GitHub Actions**
1. Faça push para a branch `main`
2. GitHub Actions executará build e deploy automaticamente
3. Aplicação será publicada no GitHub Pages

### **Manual**
```bash
# Build de produção
npm run build

# Preview do build
npm run preview
```

## 🔧 Configurações Avançadas

### **Variáveis de Ambiente**
```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Aplicação
VITE_BASE_URL=/
VITE_APP_ENV=production
VITE_NOTIFICATION_DURATION=5000

# Features (opcional)
VITE_ENABLE_OFFLINE=true
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=false
```

### **Configuração do Supabase**
- RLS habilitado em todas as tabelas
- Policies configuradas para segurança
- Realtime habilitado para sincronização

## 🐛 Troubleshooting

### **Problemas Comuns**

**Erro de conexão com Supabase**
- Verifique as variáveis de ambiente
- Confirme se as URLs estão corretas
- Teste a conectividade no painel do Supabase

**Problemas de permissão**
- Verifique as policies RLS
- Confirme se o usuário é membro do projeto
- Execute o script de policies novamente

**Build falhando**
- Limpe o cache: `npm run clean`
- Reinstale dependências: `rm -rf node_modules && npm install`
- Verifique versões do Node.js

## 🤝 Contribuindo

### **Como Contribuir**
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### **Padrões de Código**
- ESLint configurado
- Prettier para formatação
- Conventional Commits
- Componentes máximo 100 linhas

## 📝 Changelog

Veja [CHANGELOG.md](CHANGELOG.md) para detalhes das mudanças.

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS
- [Lucide](https://lucide.dev) - Ícones
- [React](https://reactjs.org) - Biblioteca frontend

## 📞 Suporte

- 📧 Email: suporte@taskmanager.com
- 💬 Discord: [Comunidade Task Manager](https://discord.gg/taskmanager)
- 📖 Documentação: [docs.taskmanager.com](https://docs.taskmanager.com)
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/task-manager/issues)

---

**Desenvolvido com ❤️ para equipes que valorizam colaboração e transparência.**