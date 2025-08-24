import { createClient } from '@supabase/supabase-js';


/**
 * directUpdateUserRole function
 * @todo Add proper documentation
 */
export async function directUpdateUserRole(userId: string, newRole: 'user' | 'sector_admin' | 'admin') {
  // Validação básica
  if (!userId || !newRole) {
    throw new Error('ID do usuário e novo papel são obrigatórios');
  }
  
  if (newRole !== 'user' && newRole !== 'sector_admin' && newRole !== 'admin') {
    throw new Error('Papel inválido. Deve ser: user, sector_admin ou admin');
  }
  
  // Obter configurações do Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Configuração do Supabase incompleta no servidor');
  }
  
  // Criar cliente com permissões de serviço
  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
    db: { schema: 'public' }
  });
  
  // 1. Primeiro tentar consultar o usuário para verificar se existe
  const { data: user, error: userError } = await supabaseAdmin
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .single();
  
  if (userError) {
    throw new Error(`Erro ao verificar usuário: ${userError.message}`);
  }
  
  if (!user) {
    throw new Error(`Usuário com ID ${userId} não encontrado`);
  }
  
  if (user.role === newRole) {
    return { success: true, noChange: true };
  }

  // 2. Executar SQL direto para atualizar o papel
  // Usando RPC para executar SQL com parâmetros
  const result = await supabaseAdmin.rpc('update_user_role', {
    user_id: userId,
    new_role: newRole
  });

  if (result.error) {
    throw new Error(`Erro ao executar SQL: ${result.error.message}`);
  }
  
  // 3. Verificar se a atualização foi bem-sucedida
  const { data: updatedUser, error: verifyError } = await supabaseAdmin
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .single();
  
  if (verifyError) {
    throw new Error(`Erro ao verificar atualização: ${verifyError.message}`);
  }
  
  if (updatedUser.role !== newRole) {
    throw new Error(`A atualização falhou: papel ainda é ${updatedUser.role}`);
  }
  
  return { success: true };
} 