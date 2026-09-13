import * as React from "react";
import { FolderSearch } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  title = "We couldn't find any matching programs yet",
  description = "Based on the information provided right now, we didn't find an exact match. Don't worry — you can easily update your situation details or check back as programs change.",
  icon,
  actionLabel = "Update Your Details",
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff] text-[#1e3a8a] mb-4">
        {icon || <FolderSearch className="h-6 w-6" />}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-[#0f172a] mb-2">{title}</h3>
      <p className="max-w-md text-sm text-slate-600 mb-6 leading-relaxed font-sans">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onAction && (
          <Button onClick={onAction} variant="default" size="sm">
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button onClick={onSecondaryAction} variant="outline" size="sm">
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
