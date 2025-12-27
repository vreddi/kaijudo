import type { CardImage } from "../../types/cardImage";

export type CardProps = {
  /**
   * The content to display inside the card
   */
  children?: React.ReactNode;
  /**
   * Additional CSS classes for the card container
   */
  className?: string;
  /**
   * The image source for the card (creature image)
   */
  image?: CardImage;
  /**
   * Alt text for the card image
   */
  imageAlt?: string;
  /**
   * Enable holographic effect (default: true)
   */
  holographic?: boolean;
  /**
   * Card variant style
   */
  variant?: "default" | "holo" | "reverse-holo" | "rainbow";
};
