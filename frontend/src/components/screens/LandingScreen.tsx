import React from "react";
import { ALTERNATIVE_DEMO_SCENARIOS } from "../../lib/mockData";
import { APP_IMAGES } from "../../lib/images";
import { 
  ArrowRight, 
  ShieldCheck, 
  HeartHandshake, 
  MessageSquare, 
  ClipboardCheck, 
  Sparkles, 
  CheckCircle2, 
  Briefcase, 
  HeartPulse, 
  Home, 
  Baby,
  Building2,
  Check
} from "lucide-react";

interface LandingScreenProps {
  onStartIntake: (initialPrompt?: string) => void;
  onExploreMatchesDirectly: () => void;
}

export function LandingScreen({ onStartIntake, onExploreMatchesDirectly }: LandingScreenProps) {
  // Helper to get category icon for sample scenarios
  const getScenarioIcon = (id: string) => {
    switch (id) {
      case "layoff-infant":
        return <Briefcase className="h-4 w-4 text-[#1e3a8a]" />;
      case "medical-emergency":
        return <HeartPulse className="h-4 w-4 text-rose-600" />;
      case "housing-emergency":
        return <Home className="h-4 w-4 text-amber-600" />;
      default:
        return <Building2 className="h-4 w-4 text-[#1e3a8a]" />;
    }
  };

  const getScenarioThumbnail = (id: string) => {
    switch (id) {
      case "layoff-infant":
        return APP_IMAGES.workerRelief;
      case "medical-emergency":
        return APP_IMAGES.clinicCare;
      case "housing-emergency":
        return APP_IMAGES.communityAid;
      default:
        return APP_IMAGES.heroFamily;
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center -mx-4 sm:-mx-6 lg:-mx-8 -my-6 sm:-my-8">
      {/* 2-Column Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 border-b border-slate-200">
        {/* Left Column (7 cols on lg) */}
        <div className="lg:col-span-7 p-6 sm:p-12 lg:p-16 xl:p-20 lg:border-r border-slate-200 flex flex-col justify-center bg-white">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1e3a8a] mb-3 bg-[#eff6ff] border border-[#bfdbfe] px-3 py-1 rounded-full w-fit">
            <HeartHandshake className="h-3.5 w-3.5 text-[#1e3a8a]" />
            <span>Confidential & Free Support Guide</span>
          </div>

          <h1 className="text-3xl sm:text-4xl xl:text-5xl font-bold leading-tight tracking-tight text-[#0f172a] my-4 sm:my-5">
            When life changes suddenly, finding support shouldn't feel impossible.
          </h1>

          <p className="text-base sm:text-lg leading-relaxed text-slate-600 max-w-xl mb-8 font-sans">
            Facing a job loss, sudden medical injury, or family crisis is exhausting enough without having to figure out dozens of complicated government forms. Tell us what happened in your own words — we'll help you find every program you qualify for.
          </p>

          {/* Official Social Safety Presentation Photo Card */}
          <div className="mb-8 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs">
            <div className="relative h-44 sm:h-52 w-full overflow-hidden">
              <img
                src={APP_IMAGES.heroFamily}
                alt="Pakistani family accessing social support services"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent flex items-end p-4 sm:p-5">
                <div className="text-white space-y-1">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-700/90 backdrop-blur-xs text-[11px] font-semibold text-white px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Official Pakistan Social Safety Registry Guide</span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-100">
                    Direct access to BISP Nashonuma, PESSI Worker Relief, Sehat Sahulat Universal Healthcare & Bait-ul-Mal
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3.5 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 font-sans">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block"></span>
                NADRA CNIC Verification Ready
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1e3a8a] inline-block"></span>
                PKR Benefit Rates for 2026
              </span>
              <span className="flex items-center gap-1 text-[#1e3a8a] font-medium">
                English & Roman Urdu Support
              </span>
            </div>
          </div>

          {/* CTA Box */}
          <div className="flex flex-wrap items-center gap-4 mb-10 sm:mb-12">
            <button
              onClick={() => onStartIntake()}
              className="bg-[#1e3a8a] text-white hover:bg-[#172554] transition-all px-7 py-3.5 rounded-md text-sm sm:text-base font-semibold cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <span>Tell us what happened</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={onExploreMatchesDirectly}
              className="bg-white text-slate-800 border border-slate-300 hover:border-[#1e3a8a] hover:text-[#1e3a8a] transition-all px-6 py-3.5 rounded-md text-sm sm:text-base font-medium cursor-pointer"
            >
              Explore Sample Programs
            </button>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-8 border-t border-slate-100">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-[#eff6ff] text-[#1e3a8a] flex items-center justify-center">
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-semibold text-[#1e3a8a] uppercase tracking-wider">Step 1</span>
              </div>
              <h3 className="text-lg font-semibold text-[#0f172a]">
                Tell Your Story
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Explain your situation in everyday words. No legal forms, no intimidating tests.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-[#eff6ff] text-[#1e3a8a] flex items-center justify-center">
                  <ClipboardCheck className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-semibold text-[#1e3a8a] uppercase tracking-wider">Step 2</span>
              </div>
              <h3 className="text-lg font-semibold text-[#0f172a]">
                Review What We Heard
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Easily double-check and adjust your family, housing, and income information.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-[#f3e8ff] text-[#6b21a8] flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-semibold text-[#6b21a8] uppercase tracking-wider">Step 3</span>
              </div>
              <h3 className="text-lg font-semibold text-[#0f172a]">
                See Your Matches
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Discover government, state, and civic programs tailored to your exact crisis.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Step 4</span>
              </div>
              <h3 className="text-lg font-semibold text-[#0f172a]">
                Clear Action Plan
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                Follow simple, step-by-step guidance so you know what to submit and when.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols on lg) */}
        <div className="lg:col-span-5 p-6 sm:p-10 xl:p-12 bg-slate-50 flex flex-col justify-start">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6b21a8] bg-[#f3e8ff] border border-[#d8b4fe] px-2.5 py-0.5 rounded-full">
              Instant Scenarios
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#0f172a] mb-2">
            Explore Common Situations
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6 font-sans">
            Select a sample situation to see how HaqFlow organizes programs, rules, and documents:
          </p>

          <div className="space-y-4">
            {ALTERNATIVE_DEMO_SCENARIOS.map((scenario) => {
              const isRecommended = scenario.id === "layoff-infant";
              const thumbnail = getScenarioThumbnail(scenario.id);
              return (
                <div
                  key={scenario.id}
                  onClick={() => onStartIntake(scenario.prompt)}
                  className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 hover:border-[#1e3a8a] hover:shadow-md transition-all flex flex-col gap-3 cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={thumbnail}
                      alt={scenario.title}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover object-center shrink-0 border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="h-5 w-5 rounded-md bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[#eff6ff] transition-colors">
                            {getScenarioIcon(scenario.id)}
                          </div>
                          <h4 className="text-sm sm:text-base font-semibold text-[#0f172a] group-hover:text-[#1e3a8a] transition-colors truncate">
                            {scenario.title}
                          </h4>
                        </div>
                        {isRecommended && (
                          <span className="inline-block text-[10px] font-semibold text-[#1e3a8a] bg-[#eff6ff] border border-[#bfdbfe] px-2 py-0.5 rounded-full shrink-0">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-2">
                        {scenario.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartIntake(scenario.prompt);
                      }}
                      className="text-xs font-medium text-[#1e3a8a] group-hover:text-[#172554] inline-flex items-center gap-1 cursor-pointer font-sans"
                    >
                      <span>Load this situation</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                    <span className="text-[11px] text-slate-400 font-sans">
                      Realistic PKR rules
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
