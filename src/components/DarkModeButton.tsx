import * as React from "react";
import {useTheme} from "src/context/ThemeContext";

const MoonIcon: React.FC = () => (
  <svg
    className="h-4 w-4 md:h-5 md:w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const SunIcon: React.FC = () => (
  <svg
    className="h-4 w-4 md:h-5 md:w-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

export const DarkModeButton = () => {
  const {isDark, toggleDarkMode} = useTheme();

  return (
    <button
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
      onClick={(e) => {
        toggleDarkMode();
        e.currentTarget.blur();
      }}
      type="button"
      className="flex h-8 w-8 items-center justify-center rounded-sm border border-border bg-button text-button-text shadow-sm transition-colors hover:bg-button-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent md:h-10 md:w-10"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};
