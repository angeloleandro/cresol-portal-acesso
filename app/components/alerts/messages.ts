import type { AlertMessage, CrudOperation, OperationResult, EntityContext } from './types';




/**
 * Mensagens para operações CRUD
 */
export const CRUD_MESSAGES = {
  // Operações de Criação
  create: {
    success: (entity: string): AlertMessage => ({
      title: `${entity} criado com sucesso!`,
      description: 'A operação foi concluída com êxito.'
    }),
    error: (entity: string, details?: string): AlertMessage => ({
      title: `Erro ao criar ${entity}`,
      description: details || 'Ocorreu um erro durante a criação. Tente novamente.'
    }),
    loading: (entity: string): AlertMessage => ({
      title: `Criando ${entity}...`,
      description: 'Aguarde enquanto processamos sua solicitação.'
    })
  },

  // Operações de Atualização
  update: {
    success: (entity: string): AlertMessage => ({
      title: `${entity} atualizado com sucesso!`,
      description: 'As alterações foram salvas.'
    }),
    error: (entity: string, details?: string): AlertMessage => ({
      title: `Erro ao atualizar ${entity}`,
      description: details || 'Não foi possível salvar as alterações. Tente novamente.'
    }),
    loading: (entity: string): AlertMessage => ({
      title: `Atualizando ${entity}...`,
      description: 'Salvando suas alterações.'
    })
  },

  // Operações de Exclusão
  delete: {
    success: (entity: string): AlertMessage => ({
      title: `${entity} excluído com sucesso!`,
      description: 'O item foi removido permanentemente.'
    }),
    error: (entity: string, details?: string): AlertMessage => ({
      title: `Erro ao excluir ${entity}`,
      description: details || 'Não foi possível remover o item. Tente novamente.'
    }),
    loading: (entity: string): AlertMessage => ({
      title: `Excluindo ${entity}...`,
      description: 'Removendo o item do sistema.'
    })
  },

  // Operações de Busca/Carregamento
  fetch: {
    success: (entity: string): AlertMessage => ({
      title: `${entity} carregado com sucesso!`,
      description: 'Os dados foram atualizados.'
    }),
    error: (entity: string, details?: string): AlertMessage => ({
      title: `Erro ao carregar ${entity}`,
      description: details || 'Não foi possível carregar os dados. Verifique sua conexão.'
    }),
    loading: (entity: string): AlertMessage => ({
      title: `Carregando ${entity}...`,
      description: 'Buscando informações atualizadas.'
    })
  },

  // Operações de Upload
  upload: {
    success: (entity: string): AlertMessage => ({
      title: `Upload de ${entity} concluído!`,
      description: 'O arquivo foi enviado com sucesso.'
    }),
    error: (entity: string, details?: string): AlertMessage => ({
      title: `Erro no upload de ${entity}`,
      description: details || 'Falha no envio do arquivo. Verifique o formato e tamanho.'
    }),
    loading: (entity: string): AlertMessage => ({
      title: `Enviando ${entity}...`,
      description: 'Upload em andamento. Por favor, aguarde.'
    })
  },

  // Operações de Download
  download: {
    success: (entity: string): AlertMessage => ({
      title: `Download de ${entity} iniciado!`,
      description: 'O arquivo será baixado automaticamente.'
    }),
    error: (entity: string, details?: string): AlertMessage => ({
      title: `Erro no download de ${entity}`,
      description: details || 'Não foi possível baixar o arquivo. Tente novamente.'
    }),
    loading: (entity: string): AlertMessage => ({
      title: `Preparando download de ${entity}...`,
      description: 'Gerando arquivo para download.'
    })
  }
} as const;

/**
 * Mensagens específicas por módulo do sistema
 */
