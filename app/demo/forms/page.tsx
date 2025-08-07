'use client';

import React, { useState } from 'react';
import { FormField, FormInput, FormSelect, type SelectOption } from '@/app/components/forms';

/**
 * Demo page for professional form components
 * 
 * This page demonstrates the usage of the new professional form components:
 * - FormField: Unified wrapper with labels, errors, help text
 * - FormInput: Professional input with icons, validation, states  
 * - FormSelect: Advanced dropdown with search, keyboard navigation
 * 
 * Based on Chakra UI v3 patterns with Cresol design system integration
 * Full WCAG 2.1 AA accessibility compliance
 */
export default function FormsDemo() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    position: '',
    workLocation: '',
    department: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  // Sample data for selects
  const positions: SelectOption[] = [
    { value: '1', label: 'Gerente Geral', description: 'Administração Geral' },
    { value: '2', label: 'Analista Financeiro', description: 'Análise e Planejamento', group: 'Financeiro' },
    { value: '3', label: 'Analista de Crédito', description: 'Avaliação de Risco', group: 'Financeiro' },
    { value: '4', label: 'Desenvolvedor Frontend', description: 'Desenvolvimento Web', group: 'Tecnologia' },
    { value: '5', label: 'Desenvolvedor Backend', description: 'APIs e Sistemas', group: 'Tecnologia' },
    { value: '6', label: 'Designer UX/UI', description: 'Experiência do Usuário', group: 'Tecnologia' },
    { value: '7', label: 'Atendente', description: 'Atendimento ao Cliente', group: 'Atendimento' },
    { value: '8', label: 'Supervisor de Atendimento', description: 'Gestão de Equipe', group: 'Atendimento' }
  ];
  
  const workLocations: SelectOption[] = [
    { value: 'matriz', label: 'Matriz - Cascavel', description: 'Sede principal' },
    { value: 'filial-1', label: 'Filial Toledo', description: 'Agência Toledo' },
    { value: 'filial-2', label: 'Filial Marechal Rondon', description: 'Agência Marechal Rondon' },
    { value: 'filial-3', label: 'Filial Assis Chateaubriand', description: 'Agência Assis Chateaubriand' },
    { value: 'remote', label: 'Trabalho Remoto', description: 'Home office' }
  ];
  
  const departments: SelectOption[] = [
    { value: 'admin', label: 'Administração' },
    { value: 'finance', label: 'Financeiro' },
    { value: 'tech', label: 'Tecnologia' },
    { value: 'hr', label: 'Recursos Humanos' },
    { value: 'customer-service', label: 'Atendimento ao Cliente' }
  ];
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    
    // Simple validation example
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'E-mail deve ter formato válido';
    } else if (!formData.email.endsWith('@cresol.com.br')) {
      newErrors.email = 'Use seu e-mail corporativo @cresol.com.br';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter no mínimo 8 caracteres';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.workLocation) {
      newErrors.workLocation = 'Local de trabalho é obrigatório';
    }
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
      } else {
        alert('Formulário enviado com sucesso! ✅\n\nDados:\n' + JSON.stringify(formData, null, 2));
      }
    }, 1500);
  };
  
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const handleClear = (field: string) => {
    setFormData(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Componentes de Formulário Profissionais
          </h1>
          <p className="text-gray-600">
            Demonstração dos componentes FormField, FormInput e FormSelect
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Baseado nos padrões Chakra UI v3 com design system Cresol | WCAG 2.1 AA
          </p>
        </div>
        
        {/* Main Form Demo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Formulário de Cadastro Completo
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Informações Pessoais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField 
                  label="Nome Completo" 
                  error={errors.name}
                  helpText="Digite seu nome completo"
                  required
                >
                  <FormInput 
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    placeholder="Seu nome completo"
                    disabled={loading}
                    clearable
                    onClear={() => handleClear('name')}
                  />
                </FormField>
                
                <FormField 
                  label="E-mail Corporativo" 
                  error={errors.email}
                  helpText="Use seu e-mail @cresol.com.br"
                  required
                >
                  <FormInput 
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    placeholder="seu@cresol.com.br"
                    startIcon="Mail"
                    disabled={loading}
                    clearable
                    onClear={() => handleClear('email')}
                  />
                </FormField>
              </div>
            </div>
            
            {/* Authentication Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Autenticação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField 
                  label="Senha" 
                  error={errors.password}
                  helpText="Mínimo 8 caracteres"
                  required
                >
                  <FormInput 
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    placeholder="Digite sua senha..."
                    disabled={loading}
                    showPasswordToggle
                  />
                </FormField>
                
                <div className="flex items-end">
                  <FormField label="Demonstração de Estados" className="w-full">
                    <FormInput 
                      type="text"
                      placeholder="Campo desabilitado"
                      disabled
                      startIcon="Info"
                    />
                  </FormField>
                </div>
              </div>
            </div>
            
            {/* Work Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Informações Profissionais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField 
                  label="Cargo" 
                  error={errors.position}
                  helpText="Selecione seu cargo atual"
                >
                  <FormSelect
                    options={positions}
                    value={formData.position}
                    onChange={handleInputChange('position')}
                    placeholder="Selecione um cargo..."
                    searchable
                    disabled={loading}
                    clearable
                    onClear={() => handleClear('position')}
                    noOptionsText="Nenhum cargo encontrado"
                    emptyText="Digite para pesquisar cargos"
                  />
                </FormField>
                
                <FormField 
                  label="Local de Trabalho" 
                  error={errors.workLocation}
                  helpText="Escolha seu local de atuação"
                  required
                >
                  <FormSelect
                    options={workLocations}
                    value={formData.workLocation}
                    onChange={handleInputChange('workLocation')}
                    placeholder="Selecione o local..."
                    disabled={loading}
                    clearable
                    onClear={() => handleClear('workLocation')}
                  />
                </FormField>
                
                <FormField 
                  label="Departamento" 
                  helpText="Departamento organizacional"
                >
                  <FormSelect
                    options={departments}
                    value={formData.department}
                    onChange={handleInputChange('department')}
                    placeholder="Selecione o departamento..."
                    disabled={loading}
                    variant="filled"
                  />
                </FormField>
                
                <FormField label="Demonstração de Variantes">
                  <FormInput 
                    type="text"
                    placeholder="Variante underline"
                    variant="underline"
                    disabled={loading}
                  />
                </FormField>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
                onClick={() => {
                  setFormData({
                    email: '',
                    password: '',
                    name: '',
                    position: '',
                    workLocation: '',
                    department: ''
                  });
                  setErrors({});
                }}
              >
                Limpar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Formulário'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Component Variants Demo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Variante Outline</h3>
            <div className="space-y-4">
              <FormField label="Input Outline">
                <FormInput 
                  variant="outline"
                  placeholder="Outline variant"
                  startIcon="Search"
                />
              </FormField>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Variante Filled</h3>
            <div className="space-y-4">
              <FormField label="Input Filled">
                <FormInput 
                  variant="filled"
                  placeholder="Filled variant"
                  startIcon="Search"
                />
              </FormField>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Variante Underline</h3>
            <div className="space-y-4">
              <FormField label="Input Underline">
                <FormInput 
                  variant="underline"
                  placeholder="Underline variant"
                  startIcon="Search"
                />
              </FormField>
            </div>
          </div>
        </div>
        
        {/* Size Variants Demo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tamanhos dos Componentes</h3>
          <div className="space-y-4">
            <FormField label="Tamanho Small">
              <FormInput 
                size="sm"
                placeholder="Small size input"
                startIcon="Search"
              />
            </FormField>
            
            <FormField label="Tamanho Medium (padrão)">
              <FormInput 
                size="md"
                placeholder="Medium size input"
                startIcon="Search"
              />
            </FormField>
            
            <FormField label="Tamanho Large">
              <FormInput 
                size="lg"
                placeholder="Large size input"
                startIcon="Search"
              />
            </FormField>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>
            Componentes implementados com base no design system Cresol e padrões Chakra UI v3
          </p>
          <p>
            Acessibilidade WCAG 2.1 AA | Navegação por teclado | Screen reader friendly
          </p>
        </div>
      </div>
    </div>
  );
}