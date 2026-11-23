import * as React from "react";
import {useTranslation} from "react-i18next";
import Checkbox from "src/components/Checkbox";
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

  return (
    <div className="text-white">
      <div className="grid gap-4">
        <div className="md:block hidden">
          <h2 className="mb-2 text-3xl font-bold">{t("shortcuts")}</h2>
          <div className="grid gap-2">
            <ul className="list-disc pl-6">
              <li>{t("arrow_keys")}</li>
              <li>{t("number_keys")}</li>
              <li>{t("backspace")}</li>
              <li>{t("escape")}</li>
              <li>{t("hint")}</li>
              <li>{t("note_mode")}</li>
              <li>{t("undo")}</li>
              <li>{t("redo")}</li>
              <li>{t("copy_paste_notes")}</li>
            </ul>
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-3xl font-bold">{t("settings")}</h2>
          <div className="grid gap-2">
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
        <div>
          <h2 className="text-3xl font-bold text-white">{t("about")}</h2>
          <p className="text-white">
            {t("about_text")}{" "}
            <a target="_blank" className="underline" href="https://github.com/TN1ck/super-sudoku" rel="noreferrer">
              Github
            </a>
            .{" "}
            <a href="https://tn1ck.com" target="_blank" className="hover:underline" rel="noreferrer">
              {t("created_by")}
            </a>{" "}
            {t("report_issue")}{" "}
            <a
              target="_blank"
              className="underline"
              href="https://github.com/TN1ck/super-sudoku/issues"
              rel="noreferrer"
            >
              Github
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsAndInformation;
