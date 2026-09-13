import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, SituationExtraction, IntakeLanguage } from "../../types";
import { api } from "../../lib/api";
import { CRISIS_HELPLINES } from "../../lib/safety";
import { Button } from "../ui/button";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { IntakeIllustration } from "../ui/illustrations";
import { 
  Send, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  Bot, 
  User, 
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Languages,
  Briefcase,
  HeartPulse,
  Home,
  Baby,
  MapPin,
  Phone,
  AlertTriangle,
  HeartHandshake
} from "lucide-react";

interface IntakeScreenProps {
  initialPrompt?: string;
  onProceedToSummary: (extracted: SituationExtraction) => void;
}

export function IntakeScreen({ initialPrompt, onProceedToSummary }: IntakeScreenProps) {
  const [currentLang, setCurrentLang] = useState<IntakeLanguage>("en");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState(initialPrompt || "");
  const [isThinking, setIsThinking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extractedState, setExtractedState] = useState<SituationExtraction | null>(null);
  const [isCrisisActive, setIsCrisisActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load intake history on mount
  useEffect(() => {
    loadHistory(currentLang);
  }, []);

  const loadHistory = async (lang: IntakeLanguage = "en") => {
    try {
      setErrorMsg(null);
      const history = await api.getIntakeHistory(lang);
      setMessages(history);
      const summary = await api.getSituationSummary();
      setExtractedState(summary);
      setIsCrisisActive(api.getIsCrisisActive());

      // If initialPrompt was provided from the landing page, auto-send or set it
      if (initialPrompt && history.length === 1) {
        setInputValue(initialPrompt);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load intake session.");
    }
  };

  const handleLanguageChange = async (newLang: IntakeLanguage) => {
    if (newLang === currentLang) return;
    setCurrentLang(newLang);
    const updatedMessages = api.setChatLanguage(newLang);
    setMessages(updatedMessages);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isThinking) return;

    // If crisis is NOT active, check if user clicked a direct transition prompt
    const lower = text.toLowerCase();
    if (
      !isCrisisActive && (
        lower.includes("review") || 
        lower.includes("summary") || 
        lower.includes("show matching") || 
        lower.includes("see match") || 
        lower.includes("go to review") ||
        lower.includes("summary aur matches dekhein") ||
        lower.includes("matching programs dikhayein")
      )
    ) {
      if (extractedState && extractedState.location !== "Not provided yet" && extractedState.householdSize > 0) {
        onProceedToSummary(extractedState);
        return;
      }
    }

    // Instantly append user's message to local chat so the user sees it immediately
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setErrorMsg(null);
    setIsThinking(true);

    try {
      const response = await api.sendIntakeMessage(text, currentLang);
      setMessages((prev) => [...prev, response.reply]);
      setExtractedState(response.updatedExtraction);
      setIsCrisisActive(api.getIsCrisisActive());
    } catch (err: any) {
      setErrorMsg(err.message || "Could not process message. Please check connection and retry.");
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper to render relevant mini icon next to quick reply choice
  const getChoiceIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("safe") || lower.includes("mehfooz")) {
      return <HeartHandshake className="h-3.5 w-3.5 text-emerald-600 shrink-0" />;
    }
    if (lower.includes("helpline") || lower.includes("emergency") || lower.includes("call")) {
      return <Phone className="h-3.5 w-3.5 text-rose-600 shrink-0" />;
    }
    if (lower.includes("job") || lower.includes("layoff") || lower.includes("naukri") || lower.includes("separated")) {
      return <Briefcase className="h-3.5 w-3.5 text-[#1e3a8a] shrink-0" />;
    }
    if (lower.includes("baby") || lower.includes("infant") || lower.includes("bacha") || lower.includes("child")) {
      return <Baby className="h-3.5 w-3.5 text-[#6b21a8] shrink-0" />;
    }
    if (lower.includes("rent") || lower.includes("utility") || lower.includes("kiraya") || lower.includes("bijli") || lower.includes("heat")) {
      return <Home className="h-3.5 w-3.5 text-amber-600 shrink-0" />;
    }
    if (lower.includes("medical") || lower.includes("injury") || lower.includes("doctor") || lower.includes("prescription") || lower.includes("bimari") || lower.includes("dawa")) {
      return <HeartPulse className="h-3.5 w-3.5 text-rose-600 shrink-0" />;
    }
    if (lower.includes("lahore") || lower.includes("karachi") || lower.includes("punjab") || lower.includes("sindh") || lower.includes("islamabad") || lower.includes("rawalpindi") || lower.includes("faisalabad") || lower.includes("log") || lower.includes("people")) {
      return <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />;
    }
    return <Sparkles className="h-3.5 w-3.5 text-[#1e3a8a] shrink-0" />;
  };

  const isReadyForSummary = !isCrisisActive && extractedState && extractedState.location !== "Not provided yet" && extractedState.householdSize > 0 && messages.length >= 3;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Friendly Header with illustration and language toggle */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="hidden sm:block shrink-0">
            <IntakeIllustration className="w-20 h-20" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#1e3a8a] bg-[#eff6ff] border border-[#bfdbfe] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {currentLang === "ur" ? "Step 2 of 8 • Madadgar Chat" : "Step 2 of 8 • Guided Intake"}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 hidden sm:inline flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-600 inline" /> 
                {currentLang === "ur" ? "CNIC data mehfooz hai" : "Confidential • No signup required"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#0f172a]">
              {currentLang === "ur" ? "Batayein aap ke sath kya hua" : "Tell us what happened"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
              {currentLang === "ur" 
                ? "Apne aam alfaz mein likhein. HaqFlow aap ki baat samajh kar sahi madad aur relief programs dhoonday ga." 
                : "Describe your situation in your own words. HaqFlow will listen, extract key facts, and match you with the right benefits."
              }
            </p>
          </div>
        </div>

        {/* Top Actions: Language Selector & Review Summary button */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0">
          {/* Language Selector Toggle */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center px-1.5 text-slate-400">
              <Languages className="h-3.5 w-3.5" />
            </div>
            <button
              type="button"
              onClick={() => handleLanguageChange("en")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                currentLang === "en"
                  ? "bg-[#1e3a8a] text-white shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange("ur")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                currentLang === "ur"
                  ? "bg-[#1e3a8a] text-white shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Roman Urdu
            </button>
          </div>

          {extractedState && messages.length > 1 && !isCrisisActive && (
            <Button
              size="sm"
              variant="default"
              onClick={() => onProceedToSummary(extractedState)}
              className="gap-1.5 text-xs font-semibold bg-[#1e3a8a] hover:bg-[#172554]"
            >
              <span>{currentLang === "ur" ? "Summary Dekhein" : "Review Summary"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Error Banner with retry */}
      {errorMsg && (
        <Alert variant="destructive">
          <AlertTitle className="text-xs font-semibold">
            {currentLang === "ur" ? "Message process nahi ho saka" : "Unable to process message"}
          </AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-2 mt-1">
            <span>{errorMsg}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSendMessage(inputValue || "Retry")}
              className="bg-white text-xs h-7"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              {currentLang === "ur" ? "Dobara Koshish Karein" : "Try Again"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Chat Messages Log */}
      <div className="border border-slate-200 bg-white rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 space-y-5 min-h-[360px] max-h-[480px] overflow-y-auto">
          {messages.map((msg) => {
            const isAI = msg.sender === "ai";
            const isCrisisMsg = !!msg.isCrisis;
            const showSummaryCard = isAI && !isCrisisMsg && !isCrisisActive && extractedState && 
              extractedState.location !== "Not provided yet" && 
              extractedState.householdSize > 0 && (
                msg.text.includes("organized") || 
                msg.text.includes("profile priorities") || 
                msg.text.includes("ready to review") ||
                msg.text.includes("darj kar li hain")
              );

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAI ? "justify-start" : "justify-end"}`}
              >
                {isAI && (
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
                    isCrisisMsg 
                      ? "bg-rose-100 border border-rose-300 text-rose-700"
                      : "bg-[#eff6ff] border border-[#bfdbfe] text-[#1e3a8a]"
                  }`}>
                    {isCrisisMsg ? <AlertTriangle className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                )}

                <div
                  className={`max-w-[85%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                    isCrisisMsg
                      ? "bg-rose-50/90 text-rose-950 border border-rose-200 shadow-xs"
                      : isAI
                      ? "bg-slate-50 text-[#0f172a] border border-slate-200"
                      : "bg-[#1e3a8a] text-white shadow-xs"
                  }`}
                >
                  {/* Crisis Emergency Banner */}
                  {isCrisisMsg && (
                    <div className="mb-3 pb-2.5 border-b border-rose-200/80 flex items-center gap-2 text-rose-800 font-semibold text-xs">
                      <HeartHandshake className="h-4 w-4 text-rose-600 shrink-0" />
                      <span>
                        {currentLang === "ur" 
                          ? "Fikr Mandi Aur Fori Crisis Support" 
                          : "Immediate Crisis Support Available"
                        }
                      </span>
                    </div>
                  )}

                  <p className="font-sans whitespace-pre-line">{msg.text}</p>
                  
                  {/* Interactive Helpline Quick-Call Actions for Crisis Messages */}
                  {isCrisisMsg && (
                    <div className="mt-4 pt-3 border-t border-rose-200 space-y-2">
                      <span className="block text-xs font-semibold text-rose-900">
                        {currentLang === "ur" 
                          ? "Fori call karne ke liye number par click karein:" 
                          : "Tap any number below to call directly (Free & 24/7):"
                        }
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {CRISIS_HELPLINES.slice(0, 4).map((h, i) => (
                          <a
                            key={i}
                            href={`tel:${h.phone.replace(/[^0-9]/g, '')}`}
                            className="flex items-center justify-between p-2 rounded-lg bg-white border border-rose-200 hover:border-rose-400 text-rose-900 hover:bg-rose-50/50 transition-colors text-xs font-sans shadow-2xs group"
                          >
                            <div className="min-w-0 pr-1">
                              <p className="font-semibold truncate text-[11px] text-rose-950">{h.name}</p>
                              <p className="text-[10px] text-slate-500">{h.hours} • Free</p>
                            </div>
                            <span className="inline-flex items-center gap-1 bg-rose-600 text-white font-bold text-[11px] px-2 py-1 rounded shrink-0 group-hover:bg-rose-700">
                              <Phone className="h-2.5 w-2.5" />
                              {h.phone}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-1.5 ${
                      isCrisisMsg ? "text-rose-400" : isAI ? "text-slate-400" : "text-blue-200 text-right"
                    }`}
                  >
                    {msg.timestamp}
                  </span>

                  {/* Ready to review inline callout card (ONLY shown if not in crisis and genuine facts exist) */}
                  {showSummaryCard && extractedState && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>
                          {currentLang === "ur" 
                            ? `Profile darj ho gayi: ${extractedState.location} • ${extractedState.householdSize} afraad`
                            : `Profile noted: ${extractedState.location} • ${extractedState.householdSize} people`
                          }
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onProceedToSummary(extractedState)}
                        className="w-full gap-1.5 text-xs font-semibold mt-1 bg-[#1e3a8a] hover:bg-[#172554]"
                      >
                        <span>
                          {currentLang === "ur" 
                            ? "Summary aur Matching Programs Dekhein" 
                            : "Review Situation & Matches Now"
                          }
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}

                  {/* Quick reply choices */}
                  {isAI && msg.quickReplies && msg.quickReplies.length > 0 && !showSummaryCard && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap gap-2">
                      <span className="w-full block text-xs font-medium text-slate-500 mb-1">
                        {currentLang === "ur" ? "Jawab dene ke liye option par tap karein:" : "Tap an option to respond quickly:"}
                      </span>
                      {msg.quickReplies.map((choice, idx) => (
                        <button
                          key={idx}
                          disabled={isThinking}
                          onClick={() => handleSendMessage(choice)}
                          className={`inline-flex items-center gap-1.5 text-xs rounded-md px-3 py-1.5 transition-colors text-left cursor-pointer disabled:opacity-50 font-sans shadow-xs ${
                            isCrisisMsg
                              ? "bg-white hover:bg-rose-100/80 text-rose-900 border border-rose-200 font-medium"
                              : "bg-white hover:bg-[#eff6ff] hover:text-[#1e3a8a] hover:border-[#bfdbfe] text-slate-700 border border-slate-200"
                          }`}
                        >
                          {getChoiceIcon(choice)}
                          <span>{choice}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {!isAI && (
                  <div className="h-8 w-8 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Thinking / Loading State */}
          {isThinking && (
            <div className="flex gap-3 justify-start items-center text-xs text-slate-600">
              <div className="h-8 w-8 rounded-full bg-[#eff6ff] border border-[#bfdbfe] flex items-center justify-center text-[#1e3a8a] shrink-0">
                <Sparkles className="h-4 w-4 animate-spin text-[#6b21a8]" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#1e3a8a] animate-bounce" />
                <span className="inline-block h-2 w-2 rounded-full bg-[#6b21a8] animate-bounce [animation-delay:0.2s]" />
                <span className="inline-block h-2 w-2 rounded-full bg-[#1e3a8a] animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs font-medium text-slate-700 ml-1">
                  {currentLang === "ur" 
                    ? "Programs check ho rahe hain aur agla sawal tayar ho raha hai..." 
                    : "Checking programs & preparing next step..."}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Free text input bar */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isCrisisActive
                ? currentLang === "ur"
                  ? "Aap ki hifazat ahem hai. Agar aap mehfooz hain aur jari rakhna chahte hain, to yahan likhein..."
                  : "Intake paused for safety. Let us know when you feel safe to proceed with programs..."
                : currentLang === "ur"
                ? "Yahan apna jawab ya sawal likhein (jaise 'Meri job chali gayi hai, Karachi mein rehta hoon...')"
                : "Type your answer or question (e.g. 'I was laid off yesterday, living in Karachi with 2 people...')"
            }
            rows={2}
            className={`w-full resize-none rounded-xl bg-white p-3.5 pr-24 text-sm text-[#0f172a] placeholder:text-slate-400 focus:outline-none focus:ring-2 shadow-xs border ${
              isCrisisActive
                ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-slate-300 focus:border-[#1e3a8a] focus:ring-[#1e3a8a]/20"
            }`}
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
            <Button
              size="sm"
              variant="default"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isThinking}
              className={`h-8 px-3 text-xs ${
                isCrisisActive
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-[#1e3a8a] hover:bg-[#172554]"
              }`}
            >
              <span>{currentLang === "ur" ? "Bheinjen" : "Send"}</span>
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 pt-1">
          <span className="flex items-center gap-1.5 font-sans">
            <HelpCircle className="h-3.5 w-3.5 text-[#1e3a8a]" />
            {currentLang === "ur"
              ? "Enter daba kar bheinjen, ya Shift + Enter nayi line ke liye."
              : "Press Enter to send, or Shift + Enter for a new line."
            }
          </span>

          {extractedState && !isCrisisActive && extractedState.location !== "Not provided yet" && extractedState.householdSize > 0 && (
            <button
              onClick={() => onProceedToSummary(extractedState)}
              className="text-[#1e3a8a] hover:underline cursor-pointer inline-flex items-center gap-1 font-semibold"
            >
              <span>
                {currentLang === "ur" 
                  ? "Summary ki taraf jayein" 
                  : isReadyForSummary 
                    ? "Ready to see your matches" 
                    : "Skip ahead to summary"
                }
              </span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

