import React, { useState } from "react";
import { AppScreen } from "../types";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  RotateCcw, 
  AlertCircle, 
  Menu, 
  X, 
  HelpCircle,
  FolderOpen,
  ArrowRight,
  LayoutDashboard,
  CheckCircle2,
  CircleDot,
  Layers,
  Sparkles,
  MessageSquare,
  FileCheck,
  Award,
  CalendarCheck,
  FileText
} from "lucide-react";

interface HeaderProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  caseId: string;
  isSimulatingError: boolean;
  onToggleSimulateError: () => void;
  isSimulatingEmpty: boolean;
  onToggleSimulateEmpty: () => void;
  onResetDemo: () => void;
  /** When true (live backend mode), the mock-only error/empty simulation panel is hidden and a "Live Backend" badge is shown instead. */
  hideDevTools?: boolean;
}

const ALL_STEPS: { id: AppScreen; label: string; stepNumber: number; description: string }[] = [
  { id: "landing", label: "Start & Overview", stepNumber: 1, description: "Welcome and common situations" },
  { id: "intake", label: "Guided AI Intake", stepNumber: 2, description: "Conversation about what happened" },
  { id: "summary", label: "Review Information", stepNumber: 3, description: "Check household and income facts" },
  { id: "matches", label: "Program Matches", stepNumber: 4, description: "Programs you may qualify for" },
  { id: "documents", label: "Required Documents", stepNumber: 5, description: "Document checklist & scanning" },
  { id: "action_plan", label: "Action Plan", stepNumber: 6, description: "Step-by-step submission plan" },
  { id: "dashboard", label: "Case Dashboard", stepNumber: 7, description: "Central command & deadlines" }
];

