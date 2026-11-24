import * as React from "react";
import {useTranslation} from "react-i18next";
import Button from "src/components/Button";

export type InfoPanelType = "shortcuts" | "about";

interface InfoModalProps {
  panel: InfoPanelType | null;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({panel, onClose}) => {
  const {t} = useTranslation();

  React.useEffect(() => {
    if (!panel) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [panel, onClose]);

  if (!panel) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
    >
      <div
        className="w-full max-w-xl rounded-md border border-border bg-surface p-4 text-ink shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="info-modal-title" className="text-2xl font-bold">
            {panel === "shortcuts" ? t("shortcuts") : t("about")}
          </h2>
          <Button aria-label={t("close")} onClick={onClose}>
            ✕
          </Button>
        </div>

        {panel === "shortcuts" ? (
          <ul className="list-disc space-y-1 pl-6">
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
        ) : (
          <p>
            {t("about_text")}{" "}
            <a
              target="_blank"
              className="text-accent underline hover:text-accent-hover"
              href="https://github.com/TN1ck/super-sudoku"
              rel="noreferrer"
            >
              Github
            </a>
            .{" "}
            <a
              href="https://tn1ck.com"
              target="_blank"
              className="text-accent hover:text-accent-hover hover:underline"
              rel="noreferrer"
            >
              {t("created_by")}
            </a>{" "}
            {t("report_issue")}{" "}
            <a
              target="_blank"
              className="text-accent underline hover:text-accent-hover"
              href="https://github.com/TN1ck/super-sudoku/issues"
              rel="noreferrer"
            >
              Github
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
};
