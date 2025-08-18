'use client';

import { Card } from "@chakra-ui/react";
import { ReactNode } from 'react';

interface ChakraCardProps {
  children: ReactNode;
  variant?: 'elevated' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  colorPalette?: 'gray' | 'orange';
  width?: string;
  maxW?: string;
  className?: string;
}

interface ChakraCardRootProps {
  children: ReactNode;
  variant?: 'elevated' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  colorPalette?: 'gray' | 'orange';
  width?: string;
  maxW?: string;
  className?: string;
  onClick?: () => void;
  flexDirection?: 'row' | 'column';
  overflow?: 'hidden' | 'visible';
}

interface ChakraCardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface ChakraCardBodyProps {
  children: ReactNode;
  gap?: string | number;
  className?: string;
}

interface ChakraCardFooterProps {
  children: ReactNode;
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  gap?: string | number;
  className?: string;
}

interface ChakraCardTitleProps {
  children: ReactNode;
  mt?: string | number;
  mb?: string | number;
  className?: string;
}

interface ChakraCardDescriptionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Chakra Card Root Component
 * Main card container following Chakra UI v3 pattern
 */
const ChakraCardRoot = ({ 
  children, 
  variant = 'outline', 
  size = 'md', 
  colorPalette = 'gray',
  width,
  maxW,
  className = '',
  onClick,
  flexDirection = 'column',
  overflow = 'visible',
  ...props 
}: ChakraCardRootProps) => {
  return (
    <Card.Root
      variant={variant}
      size={size}
      colorPalette={colorPalette}
      width={width}
      maxW={maxW}
      flexDirection={flexDirection}
      overflow={overflow}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </Card.Root>
  );
};

/**
 * Chakra Card Header Component
 * Header section for title and top actions
 */
const ChakraCardHeader = ({ children, className = '' }: ChakraCardHeaderProps) => {
  return (
    <Card.Header className={className}>
      {children}
    </Card.Header>
  );
};

/**
 * Chakra Card Body Component
 * Main content area with optional gap
 */
const ChakraCardBody = ({ children, gap = "4", className = '' }: ChakraCardBodyProps) => {
  return (
    <Card.Body gap={gap} className={className}>
      {children}
    </Card.Body>
  );
};

/**
 * Chakra Card Footer Component
 * Footer section for actions and buttons
 */
const ChakraCardFooter = ({ 
  children, 
  justifyContent = 'flex-end', 
  gap = "2", 
  className = '' 
}: ChakraCardFooterProps) => {
  return (
    <Card.Footer justifyContent={justifyContent} gap={gap} className={className}>
      {children}
    </Card.Footer>
  );
};

/**
 * Chakra Card Title Component
 * Title text with proper spacing
 */
const ChakraCardTitle = ({ children, mt, mb = "2", className = '' }: ChakraCardTitleProps) => {
  return (
    <Card.Title mt={mt} mb={mb} className={className}>
      {children}
    </Card.Title>
  );
};

/**
 * Chakra Card Description Component
 * Description text with proper styling
 */
const ChakraCardDescription = ({ children, className = '' }: ChakraCardDescriptionProps) => {
  return (
    <Card.Description className={className}>
      {children}
    </Card.Description>
  );
};

/**
 * Complete Card component with all sub-components
 * Following Chakra UI v3 composable pattern
 */
export const ChakraCard = {
  Root: ChakraCardRoot,
  Header: ChakraCardHeader,
  Body: ChakraCardBody,
  Footer: ChakraCardFooter,
  Title: ChakraCardTitle,
  Description: ChakraCardDescription,
};

export default ChakraCard;