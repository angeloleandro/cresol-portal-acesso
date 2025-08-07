import React from 'react';

interface FormFieldGroupProps {
  title: string;
  children: React.ReactNode;
}

export const FormFieldGroup: React.FC<FormFieldGroupProps> = ({ title, children }) => (
  <div className="space-y-3">
    <h4 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-1">
      {title}
    </h4>
    {children}
  </div>
);