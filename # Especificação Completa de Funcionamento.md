# Especificação Completa de Funcionamento - Task Manager App

## 🎯 Visão Geral do Sistema

### **Conceito Central**
O Task Manager é um sistema colaborativo de gerenciamento de tarefas focado na **visualização do progresso** e **colaboração em tempo real**. O aplicativo organiza o trabalho em **Projetos**, onde **Pessoas** executam **Tarefas** compostas por **Etapas**, permitindo rastreamento granular do progresso e dependências entre atividades.

### **Filosofia de Uso**
- **Transparência Total**: Todo usuário vê o progresso de todos os outros
- **Colaboração Fluida**: Tarefas podem ser compartilhadas e transferidas facilmente
- **Progresso Granular**: Baseado em etapas concluídas, não estimativas
- **Dependências Visuais**: Relações entre tarefas mostradas graficamente
- **Tempo Real**: Atualizações instantâneas para todos os colaboradores

---

## 🔐 Sistema de Autenticação e Acesso

### **Processo de Registro e Login**
**Registro de Novo Usuário:**
1. Usuário acessa a aplicação pela primeira vez
2. É redirecionado para tela de registro
3. Preenche: Nome completo, email, senha
4. Sistema envia email de confirmação via Supabase Auth
5. Após confirmação, usuário é direcionado automaticamente para dashboard

**Login de Usuário Existente:**
1. Usuário insere email e senha
2. Opção "Lembrar-me" para persistir sessão
3. Autenticação via Supabase Auth
4. Redirecionamento automático para dashboard ou último projeto acessado

**Recuperação de Senha:**
1. Link "Esqueci minha senha" na tela de login
2. Usuário insere email cadastrado
3. Recebe email com link de reset (Supabase Auth)
4. Define nova senha e é redirecionado para login

**Gestão de Sessão:**
- Sessão persiste automaticamente via Supabase
- Auto-login em visitas subsequentes se "Lembrar-me" ativado
- Logout manual disponível no dropdown do avatar do usuário

---

## 🏠 Estrutura de Navegação e Layout

### **Layout Principal (Pós-Login)**

**Header Superior (Fixo):**
- **Logo/Nome** do sistema (lado esquerdo)
- **Barra de Busca Global** (centro) - busca em projetos, pessoas e tarefas
- **Ícone de Notificações** com badge numérico de não lidas
- **Avatar do Usuário** com dropdown: Perfil, Configurações, Logout

**Breadcrumb Dinâmico:**
- Sempre visível abaixo do header
- Atualiza conforme navegação: "Projetos" → "Projeto X > Pessoas" → "Projeto X > Tarefas"
- Cada item clicável para navegação rápida
- Botão "← Voltar aos Projetos" quando dentro de um projeto específico

**Área de Conteúdo Principal:**
- Adapta-se conforme a seção ativa
- Cards organizados em grid responsivo
- Filtros laterais quando aplicável

**Navegação por Abas (Dentro de Projeto):**
- **Pessoas**: Visualização de membros e suas tarefas
- **Tarefas**: Lista completa de tarefas do projeto

### **Estados de Contexto**
- **Nenhum Projeto Selecionado**: Dashboard geral com lista de projetos
- **Projeto Selecionado**: Todas as abas filtram pelo projeto ativo
- **Persistência**: Último projeto acessado é lembrado na próxima sessão

---

## 📁 Funcionalidade: Gestão de Projetos

### **Dashboard Inicial (Lista de Projetos)**

**Visualização:**
- Grid responsivo de cards de projetos
- Cada card exibe: Nome, descrição resumida, número de membros, número de tarefas ativas
- Data de criação e última atualização no rodapé do card (fonte pequena)
- Cards clicáveis que levam à aba "Pessoas" do projeto

**Interações:**
- **Clique no Card**: Seleciona projeto e navega para aba "Pessoas"
- **Botão "Criar Novo Projeto"**: Abre modal de criação
- **Busca Global**: Campo no header permite buscar projetos por nome

**Modal de Criação de Projeto:**
- Campos: Nome (obrigatório), Descrição (opcional)
- Validação: Nome mínimo 3 caracteres
- Ao confirmar: Projeto criado, usuário atual definido como owner, redirecionamento para o projeto
- Auto-save: Salvamento automático no Supabase ao confirmar

### **Gestão de Membros do Projeto**
- Cada projeto mantém lista de membros com roles (owner, admin, member)
- Usuários podem participar de múltiplos projetos simultaneamente
- Owner do projeto pode adicionar/remover membros
- Todos os membros têm permissão para criar/editar tarefas (sistema democrático)

