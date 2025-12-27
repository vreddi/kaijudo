import type { PropsWithChildren, ReactNode } from "react";

export type ComponentPageProps = PropsWithChildren<{
  /**
   * The name of the component
   */
  name: string;
  /**
   * The description of the component
   */
  description: string;
  /**
   * MDX content for the Examples tab that lists all stories
   */
  examples?: ReactNode;
  /**
   * MDX/Markdown content for the Changelog tab
   */
  changelogs?: ReactNode;
}>;
