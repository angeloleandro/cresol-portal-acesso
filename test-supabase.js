const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🔍 Testando autenticação Supabase...');
  console.log('URL:', supabaseUrl);
  console.log('');
  
  try {
    // Testar sessão
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erro ao obter sessão:', error);
      return;
    }
    
    if (session) {
      console.log('✅ Sessão válida encontrada!');
      console.log('Email:', session.user.email);
      console.log('ID:', session.user.id);
      console.log('Expira em:', new Date(session.expires_at * 1000).toLocaleString());
      
      // Buscar perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
      } else {
        console.log('');
        console.log('📦 Perfil do usuário:');
        console.log('Role:', profile.role);
        console.log('Nome:', profile.full_name);
      }
    } else {
      console.log('⚠️ Nenhuma sessão ativa');
    }
    
  } catch (err) {
    console.error('💥 Erro fatal:', err);
  }
}

testAuth();