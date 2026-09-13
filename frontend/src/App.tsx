import React, { useState, useEffect } from "react";
import { AppScreen, SituationExtraction } from "./types";
import { api, isLiveMode } from "./services/api";
import { Header } from "./components/Header";
import { LandingScreen } from "./components/screens/LandingScreen";
import { IntakeScreen } from "./components/screens/IntakeScreen";
import { SummaryScreen } from "./components/screens/SummaryScreen";
import { MatchesScreen } from "./components/screens/MatchesScreen";
import { ProgramDetailsScreen } from "./components/screens/ProgramDetailsScreen";
import { DocumentUploadScreen } from "./components/screens/DocumentUploadScreen";
import { ActionPlanScreen } from "./components/screens/ActionPlanScreen";
import { DashboardScreen } from "./components/screens/DashboardScreen";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("landing");
  const [selectedProgramId, setSelectedProgramId] = useState<string>("prog-uim-01");
  const [targetDocId, setTargetDocId] = useState<string | undefined>(undefined);
  const [initialIntakePrompt, setInitialIntakePrompt] = useState<string | undefined>(undefined);
  
  // State simulation flags for evaluation. These only affect the in-memory
  // mock (lib/mockApi.ts) — in live mode (VITE_USE_MOCK=false with a real
  // VITE_API_BASE_URL) the toggles are hidden by Header via `hideDevTools`,
  // since error/empty states then come from the real backend, not a flag.
  const [isSimulatingError, setIsSimulatingError] = useState(false);
  const [isSimulatingEmpty, setIsSimulatingEmpty] = useState(false);
  const [caseId, setCaseId] = useState("HQF-2026-8942");
  const hideDevTools = isLiveMode();

  const handleStartIntake = (prompt?: string) => {
    setInitialIntakePrompt(prompt);
    setCurrentScreen("intake");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProceedToSummary = (extracted: SituationExtraction) => {
    setCurrentScreen("summary");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmAndFindMatches = () => {
    setCurrentScreen("matches");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectProgram = (programId: string) => {
    setSelectedProgramId(programId);
    setCurrentScreen("program_details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUploadDocumentFromProgram = (docId: string) => {
    setTargetDocId(docId);
    setCurrentScreen("documents");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUploadClickFromTask = (docId?: string) => {
    setTargetDocId(docId);
    setCurrentScreen("documents");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleSimulateError = () => {
    const next = !isSimulatingError;
    setIsSimulatingError(next);
    api.setSimulateError(next);
  };

  const handleToggleSimulateEmpty = () => {
    const next = !isSimulatingEmpty;
    setIsSimulatingEmpty(next);
    api.setSimulateEmpty(next);
    // If currently on matches, re-render
    if (currentScreen === "matches") {
      setCurrentScreen("matches");
    }
  };

  const handleResetDemo = () => {
    api.resetToDefault();
    setIsSimulatingError(false);
    setIsSimulatingEmpty(false);
    setCurrentScreen("landing");
    setInitialIntakePrompt(undefined);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigate = (screen: AppScreen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#0f172a] font-sans">
      {/* Universal Top Navigation Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        caseId={caseId}
        isSimulatingError={isSimulatingError}
        onToggleSimulateError={handleToggleSimulateError}
        isSimulatingEmpty={isSimulatingEmpty}
        onToggleSimulateEmpty={handleToggleSimulateEmpty}
        onResetDemo={handleResetDemo}
        hideDevTools={hideDevTools}
      />

      {/* Main Screen Content Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentScreen === "landing" && (
          <LandingScreen
            onStartIntake={handleStartIntake}
            onExploreMatchesDirectly={() => handleNavigate("matches")}
          />
        )}

        {currentScreen === "intake" && (
          <IntakeScreen
            initialPrompt={initialIntakePrompt}
            onProceedToSummary={handleProceedToSummary}
          />
        )}

        {currentScreen === "summary" && (
          <SummaryScreen
            onConfirmAndFindMatches={handleConfirmAndFindMatches}
            onBackToIntake={() => handleNavigate("intake")}
          />
        )}

        {currentScreen === "matches" && (
          <MatchesScreen
            onSelectProgram={handleSelectProgram}
            onProceedToActionPlan={() => handleNavigate("action_plan")}
            onGoToUploadDocuments={() => handleNavigate("documents")}
            onModifySituation={() => handleNavigate("summary")}
          />
        )}

        {currentScreen === "program_details" && (
          <ProgramDetailsScreen
            programId={selectedProgramId}
            onBackToMatches={() => handleNavigate("matches")}
            onUploadDocument={handleUploadDocumentFromProgram}
            onGoToActionPlan={() => handleNavigate("action_plan")}
          />
        )}

        {currentScreen === "documents" && (
          <DocumentUploadScreen
            initialTargetDocId={targetDocId}
            onProceedToActionPlan={() => handleNavigate("action_plan")}
            onBackToMatches={() => handleNavigate("matches")}
          />
        )}

        {currentScreen === "action_plan" && (
          <ActionPlanScreen
            onGoToDashboard={() => handleNavigate("dashboard")}
            onUploadClick={handleUploadClickFromTask}
          />
        )}

        {currentScreen === "dashboard" && (
          <DashboardScreen
            onNavigateToMatches={() => handleNavigate("matches")}
            onNavigateToDocuments={() => handleNavigate("documents")}
            onNavigateToActionPlan={() => handleNavigate("action_plan")}
            onNavigateToIntake={() => handleNavigate("intake")}
            onSelectProgram={handleSelectProgram}
          />
        )}
      </main>

      {/* Universal Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 sm:py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-slate-500">
            HaqFlow • Free, confidential guidance through public support programs
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-500">
            <span>No CNIC storage required</span>
            <span>•</span>
            <span>Private & confidential</span>
            <span>•</span>
            <button
              onClick={handleResetDemo}
              className="text-[#1e3a8a] hover:underline cursor-pointer font-semibold"
            >
              Reset Demo
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
