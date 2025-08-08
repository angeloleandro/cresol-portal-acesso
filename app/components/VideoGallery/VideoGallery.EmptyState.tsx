/**
 * VideoGallery Empty States
 * Enterprise-grade empty state components with actions
 */

"use client";

import { motion } from 'framer-motion';
import clsx from 'clsx';
import Link from 'next/link';
import { Icon, IconName } from '../icons/Icon';
import { scrollAnimations } from './VideoGallery.animations';

interface EmptyStateConfig {
  icon: IconName;
  title: string;
  message: string;
  actionLabel: string;
  secondaryAction?: {
    label: string;
    href: string;
  };
}

interface EmptyStateProps {
  variant?: 'default' | 'search' | 'error' | 'maintenance' | 'permission';
  title?: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
  showIllustration?: boolean;
}

/**
 * Main Empty State Component
 */
export function VideoGalleryEmptyState({
  variant = 'default',
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
  className,
  showIllustration = true
}: EmptyStateProps) {
  const config = getEmptyStateConfig(variant);
  
  const finalTitle = title || config.title;
  const finalMessage = message || config.message;
  const finalActionLabel = actionLabel || config.actionLabel;

  return (
    <motion.div
      variants={scrollAnimations}
      initial="hidden"
      animate="visible"
      className={clsx(
        'flex flex-col items-center justify-center',
        'py-16 px-8 text-center space-y-6',
        'min-h-[400px]',
        className
      )}
    >
      {/* Illustration */}
      {showIllustration && (
        <EmptyStateIllustration 
          variant={variant} 
          icon={config.icon}
        />
      )}
      
      {/* Content */}
      <div className="space-y-3 max-w-md">
        <h3 className="text-xl font-semibold text-neutral-900">
          {finalTitle}
        </h3>
        <p className="text-neutral-600 leading-relaxed">
          {finalMessage}
        </p>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {finalActionLabel && (actionHref || onAction) && (
          <EmptyStateAction
            label={finalActionLabel}
            href={actionHref}
            onClick={onAction}
            variant="primary"
          />
        )}
        
        {config.secondaryAction && (
          <EmptyStateAction
            label={config.secondaryAction.label}
            href={config.secondaryAction.href}
            variant="secondary"
          />
        )}
      </div>
    </motion.div>
  );
}

/**
 * Empty State Configuration
 */
function getEmptyStateConfig(variant: EmptyStateProps['variant'] = 'default'): EmptyStateConfig {
  const configs: Record<NonNullable<EmptyStateProps['variant']>, EmptyStateConfig> = {
    default: {
      icon: 'video',
      title: 'Nenhum vídeo encontrado',
      message: 'Ainda não há vídeos na galeria. Adicione o primeiro vídeo para começar.',
      actionLabel: 'Adicionar vídeo',
      secondaryAction: {
        label: 'Ver documentação',
        href: '/help/videos'
      }
    },
    search: {
      icon: 'search',
      title: 'Nenhum resultado encontrado',
      message: 'Não encontramos vídeos que correspondam à sua busca. Tente usar termos diferentes.',
      actionLabel: 'Limpar busca',
      secondaryAction: {
        label: 'Ver todos os vídeos',
        href: '/videos'
      }
    },
    error: {
      icon: 'alert-circle',
      title: 'Erro ao carregar vídeos',
      message: 'Ocorreu um problema ao carregar a galeria de vídeos. Verifique sua conexão e tente novamente.',
      actionLabel: 'Tentar novamente',
      secondaryAction: {
        label: 'Reportar problema',
        href: '/support'
      }
    },
    maintenance: {
      icon: 'tool',
      title: 'Sistema em manutenção',
      message: 'A galeria de vídeos está temporariamente indisponível para manutenção. Tente novamente em alguns minutos.',
      actionLabel: 'Atualizar página',
      secondaryAction: {
        label: 'Voltar ao início',
        href: '/'
      }
    },
    permission: {
      icon: 'lock',
      title: 'Acesso restrito',
      message: 'Você não tem permissão para visualizar esta galeria de vídeos. Entre em contato com o administrador.',
      actionLabel: 'Solicitar acesso',
      secondaryAction: {
        label: 'Voltar ao início',
        href: '/'
      }
    }
  };

  return configs[variant || 'default'] || configs.default;
}

/**
 * Empty State Illustration
 */