export const MODULE_MESSAGES = {
  // Gestão de Usuários
  users: {
    created: () => CRUD_MESSAGES.create.success('Usuário'),
    updated: () => CRUD_MESSAGES.update.success('Usuário'),
    deleted: () => CRUD_MESSAGES.delete.success('Usuário'),
    roleChanged: (role: string): AlertMessage => ({
      title: 'Permissão alterada com sucesso!',
      description: `O usuário agora tem o papel de ${role}.`
    }),
    activated: (): AlertMessage => ({
      title: 'Usuário ativado com sucesso!',
      description: 'O usuário pode agora acessar o sistema.'
    }),
    deactivated: (): AlertMessage => ({
      title: 'Usuário desativado com sucesso!',
      description: 'O acesso do usuário foi bloqueado.'
    })
  },

  // Gestão de Setores
  sectors: {
    created: () => CRUD_MESSAGES.create.success('Setor'),
    updated: () => CRUD_MESSAGES.update.success('Setor'),
    deleted: () => CRUD_MESSAGES.delete.success('Setor'),
    memberAdded: (): AlertMessage => ({
      title: 'Membro adicionado com sucesso!',
      description: 'O usuário foi vinculado ao setor.'
    }),
    memberRemoved: (): AlertMessage => ({
      title: 'Membro removido com sucesso!',
      description: 'O usuário foi desvinculado do setor.'
    })
  },

  // Gestão de Subsetores
  subsectors: {
    created: () => CRUD_MESSAGES.create.success('Subsetor'),
    updated: () => CRUD_MESSAGES.update.success('Subsetor'),
    deleted: () => CRUD_MESSAGES.delete.success('Subsetor'),
    teamUpdated: (): AlertMessage => ({
      title: 'Equipe atualizada com sucesso!',
      description: 'As informações da equipe foram salvas.'
    })
  },

  // Gestão de Conteúdo
  content: {
    newsCreated: () => CRUD_MESSAGES.create.success('Notícia'),
    newsUpdated: () => CRUD_MESSAGES.update.success('Notícia'),
    newsDeleted: () => CRUD_MESSAGES.delete.success('Notícia'),
    eventCreated: () => CRUD_MESSAGES.create.success('Evento'),
    eventUpdated: () => CRUD_MESSAGES.update.success('Evento'),
    eventDeleted: () => CRUD_MESSAGES.delete.success('Evento'),
    messageCreated: () => CRUD_MESSAGES.create.success('Mensagem'),
    messageUpdated: () => CRUD_MESSAGES.update.success('Mensagem'),
    messageDeleted: () => CRUD_MESSAGES.delete.success('Mensagem')
  },

  // Gestão de Mídia
  media: {
    imageUploaded: () => CRUD_MESSAGES.upload.success('imagem'),
    videoUploaded: () => CRUD_MESSAGES.upload.success('vídeo'),
    fileDeleted: () => CRUD_MESSAGES.delete.success('arquivo'),
    bannerCreated: () => CRUD_MESSAGES.create.success('Banner'),
    bannerUpdated: () => CRUD_MESSAGES.update.success('Banner'),
    bannerDeleted: () => CRUD_MESSAGES.delete.success('Banner')
  },

  // Grupos
  groups: {
    created: () => CRUD_MESSAGES.create.success('Grupo'),
    updated: () => CRUD_MESSAGES.update.success('Grupo'),
    deleted: () => CRUD_MESSAGES.delete.success('Grupo'),
    memberAdded: (): AlertMessage => ({
      title: 'Membro adicionado com sucesso!',
      description: 'O usuário foi adicionado ao grupo.'
    }),
    memberRemoved: (): AlertMessage => ({
      title: 'Membro removido com sucesso!',
      description: 'O usuário foi removido do grupo.'
    })
  },

  // Coleções
  collections: {
    created: () => CRUD_MESSAGES.create.success('Coleção'),
    updated: () => CRUD_MESSAGES.update.success('Coleção'),
    deleted: () => CRUD_MESSAGES.delete.success('Coleção'),
    statusChanged: (isActive: boolean): AlertMessage => ({
      title: `Coleção ${isActive ? 'ativada' : 'desativada'} com sucesso!`,
      description: `A coleção está agora ${isActive ? 'disponível' : 'indisponível'} para visualização.`
    }),
    itemsAdded: (count: number): AlertMessage => ({
      title: `${count} ${count === 1 ? 'item adicionado' : 'itens adicionados'} com sucesso!`,
      description: 'Os novos itens estão disponíveis na coleção.'
    })
  }
} as const;

/**
 * Mensagens de sistema e validação
 */
