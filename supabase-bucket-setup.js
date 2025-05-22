// Este é um script de referência para configurar buckets no Supabase
// É necessário executar estas consultas no painel do Supabase SQL Editor

/*
-- Criar um bucket chamado 'images' para armazenar as imagens do portal
INSERT INTO storage.buckets (id, name, public)
VALUES (
  'images',
  'images',
  true  -- Definido como public para permitir acesso sem autenticação
);

-- Configurar políticas de acesso para permitir que usuários autenticados façam upload de imagens
-- Permitir que qualquer usuário autenticado faça upload
CREATE POLICY "Usuários autenticados podem fazer upload 1" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'images' AND (storage.foldername(name))[1] = 'sector-news');

-- Permitir que qualquer usuário autenticado atualize seus próprios uploads
CREATE POLICY "Usuários autenticados podem atualizar seus próprios uploads 1" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'images' AND owner = auth.uid() AND (storage.foldername(name))[1] = 'sector-news');

-- Permitir que qualquer usuário autenticado delete seus próprios uploads
CREATE POLICY "Usuários autenticados podem deletar seus próprios uploads 1" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'images' AND owner = auth.uid() AND (storage.foldername(name))[1] = 'sector-news');

-- Permitir que os administradores gerenciem todos os arquivos
CREATE POLICY "Admins podem gerenciar todos os arquivos" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'images' 
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Permitir que administradores de setor gerenciem arquivos de seus setores
CREATE POLICY "Administradores de setor podem gerenciar arquivos de seus setores" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = 'sector-news'
    AND (storage.foldername(name))[2] IN (
      SELECT sector_id FROM sector_admins
      WHERE user_id = auth.uid()
    )
  );

-- Permitir que qualquer pessoa visualize as imagens (mesmo não autenticadas)
CREATE POLICY "Imagens públicas para visualização" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'images');
*/

console.log(`
=======================================
Instruções para configurar o Supabase Storage
=======================================

1. Acesse o painel do Supabase da sua aplicação
2. Vá até a seção "Storage" no menu lateral
3. Clique em "Criar novo bucket"
4. Nomeie o bucket como "images" e marque como público
5. Vá até a seção SQL Editor
6. Cole e execute os comandos SQL contidos neste arquivo para configurar as políticas de acesso
7. Verifique se as políticas foram criadas corretamente
`);

// Instruções para verificar se a configuração está funcionando
console.log(`
Para testar se a configuração está funcionando:
1. Faça upload de uma imagem de teste
2. Verifique se você consegue acessar a imagem via URL pública
3. Teste os diferentes níveis de permissão (usuário comum, admin, admin de setor)
`); 