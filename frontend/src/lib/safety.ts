import { IntakeLanguage } from '../types';

/**
 * Regex patterns identifying self-harm, suicidal ideation, or immediate danger.
 * Covers both English and Roman Urdu crisis expressions.
 */
const CRISIS_PATTERNS: RegExp[] = [
  // English self-harm & suicide indicators
  /\b(?:want|wanna|wish)\s+to\s+die\b/i,
  /\b(?:kill|killing)\s+(?:my\s*self|myself)\b/i,
  /\b(?:hurt|hurting)\s+(?:my\s*self|myself)\b/i,
  /\b(?:harm|harming)\s+(?:my\s*self|myself|someone)\b/i,
  /\bself[- ]?harm\b/i,
  /\bend\s+(?:my\s+life|it\s+all|my\s+pain)\b/i,
  /\btake\s+my\s+(?:own\s+)?life\b/i,
  /\bsuicid(?:e|al)\b/i,
  /\bcommit\s+suicide\b/i,
  /\bbetter\s+off\s+dead\b/i,
  /\b(?:nothing|no\s+reason)\s+(?:left\s+)?to\s+live\s+for\b/i,
  /\b(?:don'?t|do\s+not)\s+want\s+to\s+live\b/i,
  /\bcan'?t\s+go\s+on(?:\s+anymore)?\b/i,
  /\bcannot\s+go\s+on(?:\s+anymore)?\b/i,
  /\bhang\s+(?:my\s*self|myself)\b/i,
  /\bslit\s+my\s+wrists?\b/i,
  /\boverdose\s+(?:on\s+pills|myself)\b/i,
  /\bdanger\s+to\s+(?:myself|others)\b/i,

  // Roman Urdu & Urdu crisis patterns
  /\bkhud\s*k[u|o]shi\b/i,
  /\bapni\s+jaan\s+(?:le\s*(?:na|lunga|loonga|doon)|khatam)\b/i,
  /\bjaan\s+(?:de\s+dunga|de\s+doonga|lena\s+chahta)\b/i,
  /\bmar\s+jana\s+(?:chahta|chahti|behtar)\b/i,
  /\bmarne\s+ka\s+dil\b/i,
  /\bmar\s+ja(?:un|oon|on)\b/i,
  /\bzindagi\s+(?:khatam|se\s+tang|se\s+bezari)\b/i,
  /\bjeena\s+nahi\s+chahta\b/i,
  /\bkhud\s+ko\s+(?:nu?q?san|khatam|mar)\b/i,
  /\bapne\s+aap\s+ko\s+(?:chot|nu?q?san)\b/i
];

/**
 * Returns true if text suggests suicidal ideation, self-harm, or crisis danger.
 */
export function isCrisisLanguage(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length < 3) return false;
  return CRISIS_PATTERNS.some((pattern) => pattern.test(trimmed));
}

const SAFETY_CONFIRMATION_PATTERNS: RegExp[] = [
  /\b(?:i(?:'m|\s+am)?\s+safe)\b/i,
  /\bsafe\s+(?:right\s+now|now|at\s+the\s+moment)\b/i,
  /\bcontinue\s+with\s+(?:support|programs|navigation|intake)\b/i,
  /\bproceed\s+with\s+programs\b/i,
  /\bi\s+want\s+to\s+continue\b/i,
  /\bready\s+to\s+continue\b/i,
  /\bmehfooz\s+hoon\b/i,
  /\bprograms\s+jari\s+rakhein\b/i,
  /\baagay\s+barhein\b/i
];

/**
 * Returns true if the user explicitly confirms they are safe and wish to continue.
 */
export function isSafetyConfirmation(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  return SAFETY_CONFIRMATION_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export interface HelplineResource {
  name: string;
  phone: string;
  description: string;
  hours: string;
  free: boolean;
}

export const CRISIS_HELPLINES: HelplineResource[] = [
  {
    name: "Umang Pakistan Mental Health Helpline",
    phone: "0311-7786264",
    description: "24/7 dedicated professional mental health crisis counseling",
    hours: "24/7",
    free: true
  },
  {
    name: "Umang Secondary Support Line",
    phone: "0317-4288665",
    description: "Crisis counseling & emotional distress support",
    hours: "24/7",
    free: true
  },
  {
    name: "National Health Emergency Line (Sehat)",
    phone: "1166",
    description: "Government of Pakistan toll-free health emergency assistance",
    hours: "24/7",
    free: true
  },
  {
    name: "Rescue Emergency Services",
    phone: "1122",
    description: "Immediate emergency medical & rescue assistance",
    hours: "24/7",
    free: true
  },
  {
    name: "Global Suicide & Crisis Lifeline",
    phone: "988",
    description: "Universal crisis support (call or text 988)",
    hours: "24/7",
    free: true
  }
];

export function getCrisisResponse(language: IntakeLanguage): { text: string; quickReplies: string[] } {
  if (language === 'ur') {
    return {
      text: `Aap ne jo baat share ki hai, mujhe aap ki hifazat aur sehat ki shadeed fikr hai. Aap ki zindagi intehai qeemti hai aur aisi mushkil ghari mein aap ko fori insani sahara milna chahiye jo yeh tool akela faraham nahi kar sakta.\n\nAgar aap is waqt shadeed pareshani mein hain ya khud ko nuqsan pohanchane ka soch rahe hain, barah-e-karam abhi in free aur confidential helplines par rabta karein:\n\n• **Umang Mental Health Helpline (Pakistan)**: 0311-7786264 ya 0317-4288665 (24/7 muft mashwara)\n• **Qaumi Sehat Emergency Line**: 1166 (Toll-Free muft call)\n• **Emergency Rescue 1122**: 1122 ya 15\n\nHum ne aap ki program intake ko foran rok diya hai. Barah-e-karam kisi helpline ya pyaray se fori rabta karein. Jab aap mehfooz mehsoos karein aur aagay barhna chahein, to humein batayein.`,
      quickReplies: [
        "Main is waqt mehfooz hoon, programs jari rakhein",
        "Emergency helpline details dobara dikhayein"
      ]
    };
  }

  return {
    text: `I'm really concerned about what you just shared. Your safety and well-being come first, and you deserve immediate human support beyond what this public benefits tool can offer.\n\nIf you're in crisis, please reach out to professional support right now — you do not have to carry this alone:\n\n• **Umang Mental Health Helpline (Pakistan)**: Call 0311-7786264 or 0317-4288665 (24/7 free, confidential crisis counseling)\n• **Government Sehat Emergency Line**: Call 1166 (Toll-Free, 24/7 assistance)\n• **Emergency Medical & Rescue Services**: Call 1122 or 15\n• **Global / US Crisis Lifeline**: Call or text 988\n\nWe have paused your intake. Please connect with someone who can help keep you safe. When you are safe and ready, let us know if you want to continue with support navigation.`,
    quickReplies: [
      "I am safe right now, continue with support programs",
      "Show emergency helpline details again"
    ]
  };
}
