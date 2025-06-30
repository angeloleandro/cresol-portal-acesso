# Portal de Acesso Cresol

Portal de acesso unificado para os sistemas de informação empresarial interna da Cresol.

## Tecnologias Utilizadas

- **[Next.js 14](https://nextjs.org/)** - Framework React com App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Superset JavaScript com tipagem estática
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitário com cores personalizadas Cresol
- **[Supabase](https://supabase.com/)** - Backend completo (PostgreSQL + Auth + Storage + RLS)
- **[React Easy Crop](https://github.com/ValentinH/react-easy-crop)** - Componente para recorte de imagens
- **[date-fns](https://date-fns.org/)** - Biblioteca moderna para manipulação de datas

## Funcionalidades Principais

### 🔐 Autenticação e Autorização
- Sistema de login/logout com Supabase Auth
- Controle de acesso baseado em roles (admin, sector_admin, user)
- Middleware de proteção de rotas
- Aprovação administrativa para novos usuários

### 👥 Gerenciamento de Usuários
- Perfis de usuário com foto e informações pessoais
- Painel administrativo para gestão de usuários
- Atribuição e alteração de roles
- Solicitações de acesso com workflow de aprovação

### 🏢 Gestão Organizacional
- Hierarquia de setores e subsetores
- Painéis administrativos específicos por setor
- Gerenciamento de equipes por subsetor
- Links centralizados para sistemas internos

### 📊 Dashboard e Indicadores
- Indicadores econômicos atualizáveis
- Sistema de notificações em tempo real
- Central de mensagens e comunicados
- Analytics e monitoramento

### 📸 Galeria e Mídia
- Upload e gerenciamento de imagens
- Galeria de vídeos
- Sistema de banners rotativos
- Recorte inteligente de imagens

### 🔍 Busca e Navegação
- Sistema de busca global avançada
- Filtros e categorização
- Navegação por breadcrumbs
- Favoritos personalizáveis

## Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn

### Instalação

1. Clone o repositório
```bash
git clone https://github.com/angeloleandro/cresol-portal-acesso.git
cd cresol-portal-acesso
```

2. Instale as dependências
```bash
npm install
# ou
yarn install
```

3. Inicie o servidor de desenvolvimento
```bash
npm run dev
# ou
yarn dev
```

4. Acesse o aplicativo em `http://localhost:4000`

## Estrutura do Projeto

```
cresol-portal-acesso/
├── app/                          # Next.js 14 App Router
│   ├── admin/                    # Painel administrativo completo
│   │   ├── users/               # Gerenciamento de usuários
│   │   ├── sectors/             # Gestão de setores
│   │   ├── system-links/        # Links de sistemas
│   │   ├── notifications/       # Central de notificações
│   │   ├── economic-indicators/ # Indicadores econômicos
│   │   ├── banners/            # Gestão de banners
│   │   ├── gallery/            # Galeria de imagens
│   │   └── videos/             # Galeria de vídeos
│   ├── admin-setor/             # Painel admin setorial
│   ├── admin-subsetor/          # Painel admin subsetorial
│   ├── api/                     # API Routes
│   │   ├── admin/              # Endpoints administrativos
│   │   ├── auth/               # Autenticação
│   │   └── notifications/      # API de notificações
│   ├── components/              # Componentes reutilizáveis
│   │   ├── icons/              # Sistema de ícones SVG personalizado
│   │   └── ui/                 # Componentes de interface
│   ├── home/                    # Página principal
│   ├── profile/                 # Perfil do usuário
│   ├── setores/                 # Páginas de setores
│   └── subsetores/              # Páginas de subsetores
├── lib/                         # Utilitários e configurações
│   ├── supabase/               # Configuração Supabase (client/server)
│   ├── error-handler.ts        # Tratamento de erros
│   └── auth.ts                 # Utilitários de autenticação
├── public/                      # Arquivos estáticos
├── middleware.ts                # Middleware de autenticação
└── supabase/                    # Configurações do Supabase
```

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento (porta 4000)
- `npm run build` - Constrói a aplicação para produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o ESLint para verificar qualidade do código

## Deploy

Este projeto está configurado para deploy na [Vercel](https://vercel.com/). As variáveis de ambiente devem ser configuradas no painel da Vercel.

## Licença

Proprietário - Cresol

## Configuração do Supabase

### Autenticação e Banco de Dados

A aplicação utiliza o Supabase para autenticação de usuários e armazenamento de dados.

### Configuração do Storage para Imagens

O portal permite upload de imagens para notícias e eventos. Para configurar o storage:

1. Acesse o painel do Supabase da sua aplicação
2. Vá até a seção "Storage" no menu lateral
3. Clique em "Criar novo bucket"
4. Nomeie o bucket como "images" e marque como público
5. Configurar políticas de acesso através do SQL Editor:

```sql
-- Criar um bucket chamado 'images' para armazenar as imagens do portal
INSERT INTO storage.buckets (id, name, public)
VALUES (
  'images',
  'images',
  true
);

-- Configurar políticas de acesso para permitir que usuários autenticados façam upload de imagens
CREATE POLICY "Usuários autenticados podem fazer upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'images' AND (storage.foldername(name))[1] = 'sector-news');

-- Permitir que usuários autenticados atualizem seus próprios uploads
CREATE POLICY "Usuários autenticados podem atualizar seus próprios uploads" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'images' AND owner = auth.uid() AND (storage.foldername(name))[1] = 'sector-news');

-- Permitir que usuários autenticados deletem seus próprios uploads
CREATE POLICY "Usuários autenticados podem deletar seus próprios uploads" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'images' AND owner = auth.uid() AND (storage.foldername(name))[1] = 'sector-news');

-- Permitir que qualquer pessoa visualize as imagens
CREATE POLICY "Imagens públicas para visualização" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'images');

-- Permitir upload de avatares
CREATE POLICY "Usuários podem fazer upload de avatares" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'images' AND (storage.foldername(name))[1] = 'avatars');

-- Permitir que usuários atualizem seus próprios avatares
CREATE POLICY "Usuários podem atualizar seus próprios avatares" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'images' AND owner = auth.uid() AND (storage.foldername(name))[1] = 'avatars');

-- Permitir que usuários deletem seus próprios avatares
CREATE POLICY "Usuários podem deletar seus próprios avatares" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'images' AND owner = auth.uid() AND (storage.foldername(name))[1] = 'avatars');
```

### Arquivos de Configuração

O repositório inclui vários arquivos de configuração e scripts de apoio:

- `supabase-bucket-setup.js` - Configuração completa do Storage
- `admin-setup.js` - Script para configuração inicial de administradores
- `setup-notifications.js` - Configuração do sistema de notificações
- `fix-notifications-rls.sql` - Políticas RLS para notificações
- `sql-functions.sql` - Funções SQL personalizadas

3. **Gerenciamento de Setores e Subsetores**
   - Visualização hierárquica de setores da organização
   - Gestão de subsetores com equipes específicas
   - Painéis administrativos diferenciados por nível
   - Sistema de links específicos por setor

4. **Sistema de Notificações**
   - Notificações em tempo real
   - Segmentação por grupos de usuários
   - Central de mensagens integrada
   - Histórico de comunicados

5. **Galeria Multimídia**
   - Upload de imagens com recorte inteligente
   - Galeria de vídeos organizável
   - Sistema de banners rotativos para homepage
   - Gerenciamento de mídia por categorias

6. **Indicadores Econômicos**
   - Dashboard com indicadores atualizáveis
   - Interface administrativa para gestão dos dados
   - Visualização responsiva e interativa

7. **Busca e Navegação Avançada**
   - Sistema de busca global com filtros
   - Navegação por breadcrumbs
   - Favoritos personalizáveis por usuário
   - Interface responsiva e acessível

## Arquitetura e Segurança

### Autenticação e Autorização
- **Middleware personalizado** para proteção de rotas
- **Row Level Security (RLS)** no Supabase para controle granular de acesso
- **Três níveis de usuário**: admin, sector_admin, user
- **Validação de sessão** em tempo real

### Banco de Dados
- **PostgreSQL** via Supabase com políticas RLS
- **Tabelas principais**: profiles, sectors, subsectors, notifications, system_links
- **Storage integrado** para upload de arquivos
- **Backup automático** e versionamento

### Performance e UX
- **App Router** do Next.js 14 para SSR otimizado
- **Componentes reutilizáveis** com Tailwind CSS
- **Loading states** e tratamento de erros
- **Interface responsiva** mobile-first

## Suporte e Manutenção

Para suporte técnico ou dúvidas sobre o sistema:
- Consulte a documentação em `CLAUDE.md` para desenvolvimento
- Verifique os logs de erro no painel do Supabase
- Utilize as ferramentas de desenvolvimento do Next.js