# Portal de Acesso Cresol

Portal de acesso unificado para os sistemas de informação empresarial interna da Cresol.

## Tecnologias Utilizadas

- [Next.js](https://nextjs.org/) - Framework React para desenvolvimento web
- [TypeScript](https://www.typescriptlang.org/) - Superset JavaScript com tipagem estática
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [Supabase](https://supabase.com/) - Plataforma de backend com autenticação e banco de dados

## Funcionalidades

- Autenticação de usuários (login/logout)
- Cadastro de novos usuários com aprovação administrativa
- Perfis de usuário
- Acesso centralizado aos sistemas internos da Cresol

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

4. Acesse o aplicativo em `http://localhost:3000`

## Estrutura do Projeto

- `/app` - Páginas da aplicação (Next.js App Router)
- `/components` - Componentes reutilizáveis
- `/lib` - Utilitários e configurações
- `/public` - Arquivos estáticos

## Deploy

Este projeto está configurado para deploy na [Vercel](https://vercel.com/).

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
```

Um arquivo de referência `supabase-bucket-setup.js` está disponível no repositório com todas as consultas SQL necessárias e instruções detalhadas.