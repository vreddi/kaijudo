import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

import "@/components/ui/warcraftcn/styles/warcraft.css";

const buttonVariants = cva(
  "fantasy inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-none transition-all duration-200 motion-reduce:transition-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-95 active:brightness-75 active:shadow-inner",
  {
    variants: {
      variant: {
        default:
          "bg-center bg-cover bg-no-repeat text-white hover:brightness-110",
        frame:
          "bg-center bg-cover bg-no-repeat text-white hover:brightness-110",
      },
      civilization: {
        light: "",
        water: "",
        darkness: "",
        fire: "",
        nature: "",
      },
      size: {
        sm: "px-3 py-2 text-xs",
        md: "px-5 py-4 text-sm",
        lg: "px-6 py-5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      civilization: "light",
      size: "md",
    },
  }
);

function Button({
  className,
  variant,
  civilization,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  const borderImageClass =
    variant === "frame" ? "wc-btn-border-frame" : "wc-btn-border";

  return (
    <Comp
      className={cn(
        buttonVariants({ variant, civilization, size }),
        "border-solid [border-image-repeat:stretch] border-5 [border-image-slice:16_fill]",
        borderImageClass,
        className
      )}
      data-slot="button"
      {...props}
    />
  );
}

export { Button, buttonVariants };
