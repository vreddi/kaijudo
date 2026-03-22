import React, { useRef, useEffect, useState, useMemo } from "react";
import Tilt from "react-parallax-tilt";
import { cn } from "./utils";
import "./Card.css";
import { CardSize } from "./types/cardSize";
import type { CardSize as CardSizeType } from "./types/cardSize";

/** Civilization-to-color mapping */
const CIV_COLORS: Record<string, string> = {
  light: "#e6c619",
  water: "#1e90ff",
  darkness: "#9b59b6",
  fire: "#e63946",
  nature: "#2d9e5c",
};

/** Rarity-to-variant mapping */
const RARITY_VARIANTS: Record<string, CardVariant> = {
  none: "default",
  common: "default",
  uncommon: "holo",
  rare: "holo",
  veryRare: "reverse-holo",
  superRare: "rainbow",
};

export type CardVariant = "default" | "holo" | "reverse-holo" | "rainbow";
export type CardState = "normal" | "tapped" | "disabled" | "selected" | "flipped";
export type CardDisplayMode = "image" | "detailed";

export interface CardProps {
  /** Card image source */
  imageSrc?: string;
  /** Alt text for the card image */
  imageAlt?: string;
  /** Card back image (falls back to generic design) */
  cardBackSrc?: string;
  /** Enable holographic effects (default: true) */
  holographic?: boolean;
  /** Card size (default: Large) */
  size?: CardSizeType;
  /** Holo variant — auto-set by rarity if provided */
  variant?: CardVariant;
  /** Card state */
  state?: CardState;
  /** Display mode: image-only or detailed with stats */
  displayMode?: CardDisplayMode;
  /** Enable 3D tilt on hover (default: true) */
  tiltEnabled?: boolean;
  /** Max tilt angle in degrees (default: 15) */
  tiltMaxAngle?: number;
  /** Card civilization for glow color */
  civilization?: string;
  /** Card rarity — auto-selects variant if set */
  rarity?: string;
  /** Mana cost (shown in detailed mode) */
  manaCost?: number;
  /** Power value (shown in detailed mode) */
  power?: number;
  /** Card name (shown in detailed mode) */
  name?: string;
  /** Additional CSS classes */
  className?: string;
  /** Content to render inside the card */
  children?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Enhanced Trading Card Component
 *
 * Features:
 * - 3D parallax tilt on hover via react-parallax-tilt
 * - Holographic effects (holo, reverse-holo, rainbow) driven by mouse position
 * - Civilization-based glow colors
 * - Rarity-based auto variant selection
 * - Card states: normal, tapped, disabled, selected, flipped
 * - Two display modes: image-only or detailed with stat badges
 * - Sparkle particles for super rare cards
 * - Card back with generic fallback or custom image
 */
export function Card({
  children,
  className,
  imageSrc,
  imageAlt = "Card",
  cardBackSrc,
  holographic = true,
  variant,
  state = "normal",
  displayMode = "image",
  tiltEnabled = true,
  tiltMaxAngle = 15,
  civilization,
  rarity,
  manaCost,
  power,
  name,
  onClick,
  size = CardSize.Large,
}: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  // Auto-select variant from rarity if not explicitly set
  const resolvedVariant = variant ?? (rarity ? RARITY_VARIANTS[rarity] ?? "default" : "holo");

  // Civilization color
  const civColor = civilization ? CIV_COLORS[civilization] ?? CIV_COLORS.light : undefined;

  // Track mouse for holo effects
  useEffect(() => {
    if (!isHovered || !holographic || resolvedVariant === "default") return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isHovered, holographic, resolvedVariant]);

  // Sparkle positions for super rare
  const sparkles = useMemo(() => {
    if (rarity !== "superRare") return [];
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 90 + 5}%`,
      top: `${Math.random() * 90 + 5}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${1.5 + Math.random() * 1.5}s`,
    }));
  }, [rarity]);

  const variantClasses = {
    default: "",
    holo: "card-holo",
    "reverse-holo": "card-reverse-holo",
    rainbow: "card-rainbow",
  };

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

  const holoAngle = Math.atan2(mousePosition.y - 50, mousePosition.x - 50) * (180 / Math.PI) + 130;

  const cssVars = {
    "--mouse-x": `${mousePosition.x}%`,
    "--mouse-y": `${mousePosition.y}%`,
    "--civ-color": civColor ?? "rgba(212, 160, 23, 0.6)",
    "--holo-angle": `${holoAngle}deg`,
  } as React.CSSProperties;

  const isFlipped = state === "flipped";

  const cardContent = (
    <div
      ref={cardRef}
      className={cn(
        "card-container relative rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
        "shadow-2xl border-2 border-slate-600/30",
        "transform-gpu transition-all duration-500 ease-in-out",
        sizeClasses[size],
        state === "tapped" && "card-tapped",
        state === "disabled" && "card-disabled",
        state === "selected" && "card-selected",
        className
      )}
      style={cssVars}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 50, y: 50 });
      }}
      onClick={onClick}
    >
      <div className={cn("card-flipper", isFlipped && "flipped")}>
        {/* Front face */}
        <div className={cn("card-face", holographic && resolvedVariant !== "default" && variantClasses[resolvedVariant])}>
          {/* Card image or placeholder */}
          <div className="relative w-full h-full">
            {imageSrc ? (
              <>
                <img
                  src={imageSrc}
                  alt={imageAlt}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
                {holographic && (
                  <div className={cn("card-image-shine", isHovered && "active")} />
                )}
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 flex items-center justify-center">
                <span className="text-slate-600 text-[10px] text-center px-2 font-medium">
                  {name || imageAlt}
                </span>
              </div>
            )}
          </div>

          {/* Detailed mode overlays */}
          {displayMode === "detailed" && (
            <>
              {manaCost !== undefined && (
                <div className="card-mana-badge">{manaCost}</div>
              )}
              {civilization && (
                <div className="card-civ-indicator">
                  {civilization}
                </div>
              )}
              <div className="card-detail-overlay">
                <div className="card-detail-gradient">
                  {name && (
                    <span className="text-sm font-bold text-white truncate">
                      {name}
                    </span>
                  )}
                </div>
              </div>
              {power !== undefined && (
                <div className="card-power-badge">
                  {power.toLocaleString()}
                </div>
              )}
            </>
          )}

          {/* Sparkles for super rare */}
          {rarity === "superRare" && sparkles.length > 0 && (
            <div className="card-sparkles">
              {sparkles.map((s) => (
                <div
                  key={s.id}
                  className="card-sparkle"
                  style={{
                    left: s.left,
                    top: s.top,
                    animationDelay: s.delay,
                    animationDuration: s.duration,
                  }}
                />
              ))}
            </div>
          )}

          {/* Custom children content */}
          {children && (
            <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10">
              {children}
            </div>
          )}
        </div>

        {/* Back face */}
        <div className="card-face card-face-back">
          {cardBackSrc ? (
            <img
              src={cardBackSrc}
              alt="Card back"
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="card-back-default">
              <span className="card-back-logo">K</span>
            </div>
          )}
        </div>
      </div>

      {/* Border glow */}
      {holographic && isHovered && (
        <div
          className={cn(
            "card-border-glow active",
            resolvedVariant === "rainbow" ? "rainbow-glow" : "civ-glow"
          )}
        />
      )}
    </div>
  );

  // Wrap in tilt if enabled and not tapped/disabled/flipped
  if (tiltEnabled && state === "normal" || state === "selected") {
    return (
      <Tilt
        tiltMaxAngleX={tiltMaxAngle}
        tiltMaxAngleY={tiltMaxAngle}
        perspective={800}
        scale={1.03}
        transitionSpeed={400}
        glareEnable={holographic && resolvedVariant !== "default"}
        glareMaxOpacity={0.2}
        glareColor={civColor ?? "#ffffff"}
        glarePosition="all"
        glareBorderRadius="16px"
      >
        {cardContent}
      </Tilt>
    );
  }

  return cardContent;
}