---

## 👥 Funcionalidade: Gestão de Pessoas

### **Aba Pessoas (Contextualizada por Projeto)**

**Layout e Navegação:**
- Breadcrumb: "Projeto X > Pessoas"
- Botão "← Voltar aos Projetos" sempre visível
- Botão "Adicionar Pessoa ao Projeto" (abre modal)

**Visualização de Pessoas:**
- Grid responsivo de cards de pessoas
- Cada card contém:
  - **Cabeçalho**: Nome da pessoa + avatar (se disponível)
  - **Corpo**: Lista de subcards com tarefas atribuídas à pessoa
  - **Rodapé**: Total de tarefas ativas e % médio de conclusão

**Subcards de Tarefas (Dentro do Card da Pessoa):**
- **Nome da tarefa** em destaque
- **Barra de progresso visual** mostrando % de conclusão
- **Badge de status** (Não Iniciada/Em Andamento/Pausada/Concluída)
- **Datas**: Criação e última atualização (fonte pequena no rodapé)
- **Ícone de dependências** (🔗) se a tarefa depende de outras

**Sistema de Filtros:**
- **Por Status**: Não iniciada, Em andamento, Pausada, Concluída
- **Por % de Conclusão**: 0-25%, 26-50%, 51-75%, 76-100%
- **Por Data**: Mais recentes, Mais antigas, Atualizadas recentemente
- Filtros aplicam-se aos subcards dentro de cada pessoa

### **Interações e Drag & Drop**

**Marcar Etapas como Concluídas:**
1. Usuário clica no subcard da tarefa
2. Modal expandido abre mostrando todas as etapas
3. Checkbox ao lado de cada etapa para marcar como concluída
4. % de conclusão atualiza automaticamente (etapas concluídas / total de etapas)
5. Auto-save instantâneo + notificação para outros membros

**Transferência de Tarefas (Drag & Drop):**
1. Usuário arrasta subcard de uma pessoa para outra
2. **Feedback Visual**: 
   - Área de destino destacada em verde (válido) ou vermelho (inválido)
   - Tooltip explicativo durante o arraste
3. **Validações**:
   - Verificar se pessoa de destino não está sobrecarregada
   - Validar dependências não resolvidas
   - Confirmar permissões
4. **Confirmação**: Modal pergunta se deseja transferir ou compartilhar tarefa
5. **Auto-save**: Atualização instantânea no banco + notificação para ambas as pessoas

**Adicionar Pessoa ao Projeto:**
- Modal simples com campo "Nome" e "Email"
- Se email já existe no sistema: adiciona ao projeto
- Se email não existe: envia convite por email
- Pessoa adicionada imediatamente aparece na lista

---

## ✅ Funcionalidade: Gestão de Tarefas

### **Aba Tarefas (Contextualizada por Projeto)**

**Layout e Navegação:**
- Breadcrumb: "Projeto X > Tarefas"
- Botão "← Voltar aos Projetos"
- Botão "Criar Nova Tarefa" (abre modal completo)

**Visualização de Tarefas:**
- Grid responsivo de cards de tarefas
- Cada card exibe:
  - **Nome** e descrição resumida
  - **% de conclusão** com barra de progresso
  - **Status** com badge colorido
  - **Pessoas atribuídas** (avatares em linha)
  - **Ícone de dependências** se houver
  - **Datas** de criação e atualização (rodapé)

**Filtros Cascata:**
- **Dropdown 1 - Status**: Todos, Não iniciada, Em andamento, Pausada, Concluída
- **Dropdown 2 - Pessoas**: Carrega pessoas do projeto atual
- **Dropdown 3 - Busca**: Campo livre para buscar por nome/descrição
- Filtros aplicam-se instantaneamente sem reload

### **Modal de Criação de Tarefa**

**Campos Obrigatórios:**
- **Nome da Tarefa**: Campo de texto obrigatório
- **Descrição**: Textarea para explicação detalhada
- **Atribuir a**: Seletor múltiplo de pessoas (mínimo 1 pessoa)

**Etapas da Tarefa:**
- **Lista Dinâmica**: Usuário pode adicionar quantas etapas conseguir enxergar
- **Cada Etapa**: Nome (obrigatório) + Descrição (opcional)
- **Reordenação**: Drag & drop para reordenar etapas
- **Validação**: Mínimo 1 etapa para criar tarefa

