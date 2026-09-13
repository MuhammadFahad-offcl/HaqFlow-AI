/**
 * services/api.ts
 * -----------------------------------------------------------------------
 * The single API surface consumed by every screen. It keeps the exact same
 * shape as the original in-memory mock (`lib/api.ts`) so no screen needs to
 * change, but for the three endpoints the Python backend actually exposes
 * (intake, match, analyze-document) it makes real HTTP calls when live mode
 * is enabled.
 *
 * Mode is controlled by env vars (see .env.example):
 *   VITE_API_BASE_URL   e.g. http://localhost:8000
 *   VITE_USE_MOCK        "true" (default) | "false"
 *
 * With VITE_USE_MOCK=true (or no VITE_API_BASE_URL configured), every call
 * falls back to the deterministic, dependency-free mock logic so the UI can
 * always be developed and demoed without the backend running.
 * -----------------------------------------------------------------------
 */

import {
  Program,
  SituationExtraction,
  ChatMessage,
  DocumentItem,
  ActionPlanItem,
  CaseOverview,
  IntakeLanguage,
  ApiIntakeResponse,
  ApiMatchResponse,
  ApiDocumentAnalysisResponse,
  ExtractedDocumentData
} from '../types';

import { mockApi } from '../lib/mockApi';

// Trim a trailing slash defensively — "https://x.vercel.app/" + "/api/v1/intake"
// would otherwise produce a double slash that some deployments 404 on.
const API_BASE_URL: string = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '').replace(/\/+$/, '');
const USE_MOCK: boolean =
  (import.meta.env.VITE_USE_MOCK as string | undefined) !== 'false' && API_BASE_URL === ''
    ? true
    : (import.meta.env.VITE_USE_MOCK as string | undefined) === 'true';