function EmptyStateIllustration({ 
  variant, 
  icon 
}: { 
  variant: EmptyStateProps['variant']; 
  icon: IconName;
}) {
  const getColorClass = () => {
    switch (variant) {
      case 'error': return 'text-red-400';
      case 'maintenance': return 'text-yellow-400';
      case 'permission': return 'text-orange-400';
      default: return 'text-neutral-400';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: "backOut",
        delay: 0.2 
      }}
      className={clsx(
        'relative p-8 rounded-full',
        'bg-gradient-to-br from-neutral-50 to-neutral-100',
        'border border-neutral-200'
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 rounded-full opacity-30">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern
            id="empty-pattern"
            patternUnits="userSpaceOnUse"
            width="10"
            height="10"
          >
            <circle cx="5" cy="5" r="1" fill="currentColor" />
          </pattern>
          <rect width="100" height="100" fill="url(#empty-pattern)" />
        </svg>
      </div>
      
      {/* Main Icon */}
      <Icon 
        name={icon} 
        className={clsx(
          'w-16 h-16 relative z-10',
          getColorClass()
        )}
      />
      
      {/* Floating Elements */}
      <motion.div
        animate={{ 
          y: [-5, 5, -5],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute -top-2 -right-2"
      >
        <div className="w-3 h-3 bg-primary/20 rounded-full" />
      </motion.div>
      
      <motion.div
        animate={{ 
          y: [5, -5, 5],
          rotate: [0, -10, 10, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 0.5
        }}
        className="absolute -bottom-2 -left-2"
      >
        <div className="w-2 h-2 bg-secondary/20 rounded-full" />
      </motion.div>
    </motion.div>
  );
}

/**
 * Empty State Action Button
 */
interface EmptyStateActionProps {
  label: string;
  href?: string;
  onClick?: () => void;
  variant: 'primary' | 'secondary';
}

function EmptyStateAction({ 
  label, 
  href, 
  onClick, 
  variant 
}: EmptyStateActionProps) {
  const baseClasses = clsx(
    'inline-flex items-center gap-2 px-6 py-3',
    'font-medium rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  );

  const variantClasses = {
    primary: clsx(
      'bg-primary text-white',
      'hover:bg-primary-dark hover:shadow-lg',
      'focus:ring-primary/20',
      'transform hover:-translate-y-0.5'
    ),
    secondary: clsx(
      'bg-white text-neutral-700 border border-neutral-300',
      'hover:bg-neutral-50 hover:border-neutral-400',
      'focus:ring-neutral/20'
    )
  };

  const className = clsx(baseClasses, variantClasses[variant]);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  if (href) {
    return (
      <Link href={href} className={className} onClick={handleClick}>
        {label}
        <Icon name="arrow-right" className="w-4 h-4" />
      </Link>
    );
  }

  return (
    <button className={className} onClick={onClick}>
      {label}
      <Icon name="refresh-cw" className="w-4 h-4" />
    </button>
  );
}

/**
 * Compact Empty State
 */
interface CompactEmptyStateProps {
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function CompactEmptyState({
  message = 'Nenhum vídeo encontrado',
  actionLabel,
  onAction,
  className
}: CompactEmptyStateProps) {
  return (
    <div className={clsx(
      'flex flex-col items-center justify-center',
      'py-8 px-4 text-center space-y-3',
      'bg-neutral-50 border-2 border-dashed border-neutral-300',
      'rounded-xl',
      className
    )}>
      <Icon name="video" className="w-6 h-6 text-neutral-400" />
      <p className="text-sm text-neutral-600 max-w-xs">
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="text-xs text-primary hover:text-primary-dark font-medium transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Inline Empty State (for list items)
 */
export function InlineEmptyState({ 
  message = 'Lista vazia',
  className 
}: { 
  message?: string; 
  className?: string;
}) {
  return (
    <div className={clsx(
      'flex items-center justify-center gap-3',
      'py-6 text-neutral-500',
      className
    )}>
      <Icon name="info" className="w-4 h-4" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

/**
 * Error Recovery Empty State
 */
interface ErrorRecoveryProps {
  error: string;
  onRetry: () => void;
  onReport?: () => void;
  className?: string;
}

export function ErrorRecoveryEmptyState({
  error,
  onRetry,
  onReport,
  className
}: ErrorRecoveryProps) {
  return (
    <motion.div
      variants={scrollAnimations}
      initial="hidden"
      animate="visible"
      className={clsx(
        'flex flex-col items-center justify-center',
        'py-12 px-6 text-center space-y-4',
        'bg-red-50 border border-red-200 rounded-xl',
        className
      )}
    >
      <Icon name="AlertTriangle" className="w-8 h-8 text-red-500" />
      
      <div className="space-y-2">
        <h3 className="font-semibold text-red-900">
          Ops, algo deu errado
        </h3>
        <p className="text-sm text-red-700 max-w-md">
          {error}
        </p>
      </div>
      
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </motion.button>
        
        {onReport && (
          <button
            onClick={onReport}
            className="px-4 py-2 text-red-600 text-sm font-medium hover:text-red-800 transition-colors"
          >
            Reportar problema
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default VideoGalleryEmptyState;