/**
 * Forms Components - Professional Form Library
 * 
 * Enterprise-grade form components with:
 * - Chakra UI v3 design patterns
 * - React Hook Form integration
 * - WCAG 2.1 AA accessibility compliance
 * - Cresol design system integration
 * - TypeScript support
 * - Professional loading and error states
 * - Mobile-first responsive design
 * 
 * Components:
 * - FormField: Unified field wrapper with labels, errors, help text
 * - FormInput: Professional input with icons, validation, states
 * - FormSelect: Advanced dropdown with search, keyboard navigation
 * 
 * Usage:
 * ```tsx
 * import { FormField, FormInput, FormSelect } from '@/app/components/forms';
 * 
 * <FormField label="Email" error={errors.email?.message} required>
 *   <FormInput 
 *     type="email" 
 *     placeholder="seu@email.com"
 *     startIcon="Mail"
 *     clearable
 *   />
 * </FormField>
 * 
 * <FormField label="Cargo" required>
 *   <FormSelect 
 *     options={positions}
 *     searchable
 *     placeholder="Selecione um cargo..."
 *   />
 * </FormField>
 * ```
 */

export { FormField, type FormFieldProps } from './FormField';
export { FormInput, type FormInputProps } from './FormInput';
export { FormSelect, type FormSelectProps, type SelectOption } from './FormSelect';
export { StandardSelect } from './StandardSelect';
export { ChakraSelect, type ChakraSelectProps, type ChakraSelectOption } from './ChakraSelect';

// Types are already exported with the components above

// Form validation helpers (future enhancement)
export const formUtils = {
  // Email validation
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Cresol corporate email validation
  validateCresolEmail: (email: string): boolean => {
    return email.endsWith('@cresol.com.br');
  },
  
  // Password strength validation
  validatePassword: (password: string): { isValid: boolean; strength: 'weak' | 'medium' | 'strong' } => {
    if (password.length < 8) {
      return { isValid: false, strength: 'weak' };
    }
    
    let score = 0;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 3) return { isValid: false, strength: 'weak' };
    if (score === 3) return { isValid: true, strength: 'medium' };
    return { isValid: true, strength: 'strong' };
  },
  
  // Required field validation
  required: (value: any): boolean => {
    if (typeof value === 'string') return value.trim().length > 0;
    return value != null && value !== '';
  }
};

// Form constants
export const FORM_SIZES = ['sm', 'md', 'lg'] as const;
export const FORM_VARIANTS = ['outline', 'filled', 'underline'] as const;

export type FormSize = typeof FORM_SIZES[number];
export type FormVariant = typeof FORM_VARIANTS[number];