import React, { useState, useEffect } from "react";
import { Program } from "../../types";
import { api } from "../../lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  FileText, 
  ListOrdered, 
  HelpCircle,
  Upload,
  Coins,
  ShieldCheck
} from "lucide-react";

interface ProgramDetailsScreenProps {
  programId: string;
  onBackToMatches: () => void;
  onUploadDocument: (docId: string) => void;
  onGoToActionPlan: () => void;
}

export function ProgramDetailsScreen({
  programId,
  onBackToMatches,
  onUploadDocument,
  onGoToActionPlan
}: ProgramDetailsScreenProps) {
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchProgram();
  }, [programId]);

  const fetchProgram = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getProgramById(programId);
      if (!data) throw new Error("Program not found.");
      setProgram(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load program details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1e3a8a] border-t-transparent" />
        <h3 className="text-base font-semibold text-[#0f172a]">Loading program details...</h3>
      </div>
    );
  }

  if (errorMsg || !program) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Alert variant="destructive">
          <AlertTitle className="text-xs font-semibold">Unable to Load Program Details</AlertTitle>
          <AlertDescription>{errorMsg || "Unable to display this program right now."}</AlertDescription>
        </Alert>
        <Button onClick={onBackToMatches} variant="outline" size="sm" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Matches
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top navigation back button */}
      <div>
        <button
          onClick={onBackToMatches}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1e3a8a] hover:underline transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Matched Programs</span>
        </button>
      </div>

      {/* Program Header Card */}
      <Card className="border-slate-200 bg-white overflow-hidden">
        {/* Contextual Real Human Photograph Banner */}
        {program.imageUrl && (
          <div className="relative h-48 sm:h-64 w-full bg-slate-900 overflow-hidden">
            <img
              src={program.imageUrl}
              alt={program.name}
              className="w-full h-full object-cover object-center opacity-90"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent flex items-end p-5 sm:p-6">
              <div className="space-y-1 text-white">
                <div className="flex flex-wrap items-center gap-2">
                  {program.officialLogoText && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase bg-emerald-800 text-white px-2.5 py-0.5 rounded shadow-xs">
                      🇵🇰 {program.officialLogoText}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/20 backdrop-blur-xs text-white px-2 py-0.5 rounded">
                    <ShieldCheck className="h-3 w-3" />
                    Government Certified
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {program.name}
                </h2>
              </div>
            </div>
          </div>
        )}

        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl sm:text-2xl font-bold text-[#0f172a]">
                  {program.name}
                </CardTitle>
                <Badge variant={program.matchStrength === "high" ? "high-match" : "possible-match"}>
                  {program.matchStrength === "high" ? "High match" : "Possible match"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-sans">
                Offered by: <span className="font-medium text-slate-700">{program.agency}</span>
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-1 shrink-0 bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded-md">
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
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-xs sm:text-sm leading-relaxed text-slate-700">
            <p className="font-semibold text-[#1e3a8a] mb-1 uppercase tracking-wider text-[11px]">
              What this program does for you:
            </p>
            <p className="font-sans">{program.plainEligibilitySummary}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-[#1e3a8a]" />
              Official rules verified: <strong className="text-slate-700 font-medium">{program.lastUpdated}</strong>
            </span>

            <a
              href={program.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1e3a8a] hover:underline"
            >
              <span>Verify on official government site</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Plain Language Eligibility Conditions */}
      <Card className="border-slate-200 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#0f172a]">
            <ShieldCheck className="h-5 w-5 text-[#1e3a8a]" />
            Eligibility Rules Explained Simply
          </CardTitle>
          <CardDescription className="font-sans text-xs text-slate-500">
            These are the criteria the state or agency uses to approve your application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {program.eligibilityCriteria.map((criterion, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] shrink-0 mt-0.5" />
                <span className="font-sans">{criterion}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Required Documents Checklist */}
      <Card className="border-slate-200 bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#0f172a]">
                <FileText className="h-5 w-5 text-[#1e3a8a]" />
                Required Documents ({program.requiredDocuments.length})
              </CardTitle>
              <CardDescription className="font-sans text-xs text-slate-500">
                You will need these papers ready to submit with your application.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {program.requiredDocuments.map((doc) => {
              const statusBadgeVariant = {
                needed: "warning" as const,
                uploaded: "secondary" as const,
                verified: "success" as const,
                review_required: "low-confidence" as const
              };

              const statusLabels = {
                needed: "Needed",
                uploaded: "Uploaded",
                verified: "Verified",
                review_required: "Review Needed"
              };

              return (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50/60 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#0f172a]">{doc.name}</span>
                      <Badge variant={statusBadgeVariant[doc.status]}>
                        {statusLabels[doc.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 font-sans">{doc.description}</p>
                    <span className="block text-[11px] text-slate-400">
                      Accepted formats: {doc.acceptableFormats.join(", ")}
                    </span>
                  </div>

                  {doc.status === "needed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUploadDocument(doc.id)}
                      className="shrink-0 text-xs gap-1 font-medium"
                    >
                      <Upload className="h-3 w-3 text-[#1e3a8a]" />
                      <span>Attach File</span>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Application Instructions */}
      <Card className="border-slate-200 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-[#0f172a]">
            <ListOrdered className="h-5 w-5 text-[#1e3a8a]" />
            Step-by-Step Filing Guide
          </CardTitle>
          <CardDescription className="font-sans text-xs text-slate-500">
            Follow these simple steps in order to avoid delays or rejections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {program.applicationSteps.map((step) => (
              <div key={step.stepNumber} className="flex items-start gap-3 text-xs sm:text-sm">
                <div className="h-6 w-6 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {step.stepNumber}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-[#0f172a]">{step.title}</span>
                    {step.timing && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                        {step.timing}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">{step.instruction}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <Button variant="outline" size="sm" onClick={onBackToMatches} className="text-xs font-medium">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />
          Back to Matches
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={onGoToActionPlan}
          className="w-full sm:w-auto text-xs font-semibold"
        >
          View Full Action Plan Checklist
        </Button>
      </div>
    </div>
  );
}
