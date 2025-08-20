// Funções utilitárias para formatação de datas
// Padronizado com as funções do setor

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric'
    });
  } catch {
    return '';
  }
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric'
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', {
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

export function formatEventPeriod(startDate: string, endDate: string | null): string {
  if (!startDate) return '';
  
  try {
    const start = new Date(startDate);
    
    if (isNaN(start.getTime())) return '';
    
    const startFormatted = start.toLocaleDateString('pt-BR', {
      minute: '2-digit'
    });
    
    if (!endDate) {
      return startFormatted;
    }
    
    const end = new Date(endDate);
    
    if (isNaN(end.getTime())) {
      return startFormatted;
    }
    
    // Check if it's the same day
    if (start.toDateString() === end.toDateString()) {
      return `${start.toLocaleDateString('pt-BR', {
        year: 'numeric'
      })} das ${start.toLocaleTimeString('pt-BR', {
        minute: '2-digit'
      })} às ${end.toLocaleTimeString('pt-BR', {
        minute: '2-digit'
      })}`;
    }
    
    const endFormatted = end.toLocaleDateString('pt-BR', {
      minute: '2-digit'
    });
    
    return `${startFormatted} - ${endFormatted}`;
  } catch {
    return '';
  }
}

export function formatForDateTimeInput(dateString: string | null | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    // Format to YYYY-MM-DDTHH:mm for datetime-local input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
}