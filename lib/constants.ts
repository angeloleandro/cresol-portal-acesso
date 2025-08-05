// Application constants

// Email validation
export const CRESOL_EMAIL_DOMAIN = '@cresol.com.br';

// Password generation
export const TEMP_PASSWORD_LENGTH = 10;
export const TEMP_PASSWORD_CHARSET = '36'; // Base36

// Admin configuration
export const ADMIN_EMAIL = 'comunicacao.fronteiras@cresol.com.br';
export const KNOWN_ADMIN_ID = '67552259-be23-4c9c-bd06-6d57a6c041eb';

// Helper functions
export function generateTemporaryPassword(): string {
  return Math.random().toString(36).slice(-TEMP_PASSWORD_LENGTH);
}

export function validateCrescolEmail(email: string): boolean {
  return email.endsWith(CRESOL_EMAIL_DOMAIN);
}