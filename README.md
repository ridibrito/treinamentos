# DF Treinamentos

Plataforma completa de treinamentos corporativos para a DF Corretora, desenvolvida com Next.js 15, Supabase e TypeScript.

## 🚀 Funcionalidades

### ✅ Implementadas

- **Autenticação e Perfis**: Sistema completo com 3 perfis (Admin, Palestrante, Aluno)
- **Dashboard Interativo**: Visão geral com estatísticas e progresso
- **Gestão de Treinamentos**: CRUD completo de treinamentos
- **Módulos e Slides**: Sistema de conteúdo organizado por módulos
- **Modo Apresentação**: Apresentação fullscreen com navegação por teclado
- **Testes de Conhecimento**: Sistema completo com múltipla escolha, V/F e dissertativas
- **Resultados e Histórico**: Acompanhamento de desempenho com estatísticas
- **Apostilas em PDF**: Geração de apostilas formatadas com impressão/PDF
- **Sistema de Progresso**: Tracking de conclusão de módulos por usuário

## 🛠️ Stack Tecnológica

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **Backend/Database**: Supabase (PostgreSQL + Auth + Storage)
- **UI Components**: Componentes customizados com Lucide Icons
- **Forms**: React Hook Form + Zod
- **Date Utils**: date-fns

## 📦 Instalação

### 1. Clonar o repositório

```bash
git clone <seu-repositorio>
cd dfcorretora
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar Supabase

#### 3.1 Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote as credenciais (URL e Anon Key)

#### 3.2 Executar o schema SQL

1. No Supabase Dashboard, vá em **SQL Editor**
2. Copie todo o conteúdo do arquivo `supabase-schema.sql`
3. Execute o script

Isso criará:
- Todas as tabelas necessárias
- Políticas RLS (Row Level Security)
- Indexes para performance
- Triggers e functions
- Buckets de storage recomendados

#### 3.3 Criar os Storage Buckets

No Supabase Dashboard, vá em **Storage** e crie os buckets:

1. `treinamentos-imagens` (público)
2. `apostilas` (privado)
3. `apostilas-assets` (privado)
4. `avatares` (público)

### 4. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
```

Use o arquivo `env.example` como referência.

### 5. Executar o projeto

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 👤 Primeiro Acesso

### Opção 1: Criar conta via interface (Recomendado)

1. Acesse http://localhost:3000/cadastro
2. Preencha seus dados (Nome, E-mail, Senha)
3. Clique em "Criar Conta"
4. Você será criado como **Aluno** automaticamente

**Para tornar Admin:**
- Vá no Supabase Dashboard → **Table Editor** → **profiles**
- Encontre seu usuário e edite o campo `role` para `admin`

### Opção 2: Criar usuário Admin diretamente no Supabase

1. Vá em **Authentication > Users**
2. Clique em **Add user** > **Create new user**
3. Preencha:
   - Email: seu@email.com
   - Password: sua_senha_segura
   - Auto Confirm User: ✅ Ativado

4. Após criar, vá em **Table Editor > profiles**
5. Edite o profile criado e defina:
   - `role`: `admin`
   - `nome`: Seu Nome

### Cadastro de novos colaboradores

Compartilhe o link: **http://seu-dominio.com/cadastro**

- Todos os novos usuários são cadastrados como **Aluno**
- Admins podem alterar o perfil no Supabase se necessário

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- **profiles**: Perfis de usuários (admin/palestrante/aluno)
- **treinamentos**: Treinamentos disponíveis
- **modulos**: Módulos de cada treinamento
- **slides**: Slides de cada módulo
- **testes**: Testes de conhecimento
- **questoes**: Questões dos testes
- **respostas**: Respostas dos alunos
- **resultados**: Resultados dos testes
- **progresso_treinamento**: Progresso dos usuários
- **apostilas**: Configuração de apostilas
- **apostilas_arquivos**: PDFs gerados

## 🎨 Design System

### Cores da Marca

- **Azul Principal**: `#014175` (--color-primary)
- **Azul Escuro**: `#012a4a` (--color-primary-dark)
- **Laranja**: `#FF6B00` (--color-orange)
- **Branco Suave**: `#f5f5f5` (--color-soft-white)
- **Fundo**: `#f8f9fb` (--color-background)

### Fonte

- **Inter** (usada em todo o aplicativo)

## 📝 Estrutura de Pastas

