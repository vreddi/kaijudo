import { memo } from "react";
import type { CardProps } from "./Card.types";

export const Card = memo(
  ({
    children,
    className,
    image,
    imageAlt = "Card image",
    holographic = true,
    variant = "holo",
  }: CardProps) => {
    return <div className={className}>{children}</div>;
  }
);
