import * as React from "react";
import clsx from "clsx";
import {useTranslation} from "react-i18next";
import Checkbox from "src/components/Checkbox";
import {useUserPreferences} from "src/context/UserPreferencesContext";

const SlidersIcon: React.FC = () => (
  <svg
    className="h-4 w-4 text-gray-400"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    <circle cx="9" cy="6" r="2" fill="currentColor" />
    <circle cx="15" cy="12" r="2" fill="currentColor" />
    <circle cx="11" cy="18" r="2" fill="currentColor" />
  </svg>
);

const ChevronIcon: React.FC<{open: boolean}> = ({open}) => (
  <svg
    className={clsx("duration-150 h-4 w-4 text-gray-400 transition-transform", open && "rotate-180")}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
  </svg>
);

const SettingsAndInformation: React.FC = () => {
  const {
    state,
    toggleShowHints,
    toggleShowOccurrences,
    toggleShowCircleMenu,
    toggleShowWrongEntries,
    toggleShowConflicts,
  } = useUserPreferences();
  const {t} = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  return (
    <div className="overflow-hidden rounded-md border border-white/10 bg-gray-700/40 dark:bg-gray-800/60">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm font-semibold text-gray-200 transition-colors hover:bg-white/5 focus:outline-none"
        onClick={(e) => {
          setIsSettingsOpen((prev) => !prev);
          e.currentTarget.blur();
        }}
        aria-expanded={isSettingsOpen}
        aria-controls="game-settings-panel"
      >
        <span className="flex items-center gap-2">
          <SlidersIcon />
          <span>{t("settings")}</span>
        </span>
        <ChevronIcon open={isSettingsOpen} />
      </button>
      <div
        id="game-settings-panel"
        className={isSettingsOpen ? "grid gap-2.5 border-t border-white/10 px-3.5 py-3" : "hidden"}
      >
        <Checkbox id="generated_notes" checked={state.showHints} onChange={toggleShowHints}>
          {t("show_auto_notes")}
        </Checkbox>
        <Checkbox id="highlight_wrong_entries" checked={state.showWrongEntries} onChange={toggleShowWrongEntries}>
          {t("highlight_wrong_entries")}
        </Checkbox>
        <Checkbox id="highlight_conflicts" checked={state.showConflicts} onChange={toggleShowConflicts}>
          {t("highlight_conflicts")}
        </Checkbox>
        <Checkbox id="circle_menu" checked={state.showCircleMenu} onChange={toggleShowCircleMenu}>
          {t("show_circle_menu")}
        </Checkbox>
        <Checkbox id="show_occurrences" checked={state.showOccurrences} onChange={toggleShowOccurrences}>
          {t("show_occurrences")}
        </Checkbox>
      </div>
    </div>
  );
};

export default SettingsAndInformation;
