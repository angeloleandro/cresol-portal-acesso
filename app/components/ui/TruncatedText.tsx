/**
 * Utilitários para formatação de texto
 */

import React, { useState } from 'react';

/**
 * Trunca texto longo e adiciona tooltip
 * @param text - Texto a ser truncado
 * @param maxLength - Comprimento máximo do texto
 * @returns Texto truncado ou original se menor que maxLength
 */
export const truncateText = (text: string, maxLength: number = 25): string => {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
};

/**
 * Trunca texto de forma inteligente, preservando palavras
 * @param text - Texto a ser truncado
 * @param maxLength - Comprimento máximo do texto
 * @returns Texto truncado preservando palavras
 */
export const smartTruncate = (text: string, maxLength: number = 25): string => {
  if (text.length <= maxLength) {
    return text;
  }
  
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > 0 && lastSpaceIndex > maxLength * 0.6) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
};

/**
 * Componente para exibir texto truncado com tooltip
 */

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  showTooltip?: boolean;
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  maxLength = 25,
  className = '',
  showTooltip = true
}) => {
  const [showFullText, setShowFullText] = useState(false);
  const isTextTruncated = text.length > maxLength;
  const displayText = isTextTruncated ? smartTruncate(text, maxLength) : text;
  
  if (!isTextTruncated) {
    return <span className={className}>{text}</span>;
  }
  
  return (
    <div className="relative group">
      <span 
        className={`${className} ${showTooltip ? 'cursor-help' : ''}`}
        onMouseEnter={() => setShowFullText(true)}
        onMouseLeave={() => setShowFullText(false)}
      >
        {displayText}
      </span>
      
      {showTooltip && showFullText && (
        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50 whitespace-nowrap max-w-xs">
          {text}
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};
