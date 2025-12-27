import React, { useRef, useEffect, useState } from "react";
import { cn } from "./utils";
import "./Card.css";
import { CardSize } from "./types/cardSize";
import type { CardSize as CardSizeType } from "./types/cardSize";

export interface CardProps {
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
  imageSrc?: string;
  /**
   * Alt text for the card image
   */
  imageAlt?: string;
  /**
   * Enable holographic effect (default: true)
   */
  holographic?: boolean;

  size?: CardSizeType;

  /**
   * Card variant style
   */
  variant?: "default" | "holo" | "reverse-holo" | "rainbow";
}

/**
 * Holographic Card Component
 * Inspired by Pokemon Trading Cards holographic effects
 *
 * Uses CSS transforms, gradients, blend-modes and filters to simulate
 * various Holofoil effects found in trading cards.
 *
 * @example
 * ```tsx
 * <Card imageSrc="/creature.png" imageAlt="Fire Dragon">
 *   <CardContent>Card details here</CardContent>
 * </Card>
 * ```
 */
export function Card({
  children,
  className,
  imageSrc,
  imageAlt = "Card image",
  holographic = true,
  variant = "holo",
  size = CardSize.Large,
}: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered || !holographic) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isHovered, holographic]);

  const variantClasses = {
    default: "",
    holo: "card-holo",
    "reverse-holo": "card-reverse-holo",
    rainbow: "card-rainbow",
  };

  // Size mapping based on CardSize enum
  // All sizes maintain the standard card aspect ratio (5:7)
  const sizeClasses = {
    [CardSize.Small]: "w-[175px] h-[245px]",
    [CardSize.Medium]: "w-[262px] h-[367px]",
    [CardSize.Large]: "w-[350px] h-[490px]",
    [CardSize.Hand]: "w-[175px] h-[245px]",
    [CardSize.Deck]: "w-[140px] h-[196px]",
    [CardSize.Graveyard]: "w-[175px] h-[245px]",
    [CardSize.Library]: "w-[175px] h-[245px]",
    [CardSize.Exile]: "w-[175px] h-[245px]",
    [CardSize.Stack]: "w-[262px] h-[367px]",
    [CardSize.ManaZone]: "w-[262px] h-[367px]",
    [CardSize.Battlefield]: "w-[350px] h-[490px]",
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "card-container relative rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
        "shadow-2xl border-2 border-slate-600/30",
        // Smooth size transitions when moving between zones
        "transform-gpu transition-all duration-500 ease-in-out",
        // Size classes with transitions
        sizeClasses[size],
        // Hover effects scale relative to current size
        "hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]",
        holographic && variantClasses[variant],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={
        holographic && variant === "reverse-holo"
          ? ({
              "--mouse-x": `${mousePosition.x}%`,
              "--mouse-y": `${mousePosition.y}%`,
            } as React.CSSProperties)
          : undefined
      }
    >
      {/* Card image */}
      {imageSrc && (
        <div className="relative w-full h-full">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-full object-cover"
          />
          {/* Image overlay for holographic effect */}
          {holographic && (
            <div
              className={cn(
                "card-image-shine absolute inset-0 pointer-events-none",
                isHovered && "opacity-100"
              )}
            />
          )}
        </div>
      )}

      {/* Card content overlay */}
      {children && (
        <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10">
          {children}
        </div>
      )}

      {/* Enhanced border glow effect */}
      {holographic && isHovered && <div className="card-border-glow active" />}
    </div>
  );
}
