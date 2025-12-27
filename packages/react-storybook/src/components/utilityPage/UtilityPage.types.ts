import type { PropsWithChildren } from "react";

export type UtilityPageProps = PropsWithChildren<{
  /**
   * The name of the utility
   */
  name: string;
  /**
   * The description of the utility
   */
  description: string;
}>;

