import * as React from "react";
import { cn } from "../../lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, HelpCircle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "info" | "warning" | "destructive" | "low-confidence" | "success";
}

export function Alert({ className, variant = "default", children, ...props }: AlertProps) {
  const variantStyles = {
    default: "bg-slate-50 text-[#0f172a] border-slate-200",
    info: "bg-[#eff6ff] text-[#1e3a8a] border-[#bfdbfe]",
    warning: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]",
    destructive: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]",
    "low-confidence": "bg-[#faf5ff] text-[#6b21a8] border-[#e9d5ff]",
    success: "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]"
  };

  const icons = {
    default: <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />,
    info: <Info className="h-4 w-4 text-[#1e3a8a] shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="h-4 w-4 text-[#b45309] shrink-0 mt-0.5" />,
    destructive: <AlertCircle className="h-4 w-4 text-[#dc2626] shrink-0 mt-0.5" />,
    "low-confidence": <HelpCircle className="h-4 w-4 text-[#7c3aed] shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="h-4 w-4 text-[#059669] shrink-0 mt-0.5" />
  };

  return (
    <div
      role="alert"
      className={cn(
        "relative flex w-full gap-3 rounded-md border p-4 text-sm leading-normal",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1 space-y-1">{children}</div>
    </div>
  );
}

export function AlertTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={cn("font-medium tracking-tight text-inherit", className)} {...props}>
      {children}
    </h5>
  );
}

export function AlertDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div className={cn("text-xs sm:text-sm opacity-90 leading-relaxed", className)} {...props}>
      {children}
    </div>
  );
}
