import React, { useState, useEffect } from "react";
import { CaseOverview, Program } from "../../types";
import { api } from "../../lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { DashboardIllustration } from "../ui/illustrations";
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ArrowRight, 
  Calendar, 
  Sparkles, 
  RefreshCw, 
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  Layers,
  Briefcase,
  Utensils,
  Baby,
  Home,
  HeartPulse,
  FileCheck,
  Award,
  Activity
} from "lucide-react";

interface DashboardScreenProps {
  onNavigateToMatches: () => void;
  onNavigateToDocuments: () => void;
  onNavigateToActionPlan: () => void;
  onNavigateToIntake: () => void;
  onSelectProgram: (id: string) => void;
}

export function DashboardScreen({
  onNavigateToMatches,
  onNavigateToDocuments,
  onNavigateToActionPlan,
  onNavigateToIntake,
  onSelectProgram
}: DashboardScreenProps) {
  const [overview, setOverview] = useState<CaseOverview | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAllPrograms, setShowAllPrograms] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [caseData, progs] = await Promise.all([
        api.getCaseOverview(),
        api.getMatchedPrograms()
      ]);
      setOverview(caseData);
      setPrograms(progs);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load case overview.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff] text-[#1e3a8a]">
          <Sparkles className="h-6 w-6 animate-spin text-[#6b21a8]" />
        </div>
        <h3 className="text-xl font-bold text-[#0f172a]">Loading your case dashboard...</h3>
        <p className="text-xs sm:text-sm text-slate-500">Checking your application progress and upcoming deadlines.</p>
      </div>
    );
  }

  if (errorMsg || !overview) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertTitle className="text-xs font-semibold">Dashboard Unavailable</AlertTitle>
          <AlertDescription className="flex items-center justify-between mt-2">
            <span>{errorMsg || "Could not retrieve your case information right now."}</span>
            <Button size="sm" variant="outline" onClick={loadDashboard} className="bg-white text-xs">
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const visiblePrograms = showAllPrograms ? programs : programs.slice(0, 3);

  const getProgramCategoryIcon = (category: string) => {
    switch (category) {
      case "unemployment":
        return <Briefcase className="h-4 w-4 text-[#1e3a8a]" />;
      case "food_nutrition":
        return <Utensils className="h-4 w-4 text-emerald-600" />;
      case "family_support":
        return <Baby className="h-4 w-4 text-[#6b21a8]" />;
      case "housing":
        return <Home className="h-4 w-4 text-amber-600" />;
      case "healthcare":
        return <HeartPulse className="h-4 w-4 text-rose-600" />;
      default:
        return <Sparkles className="h-4 w-4 text-[#1e3a8a]" />;
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case "unemployment":
        return "bg-[#eff6ff] border-[#bfdbfe]";
      case "food_nutrition":
        return "bg-emerald-50 border-emerald-200";
      case "family_support":
        return "bg-[#f3e8ff] border-[#d8b4fe]";
      case "housing":
        return "bg-amber-50 border-amber-200";
      case "healthcare":
        return "bg-rose-50 border-rose-200";
      default:
        return "bg-slate-50 border-slate-200";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Friendly Visual Header Card with Illustration */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="hidden sm:block shrink-0">
            <DashboardIllustration className="w-20 h-20" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1e3a8a] bg-[#eff6ff] border border-[#bfdbfe] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Case {overview.caseId} • Active
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 hidden sm:inline flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 inline" /> Updated {overview.updatedAt}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">
              Your Benefits Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-xl">
              Track your applications, monitor key deadlines, and see which benefit claims need attention next.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <Button
            size="sm"
            variant="outline"
            onClick={onNavigateToIntake}
            className="text-xs font-medium border-slate-300"
          >
            Update Situation
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={onNavigateToActionPlan}
            className="gap-1.5 text-xs font-semibold bg-[#1e3a8a] text-white hover:bg-[#172554] shadow-xs"
          >
            <span>Open Action Plan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Recommended Next Action Banner (Clean single-focus card) */}
      <div className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff]/70 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#1e3a8a] uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-[#6b21a8]" />
            Recommended Next Step
          </span>
          <p className="text-lg sm:text-xl font-bold text-[#0f172a]">
            {overview.nextRecommendedAction}
          </p>
          <p className="text-xs text-slate-600 font-sans">
            Completing this step ensures your claims are filed before the upcoming deadline.
          </p>
        </div>

        <Button
          size="sm"
          variant="default"
          onClick={onNavigateToActionPlan}
          className="shrink-0 text-xs font-semibold bg-[#1e3a8a] text-white hover:bg-[#172554] self-start sm:self-center px-4 py-2"
        >
          <span>Take Action Now</span>
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>

      {/* 3 Metric Cards with generous spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Metric 1: Progress */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Overall Progress
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#0f172a]">
              {overview.overallProgressPercent}%
            </span>
            <span className="text-xs font-semibold text-emerald-700">On track</span>
          </div>
          <Progress value={overview.overallProgressPercent} className="h-2" />
          <p className="text-xs text-slate-500 font-sans">
            Initial intake and proof verification underway
          </p>
        </div>

        {/* Metric 2: Programs */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Matched Programs
            </span>
            <div className="h-7 w-7 rounded-lg bg-[#eff6ff] text-[#1e3a8a] flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#0f172a]">
              {overview.activeProgramsCount}
            </span>
            <span className="text-xs font-semibold text-[#1e3a8a]">Available</span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            PESSI relief, BISP Nashonuma, Sehat Card & Bait-ul-Mal
          </p>
          <button
            onClick={onNavigateToMatches}
            className="text-xs text-[#1e3a8a] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>View all programs</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Metric 3: Documents */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Documents Verified
            </span>
            <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#0f172a]">
              {overview.documentsUploadedCount} / {overview.documentsTotalCount}
            </span>
            <span className="text-xs font-semibold text-amber-700">Pending</span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            {overview.documentsTotalCount - overview.documentsUploadedCount} files needed for submission
          </p>
          <button
            onClick={onNavigateToDocuments}
            className="text-xs text-[#1e3a8a] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>Upload remaining files</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Two Columns: Programs in Progress & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Programs (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-[#0f172a]">
                  Programs in Progress
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Showing {visiblePrograms.length} of {programs.length} active programs
                </p>
              </div>

              <button
                onClick={onNavigateToMatches}
                className="text-xs text-[#1e3a8a] font-semibold hover:underline cursor-pointer"
              >
                All Matches →
              </button>
            </div>

            {/* List of Programs */}
            <div className="space-y-3">
              {visiblePrograms.map((prog) => (
                <div
                  key={prog.id}
                  onClick={() => onSelectProgram(prog.id)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border border-slate-200 hover:border-[#1e3a8a] bg-white hover:bg-slate-50/60 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {prog.imageUrl ? (
                      <img
                        src={prog.imageUrl}
                        alt={prog.name}
                        className="w-12 h-12 rounded-lg object-cover object-center border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border ${getCategoryBg(prog.category)}`}>
                        {getProgramCategoryIcon(prog.category)}
                      </div>
                    )}
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {prog.officialLogoText && (
                          <span className="inline-block text-[9px] font-bold tracking-wider uppercase bg-slate-900 text-white px-1.5 py-0.2 rounded">
                            {prog.officialLogoText}
                          </span>
                        )}
                        <span className="font-semibold text-sm text-[#0f172a] group-hover:text-[#1e3a8a] transition-colors truncate">
                          {prog.name}
                        </span>
                        <Badge variant={prog.matchStrength === "high" ? "high-match" : "possible-match"} className="text-[10px]">
                          {prog.matchStrength === "high" ? "High match" : "Possible match"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 font-sans">{prog.plainEligibilitySummary}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0 pl-12 sm:pl-0">
                    <span className="text-xs font-bold text-[#1e3a8a] block">
                      {prog.estimatedBenefit}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {prog.missingEvidence.length === 0 ? "✓ Proof ready" : `${prog.missingEvidence.length} doc needed`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Progressive Disclosure toggle for programs list */}
            {programs.length > 3 && (
              <button
                onClick={() => setShowAllPrograms(!showAllPrograms)}
                className="w-full py-2 text-xs font-medium text-slate-600 hover:text-[#1e3a8a] flex items-center justify-center gap-1 cursor-pointer transition-colors pt-2"
              >
                <span>{showAllPrograms ? "Show fewer programs" : `Show all ${programs.length} programs`}</span>
                {showAllPrograms ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Deadlines & Dates (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#1e3a8a]" />
                <h3 className="text-lg font-bold text-[#0f172a]">
                  Upcoming Deadlines
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {overview.scheduledFollowUps.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50"
                >
                  <div className="h-8 w-8 rounded-full bg-white border border-slate-200 text-[#1e3a8a] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Clock className="h-4 w-4" />
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-xs text-[#0f172a] truncate font-sans">
                        {event.title}
                      </span>
                      <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 font-medium shrink-0">
                        {event.type}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-[#1e3a8a]">{event.date}</p>
                    <p className="text-[11px] text-slate-500 font-sans">{event.programName}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToActionPlan}
                className="w-full text-xs text-slate-700 hover:text-[#1e3a8a] border-slate-200"
              >
                <span>View Full Calendar & Action Plan</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
