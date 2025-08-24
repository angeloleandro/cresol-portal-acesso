

export type AlertStatus = 'success' | 'error' | 'warning' | 'info' | 'neutral';

export type AlertVariant = 'subtle' | 'solid' | 'surface';

export type AlertPosition = 
  | 'top'
  | 'bottom'
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left';

export type AlertSize = 'sm' | 'md' | 'lg';

/**
 * Opções para criar um alerta
 */
export interface AlertOptions {
  /** Status do alerta - determina cor e ícone */
  status: AlertStatus;
  
  /** Título principal do alerta */
  title: string;
  
  /** Descrição opcional com mais detalhes */
  description?: string;
  
  /** Duração em ms. null = não remove automaticamente */
  duration?: number | null;
  
  /** Permite fechar o alerta manualmente */
  isClosable?: boolean;
  
  /** Posição do toast na tela */
  position?: AlertPosition;
  
  /** Variante visual do alerta */
  variant?: AlertVariant;
  
  /** Tamanho do alerta */
  size?: AlertSize;
  
  /** ID único para evitar duplicados */
  id?: string;
  
  /** Callback quando o alerta é fechado */
  onClose?: () => void;
  
  /** Ação personalizada (botão/link) */
  action?: {
    label: string;
    onClick: () => void;
  };
  
  /** Ícone customizado */
  icon?: React.ReactNode;
}

/**
 * Alerta ativo no sistema
 */
export interface ActiveAlert extends Required<Omit<AlertOptions, 'onClose' | 'action' | 'icon'>> {
  /** Timestamp de criação */
  createdAt: number;
  
  /** Callback quando fechado */
  onClose?: () => void;
  
  /** Ação opcional */
  action?: AlertOptions['action'];
  
  /** Ícone customizado */
  icon?: React.ReactNode;
}

/**
 * Context do provedor de alertas
 */
export interface AlertContextValue {
  /** Lista de alertas ativos */
  alerts: ActiveAlert[];
  
  /** Adicionar novo alerta */
  showAlert: (options: AlertOptions) => () => void;
  
  /** Alertas de conveniência */
  showSuccess: (title: string, description?: string, options?: Partial<AlertOptions>) => () => void;
  showError: (title: string, description?: string, options?: Partial<AlertOptions>) => () => void;
  showWarning: (title: string, description?: string, options?: Partial<AlertOptions>) => () => void;
  showInfo: (title: string, description?: string, options?: Partial<AlertOptions>) => () => void;
  
  /** Remover alerta específico */
  removeAlert: (id: string) => void;
  
  /** Limpar todos os alertas */
  clearAlerts: () => void;
  
  /** Configurações globais */
  config: AlertConfig;
  
  /** Atualizar configurações */
  updateConfig: (config: Partial<AlertConfig>) => void;
  
  /** Métodos utilitários */
  showLoading: (message?: string, options?: Partial<AlertOptions>) => () => void;
  showProgress: (title: string, progress: number, options?: Partial<AlertOptions>) => () => void;
}

/**
 * Configurações globais do sistema de alertas
 */
export interface AlertConfig {
  /** Duração padrão por status (ms) */
  defaultDurations: Record<AlertStatus, number | null>;
  
  /** Posição padrão dos toasts */
  defaultPosition: AlertPosition;
  
  /** Variante padrão */
  defaultVariant: AlertVariant;
  
  /** Tamanho padrão */
  defaultSize: AlertSize;
  
  /** Máximo de alertas simultâneos */
  maxAlerts: number;
  
  /** Animar entrada/saída */
  animationEnabled: boolean;
  
  /** Pausar timer ao hover */
  pauseOnHover: boolean;
  
  /** Fechar ao clicar fora */
  closeOnClickOutside: boolean;
}

/**
 * Props do componente Alert
 */
export interface AlertProps extends Omit<AlertOptions, 'id'> {
  /** Se é um toast ou inline */
  mode?: 'toast' | 'inline';
  
  /** Callback quando removido */
  onRemove?: () => void;
  
  /** Se está sendo animado para saída */
  isExiting?: boolean;
  
  /** Props adicionais para o elemento root */
  rootProps?: Record<string, any>;
}

/**
 * Props do AlertContainer
 */
export interface AlertContainerProps {
  /** Posição dos alertas */
  position?: AlertPosition;
  
  /** Classe CSS customizada */
  className?: string;
  
  /** Z-index personalizado */
  zIndex?: number;
}

/**
 * Mensagem padronizada do sistema
 */
export interface AlertMessage {
  title: string;
  description?: string;
}

/**
 * Tipos de operações CRUD para mensagens padronizadas
 */
export type CrudOperation = 'create' | 'update' | 'delete' | 'fetch' | 'upload' | 'download';

/**
 * Resultado de operação para determinar status do alerta
 */
export type OperationResult = 'success' | 'error' | 'loading';

/**
 * Contexto de entidade para mensagens dinâmicas
 */
export interface EntityContext {
  /** Nome da entidade (ex: "usuário", "setor") */
  name: string;
  
  /** Nome específico do item (ex: "João Silva") */
  itemName?: string;
  
  /** Quantidade para operações em lote */
  count?: number;
}