'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode, useRef, useEffect, useState } from 'react';

import { Icon } from '@/app/components/icons/Icon';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'info';
  className?: string;
  /** WCAG 2.1 AA Accessibility Props */
  ariaLabel?: string;
  ariaDescription?: string;
  initialFocus?: React.RefObject<HTMLElement>;
  restoreFocus?: boolean;
  preventClose?: boolean;
}

interface ConfirmationModalProps extends BaseModalProps {
  type: 'confirmation';
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'success' | 'warning';
  isLoading?: boolean;
  children?: ReactNode;
  variantStyles?: any;
}

interface ExportModalProps extends BaseModalProps {
  type: 'export';
  onExport: (format: string) => void;
  exportFormats: Array<{
    label: string;
    value: string;
    icon?: string;
    description?: string;
  }>;
  isExporting?: boolean;
  currentProgress?: number;
  children?: ReactNode;
  variantStyles?: any;
}

interface ProgressModalProps extends BaseModalProps {
  type: 'progress';
  progress: number;
  progressLabel?: string;
  canCancel?: boolean;
  onCancel?: () => void;
  children?: ReactNode;
  variantStyles?: any;
}

interface CustomModalProps extends BaseModalProps {
  type: 'custom';
  children: ReactNode;
  actions?: ReactNode;
  variantStyles?: any;
}

type AccessibleModalProps = 
  | ConfirmationModalProps 
  | ExportModalProps 
  | ProgressModalProps 
  | CustomModalProps;

const sizeConfig = {
  sm: {
    panel: 'max-w-sm',
    padding: 'p-4',
    spacing: 'space-y-3',
    title: 'text-lg',
    button: 'px-3 py-2 text-sm min-h-[32px]',
    icon: 'h-5 w-5'
  },
  md: {
    panel: 'max-w-md',
    padding: 'p-6',
    spacing: 'space-y-4',
    title: 'text-xl',
    button: 'px-4 py-2 text-sm min-h-[44px]',
    icon: 'h-6 w-6'
  },
  lg: {
    panel: 'max-w-lg',
    padding: 'p-6',
    spacing: 'space-y-5',
    title: 'text-2xl',
    button: 'px-6 py-3 text-base min-h-[48px]',
    icon: 'h-7 w-7'
  },
  xl: {
    panel: 'max-w-2xl',
    padding: 'p-8',
    spacing: 'space-y-6',
    title: 'text-2xl',
    button: 'px-8 py-4 text-lg min-h-[52px]',
    icon: 'h-8 w-8'
  },
  full: {
    panel: 'max-w-7xl mx-4',
    padding: 'p-8',
    spacing: 'space-y-6',
    title: 'text-3xl',
    button: 'px-8 py-4 text-lg min-h-[52px]',
    icon: 'h-8 w-8'
  }
};

const variantConfig = {
  default: {
    icon: 'info',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    primaryButton: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-200',
  },
  danger: {
    icon: 'alert-triangle',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    primaryButton: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-200',
  },
  success: {
    icon: 'check-circle',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    primaryButton: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-200',
  },
  warning: {
    icon: 'alert-triangle',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    primaryButton: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-200',
  },
  info: {
    icon: 'info',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    primaryButton: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-200',
  }
};

