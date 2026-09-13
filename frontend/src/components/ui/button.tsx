import * as React from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, disabled, ...props }, ref) => {
    const variantStyles = {
      default: "bg-[#1e3a8a] text-white border border-[#1e3a8a] hover:bg-[#172554] hover:border-[#172554] active:bg-[#0f172a] shadow-xs",
      secondary: "bg-[#f1f5f9] text-[#0f172a] border border-[#cbd5e1] hover:bg-[#e2e8f0] active:bg-[#cbd5e1]",
      outline: "border border-[#cbd5e1] bg-white text-[#0f172a] hover:bg-[#f8fafc] hover:border-[#1e3a8a] hover:text-[#1e3a8a] active:bg-[#eff6ff]",
      ghost: "text-[#0f172a] hover:bg-[#f1f5f9] hover:text-[#1e3a8a] border border-transparent",
      destructive: "bg-[#dc2626] text-white border border-[#dc2626] hover:bg-[#b91c1c]",
      link: "text-[#1e3a8a] underline-offset-4 hover:underline hover:text-[#172554] p-0 h-auto border-0"
    };

    const sizeStyles = {
      default: "h-10 px-5 py-2 text-sm font-medium",
      sm: "h-8 px-3.5 text-xs font-medium",
      lg: "h-11 px-6 text-sm sm:text-base font-semibold",
      icon: "h-10 w-10 p-0"
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none whitespace-nowrap",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
