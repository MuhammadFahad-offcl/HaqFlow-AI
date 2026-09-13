import React, { useState, useEffect } from "react";
import { Program, MatchStrength } from "../../types";
import { api } from "../../lib/api";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { EmptyState } from "../ui/empty-state";
import { MatchesIllustration } from "../ui/illustrations";
import { 
  CheckCircle2, 
  ExternalLink, 
  FileWarning, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  Filter, 
  Clock,
  Coins,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Eye,
  EyeOff,
  Briefcase,
  Utensils,
  Baby,
  Home,
  HeartPulse
} from "lucide-react";

interface MatchesScreenProps {
  onSelectProgram: (programId: string) => void;
  onProceedToActionPlan: () => void;
  onGoToUploadDocuments: () => void;
  onModifySituation: () => void;
}

export function MatchesScreen({
  onSelectProgram,
  onProceedToActionPlan,
  onGoToUploadDocuments,
  onModifySituation
}: MatchesScreenProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterStrength, setFilterStrength] = useState<"all" | MatchStrength>("all");
  const [expandedProgramIds, setExpandedProgramIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getMatchedPrograms();
      setPrograms(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to retrieve matched programs.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedProgramIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleExpandAll = () => {
    if (expandedProgramIds.size === filteredPrograms.length) {
      setExpandedProgramIds(new Set());
    } else {
      setExpandedProgramIds(new Set(filteredPrograms.map((p) => p.id)));
    }
  };

  const filteredPrograms = programs.filter((p) => {
    if (filterStrength !== "all" && p.matchStrength !== filterStrength) {
      return false;
    }
    return true;
  });

  const highMatchCount = programs.filter((p) => p.matchStrength === "high").length;
  const possibleMatchCount = programs.filter((p) => p.matchStrength === "possible").length;

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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff] text-[#1e3a8a]">
          <Sparkles className="h-6 w-6 animate-spin text-[#6b21a8]" />
        </div>
        <h2 className="text-xl font-bold text-[#0f172a]">
          Finding matching support programs...
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto font-sans">
          Searching state relief funds, emergency food assistance, health coverage, and local benefits.
        </p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertTitle className="text-xs font-semibold">Unable to Load Matches</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>{errorMsg}</p>
            <Button size="sm" variant="outline" onClick={fetchMatches} className="bg-white">
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const allExpanded = filteredPrograms.length > 0 && expandedProgramIds.size === filteredPrograms.length;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Friendly Visual Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="hidden sm:block shrink-0">
            <MatchesIllustration className="w-20 h-20" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1e3a8a] bg-[#eff6ff] border border-[#bfdbfe] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Step 4 of 8 • Program Matches
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 hidden sm:inline flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 inline" /> {programs.length} programs available
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">
              Programs You May Qualify For
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-xl">
              We cross-referenced your situation with federal, state, and county assistance rules. Review the matches below to prepare your applications.
            </p>
          </div>
        </div>

        {programs.length > 0 && (
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            <Button
              size="sm"
              variant="outline"
              onClick={onGoToUploadDocuments}
              className="text-xs font-medium border-slate-300"
            >
              Upload Proof
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={onProceedToActionPlan}
              className="gap-1.5 text-xs font-semibold bg-[#1e3a8a] text-white hover:bg-[#172554] shadow-xs"
            >
              <span>Build Action Plan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Filter and View Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="text-slate-500 mr-1 flex items-center gap-1.5 text-xs font-semibold">
            <Filter className="h-3.5 w-3.5 text-[#1e3a8a]" />
            Show:
          </span>
          <button
            onClick={() => setFilterStrength("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-medium ${
              filterStrength === "all"
                ? "bg-[#1e3a8a] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Programs ({programs.length})
          </button>
          <button
            onClick={() => setFilterStrength("high")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-medium ${
              filterStrength === "high"
                ? "bg-[#1e3a8a] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            High Match ({highMatchCount})
          </button>
          <button
            onClick={() => setFilterStrength("possible")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-medium ${
              filterStrength === "possible"
                ? "bg-[#1e3a8a] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Possible Match ({possibleMatchCount})
          </button>
        </div>

        <button
          onClick={toggleExpandAll}
          className="text-xs text-[#1e3a8a] hover:underline flex items-center gap-1.5 font-medium cursor-pointer"
        >
          {allExpanded ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          <span>{allExpanded ? "Collapse All Details" : "Expand All Details"}</span>
        </button>
      </div>

      {/* Empty State Condition */}
      {filteredPrograms.length === 0 && (
        <EmptyState
          title="No programs matched this filter"
          description="Try choosing 'All Programs' or update your situation details to recalculate your options."
          actionLabel="Show All Programs"
          onAction={() => setFilterStrength("all")}
          secondaryActionLabel="Update Your Situation"
          onSecondaryAction={onModifySituation}
        />
      )}

      {/* Clean Program Cards with Progressive Disclosure */}
      <div className="space-y-4">
        {filteredPrograms.map((program) => {
          const isExpanded = expandedProgramIds.has(program.id);

          return (
            <div
              key={program.id}
              className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all p-5 sm:p-6 shadow-xs"
            >
              {/* Top Row: Summary View (Always visible) */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Contextual Real Human Photograph */}
                  {program.imageUrl && (
                    <img
                      src={program.imageUrl}
                      alt={program.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover object-center border border-slate-200 shrink-0 shadow-2xs"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {program.officialLogoText && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase bg-slate-900 text-white px-2 py-0.5 rounded shadow-2xs">
                          {program.officialLogoText}
                        </span>
                      )}
                      <Badge variant={program.matchStrength === "high" ? "high-match" : "possible-match"}>
                        {program.matchStrength === "high" ? "High match" : "Possible match"}
                      </Badge>
                    </div>

                    <h3
                      onClick={() => onSelectProgram(program.id)}
                      className="text-base sm:text-lg font-bold text-[#0f172a] hover:text-[#1e3a8a] cursor-pointer transition-colors leading-snug"
                    >
                      {program.name}
                    </h3>

                    <p className="text-xs text-slate-500 font-sans">
                      Offered by: <span className="font-medium text-slate-700">{program.agency}</span>
                    </p>
                    <p className="text-xs text-slate-600 font-sans pt-0.5 line-clamp-2">
                      {program.plainEligibilitySummary}
                    </p>
                  </div>
                </div>

                {/* Benefit & Timeline Pill */}
                <div className="shrink-0 flex sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-1 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-0 border-slate-100">
                  <span className="text-sm sm:text-base font-bold text-[#1e3a8a] flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-[#1e3a8a]" />
                    {program.estimatedBenefit}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {program.timeframeToReceive}
                  </span>
                </div>
              </div>

              {/* Progressive Disclosure Toggle Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => toggleExpand(program.id)}
                  className="text-xs font-semibold text-[#1e3a8a] hover:text-[#172554] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{isExpanded ? "Hide Requirements & Match Logic" : "See Requirements & Match Logic"}</span>
                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onSelectProgram(program.id)}
                  className="text-xs text-slate-700 hover:text-[#1e3a8a] gap-1 h-8"
                >
                  <span>View Full Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Expanded Progressive Disclosure Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-3.5 animate-in fade-in-50 duration-150">
                  {/* Match Reason */}
                  <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-lg p-3.5 text-xs text-slate-800">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#1e3a8a]">Why this program matches your situation: </span>
                        <span className="text-slate-700">{program.matchReason}</span>
                      </div>
                    </div>
                  </div>

                  {/* Required Documents Needed */}
                  {program.missingEvidence && program.missingEvidence.length > 0 && (
                    <div className="flex items-start gap-2.5 text-xs bg-[#fffbeb] border border-[#fde68a] rounded-lg p-3.5">
                      <FileWarning className="h-4 w-4 text-[#b45309] shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-semibold text-[#92400e]">Documents you'll need: </span>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {program.missingEvidence.map((docName, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-white text-[#92400e] border border-[#fde68a] px-2.5 py-0.5 rounded-md text-xs font-medium shadow-2xs"
                            >
                              {docName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Application Steps & Official Link */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <a
                      href={program.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1e3a8a] transition-colors"
                    >
                      <span>Official government program portal</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <button
                      onClick={() => onSelectProgram(program.id)}
                      className="text-xs font-semibold text-[#1e3a8a] hover:underline cursor-pointer"
                    >
                      Read comprehensive step-by-step instructions →
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
