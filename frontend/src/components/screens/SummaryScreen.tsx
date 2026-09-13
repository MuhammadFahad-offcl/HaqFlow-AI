import React, { useState, useEffect } from "react";
import { SituationExtraction } from "../../types";
import { api } from "../../lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { ReviewIllustration } from "../ui/illustrations";
import { 
  MapPin, 
  Users, 
  Briefcase, 
  Coins, 
  CheckCircle2, 
  Edit3, 
  Save, 
  X, 
  ArrowRight, 
  Sparkles,
  RefreshCw,
  Baby,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck
} from "lucide-react";

interface SummaryScreenProps {
  onConfirmAndFindMatches: () => void;
  onBackToIntake: () => void;
}

export function SummaryScreen({ onConfirmAndFindMatches, onBackToIntake }: SummaryScreenProps) {
  const [situation, setSituation] = useState<SituationExtraction | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<SituationExtraction | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newNeedInput, setNewNeedInput] = useState("");
  const [showEligibilityDetails, setShowEligibilityDetails] = useState(false);

  useEffect(() => {
    loadSituation();
  }, []);

  const loadSituation = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getSituationSummary();
      setSituation(data);
      setEditedData({ ...data });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load situation summary.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!editedData) return;
    setIsSaving(true);
    try {
      const updated = await api.updateSituationSummary(editedData);
      setSituation(updated);
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save updates.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNeed = () => {
    if (!newNeedInput.trim() || !editedData) return;
    setEditedData({
      ...editedData,
      specificNeeds: [...editedData.specificNeeds, newNeedInput.trim()]
    });
    setNewNeedInput("");
  };

  const handleRemoveNeed = (index: number) => {
    if (!editedData) return;
    setEditedData({
      ...editedData,
      specificNeeds: editedData.specificNeeds.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#eff6ff] text-[#1e3a8a]">
          <Sparkles className="h-6 w-6 animate-spin text-[#6b21a8]" />
        </div>
        <h3 className="text-xl font-bold text-[#0f172a]">Organizing your information...</h3>
        <p className="text-xs sm:text-sm text-slate-500">Checking your situation against program qualification criteria.</p>
      </div>
    );
  }

  if (errorMsg || !situation) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertTitle className="text-xs font-semibold">Unable to Load Situation Summary</AlertTitle>
          <AlertDescription className="mt-2 flex items-center justify-between">
            <span>{errorMsg || "An unexpected error occurred."}</span>
            <Button size="sm" variant="outline" onClick={loadSituation} className="bg-white text-xs">
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const current = isEditing ? editedData! : situation;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Visual Header Card with Illustration */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <div className="hidden sm:block shrink-0">
            <ReviewIllustration className="w-20 h-20" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1e3a8a] bg-[#eff6ff] border border-[#bfdbfe] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Step 3 of 8 • Your Information
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 hidden sm:inline flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 inline" /> Ready to review
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">
              Here is what we heard
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed max-w-xl">
              Take a moment to verify these 4 key facts. If anything looks off, click <strong>Edit Details</strong> below before we calculate your benefits.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          {!isEditing ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditedData({ ...situation });
                setIsEditing(true);
              }}
              className="gap-1.5 text-xs font-medium border-slate-300"
            >
              <Edit3 className="h-3.5 w-3.5 text-[#1e3a8a]" />
              <span>Edit Details</span>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditedData({ ...situation });
                  setIsEditing(false);
                }}
                className="text-xs font-medium text-slate-600"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                variant="default"
                isLoading={isSaving}
                onClick={handleSaveEdits}
                className="text-xs font-semibold bg-[#1e3a8a]"
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Clean 4-Fact Cards Grid with generous whitespace */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Fact 1: Location */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="h-7 w-7 rounded-lg bg-[#eff6ff] text-[#1e3a8a] flex items-center justify-center">
                <MapPin className="h-4 w-4" />
              </div>
              Location & County
            </span>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Matched
            </span>
          </div>

          <div>
            {isEditing ? (
              <input
                type="text"
                value={editedData?.location || ""}
                onChange={(e) => setEditedData({ ...editedData!, location: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm bg-white text-[#0f172a] focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20"
              />
            ) : (
              <div>
                <p className="text-xl font-bold text-[#0f172a]">{current.location}</p>
                <p className="text-xs text-slate-500 mt-1">Connects to state and local relief programs</p>
              </div>
            )}
          </div>
        </div>

        {/* Fact 2: Household Size */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="h-7 w-7 rounded-lg bg-[#eff6ff] text-[#1e3a8a] flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
              Household Members
            </span>
            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
              {current.householdSize} Total
            </span>
          </div>

          <div>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={editedData?.householdSize || 1}
                  onChange={(e) => setEditedData({ ...editedData!, householdSize: parseInt(e.target.value) || 1 })}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm bg-white"
                />
                <input
                  type="text"
                  placeholder="Notes on dependents (e.g. infant, spouse)"
                  value={editedData?.dependents || ""}
                  onChange={(e) => setEditedData({ ...editedData!, dependents: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-xs bg-white"
                />
              </div>
            ) : (
              <div>
                <p className="text-xl font-bold text-[#0f172a]">{current.householdSize} People in Household</p>
                <p className="text-xs text-slate-500 mt-1">{current.dependents}</p>
              </div>
            )}
          </div>
        </div>

        {/* Fact 3: Employment Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="h-7 w-7 rounded-lg bg-[#eff6ff] text-[#1e3a8a] flex items-center justify-center">
                <Briefcase className="h-4 w-4" />
              </div>
              Employment Status
            </span>
            <span className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              Involuntary
            </span>
          </div>

          <div>
            {isEditing ? (
              <input
                type="text"
                value={editedData?.employmentStatus || ""}
                onChange={(e) => setEditedData({ ...editedData!, employmentStatus: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm bg-white"
              />
            ) : (
              <div>
                <p className="text-xl font-bold text-[#0f172a]">{current.employmentStatus}</p>
                <p className="text-xs text-slate-500 mt-1">Qualifies for PESSI worker wage relief & transition stipends</p>
              </div>
            )}
          </div>
        </div>

        {/* Fact 4: Current Income */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="h-7 w-7 rounded-lg bg-[#eff6ff] text-[#1e3a8a] flex items-center justify-center">
                <Coins className="h-4 w-4" />
              </div>
              Current Income Disruption
            </span>
            <span className="text-[11px] font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
              Rs 0 Earnings
            </span>
          </div>

          <div>
            {isEditing ? (
              <textarea
                rows={2}
                value={editedData?.incomeSituation || ""}
                onChange={(e) => setEditedData({ ...editedData!, incomeSituation: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm bg-white"
              />
            ) : (
              <div>
                <p className="text-xl font-bold text-[#0f172a]">{current.incomeSituation}</p>
                <p className="text-xs text-slate-500 mt-1">Meets criteria for expedited food aid and health subsidies</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Identified Hardships & Specific Needs (Clean Chip Grid) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <Baby className="h-4 w-4 text-[#1e3a8a]" />
            Immediate Needs & Hardships Flagged
          </span>
          <span className="text-xs text-slate-500 font-sans">
            {current.specificNeeds.length} priorities identified
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {current.specificNeeds.map((need, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 bg-[#eff6ff] border border-[#bfdbfe] px-3.5 py-1.5 rounded-full text-xs font-medium text-[#1e3a8a] shadow-2xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-[#1e3a8a]" />
              <span>{need}</span>
              {isEditing && (
                <button
                  onClick={() => handleRemoveNeed(idx)}
                  className="text-rose-600 hover:text-rose-800 ml-1 p-0.5 cursor-pointer"
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>

        {isEditing && (
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={newNeedInput}
              onChange={(e) => setNewNeedInput(e.target.value)}
              placeholder="Add another need (e.g. Utility disconnect notice, Prescription formula)"
              className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-xs bg-white"
            />
            <Button size="sm" variant="outline" onClick={handleAddNeed} className="text-xs">
              Add Need
            </Button>
          </div>
        )}
      </div>

      {/* Progressive Disclosure: Collapsible Guidelines / Criteria Explanation */}
      <div className="bg-slate-50/80 rounded-xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => setShowEligibilityDetails(!showEligibilityDetails)}
          className="w-full px-6 py-4 flex items-center justify-between text-left text-xs font-medium text-slate-700 hover:text-[#0f172a] hover:bg-slate-100/60 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Info className="h-4 w-4 text-[#1e3a8a]" />
            <span>How do these facts determine your eligibility?</span>
          </span>
          <span className="flex items-center gap-1 text-slate-500 font-normal">
            <span>{showEligibilityDetails ? "Hide explanation" : "See details"}</span>
            {showEligibilityDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </span>
        </button>

        {showEligibilityDetails && (
          <div className="px-6 pb-5 pt-1 text-xs text-slate-600 space-y-2.5 border-t border-slate-200/60 font-sans leading-relaxed">
            <p>
              • <strong>District & Province:</strong> Social safety nets are administered across federal, provincial, and district directorates. Your district (e.g., Lahore, Punjab) determines specific PESSI branch locations, Sehat Sahulat empaneled hospital coverage, and Bait-ul-Mal district offices.
            </p>
            <p>
              • <strong>Household Size & Dependents:</strong> National Socio-Economic Registry (NSER) and PMT welfare thresholds evaluate household dependency ratios. Having an infant under 24 months triggers immediate enrollment in BISP Nashonuma for specialized nutritional supplements.
            </p>
            <p>
              • <strong>Involuntary Separation:</strong> Documented retrenchment without misconduct establishes entitlement for provincial worker wage transition stipends and emergency rental stabilization.
            </p>
          </div>
        )}
      </div>

      {/* Spacious Footer CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <Button variant="ghost" size="sm" onClick={onBackToIntake} className="text-xs text-slate-600">
          Back to Conversation
        </Button>

        <Button
          size="lg"
          variant="default"
          onClick={onConfirmAndFindMatches}
          className="w-full sm:w-auto px-8 py-3 gap-2 text-xs font-semibold bg-[#1e3a8a] text-white hover:bg-[#172554] shadow-xs"
        >
          <span>Confirm & View Matched Programs</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
