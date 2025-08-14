'use client';

import React from 'react';
import { ConfigProvider } from 'antd';
import type { ThemeConfig } from 'antd';
import ptBR from 'antd/locale/pt_BR';

// Tema customizado com cores Cresol
const cresolTheme: ThemeConfig = {
  token: {
    // Cores principais
    colorPrimary: '#F58220', // Cresol Orange
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#1890ff',
    
    // Cores de background
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f5f5',
    
    // Cores de texto
    colorText: 'rgba(0, 0, 0, 0.88)',
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    colorTextTertiary: 'rgba(0, 0, 0, 0.45)',
    
    // Bordas
    colorBorder: '#d9d9d9',
    borderRadius: 6,
    
    // Fontes
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
  },
  components: {
    // Configuração específica do Spin
    Spin: {
      colorPrimary: '#F58220', // Cor do spinner
      colorBgContainer: 'rgba(255, 255, 255, 0.9)', // Background do container
      contentHeight: 400, // Altura mínima do conteúdo
    },
    // Configuração de botões
    Button: {
      colorPrimary: '#F58220',
      algorithm: true, // Habilita algoritmo de cores derivadas
    },
    // Configuração de mensagens/notificações
    Message: {
      colorBgElevated: '#ffffff',
      colorText: 'rgba(0, 0, 0, 0.88)',
    },
    // Configuração de modais
    Modal: {
      colorBgElevated: '#ffffff',
      colorText: 'rgba(0, 0, 0, 0.88)',
    },
  },
};

interface AntdConfigProviderProps {
  children: React.ReactNode;
}

/**
 * Provider global para configuração do Ant Design
 * Define tema com cores Cresol e localização pt-BR
 */
export const AntdConfigProvider: React.FC<AntdConfigProviderProps> = ({ children }) => {
  return (
    <ConfigProvider 
      theme={cresolTheme}
      locale={ptBR}
      // Configurações globais
      autoInsertSpaceInButton={false} // Não inserir espaço automático em botões chineses
      componentSize="middle" // Tamanho padrão dos componentes
      // Configuração de formulários
      form={{
        validateMessages: {
          required: '${label} é obrigatório',
          types: {
            email: '${label} não é um email válido',
            number: '${label} não é um número válido',
          },
          number: {
            range: '${label} deve estar entre ${min} e ${max}',
          },
        },
      }}
      // Configuração de espaços vazios
      renderEmpty={() => (
        <div className="text-center py-8 text-gray-400">
          Nenhum dado disponível
        </div>
      )}
    >
      {children}
    </ConfigProvider>
  );
};

export default AntdConfigProvider;