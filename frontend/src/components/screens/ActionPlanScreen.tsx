import React, { useState, useEffect } from "react";
import { ActionPlanItem, ActionPriority } from "../../types";
import { api } from "../../lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { TaskItem } from "../ui/task-item";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Printer, 
  Share2, 
  Plus, 
  RefreshCw, 
  Calendar,
  Sparkles
} from "lucide-react";

interface ActionPlanScreenProps {
  onGoToDashboard: () => void;
  onUploadClick: (docId?: string) => void;
}

export function ActionPlanScreen({ onGoToDashboard, onUploadClick }: ActionPlanScreenProps) {
  const [items, setItems] = useState<ActionPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<"all" | ActionPriority>("all");
  const [copiedNotice, setCopiedNotice] = useState(false);

  useEffect(() => {
    loadActionPlan();
  }, []);

  const loadActionPlan = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getActionPlan();
      setItems(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load action plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await api.toggleActionPlanItem(id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to toggle task.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyPlan = () => {
    const textSummary = items
      .map(
        (i) =>
          `[${i.completed ? "X" : " "}] ${i.title} (${i.priority}) - Due: ${i.deadline}\n  Program: ${i.programName}\n  Details: ${i.description}`
      )
      .join("\n\n");
    navigator.clipboard?.writeText(
      `HaqFlow Action Plan:\n\n${textSummary}\n\nGenerated via HaqFlow Social Support Navigator`
    );
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  const completedCount = items.filter((i) => i.completed).length;
  const progressScore = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const immediateItems = items.filter((i) => i.priority === "immediate");
  const week1Items = items.filter((i) => i.priority === "week_1");
  const week2Items = items.filter((i) => i.priority === "week_2");

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1e3a8a] border-t-transparent" />
        <h3 className="text-base font-semibold text-[#0f172a]">Organizing your action plan...</h3>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-[#1e3a8a] uppercase tracking-wider mb-1">
            Step 7 of 8 • Action Plan
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">
            Your Step-by-Step Action Plan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-sans">
            A clear, organized checklist of what to do first, next, and in the weeks ahead to get your benefits without delays.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyPlan}
            className="text-xs gap-1 font-medium"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>{copiedNotice ? "Copied!" : "Copy Plan"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handlePrint}
            className="text-xs gap-1 hidden sm:inline-flex font-medium"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print</span>
          </Button>

          <Button
            size="sm"
            variant="default"
            onClick={onGoToDashboard}
            className="gap-1.5 text-xs font-semibold"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertTitle className="text-xs font-semibold">Notice</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Progress & Next Milestone Card */}
      <Card className="border-slate-200 bg-white">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#1e3a8a] block">
                Overall Progress
              </span>
              <p className="text-lg sm:text-xl font-bold text-[#0f172a]">
                {completedCount} of {items.length} steps completed
              </p>
            </div>
            <div className="text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-md border border-slate-200 font-sans">
              <strong>Next deadline:</strong> Tomorrow (WIC appointment & Sunday claim check-in)
            </div>
          </div>

          <Progress value={progressScore} showLabel />
        </CardContent>
      </Card>

      {/* Priority Groups */}
      <div className="space-y-6">
        {/* Immediate Section */}
        {immediateItems.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-600" />
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Do This First (Next 2–3 Days)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {immediateItems.filter((i) => i.completed).length} of {immediateItems.length} done
              </span>
            </div>

            <div className="space-y-2.5">
              {immediateItems.map((item) => (
                <TaskItem
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onUploadClick={onUploadClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Week 1 Section */}
        {week1Items.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1e3a8a]" />
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Week 1 Steps (Days 4–7)
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {week1Items.filter((i) => i.completed).length} of {week1Items.length} done
              </span>
            </div>

            <div className="space-y-2.5">
              {week1Items.map((item) => (
                <TaskItem
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onUploadClick={onUploadClick}
                />
              ))}
            </div>
          </div>
        )}

        {/* Week 2 Section */}
        {week2Items.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                <h3 className="text-sm font-bold text-[#0f172a]">
                  Week 2 & Ongoing Check-ins
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {week2Items.filter((i) => i.completed).length} of {week2Items.length} done
              </span>
            </div>

            <div className="space-y-2.5">
              {week2Items.map((item) => (
                <TaskItem
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onUploadClick={onUploadClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-slate-500 font-sans">
          All checklist progress is automatically saved to your profile.
        </span>

        <Button size="default" variant="default" onClick={onGoToDashboard} className="w-full sm:w-auto text-xs font-semibold">
          Go to Case Dashboard
        </Button>
      </div>
    </div>
  );
}
