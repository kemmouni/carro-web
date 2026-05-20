import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, className, children, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:   "bg-brand-orange text-white hover:bg-brand-orange-hover",
      secondary: "bg-transparent text-white border border-dark-border hover:border-brand-orange hover:text-brand-orange",
      ghost:     "bg-transparent text-gray-300 hover:text-white hover:bg-dark-secondary",
      danger:    "bg-red-600 text-white hover:bg-red-700",
    };

    const sizes = {
      sm: "h-8  px-4  text-[12px]",
      md: "h-11 px-5  text-[14px]",
      lg: "h-12 px-6  text-[15px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
