declare module '*.mdx' {
  import { ComponentType } from 'react';
  const Component: ComponentType;
  export default Component;
}

declare module '*.md?raw' {
  const content: string;
  export default content;
}

