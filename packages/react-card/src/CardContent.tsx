import React from 'react';
import { cn } from './utils';

export interface CardContentProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * CardContent component for card body content
 */
export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('text-white space-y-2', className)}>{children}</div>
  );
}