export default function AccessibleModal(props: AccessibleModalProps) {
  const {
    isOpen,
    onClose,
    title,
    description,
    size = 'md',
    variant = 'default',
    className = '',
    ariaLabel,
    ariaDescription,
    initialFocus,
    restoreFocus = true,
    preventClose = false
  } = props;

  const [mounted, setMounted] = useState(false);
  const defaultFocusRef = useRef<HTMLButtonElement>(null);
  const sizeStyles = sizeConfig[size];
  const variantStyles = variantConfig[variant];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleClose = () => {
    if (!preventClose) {
      onClose();
    }
  };

  const renderModalContent = () => {
    switch (props.type) {
      case 'confirmation':
        return <ConfirmationContent {...props} sizeStyles={sizeStyles} variantStyles={variantStyles} />;
      case 'export':
        return <ExportContent {...props} sizeStyles={sizeStyles} variantStyles={variantStyles} />;
      case 'progress':
        return <ProgressContent {...props} sizeStyles={sizeStyles} variantStyles={variantStyles} />;
      case 'custom':
        return <CustomContent {...props} sizeStyles={sizeStyles} variantStyles={variantStyles} />;
      default:
        return null;
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={handleClose}
        initialFocus={initialFocus || defaultFocusRef}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" 
            aria-hidden="true"
          />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel 
                className={`
                  w-full ${sizeStyles.panel} transform overflow-hidden rounded-lg 
                  bg-white ${sizeStyles.padding} text-left align-middle shadow-xl 
                  transition-all border border-gray-200 ${className}
                `}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`
                      flex-shrink-0 ${variantStyles.iconBg} rounded-full p-3 
                      flex items-center justify-center
                    `}>
                      <Icon 
                        name={variantStyles.icon as any} 
                        className={`${sizeStyles.icon} ${variantStyles.iconColor}`}
                        aria-hidden="true" 
                      />
                    </div>
                    <div>
                      <Dialog.Title
                        id="modal-title"
                        as="h3"
                        className={`${sizeStyles.title} font-semibold text-gray-900 leading-6`}
                      >
                        {title}
                      </Dialog.Title>
                      {description && (
                        <Dialog.Description
                          id="modal-description"
                          className="mt-2 text-sm text-gray-600 leading-relaxed"
                        >
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                  </div>

                  {!preventClose && (
                    <button
                      onClick={handleClose}
                      className="
                        flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 
                        hover:bg-gray-100 rounded-lg transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50
                      "
                      aria-label="Fechar modal"
                    >
                      <Icon name="x" className="h-5 w-5" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className={sizeStyles.spacing}>
                  {renderModalContent()}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Confirmation Modal Content
function ConfirmationContent({ 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  confirmVariant = 'primary',
  isLoading = false,
  children,
  sizeStyles,
  variantStyles 
}: ConfirmationModalProps & { sizeStyles: any; variantStyles: any }) {
  
  const getConfirmButtonStyles = () => {
    switch (confirmVariant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-200';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-200';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-200';
      case 'primary':
      default:
        return 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-200';
    }
  };

  return (
    <>
      {children && (
        <div className="text-gray-700 leading-relaxed">
          {children}
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className={`
            ${sizeStyles.button} border border-gray-300 bg-white text-gray-700 
            hover:bg-gray-50 hover:border-gray-400 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50
            disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium
            w-full sm:w-auto
          `}
        >
          {cancelText}
        </button>
        
        <button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={`
            ${sizeStyles.button} ${getConfirmButtonStyles()} 
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50
            disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium
            w-full sm:w-auto flex items-center justify-center space-x-2
          `}
        >
          {isLoading && (
            <Icon 
              name="refresh" 
              className={`${sizeStyles.icon} animate-spin`}
              aria-hidden="true" 
            />
          )}
          <span>{confirmText}</span>
        </button>
      </div>
    </>
  );
}

// Export Modal Content
function ExportContent({ 
  onExport, 
  exportFormats, 
  isExporting = false,
  currentProgress = 0,
  children,
  sizeStyles 
}: ExportModalProps & { sizeStyles: any }) {
  
  return (
    <>
      {children}
      
      {isExporting ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Icon 
              name="download" 
              className={`${sizeStyles.icon} text-blue-600 animate-bounce`}
              aria-hidden="true" 
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Exportando... {currentProgress}%
              </p>
              <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${currentProgress}%` }}
                  role="progressbar"
                  aria-valuenow={currentProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Progresso da exportação: ${currentProgress}%`}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {exportFormats.map((format) => (
            <button
              key={format.value}
              onClick={() => onExport(format.value)}
              className="
                w-full flex items-center space-x-3 px-4 py-3 
                bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200
                border border-gray-200 hover:border-gray-300 text-left
                focus:outline-none focus:ring-2 focus:ring-orange-200 focus:ring-opacity-50
              "
            >
              {format.icon && (
                <Icon 
                  name={format.icon as any} 
                  className={`${sizeStyles.icon} text-gray-600 flex-shrink-0`}
                  aria-hidden="true" 
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{format.label}</p>
                {format.description && (
                  <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                )}
              </div>
              <Icon 
                name="chevron-right" 
                className="h-5 w-5 text-gray-400"
                aria-hidden="true" 
              />
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// Progress Modal Content
function ProgressContent({ 
  progress, 
  progressLabel = 'Processando...',
  canCancel = false,
  onCancel,
  children,
  sizeStyles 
}: ProgressModalProps & { sizeStyles: any }) {
  
  return (
    <>
      {children}
      
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 mb-2">
            {progressLabel}
          </p>
          <p className="text-3xl font-bold text-orange-600">
            {Math.round(progress)}%
          </p>
        </div>
        
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-orange-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progressLabel} ${Math.round(progress)}%`}
          ></div>
        </div>
        
        {canCancel && onCancel && (
          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={onCancel}
              className={`
                ${sizeStyles.button} border border-gray-300 bg-white text-gray-700 
                hover:bg-gray-50 hover:border-gray-400 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50
                rounded-lg font-medium
              `}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// Custom Modal Content
function CustomContent({ 
  children, 
  actions,
  sizeStyles 
}: CustomModalProps & { sizeStyles: any }) {
  
  return (
    <>
      <div className="text-gray-700 leading-relaxed">
        {children}
      </div>
      
      {actions && (
        <div className="pt-4 border-t border-gray-200">
          {actions}
        </div>
      )}
    </>
  );
}