"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import "@/components/ui/warcraftcn/styles/warcraft.css";

const checkboxVariants = cva(
  "inline-flex items-center gap-3 cursor-pointer select-none fantasy mb-2 font-bold",
  {
    variants: {
      faction: {
        default: "text-yellow-800 dark:text-yellow-100",
        orc: "text-red-700 dark:text-red-100",
        elf: "text-green-700 dark:text-green-100",
        human: "text-blue-700 dark:text-blue-100",
        undead: "text-purple-700 dark:text-purple-100",
      },
    },
    defaultVariants: {
      faction: "default",
    },
  }
);

type Faction = "default" | "orc" | "elf" | "human" | "undead";

type CheckboxBaseProps = Omit<
  React.ComponentProps<typeof CheckboxPrimitive.Root>,
  "children" | "asChild"
> &
  VariantProps<typeof checkboxVariants> & {
    faction?: Faction;
  };

// Require either children (label text), aria-label, or aria-labelledby
type CheckboxProps =
  | (CheckboxBaseProps & { children: React.ReactNode; "aria-label"?: string; "aria-labelledby"?: string })
  | (CheckboxBaseProps & { children?: never; "aria-label": string; "aria-labelledby"?: string })
  | (CheckboxBaseProps & { children?: never; "aria-label"?: string; "aria-labelledby": string });

function Checkbox({
  faction = "default",
  children,
  className,
  disabled,
  id,
  ...props
}: CheckboxProps) {
  if (
    process.env.NODE_ENV !== "production" &&
    !children &&
    !props["aria-label"] &&
    !props["aria-labelledby"]
  ) {
    console.error(
      "[Checkbox] Accessibility error: every Checkbox must have an accessible name. " +
        "Provide children (label text), aria-label, or aria-labelledby."
    );
  }

  const root = (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn("wc-checkbox", `wc-checkbox-${faction}`, className)}
      disabled={disabled}
      id={id}
      {...props}
    >
      <CheckboxPrimitive.Indicator />
    </CheckboxPrimitive.Root>
  );

  if (children) {
    return (
      <label
        htmlFor={id}
        className={cn(
          checkboxVariants({ faction }),
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {root}
        {children}
      </label>
    );
  }

  return root;
}

export { Checkbox, checkboxVariants };
export type { CheckboxProps, Faction };
