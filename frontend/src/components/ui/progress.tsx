import * as React from "react";
import { cn } from "../../lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  showLabel?: boolean;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, showLabel = false, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div className="w-full space-y-1.5" ref={ref} {...props}>
        {showLabel && (
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span>Progress</span>
            <span className="font-semibold text-[#1e3a8a]">{Math.round(percentage)}%</span>
          </div>
        )}
        <div className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200", className)}>
          <div
            className="h-full bg-[#1e3a8a] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = "Progress";
