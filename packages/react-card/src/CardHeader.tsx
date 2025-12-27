import React from 'react';
import { cn } from './utils';

export interface CardHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * CardHeader component for card title/header
 */
export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <h3 className={cn('text-2xl font-bold text-white drop-shadow-lg', className)}>
      {children}
    </h3>
  );
}

