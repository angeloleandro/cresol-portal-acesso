// Utilitários para formatação de datas

// Formatar data para exibição
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return 'Data inválida';
  }
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('pt-BR', options);
};

// Formatar data simples (sem horário)
export const formatDateSimple = (dateStr: string): string => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  };
  return date.toLocaleDateString('pt-BR', options);
};

// Formatar período de evento
export const formatEventPeriod = (startDate: string, endDate: string | null): string => {
  const start = new Date(startDate);
  const startFormatted = formatDateSimple(startDate);
  
  if (!endDate) {
    return startFormatted;
  }
  
  const end = new Date(endDate);
  const endFormatted = formatDateSimple(endDate);
  
  // Se for o mesmo dia, mostrar apenas uma vez
  if (start.toDateString() === end.toDateString()) {
    return startFormatted;
  }
  
  return `${startFormatted} até ${endFormatted}`;
};

// Formatar para input datetime-local
export const formatForDateTimeInput = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Verificar se uma data já passou
export const isPastDate = (dateStr: string): boolean => {
  return new Date(dateStr) < new Date();
};

// Obter data de expiração padrão (30 dias a partir de hoje)
export const getDefaultExpirationDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString();
};

// Formatar tempo relativo (ex: "há 2 horas", "em 3 dias")
export const formatRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  
  // Lidar com datas futuras
  if (diffInMs < 0) {
    const absDiffInMs = Math.abs(diffInMs);
    const absDiffInSeconds = Math.floor(absDiffInMs / 1000);
    const absDiffInMinutes = Math.floor(absDiffInSeconds / 60);
    const absDiffInHours = Math.floor(absDiffInMinutes / 60);
    const absDiffInDays = Math.floor(absDiffInHours / 24);
    
    if (absDiffInSeconds < 60) {
      return 'agora mesmo';
    } else if (absDiffInMinutes < 60) {
      return `em ${absDiffInMinutes} ${absDiffInMinutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (absDiffInHours < 24) {
      return `em ${absDiffInHours} ${absDiffInHours === 1 ? 'hora' : 'horas'}`;
    } else if (absDiffInDays < 7) {
      return `em ${absDiffInDays} ${absDiffInDays === 1 ? 'dia' : 'dias'}`;
    } else {
      return formatDateSimple(dateStr);
    }
  }
  
  // Lidar com datas passadas
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return 'agora mesmo';
  } else if (diffInMinutes < 60) {
    return `há ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
  } else if (diffInHours < 24) {
    return `há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  } else if (diffInDays < 7) {
    return `há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`;
  } else {
    return formatDateSimple(dateStr);
  }
};