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