**Dependências:**
- **Campo "Depende de"**: Autocomplete com tarefas existentes do projeto
- **Validação**: Sistema impede dependências circulares
- **Preview**: Mini-fluxograma mostra cadeia de dependências

**Confirmação:**
- Auto-save no Supabase
- Notificações enviadas para pessoas atribuídas
- Redirecionamento para visualização da tarefa criada

### **Modal Expandido de Tarefa (Visualização/Edição)**

**Informações Principais:**
- Nome, descrição, status, pessoas atribuídas
- % de conclusão calculado automaticamente
- Histórico de mudanças (quem fez o quê, quando)

**Gestão de Etapas:**
- Lista completa de etapas com checkboxes
- Possibilidade de adicionar novas etapas
- Marcar/desmarcar etapas (auto-save + notificação)
- Reordenação via drag & drop

**Sistema de Comentários:**
- Thread de comentários no rodapé do modal
- Comentários com aninhamento (respostas a comentários)
- Estrutura visual hierárquica:
  ```
  🟦 Comentário Principal - João Silva (14:30)
     "Precisamos revisar os requisitos..."
     
     🟨 Resposta - Maria Santos (14:35)
        "Concordo, vou atualizar a documentação"
        
        🟨 Sub-resposta - João Silva (14:40)
           "Perfeito, me avise quando terminar"
  ```
- Notificações automáticas quando alguém responde

---

## 🔗 Sistema de Dependências e Fluxograma

### **Visualização de Dependências**

**Indicadores Visuais nos Cards:**
- **Ícone de corrente** (🔗) em tarefas que têm dependências
- **Tooltip no hover**: Lista das tarefas dependentes
- **Cores diferenciadas**: Tarefas bloqueadas (vermelho) vs disponíveis (verde)

**Fluxograma Interativo:**
- **Acesso**: Botão "Ver Dependências" na aba Tarefas
- **Biblioteca**: React Flow para renderização
- **Visualização**:
  - **Nós**: Representam tarefas (coloridos por status)
  - **Setas**: Indicam direção da dependência (A depende de B = A ← B)
  - **Layout**: Automático com algoritmo hierárquico

**Interações no Fluxograma:**
- **Hover em Nó**: Tooltip com informações da tarefa
- **Clique em Nó**: Abre modal da tarefa
- **Zoom e Pan**: Navegação fluida em projetos grandes
- **Filtros**: Mostrar apenas dependências de tarefa específica

### **Gestão de Dependências**

**Criação de Dependências:**
- Durante criação da tarefa: campo "Depende de" com autocomplete
- Em tarefa existente: botão "Adicionar Dependência" no modal
- Busca por nome, seleção múltipla permitida

**Validações Automáticas:**
- **Dependências Circulares**: Sistema impede (A → B → C → A)
- **Auto-dependência**: Tarefa não pode depender de si mesma
- **Notificação**: Aviso quando dependência é resolvida

**Comportamentos Automáticos:**
- Tarefa bloqueada não pode ser marcada como "Em Andamento" se dependências não estão concluídas
- Notificação automática quando dependência é concluída: "A tarefa X que bloqueava Y foi concluída"

---

## 🔔 Sistema de Notificações em Tempo Real

### **Tipos de Notificação**

**Notificações de Tarefa:**
- **Atribuição**: "Você foi atribuído à tarefa 'Implementar login' no projeto 'Website'"
- **Conclusão por Outro**: "A tarefa 'Setup banco de dados' que você executava foi concluída por Maria Santos"
- **Mudança de Status**: "A tarefa 'Design interface' foi pausada por João Silva"
- **Nova Etapa Adicionada**: "João Silva adicionou uma nova etapa à tarefa 'Testes de integração'"

**Notificações de Comentário:**
- **Novo Comentário**: "Maria Santos comentou na tarefa 'Revisão de código'"
- **Resposta**: "João Silva respondeu seu comentário na tarefa 'Deploy produção'"
- **Menção**: "@você foi mencionado por Ana Costa na tarefa 'Documentação'"

**Notificações de Dependência:**
- **Dependência Resolvida**: "A tarefa 'Backend API' que bloqueava 'Frontend integração' foi concluída"
- **Nova Dependência**: "Sua tarefa 'Testes unitários' agora depende de 'Refatoração código'"

### **Interface de Notificações**

**Ícone no Header:**
- Badge numérico com count de não lidas
- Animação sutil quando nova notificação chega
- Clique abre dropdown com últimas 10 notificações