export function Header({
  currentScreen,
  onNavigate,
  caseId,
  isSimulatingError,
  onToggleSimulateError,
  isSimulatingEmpty,
  onToggleSimulateEmpty,
  onResetDemo,
  hideDevTools = false
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoPanelOpen, setDemoPanelOpen] = useState(false);

  // Determine current step index and metadata
  const currentStepObj = ALL_STEPS.find(s => s.id === currentScreen) || ALL_STEPS[0];
  const currentStepNum = currentStepObj.stepNumber;
  const totalSteps = ALL_STEPS.length;

  // Determine contextual primary action button
  const getContextualAction = () => {
    switch (currentScreen) {
      case "landing":
        return { label: "Get Started", screen: "intake" as AppScreen };
      case "intake":
        return { label: "Continue", screen: "summary" as AppScreen };
      case "summary":
        return { label: "Find Matches", screen: "matches" as AppScreen };
      case "matches":
        return { label: "Action Plan", screen: "action_plan" as AppScreen };
      case "program_details":
        return { label: "All Matches", screen: "matches" as AppScreen };
      case "documents":
        return { label: "Action Plan", screen: "action_plan" as AppScreen };
      case "action_plan":
        return { label: "Dashboard", screen: "dashboard" as AppScreen };
      case "dashboard":
        return { label: "Update Situation", screen: "intake" as AppScreen };
      default:
        return { label: "Continue", screen: "intake" as AppScreen };
    }
  };

  const nextAction = getContextualAction();

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Demo Simulation Options Dropdown (if toggled). Mock-mode only. */}
      {demoPanelOpen && !hideDevTools && (
        <div className="bg-[#0f172a] text-white px-4 sm:px-8 py-3 border-b border-slate-800 text-xs transition-all">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-sans text-xs text-purple-300 font-semibold flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5" />
                Test how the interface handles different conditions:
              </span>
              <p className="text-slate-300 text-xs">
                Simulate a momentary connection error, or preview what happens when no programs match.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onToggleSimulateError}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                  isSimulatingError
                    ? "bg-rose-600 text-white border border-rose-400"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{isSimulatingError ? "Error Simulation: ON" : "Simulate Error"}</span>
              </button>

              <button
                onClick={onToggleSimulateEmpty}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                  isSimulatingEmpty
                    ? "bg-amber-600 text-white border border-amber-400"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                }`}
              >
                <FolderOpen className="h-3.5 w-3.5" />
                <span>{isSimulatingEmpty ? "Empty State: ON" : "Simulate Empty"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Clean Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
        {/* Left: Brand Logo & Current Step Indicator */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate("landing")}
            className="text-left focus:outline-none group cursor-pointer flex items-center gap-2.5"
            aria-label="HaqFlow Home"
          >
            <div className="h-9 w-9 rounded-lg bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-lg shadow-xs">
              H
            </div>
            <div>
              <div className="font-bold text-xl text-[#0f172a] leading-none tracking-tight flex items-center gap-2">
                <span>HaqFlow</span>
                <span className="hidden sm:inline text-[11px] font-medium bg-[#f3e8ff] text-[#6b21a8] border border-[#d8b4fe] px-2 py-0.5 rounded-full">
                  Support Guide
                </span>
              </div>
            </div>
          </button>

          {/* Current Step Breadcrumb Pill (replaces the 7 cluttered tabs) */}
          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
            <span className="text-xs text-slate-500 font-medium">
              Step {currentStepNum} of {totalSteps}:
            </span>
            <span className="text-xs font-semibold text-[#1e3a8a] bg-[#eff6ff] border border-[#bfdbfe] px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
              <CircleDot className="h-3 w-3 text-[#1e3a8a]" />
              {currentStepObj.label}
            </span>
          </div>
        </div>

        {/* Right: Only the 1-2 most important actions + Menu Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Action 1: Dashboard quick access (unless already on dashboard) */}
          <Button
            size="sm"
            variant={currentScreen === "dashboard" ? "default" : "outline"}
            onClick={() => onNavigate("dashboard")}
            className={`text-xs h-9 px-3 gap-1.5 ${
              currentScreen === "dashboard"
                ? "bg-[#1e3a8a] text-white"
                : "border-slate-200 text-slate-700 hover:border-[#1e3a8a] hover:text-[#1e3a8a]"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Button>

          {/* Action 2: Contextual primary action (Continue / Get Started) */}
          {currentScreen !== "dashboard" && (
            <Button
              size="sm"
              variant="default"
              onClick={() => onNavigate(nextAction.screen)}
              className="text-xs h-9 px-3.5 gap-1.5 font-semibold bg-[#1e3a8a] text-white hover:bg-[#172554] shadow-xs"
            >
              <span>{nextAction.label}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Collapsible Steps Menu Button (Hamburger) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
              menuOpen
                ? "bg-slate-100 border-slate-300 text-[#0f172a]"
                : "border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
            }`}
            aria-label="Toggle all steps menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span className="hidden sm:inline text-xs">Menu</span>
          </button>
        </div>
      </div>

      {/* Collapsible Steps Drawer / Dropdown Menu */}
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#1e3a8a]" />
                  <h3 className="text-sm font-bold text-[#0f172a]">
                    Application Roadmap & Steps
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-sans">
                  You can jump directly to any stage of your application at any time.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-sans">
                  Case ID: <strong className="text-[#0f172a]">{caseId}</strong>
                </span>

                {hideDevTools ? (
                  <span
                    className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded flex items-center gap-1 font-medium"
                    title="Connected to the live FastAPI backend"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Live Backend
                  </span>
                ) : (
                  <button
                    onClick={() => setDemoPanelOpen(!demoPanelOpen)}
                    className="text-xs text-slate-600 hover:text-[#1e3a8a] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <HelpCircle className="h-3 w-3 text-[#6b21a8]" />
                    <span>{demoPanelOpen ? "Hide Test Options" : "Test Scenarios"}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onResetDemo();
                    setMenuOpen(false);
                  }}
                  className="text-xs text-slate-600 hover:text-rose-600 px-2.5 py-1 rounded hover:bg-rose-50 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Reset demo session"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Grid of Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-4">
              {ALL_STEPS.map((step) => {
                const isActive = currentScreen === step.id;
                const isPast = step.stepNumber < currentStepNum;

                const getStepIcon = (id: AppScreen) => {
                  switch (id) {
                    case "landing":
                      return <Sparkles className="h-3.5 w-3.5 text-[#1e3a8a]" />;
                    case "intake":
                      return <MessageSquare className="h-3.5 w-3.5 text-[#1e3a8a]" />;
                    case "summary":
                      return <FileCheck className="h-3.5 w-3.5 text-[#1e3a8a]" />;
                    case "matches":
                      return <Award className="h-3.5 w-3.5 text-[#1e3a8a]" />;
                    case "documents":
                      return <FileText className="h-3.5 w-3.5 text-[#1e3a8a]" />;
                    case "action_plan":
                      return <CalendarCheck className="h-3.5 w-3.5 text-[#1e3a8a]" />;
                    case "dashboard":
                      return <LayoutDashboard className="h-3.5 w-3.5 text-[#1e3a8a]" />;
                    default:
                      return <CircleDot className="h-3.5 w-3.5 text-[#1e3a8a]" />;
                  }
                };

                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      onNavigate(step.id);
                      setMenuOpen(false);
                    }}
                    className={`text-left p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 ${
                      isActive
                        ? "bg-[#eff6ff] border-[#1e3a8a] text-[#1e3a8a] ring-1 ring-[#1e3a8a]/30 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        {getStepIcon(step.id)}
                        Step {step.stepNumber}
                      </span>
                      {isActive ? (
                        <Badge variant="default" className="text-[10px] bg-[#1e3a8a] py-0 px-1.5">
                          Current
                        </Badge>
                      ) : isPast ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      ) : null}
                    </div>
                    <span className="font-semibold text-xs text-[#0f172a]">
                      {step.label}
                    </span>
                    <p className="text-[11px] text-slate-500 line-clamp-1 font-sans">
                      {step.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
