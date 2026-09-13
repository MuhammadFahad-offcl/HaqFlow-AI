import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: 
    | "default" 
    | "secondary" 
    | "outline" 
    | "high-match" 
    | "possible-match" 
    | "success" 
    | "warning" 
    | "low-confidence"
    | "neutral";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "border-transparent bg-[#1e3a8a] text-white",
    secondary: "border-[#e2e8f0] bg-[#f1f5f9] text-[#0f172a]",
    outline: "border-[#cbd5e1] text-[#0f172a] bg-white",
    "high-match": "border-[#1e3a8a]/30 bg-[#eff6ff] text-[#1e3a8a] font-semibold",
    "possible-match": "border-[#d8b4fe] bg-[#faf5ff] text-[#6b21a8] font-semibold",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold",
    warning: "border-rose-200 bg-rose-50 text-rose-800 font-semibold",
    "low-confidence": "border-amber-200 bg-amber-50 text-amber-800 font-semibold",
    neutral: "border-slate-200 bg-slate-100 text-slate-700 font-normal"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans text-[11px] font-medium transition-colors whitespace-nowrap",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

