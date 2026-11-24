import * as React from "react";
import {Moon, Sun} from "@phosphor-icons/react";
import {useTheme} from "src/context/ThemeContext";

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
      {isDark ? (
        <Sun className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
      )}
    </button>
  );
};
