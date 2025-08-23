/**
 * Format file size from bytes to human-readable format
 * @param bytes - Size in bytes (can be null)
 * @returns Formatted string (e.g., "1.5 MB", "0 B" for null/0/negative/NaN)
 */
export function formatFileSize(bytes: number | null): string {
  if (bytes == null || bytes <= 0 || isNaN(bytes)) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// ========== Date Formatting Utilities ==========

/**
 * Format date with full date and time
 * @param dateStr - Date string or null/undefined
 * @returns Formatted string (e.g., "15 de dezembro de 2024, 14:30")
 */
export function formatDate(dateStr: string | null | undefined): string {
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
 * Format date without time
 * @param dateStr - Date string
 * @returns Formatted string (e.g., "15 de dezembro de 2024")
 */
export function formatDateSimple(dateStr: string): string {
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
 * Format date with only day and month
 * @param dateStr - Date string
 * @returns Formatted string (e.g., "15 dez")
 */
export function formatDateShort(dateStr: string): string {
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
 * Format time only
 * @param dateStr - Date string
 * @returns Formatted string (e.g., "14:30")
 */
export function formatTime(dateStr: string): string {
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
 * Format event period
 * @param startDate - Start date string
 * @param endDate - End date string or null
 * @returns Formatted period string
 */
export function formatEventPeriod(startDate: string, endDate: string | null): string {
  if (!startDate) return '';
  
  try {
    const start = new Date(startDate);
    
    if (isNaN(start.getTime())) return '';
    
    const startFormatted = formatDateSimple(startDate);
    
    if (!endDate) {
      return startFormatted;
    }
    
    const end = new Date(endDate);
    
    if (isNaN(end.getTime())) {
      return startFormatted;
    }
    
    // Check if it's the same day
    if (start.toDateString() === end.toDateString()) {
      return `${formatDateSimple(startDate)} das ${formatTime(startDate)} às ${formatTime(endDate)}`;
    }
    
    const endFormatted = formatDateSimple(endDate);
    
    return `${startFormatted} até ${endFormatted}`;
  } catch {
    return '';
  }
}

/**
 * Format relative time (e.g., "há 2 horas", "em 3 dias")
 * @param dateStr - Date string
 * @returns Relative time string
 */
export function formatRelativeTime(dateStr: string): string {
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
        return formatDateSimple(dateStr);
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
      return formatDateSimple(dateStr);
    }
  } catch {
    return '';
  }
}

/**
 * Format event date with relative description
 * @param dateStr - Date string
 * @returns Formatted string (e.g., "Hoje", "Amanhã", "Em 3 dias")
 */
export function formatEventDate(dateStr: string): string {
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
      return formatDateShort(dateStr);
    }
  } catch {
    return '';
  }
}

/**
 * Format date for datetime-local input
 * @param dateStr - Date string or null/undefined
 * @returns Formatted string for input (e.g., "2024-12-15T14:30")
 */
export function formatForDateTimeInput(dateStr: string | null | undefined): string {
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
 * Check if a date has passed
 * @param dateStr - Date string
 * @returns Boolean indicating if date is in the past
 */
export function isPastDate(dateStr: string): boolean {
  try {
    return new Date(dateStr) < new Date();
  } catch {
    return false;
  }
}

/**
 * Get default expiration date (30 days from now)
 * @returns ISO date string
 */
export function getDefaultExpirationDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString();
}