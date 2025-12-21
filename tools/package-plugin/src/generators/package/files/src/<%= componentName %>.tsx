import React from 'react';

export interface <%= componentName %>Props {
  /**
   * The content to display
   */
  children?: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * <%= componentName %> component
 */
export function <%= componentName %>({ children, className }: <%= componentName %>Props) {
  return (
    <div className={className}>
      {children || '<%= componentName %> Component'}
    </div>
  );
}
