'use client';

import React from 'react';
import { Select as ChakraSelect } from '@chakra-ui/react';

// Import and re-export from our base components
import { Input, Textarea } from './base/Input';
export const FormInput = Input;
export const FormTextarea = Textarea;

// Simple Select wrapper that works with Chakra v3
export const FormSelect = React.forwardRef<HTMLSelectElement, any>(
  ({ label, error, helperText, required, children, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

// Export all form fields
const FormFields = {
  Input,
  Textarea,
  Select: FormSelect,
};

export default FormFields;