**Dropdown de Notificações:**
- Lista cronológica (mais recentes primeiro)
- Cada item mostra: tipo, mensagem, tempo relativo ("há 5 min")
- Clique na notificação: navega para tarefa/projeto relacionado
- Botão "Ver todas" leva para página completa

**Página Completa de Notificações:**
- Histórico completo com paginação
- Filtros: Tipo, Lidas/Não lidas, Por projeto
- Ações em massa: "Marcar todas como lidas"

**Tempo Real (Supabase Realtime):**
- Notificações aparecem instantaneamente
- Som sutil opcional para novas notificações
- Toast temporário para notificações importantes

---

## 📊 Dashboard Pessoal e Métricas

### **Dashboard Inicial do Usuário**

**Cards de Métricas (Grid 2x2):**
- **Tarefas Ativas**: Número total com trend semanal (+5 esta semana)
- **Concluídas**: Total do mês com comparativo mês anterior
- **Taxa de Conclusão**: Percentual com trend (+2% vs mês anterior)
- **Projetos Ativos**: Número de projetos onde usuário participa

**Gráficos e Visualizações:**
- **Progresso Semanal**: Gráfico de barras (tarefas concluídas por dia)
- **Distribuição por Status**: Gráfico de pizza colorido
- **Projetos por Progresso**: Cards com barras de progresso
- **Atividade Recente**: Timeline das últimas ações do usuário

**Timeline de Atividades:**
```
🟢 Há 10 min - Concluiu etapa "Testes unitários" na tarefa "Login sistema"
🔵 Há 1 hora - Comentou na tarefa "Deploy produção" no projeto "Website"
🟡 Há 3 horas - Foi atribuído à tarefa "Documentação API" no projeto "Backend"
```

### **Métricas Calculadas Automaticamente**
- **Tempo Médio de Conclusão**: Baseado em tarefas concluídas
- **Produtividade por Projeto**: Tarefas concluídas vs tempo de participação
- **Colaboração**: Número de comentários e transferências de tarefas
- **Atualização**: Métricas recalculadas a cada ação do usuário

---

## 🔍 Sistema de Busca Global

### **Interface de Busca**

**Barra de Busca (Header):**
- Campo sempre visível no topo da aplicação
- Placeholder: "Buscar projetos, pessoas ou tarefas..."
- Atalho de teclado: Ctrl+K abre busca

**Resultados em Tempo Real:**
- Dropdown aparece conforme usuário digita
- Resultados categorizados por tipo
- Máximo 5 resultados por categoria inicialmente

### **Resultados Categorizados**

**Formato dos Resultados:**
```
🔍 Resultados para "login"

📁 PROJETOS (1)
├── Sistema de Login - 4 membros, 12 tarefas ativas

👤 PESSOAS (2)  
├── João Silva - 3 projetos, 5 tarefas ativas
└── Maria Login - 2 projetos, 3 tarefas ativas

📋 TAREFAS (3)
├── "Implementar login OAuth" - Projeto Website, 80% concluído
├── "Testes de login" - Projeto Backend, 45% concluído  
└── "Design tela login" - Projeto Mobile, 100% concluído
```

**Interações:**
- **Clique em Projeto**: Navega para aba "Pessoas" do projeto
- **Clique em Pessoa**: Abre modal com detalhes da pessoa
- **Clique em Tarefa**: Abre modal expandido da tarefa

### **Modal de Detalhes da Busca**

**Para Pessoas:**
- Nome, avatar, email
- Lista de projetos participantes
- Tarefas ativas por projeto
- Botão "Ver todas as tarefas" redireciona para filtro

**Para Tarefas:**
- Nome, descrição, status
- Projeto de origem
- Pessoas atribuídas
- % de conclusão atual
- Dependências (se houver)
- Botão "Abrir tarefa" para modal completo

**Para Projetos:**
- Nome, descrição
- Lista de membros
- Estatísticas: X tarefas, Y concluídas, Z% progresso geral
- Botão "Entrar no projeto"

---

## 🎯 Sistema de Drag & Drop Avançado

### **Funcionalidades de Drag & Drop**

**Transferência de Tarefas entre Pessoas:**
- **Origem**: Subcard de tarefa no card da pessoa
- **Destino**: Área do card de outra pessoa
- **Feedback Visual**: 
  - Cursor muda para "movimento"
  - Área de destino highlighted em verde (válido) ou vermelho (inválido)
  - Sombra dinâmica durante arraste

