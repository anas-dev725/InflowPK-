import React from "react";

interface AppLogoProps {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = "",
  showTagline = true,
  size = "md",
}) => {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const titleSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Precision Geometric Inflow Mark */}
      <div
        className={`${iconSizes[size]} relative rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-0.5 shadow-sm shadow-emerald-500/20 shrink-0 flex items-center justify-center overflow-hidden`}
      >
        <div className="w-full h-full bg-slate-950 dark:bg-slate-900 rounded-[10px] flex items-center justify-center relative">
          {/* Subtle gradient glow */}
          <div className="absolute inset-0 bg-emerald-500/10 rounded-[10px]" />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-5 h-5 text-emerald-400 relative z-10"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Inflow directional arrow pointing inward */}
            <path d="M12 3v12" />
            <path d="M7 10l5 5 5-5" />
            <circle cx="12" cy="19" r="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Wordmark */}
      <div>
        <div className="flex items-center gap-1.5">
          <span
            className={`${titleSizes[size]} font-black tracking-tight text-slate-900 dark:text-white leading-none`}
          >
            Inflow<span className="text-emerald-500">PK</span>
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 leading-none">
            v2.2
          </span>
        </div>
        {showTagline && (
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight mt-0.5">
            Freelancer Payout & FX Platform
          </p>
        )}
      </div>
    </div>
  );
};
