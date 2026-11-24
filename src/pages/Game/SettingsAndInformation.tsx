import * as React from "react";
import {CaretDown, SlidersHorizontal} from "@phosphor-icons/react";
import clsx from "clsx";
import {useTranslation} from "react-i18next";
import Checkbox from "src/components/Checkbox";
import ThemeSelector from "src/components/ThemeSelector";
import {useUserPreferences} from "src/context/UserPreferencesContext";

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
    <div className="overflow-hidden rounded-md border border-border bg-surface shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm font-semibold text-ink transition-colors hover:bg-surface-subtle/60 focus:outline-none"
        onClick={(e) => {
          setIsSettingsOpen((prev) => !prev);
          e.currentTarget.blur();
        }}
        aria-expanded={isSettingsOpen}
        aria-controls="game-settings-panel"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-ink-muted" aria-hidden="true" />
          <span>{t("settings")}</span>
        </span>
        <CaretDown
          className={clsx("h-4 w-4 text-ink-muted transition-transform duration-150", isSettingsOpen && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      <div
        id="game-settings-panel"
        className={isSettingsOpen ? "grid gap-2.5 border-t border-border px-3.5 py-3" : "hidden"}
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
        <ThemeSelector />
      </div>
    </div>
  );
};

export default SettingsAndInformation;