**Validações em Tempo Real:**
- **Capacidade**: Verificar se pessoa não está sobrecarregada (>10 tarefas ativas)
- **Permissões**: Validar se usuário pode atribuir tarefa
- **Dependências**: Alertar se pessoa não pode executar devido a dependências
- **Projeto**: Confirmar se pessoa pertence ao projeto

### **Processo de Transferência**

**Durante o Arraste:**
1. Mouse down: Tarefa "gruda" no cursor
2. Hover sobre destino válido: Área fica verde + tooltip "Transferir para [Nome]"
3. Hover sobre destino inválido: Área fica vermelha + tooltip explicativo

**Ao Soltar (Drop):**
1. Modal de confirmação: "Transferir ou Compartilhar tarefa?"
2. **Transferir**: Remove da pessoa atual, adiciona à nova
3. **Compartilhar**: Mantém em ambas (colaboração)
4. Auto-save instantâneo
5. Notificações para ambas as pessoas
6. Animação de confirmação

**Feedback de Erro:**
- Toast vermelho: "Não é possível transferir: pessoa sobrecarregada"
- Toast amarelo: "Aviso: tarefa possui dependências não resolvidas"

---

## 📤 Sistema de Exportação

### **Opções de Exportação**

**Exportação de Projetos:**
- **PDF**: Relatório completo com tarefas, pessoas e progresso
- **CSV**: Dados tabulares para análise em planilhas
- **Escopo**: Projeto específico ou todos os projetos do usuário

**Exportação de Tarefas:**
- **Filtros Aplicáveis**: Apenas tarefas visíveis nos filtros atuais
- **Campos Incluídos**: Nome, descrição, status, % conclusão, responsáveis, datas
- **Formato PDF**: Layout profissional com gráficos de progresso

**Interface de Exportação:**
- Botões "Exportar" nas páginas relevantes
- Modal de configuração: formato, escopo, campos a incluir
- Preview antes da exportação
- Download automático após processamento

### **Formatos de Saída**

**Relatório PDF:**
- Cabeçalho com logo e dados do projeto
- Sumário executivo com métricas principais
- Tabela de tarefas com status visual
- Gráficos de progresso por pessoa
- Rodapé com data/hora de geração

**Arquivo CSV:**
```csv
Nome da Tarefa,Status,Progresso,Responsáveis,Criada em,Atualizada em
"Implementar login",Em andamento,75%,"João Silva; Maria Santos",2024-01-15,2024-01-20
"Design interface",Concluída,100%,"Ana Costa",2024-01-10,2024-01-18
```

---

## 🔗 Sistema de Webhooks

### **Configuração de Webhooks**

**Interface de Configuração:**
- Página dedicada em "Configurações > Webhooks"
- Lista de webhooks ativos por projeto
- Botão "Adicionar Webhook" abre modal de configuração

**Modal de Configuração:**
- **Nome**: Identificação do webhook
- **URL**: Endpoint que receberá os dados
- **Eventos**: Seletor múltiplo dos eventos a monitorar
- **Chave Secreta**: Para validação HMAC (opcional)
- **Ativo/Inativo**: Toggle para ativar/desativar

**Eventos Disponíveis:**
- `task.created` - Nova tarefa criada
- `task.updated` - Tarefa modificada
- `task.completed` - Tarefa concluída
- `task.assigned` - Tarefa atribuída a usuário
- `comment.added` - Novo comentário adicionado
- `project.updated` - Projeto modificado

### **Payload de Webhook**

**Estrutura Padrão:**
```json
{
  "event": "task.completed",
  "timestamp": "2024-01-20T15:30:00Z",
  "project": {
    "id": "uuid",
    "name": "Website Corporativo"
  },
  "task": {
    "id": "uuid", 
    "name": "Implementar sistema de login",
    "status": "concluída",
    "completion_percentage": 100,
    "assigned_users": ["João Silva", "Maria Santos"]
  },
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@empresa.com"
  },
  "signature": "hmac-sha256-hash"
}
```

**Integração com Ferramentas:**
- **Slack**: Notificações em canais específicos
- **Discord**: Webhooks para servidores de equipe
- **Zapier**: Automações com outras ferramentas
- **APIs Customizadas**: Integrações específicas da empresa

---

## 📱 Responsividade e Experiência Mobile

### **Breakpoints e Adaptações**

