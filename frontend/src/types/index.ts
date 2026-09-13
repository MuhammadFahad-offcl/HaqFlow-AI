export type MatchStrength = 'high' | 'possible';

export type IntakeLanguage = 'en' | 'ur';

export type ProgramCategory = 
  | 'unemployment' 
  | 'family_support' 
  | 'healthcare' 
  | 'food_nutrition' 
  | 'housing' 
  | 'emergency_relief';

export type DocumentStatus = 'needed' | 'uploaded' | 'verified' | 'review_required';

export interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  category: string;
  status: DocumentStatus;
  acceptableFormats: string[];
}

export interface ApplicationStep {
  stepNumber: number;
  title: string;
  instruction: string;
  channel?: 'online' | 'phone' | 'in-person' | 'mail';
  timing?: string;
  externalUrl?: string;
}

export interface Program {
  id: string;
  name: string;
  shortCode?: string;
  agency: string;
  category: ProgramCategory;
  matchStrength: MatchStrength;
  matchReason: string;
  missingEvidence: string[];
  sourceUrl: string;
  lastUpdated: string;
  estimatedBenefit: string;
  timeframeToReceive: string;
  plainEligibilitySummary: string;
  eligibilityCriteria: string[];
  requiredDocuments: RequiredDocument[];
  applicationSteps: ApplicationStep[];
  selectedForPlan?: boolean;
  imageUrl?: string;
  officialLogoText?: string;
}

export interface SituationExtraction {
  location: string;
  householdSize: number;
  dependents: string;
  incomeSituation: string;
  employmentStatus: string;
  specificNeeds: string[];
  confidence: 'high' | 'needs_verification';
  lastEditedAt?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user' | 'system';
  text: string;
  timestamp: string;
  quickReplies?: string[];
  inputType?: 'text' | 'number' | 'single_choice' | 'multiple_choice';
  clarificationTopic?: keyof SituationExtraction | 'general';
  isCrisis?: boolean;
}

export interface ExtractedDocumentData {
  documentTypeRead: string;
  issuer: string;
  dateDetected: string;
  keyFigures: string;
  confidenceScore: number; // 0 - 100
  notes: string;
  userVerified: boolean;
}

export interface DocumentItem {
  id: string;
  title: string;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  status: DocumentStatus;
  associatedProgramIds: string[];
  extractedData?: ExtractedDocumentData;
}

export type ActionPriority = 'immediate' | 'week_1' | 'week_2';

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  programId?: string;
  programName: string;
  priority: ActionPriority;
  deadline: string;
  deadlineDays: number;
  completed: boolean;
  relatedDocId?: string;
  actionType: 'apply' | 'upload_doc' | 'contact_agency' | 'verification';
  sourceUrl?: string;
}

export interface ScheduledFollowUp {
  id: string;
  date: string;
  title: string;
  type: 'reminder' | 'deadline' | 'appointment';
  programName: string;
}

export interface CaseOverview {
  caseId: string;
  status: 'intake' | 'review' | 'matched' | 'in_progress';
  createdAt: string;
  updatedAt: string;
  overallProgressPercent: number;
  activeProgramsCount: number;
  documentsUploadedCount: number;
  documentsTotalCount: number;
  nextRecommendedAction: string;
  scheduledFollowUps: ScheduledFollowUp[];
}

export type AppScreen = 
  | 'landing' 
  | 'intake' 
  | 'summary' 
  | 'matches' 
  | 'program_details' 
  | 'documents' 
  | 'action_plan' 
  | 'dashboard';

// ---------------------------------------------------------------------------
// Backend API contract types (haqflow-backend, /api/v1/*)
// These mirror the Pydantic response_model shapes returned by FastAPI.
// Kept separate from the UI-facing types above so screens (which consume the
// UI types via services/api.ts) never need to know about the wire format.
// ---------------------------------------------------------------------------

export interface ApiChildFact {
  age: number | null;
  in_school: boolean | null;
}

/** Raw structured output of the Intake Agent (POST /api/v1/intake). */
export interface ApiIntakeResult {
  household_size: number | null;
  province: string | null;
  district: string | null;
  income_or_income_change: string | null;
  life_shock: string | null;
  children: ApiChildFact[];
  pregnancy_or_maternal_need: boolean | null;
  disability: boolean | null;
  employment_status: string | null;
  documents_mentioned: string[];
  missing_fields: string[];
  next_question: string | null;
}

export interface ApiIntakeResponse {
  case_id: string;
  situation: ApiIntakeResult;
}

/** One deterministic candidate returned before LLM explanation is applied. */
export interface ApiDeterministicMatch {
  program_id: string;
  name: string;
  match_status: 'appears_to_match';
  reasons: string[];
  required_documents: string[];
  verification_needed: true;
  official_source: string;
}

/** One program explained by the Grounded Explanation Agent. */
export interface ApiMatchExplanation {
  program_id: string;
  why_it_appears_relevant: string;
  missing_evidence: string[];
  verification: string;
  next_steps: string[];
}

/** Response of POST /api/v1/match. */
export interface ApiMatchResponse {
  case_id: string;
  summary: string;
  matches: ApiMatchExplanation[];
  candidates: ApiDeterministicMatch[];
  global_warning: string;
}

export interface ApiExtractedField {
  field: string;
  value: string | null;
  confidence: number;
}

/** Response of POST /api/v1/analyze-document. */
export interface ApiDocumentAnalysisResponse {
  document_type: string;
  status: 'usable' | 'needs_review' | 'unreadable';
  extracted_fields: ApiExtractedField[];
  missing_or_unclear: string[];
  overall_confidence: number;
  verification_note: string;
}

/** Normalized error envelope returned by FastAPI's exception handlers. */
export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