export const SYSTEM_MESSAGES = {
  // Formulários
  form: {
    submitted: (): AlertMessage => ({
      title: 'Formulário enviado com sucesso!',
      description: 'Suas informações foram processadas.'
    }),
    validationError: (): AlertMessage => ({
      title: 'Verifique os campos obrigatórios',
      description: 'Alguns campos precisam ser preenchidos corretamente.'
    }),
    saved: (): AlertMessage => ({
      title: 'Alterações salvas com sucesso!',
      description: 'Suas configurações foram atualizadas.'
    })
  },

  // Autenticação
  auth: {
    loginSuccess: (): AlertMessage => ({
      title: 'Login realizado com sucesso!',
      description: 'Bem-vindo ao sistema Cresol.'
    }),
    logoutSuccess: (): AlertMessage => ({
      title: 'Logout realizado com sucesso!',
      description: 'Até logo!'
    }),
    unauthorized: (): AlertMessage => ({
      title: 'Acesso não autorizado',
      description: 'Você não tem permissão para acessar este recurso.'
    }),
    sessionExpired: (): AlertMessage => ({
      title: 'Sessão expirada',
      description: 'Por favor, faça login novamente.'
    })
  },

  // Conectividade
  network: {
    offline: (): AlertMessage => ({
      title: 'Você está offline',
      description: 'Verifique sua conexão com a internet.'
    }),
    reconnected: (): AlertMessage => ({
      title: 'Conectado novamente!',
      description: 'Sua conexão foi reestabelecida.'
    }),
    timeout: (): AlertMessage => ({
      title: 'Tempo limite excedido',
      description: 'A operação demorou muito para responder. Tente novamente.'
    })
  },

  // Confirmações
  confirmation: {
    deleteWarning: (entity: string): AlertMessage => ({
      title: `Tem certeza que deseja excluir este ${entity}?`,
      description: 'Esta ação não pode ser desfeita.'
    }),
    unsavedChanges: (): AlertMessage => ({
      title: 'Você tem alterações não salvas',
      description: 'Deseja salvar antes de continuar?'
    })
  }
} as const;

/**
 * Função helper para gerar mensagem dinâmica
 */
/**
 * generateCrudMessage function
 * @todo Add proper documentation
 */
export function GenerateCrudMessage(
  operation: CrudOperation,
  result: OperationResult,
  entity: string,
  details?: string
): AlertMessage {
  return CRUD_MESSAGES[operation][result](entity, details);
}

/**
 * Função helper para mensagens com contexto de entidade
 */
/**
 * generateEntityMessage function
 * @todo Add proper documentation
 */
export function GenerateEntityMessage(
  operation: CrudOperation,
  result: OperationResult,
  context: EntityContext,
  details?: string
): AlertMessage {
  const { name, itemName, count } = context;
  
  if (count && count > 1) {
    const message = CRUD_MESSAGES[operation][result](name, details);
    return {
      ...message,
      title: message.title.replace(name, `${count} ${name}s`)
    };
  }
  
  const entityDisplay = itemName ? `${name} "${itemName}"` : name;
  return CRUD_MESSAGES[operation][result](entityDisplay, details);
}

/**
 * Mensagens de erro comuns para debugging
 */
export const ERROR_MESSAGES = {
  generic: (): AlertMessage => ({
    title: 'Ops! Algo deu errado',
    description: 'Ocorreu um erro inesperado. Tente novamente em alguns instantes.'
  }),
  network: (): AlertMessage => ({
    title: 'Erro de conexão',
    description: 'Verifique sua conexão com a internet e tente novamente.'
  }),
  server: (): AlertMessage => ({
    title: 'Erro no servidor',
    description: 'Nossos servidores estão temporariamente indisponíveis.'
  }),
  notFound: (entity: string): AlertMessage => ({
    title: `${entity} não encontrado`,
    description: 'O item solicitado não existe ou foi removido.'
  }),
  forbidden: (): AlertMessage => ({
    title: 'Acesso negado',
    description: 'Você não tem permissão para realizar esta ação.'
  }),
  validation: (field: string): AlertMessage => ({
    title: 'Dados inválidos',
    description: `O campo "${field}" contém informações inválidas.`
  })
} as const;