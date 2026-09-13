import React from "react";

export function IntakeIllustration({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="80" cy="80" r="72" fill="#EFF6FF" />
      <circle cx="80" cy="80" r="54" fill="#DBEAFE" fillOpacity="0.5" />
      {/* Speech bubble 1 (AI) */}
      <rect x="36" y="44" width="70" height="42" rx="12" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="2.5" />
      <path d="M50 86L44 96L58 86" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="48" y="56" width="36" height="4" rx="2" fill="#1E3A8A" />
      <rect x="48" y="66" width="46" height="4" rx="2" fill="#93C5FD" />
      
      {/* Small listening ear / heart sparkle */}
      <circle cx="114" cy="50" r="14" fill="#F3E8FF" stroke="#6B21A8" strokeWidth="2" />
      <path d="M110 50L113 47L116 50L113 53Z" fill="#6B21A8" />

      {/* Speech bubble 2 (User) */}
      <rect x="62" y="86" width="64" height="38" rx="12" fill="#1E3A8A" />
      <path d="M114 124L120 132L112 124" fill="#1E3A8A" />
      <rect x="74" y="98" width="40" height="4" rx="2" fill="#FFFFFF" />
      <rect x="74" y="108" width="26" height="4" rx="2" fill="#93C5FD" />
    </svg>
  );
}

export function MatchesIllustration({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="80" cy="80" r="72" fill="#EFF6FF" />
      {/* Document Stack */}
      <rect x="42" y="38" width="76" height="92" rx="8" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="2.5" />
      <rect x="52" y="52" width="42" height="5" rx="2.5" fill="#1E3A8A" />
      <rect x="52" y="63" width="56" height="4" rx="2" fill="#CBD5E1" />
      <rect x="52" y="73" width="48" height="4" rx="2" fill="#CBD5E1" />

      {/* Check item 1 */}
      <circle cx="58" cy="92" r="6" fill="#DCFCE7" stroke="#16A34A" strokeWidth="1.5" />
      <path d="M56 92L57.5 93.5L60.5 90.5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="70" y="90" width="34" height="4" rx="2" fill="#64748B" />

      {/* Check item 2 */}
      <circle cx="58" cy="108" r="6" fill="#DCFCE7" stroke="#16A34A" strokeWidth="1.5" />
      <path d="M56 108L57.5 109.5L60.5 106.5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="70" y="106" width="30" height="4" rx="2" fill="#64748B" />

      {/* Floating verified badge */}
      <circle cx="118" cy="46" r="18" fill="#1E3A8A" stroke="#FFFFFF" strokeWidth="3" />
      <path d="M112 46L116 50L125 41" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DashboardIllustration({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="80" cy="80" r="72" fill="#EFF6FF" />
      {/* Target & Roadmap horizon */}
      <rect x="36" y="50" width="88" height="68" rx="10" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="2.5" />
      <path d="M46 98L66 82L84 94L114 68" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="66" cy="82" r="3.5" fill="#1E3A8A" />
      <circle cx="84" cy="94" r="3.5" fill="#1E3A8A" />
      <circle cx="114" cy="68" r="4.5" fill="#6B21A8" stroke="#FFFFFF" strokeWidth="2" />
      
      {/* Progress pill */}
      <rect x="46" y="60" width="40" height="6" rx="3" fill="#DBEAFE" />
      <rect x="46" y="60" width="24" height="6" rx="3" fill="#1E3A8A" />

      {/* Star badge */}
      <circle cx="120" cy="116" r="16" fill="#F3E8FF" stroke="#6B21A8" strokeWidth="2" />
      <path d="M120 108L122 113L127 114L123.5 117.5L124.5 123L120 120L115.5 123L116.5 117.5L113 114L118 113Z" fill="#6B21A8" />
    </svg>
  );
}

export function ReviewIllustration({ className = "w-28 h-28" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="80" cy="80" r="72" fill="#F8FAFC" />
      <rect x="44" y="36" width="72" height="96" rx="10" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="2.5" />
      {/* Clipboard clip */}
      <rect x="62" y="30" width="36" height="12" rx="4" fill="#DBEAFE" stroke="#1E3A8A" strokeWidth="2" />
      
      {/* Content lines */}
      <rect x="56" y="56" width="48" height="5" rx="2.5" fill="#1E3A8A" />
      <rect x="56" y="68" width="38" height="4" rx="2" fill="#CBD5E1" />
      <rect x="56" y="78" width="44" height="4" rx="2" fill="#CBD5E1" />
      
      {/* Family / Person icon indicator */}
      <circle cx="64" cy="98" r="6" fill="#EFF6FF" stroke="#1E3A8A" strokeWidth="1.5" />
      <rect x="74" y="96" width="30" height="4" rx="2" fill="#64748B" />

      <circle cx="64" cy="114" r="6" fill="#EFF6FF" stroke="#1E3A8A" strokeWidth="1.5" />
      <rect x="74" y="112" width="24" height="4" rx="2" fill="#64748B" />
    </svg>
  );
}