/** True when the app is running against real HTTP endpoints. Header/App can read this to hide dev-only simulation toggles. */
export const isLiveMode = (): boolean => !USE_MOCK && API_BASE_URL !== '';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    }
  });

  if (!res.ok) {
    let message = `Request to ${path} failed with status ${res.status}`;
    try {
      const body = await res.json();
      message = body?.error?.message ?? message;
    } catch {
      /* response wasn't JSON, keep default message */
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

/**
 * Maps the backend's Intake Agent JSON (province/district/children[]/etc.)
 * onto the UI's SituationExtraction shape used by SummaryScreen/MatchesScreen.
 */
function mapIntakeResultToSituation(
  result: ApiIntakeResponse['situation'],
  previous: SituationExtraction
): SituationExtraction {
  const location = [result.district, result.province].filter(Boolean).join(', ') || previous.location;

  const dependentParts: string[] = [];
  if (result.children?.length) {
    dependentParts.push(
      result.children
        .map((c) => (c.age != null ? `Child (${c.age}${c.in_school ? ', in school' : ''})` : 'Child'))
        .join(', ')
    );
  }
  if (result.pregnancy_or_maternal_need) dependentParts.push('Pregnant / maternal need');
  if (result.disability) dependentParts.push('Household member with a disability');

  return {
    location,
    householdSize: result.household_size ?? previous.householdSize,
    dependents: dependentParts.length > 0 ? dependentParts.join(', ') : previous.dependents,
    incomeSituation: result.income_or_income_change ?? previous.incomeSituation,
    employmentStatus: result.employment_status ?? previous.employmentStatus,
    specificNeeds: result.life_shock
      ? Array.from(new Set([...previous.specificNeeds, result.life_shock]))
      : previous.specificNeeds,
    confidence: result.missing_fields?.length ? 'needs_verification' : 'high',
    lastEditedAt: 'Just now'
  };
}

/**
 * Maps the backend's grounded-explanation response onto the UI's Program[]
 * shape used by MatchesScreen/ProgramDetailsScreen. Fields the backend does
 * not (and deliberately should not) fabricate — like estimated benefit
 * amounts or timeframes — are left as explicit "needs verification" strings
 * rather than invented.
 */
function mapMatchResponseToPrograms(result: ApiMatchResponse): Program[] {
  const byId = new Map(result.candidates.map((c) => [c.program_id, c]));

  return result.matches.map((m) => {
    const candidate = byId.get(m.program_id);
    return {
      id: m.program_id,
      name: candidate?.name ?? m.program_id,
      agency: 'See official source',
      category: 'emergency_relief',
      matchStrength: 'possible',
      matchReason: m.why_it_appears_relevant,
      missingEvidence: m.missing_evidence,
      sourceUrl: candidate?.official_source ?? '',
      lastUpdated: 'See official source',
      estimatedBenefit: 'Needs verification with the issuing authority',
      timeframeToReceive: 'Needs verification with the issuing authority',
      plainEligibilitySummary: m.verification,
      eligibilityCriteria: candidate?.reasons ?? [],
      requiredDocuments: (candidate?.required_documents ?? []).map((name, idx) => ({
        id: `${m.program_id}-doc-${idx}`,
        name,
        description: name,
        category: 'general',
        status: 'needed' as const,
        acceptableFormats: ['pdf', 'jpg', 'png']
      })),
      applicationSteps: m.next_steps.map((step, idx) => ({
        stepNumber: idx + 1,
        title: step,
        instruction: step
      }))
    };
  });
}

function mapDocumentAnalysisToExtractedData(result: ApiDocumentAnalysisResponse): ExtractedDocumentData {
  const summary = result.extracted_fields.map((f) => `${f.field}: ${f.value ?? 'unclear'}`).join(' | ');
  return {
    documentTypeRead: result.document_type,
    issuer: 'See document',
    dateDetected: 'See document',
    keyFigures: summary || 'No fields confidently extracted',
    confidenceScore: Math.round(result.overall_confidence * 100),
    notes: [result.verification_note, ...result.missing_or_unclear].filter(Boolean).join(' '),
    userVerified: false
  };
}

export const api = {
  ...mockApi,

  // -------------------------------------------------------------------
  // 2. AI INTAKE — POST /api/v1/intake
  // -------------------------------------------------------------------
  async sendIntakeMessage(
    userText: string,
    lang?: IntakeLanguage
  ): Promise<{ reply: ChatMessage; updatedExtraction: SituationExtraction }> {
    if (USE_MOCK) return mockApi.sendIntakeMessage(userText, lang);

    const previous = await mockApi.getSituationSummary();
    const data = await apiFetch<ApiIntakeResponse>('/api/v1/intake', {
      method: 'POST',
      body: JSON.stringify({ case_id: 'HQF-2026-8942', message: userText, language: lang ?? 'en' })
    });

    const updatedExtraction = mapIntakeResultToSituation(data.situation, previous);
    await mockApi.updateSituationSummary(updatedExtraction);

    const replyText =
      data.situation.next_question ??
      "Thank you, I've recorded that. You can review your Situation Profile whenever you're ready.";

    const reply: ChatMessage = {
      id: `msg-ai-${Date.now()}`,
      sender: 'ai',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    return { reply, updatedExtraction };
  },

  // -------------------------------------------------------------------
  // 4. PROGRAM MATCHES — POST /api/v1/match
  // -------------------------------------------------------------------
  async getMatchedPrograms(): Promise<Program[]> {
    if (USE_MOCK) return mockApi.getMatchedPrograms();

    const situation = await mockApi.getSituationSummary();
    const data = await apiFetch<ApiMatchResponse>('/api/v1/match', {
      method: 'POST',
      body: JSON.stringify({ case_id: 'HQF-2026-8942', situation })
    });
    return mapMatchResponseToPrograms(data);
  },

  async getProgramById(id: string): Promise<Program | null> {
    if (USE_MOCK) return mockApi.getProgramById(id);
    const programs = await api.getMatchedPrograms();
    return programs.find((p) => p.id === id) ?? null;
  },

  // -------------------------------------------------------------------
  // 5. DOCUMENTS — POST /api/v1/analyze-document
  // -------------------------------------------------------------------
  async uploadDocument(input: {
    docId?: string;
    name: string;
    fileSize?: string;
    presetKey?: string;
    file?: File;
  }): Promise<DocumentItem> {
    if (USE_MOCK || !input.file) return mockApi.uploadDocument(input);

    const form = new FormData();
    form.append('file', input.file);
    form.append('case_id', 'HQF-2026-8942');

    const res = await fetch(`${API_BASE_URL}/api/v1/analyze-document`, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`Document analysis failed with status ${res.status}`);
    const data = (await res.json()) as ApiDocumentAnalysisResponse;

    const extracted = mapDocumentAnalysisToExtractedData(data);
    const existing = await mockApi.getDocuments();
    const target = existing.find((d) => d.id === input.docId);

    const doc: DocumentItem = {
      id: target?.id ?? input.docId ?? `doc-${Date.now()}`,
      title: input.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      fileName: input.name,
      fileSize: input.fileSize ?? `${Math.round((input.file.size / 1024) * 10) / 10} KB`,
      uploadedAt: 'Just now',
      status: data.overall_confidence >= 0.75 ? 'uploaded' : 'review_required',
      associatedProgramIds: target?.associatedProgramIds ?? [],
      extractedData: extracted
    };

    return doc;
  }
};

export type { ApiIntakeResponse, ApiMatchResponse, ApiDocumentAnalysisResponse };
