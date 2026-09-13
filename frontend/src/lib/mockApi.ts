import {
  Program,
  SituationExtraction,
  ChatMessage,
  DocumentItem,
  ActionPlanItem,
  CaseOverview,
  RequiredDocument,
  IntakeLanguage
} from '../types';

import {
  EMPTY_SITUATION,
  INITIAL_EXTRACTED_SITUATION,
  MOCK_PROGRAMS,
  INITIAL_DOCUMENTS,
  INITIAL_ACTION_PLAN,
  INITIAL_CASE_OVERVIEW
} from './mockData';

import {
  isCrisisLanguage,
  isSafetyConfirmation,
  getCrisisResponse
} from './safety';

// State container representing in-memory database during the session
interface StorageState {
  situation: SituationExtraction;
  programs: Program[];
  documents: DocumentItem[];
  actionPlan: ActionPlanItem[];
  caseOverview: CaseOverview;
  messages: ChatMessage[];
  intakeStage: number; // 0: what happened, 1: location & household, 2: urgent needs, 3: summary ready
  currentLanguage: IntakeLanguage;
  shouldSimulateError: boolean;
  shouldSimulateEmpty: boolean;
  isCrisisActive: boolean;
}

const INITIAL_CHAT_MESSAGES_EN: ChatMessage[] = [
  {
    id: "msg-ai-1",
    sender: "ai",
    text: "Hello. I am HaqFlow. When unexpected life disruptions happen, identifying what benefits and protections you qualify for can be exhausting. In your own words, what happened recently, and what are your most immediate concerns?",
    timestamp: "10:40 AM",
    quickReplies: [
      "I was unexpectedly laid off from my job",
      "I have a sudden medical injury / disability",
      "Behind on rent and utility bills",
      "I recently had a baby / pregnancy income loss"
    ]
  }
];

const INITIAL_CHAT_MESSAGES_UR: ChatMessage[] = [
  {
    id: "msg-ai-1",
    sender: "ai",
    text: "Assalam-o-Alaikum! Main HaqFlow hoon. Jab achanak zindagi mein koi mushkil pesh aye, to sahi sahara dhoondna mushkil ho jata hai. Apne alfaz mein batayein, haal hi mein aap ke sath kya hua, aur is waqt sab se barhi fikar kya hai?",
    timestamp: "10:40 AM",
    quickReplies: [
      "Meri achanak job chali gayi hai (Layoff)",
      "Bimari ya sudden medical injury hui hai",
      "Kiraye aur bills ki pareshani hai",
      "Ghar mein naya bacha paida hua hai"
    ]
  }
];

// Initialize local memory store
let state: StorageState = {
  situation: { ...EMPTY_SITUATION },
  programs: [...MOCK_PROGRAMS],
  documents: [...INITIAL_DOCUMENTS],
  actionPlan: [...INITIAL_ACTION_PLAN],
  caseOverview: { ...INITIAL_CASE_OVERVIEW },
  messages: [...INITIAL_CHAT_MESSAGES_EN],
  intakeStage: 0,
  currentLanguage: 'en',
  shouldSimulateError: false,
  shouldSimulateEmpty: false,
  isCrisisActive: false
};