```
src/
├── app/
│   ├── admin/              # Painel administrativo
│   ├── dashboard/          # Dashboard principal
│   ├── login/              # Página de login
│   ├── meus-treinamentos/  # Treinamentos do usuário
│   ├── resultados/         # Resultados e histórico
│   ├── treinamentos/       # Páginas de treinamentos
│   │   └── [id]/
│   │       ├── apostila/   # Visualização da apostila
│   │       └── modulos/    # Módulos e slides
│   └── api/                # API Routes
├── components/
│   ├── layout/             # Header, Footer, etc.
│   └── ui/                 # Componentes UI reutilizáveis
├── lib/
│   └── supabase/           # Clientes Supabase
└── types/                  # Tipos TypeScript
```

## 🔐 Permissões (RLS)

O sistema implementa Row Level Security com as seguintes regras:

- **Alunos**: Podem ver apenas seus próprios dados (respostas, resultados, progresso)
- **Palestrantes**: Podem apresentar treinamentos
- **Admins**: Acesso completo para criar e gerenciar conteúdo

## 📱 Funcionalidades por Perfil

### Aluno
- ✅ Visualizar treinamentos disponíveis
- ✅ Acessar módulos e slides
- ✅ Realizar testes de conhecimento
- ✅ Ver resultados e histórico
- ✅ Baixar/imprimir apostilas
- ✅ Acompanhar progresso

### Palestrante
- ✅ Tudo do Aluno +
- ✅ Modo Apresentação fullscreen
- ✅ Navegação por teclado nos slides

### Admin
- ✅ Tudo do Palestrante +
- ✅ Criar/editar/excluir treinamentos
- ✅ Gerenciar módulos e slides (via DB)
- ✅ Criar testes e questões (via DB)
- ✅ Configurar apostilas (via DB)
- ✅ Visualizar todos os resultados

## 🎓 Como Usar

### Para Alunos

1. Faça login na plataforma
2. No Dashboard, veja todos os treinamentos disponíveis
3. Clique em "Iniciar" para começar um treinamento
4. Navegue pelos módulos e slides
5. Complete o teste ao final (se disponível)
6. Acompanhe seu progresso e resultados

### Para Palestrantes

1. Acesse um módulo de treinamento
2. Clique em "Modo Apresentação"
3. Use as setas do teclado (← →) ou Espaço para navegar
4. Pressione **F** para fullscreen
5. Pressione **ESC** para sair

### Para Admins

1. Acesse "Gerenciar Treinamentos"
2. Clique em "Novo Treinamento"
3. Preencha os dados básicos
4. Para adicionar módulos/slides/testes:
   - Acesse o Supabase Dashboard
   - Insira dados nas tabelas correspondentes
   - Ou desenvolva interfaces de gerenciamento

## 📖 Apostilas

### Visualizar/Imprimir

1. Na página de um treinamento, clique em "Visualizar Apostila"
2. Use os botões:
   - **Imprimir**: Abre diálogo de impressão (salve como PDF)
   - **Baixar PDF**: Gera PDF (requer configuração)

### Configurar Apostila

Via Supabase, insira na tabela `apostilas`:

```json
{
  "treinamento_id": "uuid-do-treinamento",
  "versao": 1,
  "capa": {
    "titulo": "Título do Treinamento",
    "subtitulo": "Subtítulo",
    "turma": "Turma 2025",
    "data": "Janeiro/2025",
    "instrutor": "Nome do Instrutor"
  },
  "apresentacao": "<p>Texto de apresentação...</p>",
  "glossario": [
    {"termo": "Termo", "definicao": "Definição"}
  ],
  "checklist": [
    {"item": "Item 1", "obrigatorio": true}
  ],
  "faq": [
    {"pergunta": "Pergunta?", "resposta": "Resposta."}
  ],
  "paginas_anotacoes": 2,
  "watermark": "Material interno DF Corretora",
  "ativo": true
}
```

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

Configure as variáveis de ambiente no dashboard da Vercel.

## 🔧 Desenvolvimento

### Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Iniciar produção
npm start

# Lint
npm run lint
```

## 📄 Licença

© 2025 DF Corretora - Todos os direitos reservados

## 🤝 Suporte

Para dúvidas ou suporte, entre em contato com a equipe de TI da DF Corretora.

---

**Desenvolvido com ❤️ para a DF Corretora**

*Nosso plano é cuidar bem*
# treinamentos