**Mobile (< 640px):**
- Navigation bottom tab bar substituindo sidebar
- Cards em stack vertical (1 coluna)
- Modals em fullscreen
- Drag & drop substituído por botões de ação
- Busca em modal dedicado

**Tablet (640px - 1024px):**
- Grid de 2 colunas para cards
- Sidebar colapsável
- Modals em tamanho médio
- Drag & drop mantido com feedback touch

**Desktop (> 1024px):**
- Grid de 3-4 colunas
- Sidebar sempre visível
- Modais centralizados
- Hover effects completos

### **Interações Touch**

**Gestos Suportados:**
- **Swipe horizontal**: Navegar entre abas
- **Long press**: Menu de contexto em cards
- **Pull to refresh**: Atualizar listas
- **Pinch to zoom**: No fluxograma de dependências

**Adaptações Mobile:**
- Botões maiores (mínimo 44px)
- Espaçamento aumentado entre elementos
- Loading states mais evidentes
- Mensagens de erro em toast

---

## ⚡ Comportamentos Automáticos e Inteligência

### **Auto-save Inteligente**

**Triggers de Salvamento:**
- Marcar/desmarcar etapa → Save + recalcular % + timestamp
- Comentário adicionado → Save + notificação automática
- Drag & drop → Save + validação + notificação
- Mudança de status → Save + verificar dependências

**Feedback Visual:**
- Ícone "salvando..." durante operação
- Checkmark verde após confirmação
- Toast vermelho se erro de salvamento

### **Notificações Inteligentes**

**Debounce e Agrupamento:**
- Múltiplas ações na mesma tarefa = 1 notificação agrupada
- Delay de 30s para agrupar ações relacionadas
- Exemplo: "João Silva fez 3 atualizações na tarefa 'Login sistema'"

**Configurações de Usuário:**
- Toggle para cada tipo de notificação
- Horário de silêncio (não disturb)
- Frequência de email digest (diário/semanal/nunca)

### **Sincronização em Tempo Real**

**Supabase Realtime:**
- Updates instantâneos via WebSocket
- Indicator de "usuário online" nos avatares
- Cursor colaborativo em modals (quem está editando)
- Resolução de conflitos automática

---

## 🎨 Princípios de Design e UX

### **Design System**

**Cores por Status:**
- **Não Iniciada**: Cinza (#6B7280)
- **Em Andamento**: Azul (#3B82F6)  
- **Pausada**: Amarelo (#F59E0B)
- **Concluída**: Verde (#10B981)

**Tipografia:**
- Headers: Font weight 600-700
- Body: Font weight 400
- Datas/metadados: Font size pequeno, cor cinza

**Espaçamento:**
- Grid de 8px para consistency
- Cards com padding 24px
- Elementos com margin 16px

### **Estados de Loading**

**Skeleton Screens:**
- Cards com shimmer effect durante carregamento
- Preserva layout para evitar layout shift
- Duração típica 200-500ms

**Loading States:**
- Spinners para ações instantâneas
- Progress bars para uploads/exports
- Mensagens contextuais ("Salvando tarefa...")

### **Tratamento de Erros**

**Hierarquia de Feedback:**
1. **Validação inline**: Campo vermelho + mensagem
2. **Toast temporário**: Erro de ação (3-5 segundos)
3. **Modal de erro**: Problemas críticos de conexão
4. **Página de erro**: Falhas de rota/autenticação

**Retry Automático:**
- Ações de rede com retry automático (3 tentativas)
- Feedback visual durante retry
- Fallback para modo offline quando possível

---

## 🔒 Segurança e Permissões

### **Modelo de Permissões**

**Níveis de Acesso:**
- **Owner**: Criador do projeto (delete, manage members)
- **Admin**: Convidado com poderes administrativos  
- **Member**: Participante normal (default)

**Regras de Negócio:**
- Todos podem criar/editar tarefas (modelo colaborativo)
- Apenas owner/admin removem membros
- Apenas owner deleta projeto
- Qualquer membro pode atribuir tarefas

### **Segurança de Dados**

**Supabase Row Level Security (RLS):**
- Usuários só veem projetos onde são membros
- Tarefas filtradas por projeto automaticamente
- Comentários protegidos por contexto de tarefa

**Validação Dupla:**
- Frontend: UX/feedback imediato  
- Backend: Validação definitiva no Supabase
- Sanitização de inputs automática

---

Este documento define completamente o funcionamento esperado do Task Manager App, servindo como especificação técnica e funcional para desenvolvimento e referência durante toda a construção do sistema.