"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/app/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary-800 text-white hover:bg-primary-700": variant === "primary",
            "bg-white text-primary-800 border border-primary-300 hover:bg-primary-50": variant === "secondary",
            "bg-red-500 text-white hover:bg-red-600": variant === "danger",
            "bg-transparent hover:bg-primary-100 text-primary-700": variant === "ghost",
            "px-3 py-2 text-sm": size === "sm",
            "px-4 py-2 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
