"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import "@/components/ui/warcraftcn/styles/warcraft.css";

const labelVariants = cva(
  "fantasy font-medium leading-none select-none",
  {
    variants: {
      variant: {
        default:
          "text-amber-200 [text-shadow:0_0_6px_rgba(251,191,36,0.25)]",
        muted: "text-amber-200/60",
      },
      civilization: {
        light: "text-[#FFD700] [text-shadow:0_0_6px_rgba(255,215,0,0.3)]",
        water: "text-[#1E90FF] [text-shadow:0_0_6px_rgba(30,144,255,0.3)]",
        darkness: "text-[#8B00FF] [text-shadow:0_0_6px_rgba(139,0,255,0.3)]",
        fire: "text-[#FF4500] [text-shadow:0_0_6px_rgba(255,69,0,0.3)]",
        nature: "text-[#32CD32] [text-shadow:0_0_6px_rgba(50,205,50,0.3)]",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

type LabelProps = React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants> & {
    required?: boolean;
    disabled?: boolean;
  };

function Label({
  className,
  variant,
  civilization,
  size,
  required = false,
  disabled = false,
  children,
  ...props
}: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      data-disabled={disabled || undefined}
      className={cn(
        labelVariants({ variant, civilization, size }),
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <>
          <span
            aria-hidden="true"
            className="ml-1 text-red-500 [text-shadow:0_0_6px_rgba(239,68,68,0.4)]"
          >
            ✦
          </span>
          <span className="sr-only">(required)</span>
        </>
      )}
    </LabelPrimitive.Root>
  );
}

export { Label, labelVariants };
export type { LabelProps };