// Helper to simulate realistic async latency
const delay = (ms: number = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// Safe, strictly non-hallucinating fact extractors
function extractExplicitLocation(text: string): string | null {
  const lower = text.toLowerCase();

  const KNOWN_LOCATIONS = [
    { name: "Lahore District, Punjab", patterns: [/\blahore\b/i] },
    { name: "Rawalpindi District, Punjab", patterns: [/\brawalpindi\b/i] },
    { name: "Islamabad Capital Territory", patterns: [/\bislamabad\b/i] },
    { name: "Karachi, Sindh", patterns: [/\bkarachi\b/i] },
    { name: "Faisalabad, Punjab", patterns: [/\bfaisalabad\b/i] },
    { name: "Multan, Punjab", patterns: [/\bmultan\b/i] },
    { name: "Peshawar, KP", patterns: [/\bpeshawar\b/i] },
    { name: "Quetta, Balochistan", patterns: [/\bquetta\b/i] },
    { name: "Gujranwala, Punjab", patterns: [/\bgujranwala\b/i] },
    { name: "Sialkot, Punjab", patterns: [/\bsialkot\b/i] },
    { name: "Hyderabad, Sindh", patterns: [/\bhyderabad\b/i] },
    { name: "Sukkur, Sindh", patterns: [/\bsukkur\b/i] },
    { name: "Abbottabad, KP", patterns: [/\babbottabad\b/i] },
    { name: "Bahawalpur, Punjab", patterns: [/\bbahawalpur\b/i] },
    { name: "Sargodha, Punjab", patterns: [/\bsargodha\b/i] },
    { name: "Sheikhupura, Punjab", patterns: [/\bsheikhupura\b/i] },
    { name: "Gujrat, Punjab", patterns: [/\bgujrat\b/i] },
    { name: "Kasur, Punjab", patterns: [/\bkasur\b/i] },
    { name: "Mardan, KP", patterns: [/\bmardan\b/i] },
    { name: "Punjab Province", patterns: [/\bpunjab\b/i] },
    { name: "Sindh Province", patterns: [/\bsindh\b/i] },
    { name: "Khyber Pakhtunkhwa (KP)", patterns: [/\bkhyber\s+pakhtunkhwa\b/i, /\bkp\b/i] },
    { name: "Balochistan", patterns: [/\bbalochistan\b/i] }
  ];

  for (const loc of KNOWN_LOCATIONS) {
    if (loc.patterns.some((p) => p.test(lower))) {
      return loc.name;
    }
  }

  // Check if user stated "in <City>", "live in <City>", "from <City>"
  const match = text.match(/\b(?:live\s+in|living\s+in|from|district\s+of|shehr)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
  if (match && match[1]) {
    const candidate = match[1].trim();
    const banned = ["my", "a", "the", "trouble", "may", "crisis", "need", "poverty", "debt", "bed", "this", "pain", "support", "help"];
    if (!banned.includes(candidate.toLowerCase()) && candidate.length >= 3 && candidate.length <= 25) {
      return candidate;
    }
  }

  return null;
}

function extractExplicitHouseholdSize(text: string): number | null {
  const lower = text.toLowerCase();

  if (/\b(?:just\s+me|alone|only\s+me|myself|single\s+person|1\s+person|1\s+fard|sirf\s+main|single\s+individual)\b/i.test(lower)) {
    return 1;
  }
  if (/\b(?:2\s+(?:people|persons|members|log|afraad)|two\s+(?:people|of\s+us)|my\s+wife\s+and\s+(?:i|me)|my\s+husband\s+and\s+(?:i|me)|my\s+partner\s+and\s+(?:i|me)|do\s+log|2\s+of\s+us)\b/i.test(lower)) {
    return 2;
  }
  if (/\b(?:3\s+(?:people|persons|members|log|afraad)|three\s+(?:people|of\s+us)|family\s+of\s+3|family\s+of\s+three|teen\s+log|3\s+of\s+us)\b/i.test(lower)) {
    return 3;
  }
  if (/\b(?:4\s+(?:people|persons|members|log|afraad)|four\s+(?:people|of\s+us)|family\s+of\s+4|family\s+of\s+four|char\s+log|4\s+of\s+us)\b/i.test(lower)) {
    return 4;
  }
  if (/\b(?:5\s+(?:people|persons|members|log|afraad)|five\s+(?:people|of\s+us)|family\s+of\s+5|family\s+of\s+five|panch\s+log|5\s+of\s+us)\b/i.test(lower)) {
    return 5;
  }
  if (/\b(?:6\s+(?:people|persons|members|log|afraad)|six\s+(?:people|of\s+us)|family\s+of\s+6|cheh\s+log)\b/i.test(lower)) {
    return 6;
  }

  // Explicit number before people/members/afraad
  const numMatch = text.match(/\b(\d+)\s*(?:people|persons|members|family\s+members|log|afraad)\b/i);
  if (numMatch && numMatch[1]) {
    const val = parseInt(numMatch[1], 10);
    if (val >= 1 && val <= 30) return val;
  }

  // "partner and our baby" (implies user + partner + baby = 3)
  if (/\b(?:partner|wife|husband|spouse)\s+and\s+(?:our\s+)?(?:baby|infant|child)\b/i.test(lower)) {
    return 3;
  }

  return null;
}

function extractExplicitDependents(text: string): string | null {
  const lower = text.toLowerCase();

  if (/\b(?:no\s+(?:dependents|kids|children)|alone|just\s+me|koi\s+bacha\s+nahi|no\s+kids)\b/i.test(lower)) {
    return "None (single individual)";
  }

  const parts: string[] = [];

  if (/\b(?:infant|baby|newborn|bacha|chota\s+bacha)\b/i.test(lower)) {
    const ageMatch = text.match(/\b(\d+[- ](?:month|mo|year|yr)[s]?\s*(?:old)?)\b/i);
    if (ageMatch && ageMatch[1]) {
      parts.push(`1 infant (${ageMatch[1]})`);
    } else {
      parts.push("1 infant / young child");
    }
  }

  if (/\b(?:children|kids|son|daughter|bachay)\b/i.test(lower) && !parts.some(p => p.includes("infant"))) {
    parts.push("Children in household");
  }

  if (/\b(?:partner|wife|husband|spouse|biwi|shohar)\b/i.test(lower)) {
    parts.push("Adult partner / spouse");
  }

  if (/\b(?:elderly|parents|mother|father|walid|walida)\b/i.test(lower)) {
    parts.push("Elderly family member");
  }

  return parts.length > 0 ? parts.join(", ") : null;
}

function extractExplicitEmploymentAndIncome(text: string): { employment?: string; income?: string } {
  const lower = text.toLowerCase();
  const res: { employment?: string; income?: string } = {};

  if (/\b(?:laid\s+off|layoff|fired|lost\s+(?:my\s+)?job|let\s+go|unemployed|retrenched|naukri\s+chali\s+gayi|job\s+khatam)\b/i.test(lower)) {
    res.employment = "Recently separated (involuntary layoff)";
    res.income = "Income interrupted following job loss";
  } else if (/\b(?:injury|injured|accident|disability|disabled|medical\s+leave|cannot\s+work|bimari|chot|hospitalized)\b/i.test(lower)) {
    res.employment = "Unable to work due to medical condition / injury";
    res.income = "Income halted due to health emergency";
  }

  if (/\b(?:rs\.?\s*0|zero\s+(?:income|earnings)|no\s+income|\$0)\b/i.test(lower)) {
    res.income = "Rs 0 current household earnings";
  } else {
    const amountMatch = text.match(/\b(?:rs\.?|pkr)\s*([\d,]+)\b/i);
    if (amountMatch && amountMatch[1] && (lower.includes("income") || lower.includes("earning") || lower.includes("salary") || lower.includes("aamdan"))) {
      res.income = `Rs ${amountMatch[1]} monthly earnings`;
    }
  }

  return res;
}

function extractExplicitNeeds(text: string): string[] {
  const lower = text.toLowerCase();
  const needs: string[] = [];

  if (/\b(?:rent|eviction|lease|landlord|housing|kiraya)\b/i.test(lower)) {
    const rentAmountMatch = text.match(/(?:rent|kiraya)[^\d]*?(?:rs\.?|pkr)?\s*([\d,]+)/i) ||
                           text.match(/(?:rs\.?|pkr)\s*([\d,]+)[^\n.]*?(?:rent|kiraya)/i);
    if (rentAmountMatch && rentAmountMatch[1]) {
      needs.push(`Rental assistance (Rs ${rentAmountMatch[1]} due)`);
    } else {
      needs.push("Emergency rental housing assistance");
    }
  }

  if (/\b(?:infant|baby|formula|milk|diapers?|doodh|bacha)\b/i.test(lower)) {
    needs.push("Infant nutrition & formula support");
  }

  if (/\b(?:food|grocery|groceries|rations?|rashan|aata|khana)\b/i.test(lower)) {
    needs.push("Emergency grocery & food ration support");
  }

  if (/\b(?:medical|doctor|prescription|medicine|medicines|hospital|sehat|dawa|ilaj)\b/i.test(lower)) {
    needs.push("Medical care & prescription support");
  }

  if (/\b(?:utility|utilities|electric|electricity|gas|power|bijli|bill|arrears)\b/i.test(lower)) {
    needs.push("Utility bill assistance (electricity/gas)");
  }

  return needs;
}

/**
 * The original, fully in-memory mock implementation (no network calls).
 * services/api.ts wraps this: it is used directly when VITE_USE_MOCK=true,
 * and as the fallback/state-holder for every endpoint the Python backend
 * doesn't (yet) expose, even in live mode.
 */
export const mockApi = {
  /**
   * Diagnostic simulation flags for testing UI states required by prompt:
   * (Loading, Error, Empty, Demo mode)
   */
  setSimulateError(val: boolean) {
    state.shouldSimulateError = val;
  },

  setSimulateEmpty(val: boolean) {
    state.shouldSimulateEmpty = val;
  },

  getSimulationFlags() {
    return {
      error: state.shouldSimulateError,
      empty: state.shouldSimulateEmpty
    };
  },

  getIsCrisisActive() {
    return state.isCrisisActive;
  },

  loadDemoScenarioSituation(situation?: SituationExtraction) {
    state.situation = situation ? { ...situation } : { ...INITIAL_EXTRACTED_SITUATION };
  },

  resetToDefault() {
    state = {
      situation: { ...EMPTY_SITUATION },
      programs: [...MOCK_PROGRAMS],
      documents: [...INITIAL_DOCUMENTS],
      actionPlan: [...INITIAL_ACTION_PLAN],
      caseOverview: { ...INITIAL_CASE_OVERVIEW },
      messages: state.currentLanguage === 'ur' ? [...INITIAL_CHAT_MESSAGES_UR] : [...INITIAL_CHAT_MESSAGES_EN],
      intakeStage: 0,
      currentLanguage: state.currentLanguage,
      shouldSimulateError: false,
      shouldSimulateEmpty: false,
      isCrisisActive: false
    };
  },

  // 1. CASE OVERVIEW
  async getCaseOverview(): Promise<CaseOverview> {
    await delay(300);
    if (state.shouldSimulateError) {
      throw new Error("Unable to retrieve case file from social support registry. Check network connection.");
    }
    // recalculate counts dynamically
    const completedTasks = state.actionPlan.filter(a => a.completed).length;
    const totalTasks = state.actionPlan.length;
    const uploadedDocs = state.documents.filter(d => d.status === 'uploaded' || d.status === 'verified').length;
    const totalDocs = state.documents.length;

    const progressScore = Math.round(((completedTasks / Math.max(1, totalTasks)) * 0.5 + (uploadedDocs / Math.max(1, totalDocs)) * 0.5) * 100);

    state.caseOverview.overallProgressPercent = progressScore;
    state.caseOverview.documentsUploadedCount = uploadedDocs;
    state.caseOverview.documentsTotalCount = totalDocs;
    state.caseOverview.activeProgramsCount = state.programs.length;

    return { ...state.caseOverview };
  },

  // 2. AI INTAKE
  async getIntakeHistory(language?: IntakeLanguage): Promise<ChatMessage[]> {
    await delay(200);
    if (language && language !== state.currentLanguage) {
      this.setChatLanguage(language);
    }
    return [...state.messages];
  },

  setChatLanguage(language: IntakeLanguage): ChatMessage[] {
    state.currentLanguage = language;
    // If only initial greeting exists, replace it with selected language greeting
    if (state.messages.length === 1 && state.messages[0].sender === 'ai') {
      state.messages = language === 'ur' ? [...INITIAL_CHAT_MESSAGES_UR] : [...INITIAL_CHAT_MESSAGES_EN];
    }
    return [...state.messages];
  },

  async sendIntakeMessage(userText: string, lang?: IntakeLanguage): Promise<{ reply: ChatMessage; updatedExtraction: SituationExtraction }> {
    await delay(500);

    if (state.shouldSimulateError) {
      throw new Error(lang === 'ur' 
        ? "Server se rabta toot gaya hai. Barah-e-karam dobara koshish karein." 
        : "Intake stream timed out while connecting to parsing service. Please retry."
      );
    }

    const language: IntakeLanguage = lang || state.currentLanguage;
    state.currentLanguage = language;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    // Ensure we don't duplicate if already added by client
    if (!state.messages.some(m => m.id === userMessage.id || (m.sender === 'user' && m.text === userText && Date.now() - parseInt(m.id.replace('msg-user-', '') || '0') < 2000))) {
      state.messages.push(userMessage);
    }

    // 1. SAFETY - CRISIS LANGUAGE DETECTION
    // If the message suggests self-harm, suicidal thoughts, or immediate danger:
    // IMMEDIATELY pause intake, do NOT advance stage, do NOT extract data, do NOT match programs.
    if (isCrisisLanguage(userText)) {
      state.isCrisisActive = true;
      const crisisResp = getCrisisResponse(language);
      const aiReply: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: "ai",
        text: crisisResp.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: crisisResp.quickReplies,
        isCrisis: true
      };
      state.messages.push(aiReply);
      return {
        reply: aiReply,
        updatedExtraction: { ...state.situation }
      };
    }

    // 2. SAFETY - CHECK IF CURRENTLY PAUSED IN CRISIS
    if (state.isCrisisActive) {
      // Check if user confirmed safety and explicitly asked to continue
      if (isSafetyConfirmation(userText)) {
        state.isCrisisActive = false;
        const confirmReplyText = language === 'ur'
          ? "Shukriya ke aap ne bataya ke aap mehfooz hain. Hum aap ki relief aur support programs mein madad jari rakhte hain.\n\nAap ke liye sahi programs dhoondne ke liye: haal hi mein aap ke sath kya hua? Jaise job khatam hona, bimari, ya koi achanak kharcha?"
          : "Thank you for letting me know you are safe. We can now safely continue navigating public support programs together.\n\nTo help find programs suited to your needs: what happened recently that led you to seek support, such as a job disruption, health condition, or living expenses?";
        const confirmQuickReplies = language === 'ur'
          ? [
              "Meri job khatam ho gayi hai (Layoff)",
              "Bimari ya medical emergency",
              "Kiraya aur bills ki pareshani"
            ]
          : [
              "I lost my job / laid off",
              "Medical injury or illness",
              "Behind on rent and utility bills"
            ];
        const aiReply: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: "ai",
          text: confirmReplyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickReplies: confirmQuickReplies
        };
        state.messages.push(aiReply);
        return {
          reply: aiReply,
          updatedExtraction: { ...state.situation }
        };
      } else {
        // Crisis language was previously triggered and user has not confirmed safety
        const crisisResp = getCrisisResponse(language);
        const aiReply: ChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: "ai",
          text: language === 'ur'
            ? "Aap ki hifazat sab se pehle hai. Program intake is waqt ruka hua hai. Barah-e-karam fori taur par Umang helpline (0311-7786264) ya 1166 par rabta karein. Jab aap mehfooz mehsoos karein aur aagay barhna chahein, to humein batayein."
            : "Your immediate safety is the top priority. Program intake remains paused. Please connect with the Umang Helpline at 0311-7786264 or dial 1166 right now. When you are safe and confirm you want to proceed, we will continue your navigation.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickReplies: crisisResp.quickReplies,
          isCrisis: true
        };
        state.messages.push(aiReply);
        return {
          reply: aiReply,
          updatedExtraction: { ...state.situation }
        };
      }
    }

    // 3. NON-HALLUCINATING FACT EXTRACTION
    // ONLY extract facts explicitly provided in userText. Never assume or fabricate details.
    const lower = userText.toLowerCase().trim();
    const explicitLoc = extractExplicitLocation(userText);
    const explicitSize = extractExplicitHouseholdSize(userText);
    const explicitDeps = extractExplicitDependents(userText);
    const explicitEmp = extractExplicitEmploymentAndIncome(userText);
    const explicitNeeds = extractExplicitNeeds(userText);

    if (explicitLoc) {
      state.situation.location = explicitLoc;
    }
    if (explicitSize !== null) {
      state.situation.householdSize = explicitSize;
    }
    if (explicitDeps) {
      state.situation.dependents = explicitDeps;
    }
    if (explicitEmp.employment) {
      state.situation.employmentStatus = explicitEmp.employment;
    }
    if (explicitEmp.income) {
      state.situation.incomeSituation = explicitEmp.income;
    }
    if (explicitNeeds.length > 0) {
      state.situation.specificNeeds = Array.from(new Set([...state.situation.specificNeeds, ...explicitNeeds]));
    }
    state.situation.lastEditedAt = "Just now";

    let replyText = "";
    let quickReplies: string[] | undefined = undefined;

    // Check for explicit summary / review request
    if (
      lower.includes("review") || 
      lower.includes("summary") || 
      lower.includes("show match") || 
      lower.includes("see match") || 
      lower.includes("next step") || 
      lower.includes("ready") ||
      lower.includes("dikhayein") ||
      lower.includes("programs dekhna")
    ) {
      state.intakeStage = 3;
      state.situation.confidence = "high";
      if (language === 'ur') {
        replyText = "Maine aap ki batayi hui tamam maloomat Situation Profile mein darj kar li hain. Agli screen par aap apni maloomat dekh aur tabdeel kar sakte hain, aur matching programs explore kar sakte hain.";
        quickReplies = [
          "Summary aur situation review karein",
          "Ek mazeed baat batani hai"
        ];
      } else {
        replyText = "I've organized the details you shared into your Situation Profile. You can review and adjust any detail on the summary screen before exploring your program matches.";
        quickReplies = [
          "Review situation summary",
          "Add one more detail first"
        ];
      }
    }
    // Check for questions about CNIC / SSN or privacy
    else if (lower.includes("cnic") || lower.includes("ssn") || lower.includes("identity") || lower.includes("privacy") || lower.includes("safe") || lower.includes("mehfooz") || lower.includes("raaz")) {
      if (language === 'ur') {
        replyText = "HaqFlow aap ka private banking PIN ya sensitive password kabhi nahi mangta, aur aap ki tamam maloomat bilkul confidential rehti hain. Hum sirf program eligibility criteria dekhne ke liye maloomat mangte hain. Barah-e-karam batayein: aap ke sath haal hi mein kya hua? (Jaise job khatam hona, bimari, ya koi achanak pareshani?)";
        quickReplies = [
          "Meri job chali gayi hai (Layoff)",
          "Bimari ya medical emergency",
          "Kiraya aur bills ka masla"
        ];
      } else {
        replyText = "HaqFlow does not store sensitive banking PINs or confidential passwords, and your information is kept private. We only cross-reference eligibility rules against official welfare thresholds. To continue, what happened recently? For example, job loss, medical injury, or an emergency?";
        quickReplies = [
          "I lost my job / laid off",
          "Sudden medical injury or illness",
          "Behind on rent and utility bills"
        ];
      }
    }
    // Check for questions about timing or duration
    else if (lower.includes("how long") || lower.includes("timeline") || lower.includes("how fast") || lower.includes("kitna time") || lower.includes("kab milega")) {
      if (language === 'ur') {
        replyText = "Aam taur par worker transition programs 2–3 hafton mein process hoti hain, jabke emergency cash aur rashan relief expedited hoti hai agar aamdan kam ho. Kya aap matching programs dekhne ke liye tayar hain?";
        quickReplies = [
          "Jee haan, matching programs dikhayein",
          "Ek mazeed baat batani hai"
        ];
      } else {
        replyText = "Most worker wage transition benefits take 2–3 weeks to process after verification, while urgent nutrition and emergency cash assistance can issue expedited aid. Are you ready to see your matched programs?";
        quickReplies = [
          "Yes, show me my matched programs",
          "Add one more detail first"
        ];
      }
    }
    // User shared a job loss or medical condition
    else if (explicitEmp.employment && state.situation.location === "Not provided yet" && state.situation.householdSize === 0) {
      state.intakeStage = 1;
      const isLayoff = explicitEmp.employment.toLowerCase().includes("layoff");
      if (language === 'ur') {
        replyText = `Sun kar afsos hua. ${isLayoff ? 'Achanak job khatam hone par' : 'Aisi mushkil ghari mein'} fori sahara bohat ahem hai. Aap ke ilaqay ke sahi programs dekhne ke liye: aap kis shehr ya zilla mein rehte hain, aur ghar mein kitne log hain?`;
        quickReplies = [
          "Lahore",
          "Karachi",
          "Rawalpindi / Islamabad",
          "Another city or district"
        ];
      } else {
        replyText = `I'm sorry you experienced this ${isLayoff ? 'unexpected job loss' : 'hardship'}. Involuntary disruptions qualify you for legal social protections. To see which district and provincial programs you qualify for: which district or city in Pakistan do you live in, and how many people share your home?`;
        quickReplies = [
          "Lahore",
          "Karachi",
          "Rawalpindi / Islamabad",
          "Another city or district"
        ];
      }
    }
    // User provided BOTH location AND household size in this message (or across the chat)
    else if ((explicitLoc && (explicitSize !== null || state.situation.householdSize > 0)) || (explicitSize !== null && state.situation.location !== "Not provided yet")) {
      state.intakeStage = 2;
      const householdCount = state.situation.householdSize;
      const locName = state.situation.location;
      if (language === 'ur') {
        replyText = `Theek hai, maine note kar liya ke aap ${locName} mein ${householdCount} afraad ke sath rehte hain. Kya is waqt koi fori kharche hain — jaise ke kiraya, dawaiyan, ya rashan ki zaroorat?`;
        quickReplies = [
          "Upcoming rent payment",
          "Medical treatment or medicine",
          "Groceries and food rations",
          "No other urgent expenses, ready for matches"
        ];
      } else {
        replyText = `Got it. I've noted that you live in ${locName} with ${householdCount} ${householdCount === 1 ? 'person' : 'people'} in your household. Do you have any immediate urgent expenses right now (such as upcoming rent, medical treatment, or grocery needs)?`;
        quickReplies = [
          "Upcoming rent payment",
          "Medical treatment or medicine",
          "Groceries and food rations",
          "No other urgent expenses, ready for matches"
        ];
      }
    }
    // User provided ONLY location so far
    else if (explicitLoc && state.situation.householdSize === 0) {
      state.intakeStage = 1;
      if (language === 'ur') {
        replyText = `Theek hai, maine aap ka shehr ${state.situation.location} note kar liya hai. Ghar mein kitne log rehte hain?`;
        quickReplies = [
          "1 person (just me)",
          "2 people",
          "3 people",
          "4 or more people"
        ];
      } else {
        replyText = `Understood, I've noted your location as ${state.situation.location}. How many people currently share your home?`;
        quickReplies = [
          "1 person (just me)",
          "2 people",
          "3 people",
          "4 or more people"
        ];
      }
    }
    // User provided ONLY household size so far
    else if (explicitSize !== null && state.situation.location === "Not provided yet") {
      state.intakeStage = 1;
      const count = state.situation.householdSize;
      if (language === 'ur') {
        replyText = `Theek hai, ${count} afraad note kar liye. Aap Pakistan ke kis shehr ya zilla mein rehte hain?`;
        quickReplies = [
          "Lahore",
          "Karachi",
          "Islamabad",
          "Rawalpindi"
        ];
      } else {
        replyText = `Got it, ${count} ${count === 1 ? 'person' : 'people'} in your household. Which district or city in Pakistan do you currently live in?`;
        quickReplies = [
          "Lahore",
          "Karachi",
          "Islamabad",
          "Rawalpindi"
        ];
      }
    }
    // User shared specific urgent needs (rent, groceries, medicine, etc.)
    else if (explicitNeeds.length > 0) {
      state.intakeStage = 3;
      state.situation.confidence = "high";
      if (language === 'ur') {
        replyText = "Bohat shukriya. Maine yeh zarooriyat aap ki profile mein darj kar li hain. Aap ki situation profile tayar hai! Kya aap apni summary review kar ke matching programs dekhna chahte hain?";
        quickReplies = [
          "Summary aur situation review karein",
          "Matching programs dikhayein"
        ];
      } else {
        replyText = "Thank you. I have added these specific urgent needs to your profile priorities. Everything you've shared has been recorded. Would you like to review your situation summary and see your matched programs?";
        quickReplies = [
          "Review situation summary",
          "Show matching support programs"
        ];
      }
    }
    // General or initial fallback
    else {
      if (state.situation.location === "Not provided yet" && state.situation.householdSize === 0) {
        if (language === 'ur') {
          replyText = "Assalam-o-Alaikum! Aap ke liye sahi programs dhoondne ke liye: haal hi mein aap ke sath kya hua, aur is waqt sab se barhi zaroorat kya hai?";
          quickReplies = [
            "Meri job khatam ho gayi hai (Layoff)",
            "Bimari ya sudden medical injury",
            "Kiraya aur bills ka masla hai"
          ];
        } else {
          replyText = "Hello! To help find the right public support programs for you: what happened recently, and what are your most immediate concerns?";
          quickReplies = [
            "I was laid off from my job",
            "Sudden medical injury or illness",
            "Behind on rent and utility bills"
          ];
        }
      } else if (state.situation.location === "Not provided yet" || state.situation.householdSize === 0) {
        if (state.situation.location === "Not provided yet") {
          replyText = language === 'ur'
            ? "Aap Pakistan ke kis shehr ya zilla mein rehte hain?"
            : "Which district or city in Pakistan do you currently live in?";
          quickReplies = ["Lahore", "Karachi", "Islamabad", "Rawalpindi"];
        } else {
          replyText = language === 'ur'
            ? "Ghar mein kitne log rehte hain?"
            : "How many people currently share your home?";
          quickReplies = ["1 person (just me)", "2 people", "3 people", "4 or more people"];
        }
      } else {
        state.situation.confidence = "high";
        if (language === 'ur') {
          replyText = "Shukriya, maine yeh maloomat bhi note kar li hai. Aap ki situation profile tayar hai. Kya aap apni summary aur matching programs dekhna chahte hain?";
          quickReplies = [
            "Summary aur situation review karein",
            "Matching programs dikhayein"
          ];
        } else {
          replyText = "Thank you, I've noted that in your profile. Your case details are ready! Would you like to review your situation summary and see your program matches now?";
          quickReplies = [
            "Review situation summary",
            "Show matching support programs"
          ];
        }
      }
    }

    const aiReply: ChatMessage = {
      id: `msg-ai-${Date.now()}`,
      sender: "ai",
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies
    };
    state.messages.push(aiReply);

    return {
      reply: aiReply,
      updatedExtraction: { ...state.situation }
    };
  },

  // 3. SITUATION SUMMARY
  async getSituationSummary(): Promise<SituationExtraction> {
    await delay(350);
    if (state.shouldSimulateError) {
      throw new Error("Failed to load situation profile. Server connection interrupted.");
    }
    return { ...state.situation };
  },

  async updateSituationSummary(updatedFields: Partial<SituationExtraction>): Promise<SituationExtraction> {
    await delay(400);
    state.situation = {
      ...state.situation,
      ...updatedFields,
      lastEditedAt: "Just now"
    };
    return { ...state.situation };
  },

  // 4. PROGRAM MATCHES
  async getMatchedPrograms(): Promise<Program[]> {
    await delay(500);
    if (state.shouldSimulateError) {
      throw new Error("Program matching service temporarily unavailable. Please retry.");
    }
    if (state.shouldSimulateEmpty) {
      return [];
    }
    return [...state.programs];
  },

  async getProgramById(id: string): Promise<Program | null> {
    await delay(300);
    if (state.shouldSimulateError) {
      throw new Error("Could not fetch program specifications.");
    }
    const found = state.programs.find(p => p.id === id);
    return found ? { ...found } : null;
  },

  // 5. DOCUMENTS
  async getDocuments(): Promise<DocumentItem[]> {
    await delay(350);
    if (state.shouldSimulateError) {
      throw new Error("Document vault is currently unreachable.");
    }
    return [...state.documents];
  },

  async uploadDocument(input: {
    docId?: string;
    name: string;
    fileSize?: string;
    presetKey?: string;
  }): Promise<DocumentItem> {
    await delay(800); // Simulate optical character recognition / AI reading

    if (state.shouldSimulateError) {
      throw new Error("Document processing error. The uploaded file could not be parsed.");
    }

    let targetDoc = state.documents.find(d => d.id === input.docId);

    // If it's a new or specified document
    if (!targetDoc) {
      targetDoc = {
        id: input.docId || `doc-custom-${Date.now()}`,
        title: input.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
        status: "uploaded",
        associatedProgramIds: ["prog-uim-01"]
      };
      state.documents.push(targetDoc);
    }

    // Determine extraction reading simulation
    let extracted;
    if (input.name.toLowerCase().includes("separation") || input.name.toLowerCase().includes("layoff")) {
      extracted = {
        documentTypeRead: "Notice of Permanent Employment Separation",
        issuer: "Millat Industrial Works Ltd. HR Operations",
        dateDetected: "May 12, 2026",
        keyFigures: "Reason: Involuntary workforce retrenchment (No misconduct)",
        confidenceScore: 94,
        notes: "Matches applicant CNIC profile and reported separation date.",
        userVerified: false
      };
    } else if (input.name.toLowerCase().includes("birth") || input.name.toLowerCase().includes("crib") || input.name.toLowerCase().includes("b-form") || input.name.toLowerCase().includes("form")) {
      extracted = {
        documentTypeRead: "NADRA Child Registration Certificate (B-Form)",
        issuer: "NADRA Registration Authority",
        dateDetected: "October 18, 2025",
        keyFigures: "Child: Muhammad Ali | Relationship: Mother verified",
        confidenceScore: 96,
        notes: "Qualifies applicant for BISP Nashonuma infant nutrition stipend and supplementary rations.",
        userVerified: false
      };
    } else if (input.name.toLowerCase().includes("lease") || input.name.toLowerCase().includes("rent") || input.name.toLowerCase().includes("tenancy")) {
      extracted = {
        documentTypeRead: "Standard Residential Tenancy Agreement",
        issuer: "Al-Rehman Property Associates & Landlord Registry",
        dateDetected: "Effective 01/01/2026 - 12/31/2026",
        keyFigures: "Monthly Rent: Rs 22,000 / month | Tenant verified",
        confidenceScore: 72,
        notes: "Tenancy verified. Qualifies for Bait-ul-Mal emergency housing & rent stabilization grant.",
        userVerified: false
      };
    } else if (input.name.toLowerCase().includes("salary") || input.name.toLowerCase().includes("pay") || input.name.toLowerCase().includes("slip")) {
      extracted = {
        documentTypeRead: "Monthly Salary / Wage Slip",
        issuer: "Millat Industrial Works Ltd.",
        dateDetected: "Period Ending April 30, 2026",
        keyFigures: "Gross Earnings: Rs 38,500.00 | PESSI Deductions: Rs 1,925.00",
        confidenceScore: 95,
        notes: "Verified wage threshold for PESSI worker unemployment benefit.",
        userVerified: false
      };
    } else {
      extracted = {
        documentTypeRead: "Official Document / Supporting Evidence",
        issuer: "Verified Entity",
        dateDetected: new Date().toLocaleDateString(),
        keyFigures: "Valid official identification markers detected",
        confidenceScore: 88,
        notes: "Verified against case metadata.",
        userVerified: false
      };
    }

    targetDoc.fileName = input.name;
    targetDoc.fileSize = input.fileSize || "1.8 MB";
    targetDoc.uploadedAt = "Just now";
    targetDoc.status = "uploaded";
    targetDoc.extractedData = extracted;

    // Update programs missing evidence list
    state.programs.forEach(prog => {
      prog.requiredDocuments.forEach(rd => {
        if (rd.id === targetDoc?.id) {
          rd.status = 'uploaded';
        }
      });
      // update missing evidence
      prog.missingEvidence = prog.requiredDocuments
        .filter(rd => rd.status === 'needed')
        .map(rd => rd.name);
    });

    return { ...targetDoc };
  },

  async verifyDocument(docId: string, confirmedNotes?: string): Promise<DocumentItem> {
    await delay(300);
    const doc = state.documents.find(d => d.id === docId);
    if (!doc) throw new Error("Document not found");

    doc.status = "verified";
    if (doc.extractedData) {
      doc.extractedData.userVerified = true;
      if (confirmedNotes) {
        doc.extractedData.notes = confirmedNotes;
      }
    }

    // also reflect in programs
    state.programs.forEach(p => {
      p.requiredDocuments.forEach(rd => {
        if (rd.id === docId) {
          rd.status = 'verified';
        }
      });
    });

    return { ...doc };
  },

  // 6. ACTION PLAN
  async getActionPlan(): Promise<ActionPlanItem[]> {
    await delay(350);
    if (state.shouldSimulateError) {
      throw new Error("Action plan service unavailable.");
    }
    return [...state.actionPlan];
  },

  async toggleActionPlanItem(id: string): Promise<ActionPlanItem> {
    await delay(200);
    const item = state.actionPlan.find(a => a.id === id);
    if (!item) throw new Error("Task not found");

    item.completed = !item.completed;
    return { ...item };
  },

  async addActionPlanItem(newItem: Omit<ActionPlanItem, 'id' | 'completed'>): Promise<ActionPlanItem> {
    await delay(250);
    const item: ActionPlanItem = {
      ...newItem,
      id: `act-${Date.now()}`,
      completed: false
    };
    state.actionPlan.unshift(item);
    return item;
  }
};
