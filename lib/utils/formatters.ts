
/**
 * formatFileSize function
 * @todo Add proper documentation
 */
export function FormatFileSize(bytes: number | null): string {
  if (bytes == null || bytes <= 0 || isNaN(bytes)) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// ========== Date Formatting Utilities ==========

/**
 * formatDate function
 * @todo Add proper documentation
 */
export function FormatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('pt-BR', options);
  } catch {
    return '';
  }
}

/**
 * formatDateSimple function
 * @todo Add proper documentation
 */
export function FormatDateSimple(dateStr: string): string {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('pt-BR', options);
  } catch {
    return '';
  }
}

/**
 * formatDateShort function
 * @todo Add proper documentation
 */
export function FormatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short'
    });
  } catch {
    return '';
  }
}

/**
 * formatTime function
 * @todo Add proper documentation
 */
export function FormatTime(dateStr: string): string {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}

/**
 * formatEventPeriod function
 * @todo Add proper documentation
 */
export function FormatEventPeriod(startDate: string, endDate: string | null): string {
  if (!startDate) return '';
  
  try {
    const start = new Date(startDate);
    
    if (isNaN(start.getTime())) return '';
    
    const startFormatted = FormatDateSimple(startDate);
    
    if (!endDate) {
      return startFormatted;
    }
    
    const end = new Date(endDate);
    
    if (isNaN(end.getTime())) {
      return startFormatted;
    }
    
    // Check if it's the same day
    if (start.toDateString() === end.toDateString()) {
      return `${FormatDateSimple(startDate)} das ${FormatTime(startDate)} às ${FormatTime(endDate)}`;
    }
    
    const endFormatted = FormatDateSimple(endDate);
    
    return `${startFormatted} até ${endFormatted}`;
  } catch {
    return '';
  }
}

/**
 * formatRelativeTime function
 * @todo Add proper documentation
 */
export function FormatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    
    // Handle future dates
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
        return FormatDateSimple(dateStr);
      }
    }
    
    // Handle past dates
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
      return FormatDateSimple(dateStr);
    }
  } catch {
    return '';
  }
}

/**
 * formatEventDate function
 * @todo Add proper documentation
 */
export function FormatEventDate(dateStr: string): string {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
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
      return FormatDateShort(dateStr);
    }
  } catch {
    return '';
  }
}

/**
 * formatForDateTimeInput function
 * @todo Add proper documentation
 */
export function FormatForDateTimeInput(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
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

/**
 * isPastDate function
 * @todo Add proper documentation
 */
export function IsPastDate(dateStr: string): boolean {
  try {
    return new Date(dateStr) < new Date();
  } catch {
    return false;
  }
}

/**
 * getDefaultExpirationDate function
 * @todo Add proper documentation
 */
export function GetDefaultExpirationDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString();
}