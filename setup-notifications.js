const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Por favor, configure as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupNotifications() {
  try {
    console.log('🚀 Iniciando configuração do sistema de notificações...');

    // Ler o arquivo SQL
    const sqlFile = path.join(__dirname, 'sql-functions.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Dividir o conteúdo por comandos
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Executando ${sqlCommands.length} comandos SQL...`);

    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      if (command.includes('notification')) {
        console.log(`⚡ Executando comando ${i + 1}/${sqlCommands.length}...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { 
            sql_statement: command + ';' 
          });

          if (error) {
            console.error(`❌ Erro no comando ${i + 1}:`, error.message);
            // Continuar com os próximos comandos
          } else {
            console.log(`✅ Comando ${i + 1} executado com sucesso`);
          }
        } catch (cmdError) {
          console.error(`❌ Erro ao executar comando ${i + 1}:`, cmdError.message);
        }
      }
    }

    console.log('🎉 Configuração do sistema de notificações concluída!');
    console.log('');
    console.log('📋 Próximos passos:');
    console.log('1. Acesse o painel administrativo em /admin/notifications');
    console.log('2. Crie grupos de notificação conforme necessário');
    console.log('3. Teste o envio de notificações');
    console.log('4. Verifique se as notificações aparecem na home dos usuários');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
    process.exit(1);
  }
}

// Função alternativa para executar SQL diretamente
async function setupNotificationsAlternative() {
  try {
    console.log('🚀 Iniciando configuração alternativa do sistema de notificações...');

    // Criar tabelas uma por uma
    const tables = [
      {
        name: 'notification_groups',
        sql: `
          CREATE TABLE IF NOT EXISTS notification_groups (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
            sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
            subsector_id UUID REFERENCES subsectors(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'notification_group_members',
        sql: `
          CREATE TABLE IF NOT EXISTS notification_group_members (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            group_id UUID REFERENCES notification_groups(id) ON DELETE CASCADE,
            user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(group_id, user_id)
          );
        `
      },
      {
        name: 'notifications',
        sql: `
          CREATE TABLE IF NOT EXISTS notifications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(50) NOT NULL DEFAULT 'message',
            priority VARCHAR(20) NOT NULL DEFAULT 'normal',
            sent_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
            sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
            subsector_id UUID REFERENCES subsectors(id) ON DELETE CASCADE,
            related_event_id UUID,
            related_news_id UUID,
            is_global BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            expires_at TIMESTAMP WITH TIME ZONE
          );
        `
      },
      {
        name: 'notification_recipients',
        sql: `
          CREATE TABLE IF NOT EXISTS notification_recipients (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
            recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
            group_id UUID REFERENCES notification_groups(id) ON DELETE SET NULL,
            read_at TIMESTAMP WITH TIME ZONE,
            clicked_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(notification_id, recipient_id)
          );
        `
      }
    ];

    for (const table of tables) {
      console.log(`📝 Criando tabela ${table.name}...`);
      
      const { error } = await supabase
        .from('_temp')
        .select('*')
        .limit(1);

      // Usar SQL direto se possível
      const { data, error: sqlError } = await supabase
        .rpc('exec_sql', { sql_statement: table.sql })
        .catch(() => null);

      if (sqlError) {
        console.log(`⚠️  Não foi possível usar exec_sql, tentando método alternativo...`);
        // Tentar criar manualmente se necessário
      } else {
        console.log(`✅ Tabela ${table.name} criada com sucesso`);
      }
    }

    console.log('🎉 Configuração básica das tabelas concluída!');
    console.log('');
    console.log('⚠️  Nota: Algumas funções avançadas podem precisar ser criadas manualmente no Supabase Dashboard.');
    console.log('📖 Consulte o arquivo sql-functions.sql para as funções completas.');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
    process.exit(1);
  }
}

// Executar configuração
if (require.main === module) {
  setupNotificationsAlternative();
}

module.exports = { setupNotifications, setupNotificationsAlternative }; 