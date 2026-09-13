import React from "react";
import { ActionPlanItem } from "../../types";
import { Badge } from "./badge";
import { Check, Clock, ExternalLink, FileText } from "lucide-react";
import { cn } from "../../lib/utils";

interface TaskItemProps {
  key?: React.Key;
  item: ActionPlanItem;
  onToggle: (id: string) => void;
  onUploadClick?: (docId?: string) => void;
}

export function TaskItem({ item, onToggle, onUploadClick }: TaskItemProps) {
  const priorityBadgeVariant = {
    immediate: "warning" as const,
    week_1: "secondary" as const,
    week_2: "neutral" as const
  };

  const priorityLabel = {
    immediate: "Immediate Priority",
    week_1: "Week 1",
    week_2: "Week 2+"
  };

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3.5 border rounded-md p-4 transition-all duration-200",
        item.completed
          ? "border-slate-200 bg-slate-50/70 opacity-75"
          : "border-slate-200 bg-white hover:border-[#1e3a8a]/40 shadow-xs"
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={item.completed}
        onClick={() => onToggle(item.id)}
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border transition-colors cursor-pointer focus:outline-none",
          item.completed
            ? "border-[#1e3a8a] bg-[#1e3a8a] text-white"
            : "border-slate-300 bg-white hover:border-[#1e3a8a]"
        )}
      >
        {item.completed && <Check className="h-3 w-3 stroke-[3]" />}
      </button>

      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={priorityBadgeVariant[item.priority]}>
              {priorityLabel[item.priority]}
            </Badge>
            {item.programName && (
              <span className="meta text-[11px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full truncate max-w-[240px]">
                {item.programName}
              </span>
            )}
          </div>

          {item.deadline && (
            <div className="flex items-center gap-1 meta text-[11px]">
              <Clock className="h-3 w-3 text-slate-400" />
              <span className={cn(item.priority === 'immediate' && !item.completed ? "font-semibold text-rose-600" : "text-slate-600")}>
                {item.deadline}
              </span>
            </div>
          )}
        </div>

        <h4
          className={cn(
            "text-sm font-semibold leading-snug text-[#0f172a] font-sans",
            item.completed && "line-through text-slate-400"
          )}
        >
          {item.title}
        </h4>

        <p className="text-xs text-slate-600 leading-relaxed font-sans">
          {item.description}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {item.relatedDocId && onUploadClick && !item.completed && (
            <button
              onClick={() => onUploadClick(item.relatedDocId)}
              className="inline-flex items-center gap-1 meta text-[#1e3a8a] hover:text-[#172554] font-semibold transition-colors cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Attach Required Document</span>
            </button>
          )}

          {item.sourceUrl && (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 meta text-slate-500 hover:text-[#1e3a8a] transition-colors ml-auto"
            >
              <span>Agency Portal</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
