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