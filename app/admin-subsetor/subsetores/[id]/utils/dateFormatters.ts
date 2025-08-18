// Funções utilitárias para formatação de datas

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Hoje';
  } else if (diffDays === 1) {
    return 'Amanhã';
  } else if (diffDays === -1) {
    return 'Ontem';
  } else if (diffDays > 0 && diffDays <= 7) {
    return `Em ${diffDays} dias`;
  } else if (diffDays < 0 && diffDays >= -7) {
    return `Há ${Math.abs(diffDays)} dias`;
  } else {
    return formatDateShort(dateString);
  }
}