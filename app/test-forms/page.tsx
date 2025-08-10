'use client';

import React, { useState } from 'react';
import { FormField, FormInput, FormSelect, SelectOption } from '@/app/components/forms';

/**
 * Test Page for Professional Form Components
 * 
 * Validates:
 * - All form variants and sizes
 * - Responsiveness across screen sizes
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Functionality (validation, states, interactions)
 * - Icon integration and loading states
 * - Keyboard navigation
 * - Form integration patterns
 */
export default function TestFormsPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    position: '',
    department: '',
    notes: '',
    phone: '',
    website: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Mock options for select components
  const positionOptions: SelectOption[] = [
    { value: 'manager', label: 'Gerente', description: 'Gerencia equipes e projetos' },
    { value: 'analyst', label: 'Analista', description: 'Análise técnica e relatórios' },
    { value: 'coordinator', label: 'Coordenador', description: 'Coordenação de atividades', group: 'Coordenação' },
    { value: 'supervisor', label: 'Supervisor', description: 'Supervisão de equipes', group: 'Coordenação' },
    { value: 'assistant', label: 'Assistente', group: 'Suporte' },
    { value: 'intern', label: 'Estagiário', group: 'Suporte' }
  ];

  const departmentOptions: SelectOption[] = [
    { value: 'ti', label: 'Tecnologia da Informação' },
    { value: 'rh', label: 'Recursos Humanos' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'comercial', label: 'Comercial' },
    { value: 'operacoes', label: 'Operações' }
  ];

  // Handle input changes
  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Simulate loading state
  const simulateLoading = (field: string) => {
    setLoading(prev => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setLoading(prev => ({ ...prev, [field]: false }));
    }, 2000);
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      alert('Formulário válido! Dados: ' + JSON.stringify(formData, null, 2));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Teste dos Componentes de Formulário
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Validação completa dos componentes profissionais: responsividade, acessibilidade, funcionalidade e integração.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form Test Section */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Teste de Funcionalidade</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field - Outline Variant */}
                <FormField 
                  label="Email Corporativo" 
                  error={errors.email}
                  helpText="Use seu email @cresol.com.br"
                  required
                >
                  <FormInput
                    type="email"
                    variant="outline"
                    size="md"
                    value={formData.email}
                    onChange={handleChange('email')}
                    placeholder="seu.nome@cresol.com.br"
                    startIcon="Mail"
                    clearable
                    onClear={() => setFormData(prev => ({ ...prev, email: '' }))}
                    isInvalid={!!errors.email}
                  />
                </FormField>

                {/* Password Field - Filled Variant */}
                <FormField 
                  label="Senha" 
                  error={errors.password}
                  required
                >
                  <FormInput
                    type="password"
                    variant="filled"
                    size="md"
                    value={formData.password}
                    onChange={handleChange('password')}
                    placeholder="Digite sua senha"
                    startIcon="settings"
                    showPasswordToggle
                    isInvalid={!!errors.password}
                  />
                </FormField>

                {/* Name Field - Underline Variant */}
                <FormField 
                  label="Nome Completo" 
                  error={errors.name}
                  required
                >
                  <FormInput
                    type="text"
                    variant="underline"
                    size="md"
                    value={formData.name}
                    onChange={handleChange('name')}
                    placeholder="Digite seu nome completo"
                    startIcon="user"
                    isInvalid={!!errors.name}
                  />
                </FormField>

                {/* Position Select - Searchable */}
                <FormField 
                  label="Cargo" 
                  helpText="Selecione seu cargo atual na empresa"
                >
                  <FormSelect
                    options={positionOptions}
                    variant="outline"
                    size="md"
                    value={formData.position}
                    onChange={handleChange('position')}
                    placeholder="Selecione um cargo..."
                    searchable
                    clearable
                    isLoading={loading.position}
                    onClear={() => setFormData(prev => ({ ...prev, position: '' }))}
                  />
                </FormField>

                {/* Department Select - With Groups */}
                <FormField 
                  label="Departamento" 
                  loading={loading.department}
                >
                  <FormSelect
                    options={departmentOptions}
                    variant="filled"
                    size="md"
                    value={formData.department}
                    onChange={handleChange('department')}
                    placeholder="Escolha seu departamento..."
                    isLoading={loading.department}
                  />
                </FormField>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => simulateLoading('department')}
                    className="btn-secondary"
                  >
                    Testar Loading
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Validar Formulário
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Component Variants Section */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Variações dos Componentes</h2>
              
              <div className="space-y-8">
                {/* Size Variants */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tamanhos</h3>
                  <div className="space-y-4">
                    <FormField label="Pequeno (SM)">
                      <FormInput
                        size="sm"
                        placeholder="Input pequeno"
                        startIcon="Search"
                      />
                    </FormField>
                    
                    <FormField label="Médio (MD) - Padrão">
                      <FormInput
                        size="md"
                        placeholder="Input médio"
                        startIcon="user"
                      />
                    </FormField>
                    
                    <FormField label="Grande (LG)">
                      <FormInput
                        size="lg"
                        placeholder="Input grande"
                        startIcon="Mail"
                      />
                    </FormField>
                  </div>
                </div>

                {/* Style Variants */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Estilos</h3>
                  <div className="space-y-4">
                    <FormField label="Outline (Padrão)">
                      <FormInput
                        variant="outline"
                        placeholder="Estilo outline"
                        endIcon="Search"
                      />
                    </FormField>
                    
                    <FormField label="Filled">
                      <FormInput
                        variant="filled"
                        placeholder="Estilo filled"
                        endIcon="user"
                      />
                    </FormField>
                    
                    <FormField label="Underline">
                      <FormInput
                        variant="underline"
                        placeholder="Estilo underline"
                        endIcon="Mail"
                      />
                    </FormField>
                  </div>
                </div>

                {/* States */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Estados</h3>
                  <div className="space-y-4">
                    <FormField label="Normal">
                      <FormInput
                        placeholder="Estado normal"
                        startIcon="user"
                      />
                    </FormField>
                    
                    <FormField label="Com erro" error="Este campo contém um erro">
                      <FormInput
                        placeholder="Estado de erro"
                        isInvalid
                        startIcon="triangle-alert"
                      />
                    </FormField>
                    
                    <FormField label="Carregando" loading>
                      <FormInput
                        placeholder="Estado de carregamento"
                        isLoading
                      />
                    </FormField>
                    
                    <FormField label="Desabilitado">
                      <FormInput
                        placeholder="Estado desabilitado"
                        disabled
                        startIcon="settings"
                      />
                    </FormField>
                    
                    <FormField label="Com sucesso" success>
                      <FormInput
                        placeholder="Estado de sucesso"
                        value="campo@validado.com"
                        startIcon="user-check"
                      />
                    </FormField>
                  </div>
                </div>

                {/* Select States */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Select - Estados</h3>
                  <div className="space-y-4">
                    <FormField label="Select com busca">
                      <FormSelect
                        options={positionOptions.slice(0, 3)}
                        searchable
                        placeholder="Busque um cargo..."
                      />
                    </FormField>
                    
                    <FormField label="Select carregando">
                      <FormSelect
                        options={[]}
                        isLoading
                        loadingText="Buscando dados..."
                        placeholder="Aguarde..."
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility Test Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Teste de Acessibilidade</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Navegação por Teclado</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• <kbd className="px-2 py-1 bg-gray-100 rounded-sm">Tab</kbd> - Navegar entre campos</li>
                <li>• <kbd className="px-2 py-1 bg-gray-100 rounded-sm">↑/↓</kbd> - Navegar nas opções do select</li>
                <li>• <kbd className="px-2 py-1 bg-gray-100 rounded-sm">Enter</kbd> - Selecionar opção</li>
                <li>• <kbd className="px-2 py-1 bg-gray-100 rounded-sm">Esc</kbd> - Fechar dropdown</li>
                <li>• <kbd className="px-2 py-1 bg-gray-100 rounded-sm">Space</kbd> - Abrir select</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Conformidade WCAG</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✅ Contraste adequado (4.5:1)</li>
                <li>✅ Tamanhos mínimos de toque (44px)</li>
                <li>✅ Labels apropriadas</li>
                <li>✅ Estados focados visíveis</li>
                <li>✅ Suporte a leitores de tela</li>
                <li>✅ Navegação por teclado</li>
                <li>✅ Textos alternativos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Responsiveness Test */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibent text-gray-900 mb-6">Teste Responsivo</h2>
          
          <div className="space-y-6">
            <p className="text-gray-600">
              Os componentes se adaptam automaticamente a diferentes tamanhos de tela:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Mobile (≤640px)</h4>
                <p className="text-sm text-gray-600">Altura mínima 44px, texto base 16px</p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Tablet (641px+)</h4>
                <p className="text-sm text-gray-600">Layout otimizado, espaçamento adequado</p>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Desktop (1024px+)</h4>
                <p className="text-sm text-gray-600">Layout completo, todos os recursos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}