import * as React from "react";
import {
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowsOutCardinal,
  Backspace,
  Copy,
  Hash,
  type Icon as PhosphorIcon,
  Info,
  Keyboard,
  Lightbulb,
  NotePencil,
  Pause,
  X,
} from "@phosphor-icons/react";
import {useTranslation} from "react-i18next";
import Button from "src/components/Button";

export type InfoPanelType = "shortcuts" | "about";

interface InfoModalProps {
  panel: InfoPanelType | null;
  onClose: () => void;
}

type ShortcutKey =
  | "arrow_keys"
  | "number_keys"
  | "backspace"
  | "escape"
  | "hint"
  | "note_mode"
  | "undo"
  | "redo"
  | "copy_paste_notes";

const SHORTCUT_ITEMS: ReadonlyArray<{key: ShortcutKey; Icon: PhosphorIcon}> = [
  {key: "arrow_keys", Icon: ArrowsOutCardinal},
  {key: "number_keys", Icon: Hash},
  {key: "backspace", Icon: Backspace},
  {key: "escape", Icon: Pause},
  {key: "hint", Icon: Lightbulb},
  {key: "note_mode", Icon: NotePencil},
  {key: "undo", Icon: ArrowCounterClockwise},
  {key: "redo", Icon: ArrowClockwise},
  {key: "copy_paste_notes", Icon: Copy},
];

function splitShortcutText(text: string): {keys: string; description: string} {
  const match = text.match(/[:：]/);
  if (!match || match.index === undefined) {
    return {keys: "", description: text.trim()};
  }
  return {
    keys: text.slice(0, match.index).trim(),
    description: text.slice(match.index + 1).trim(),
  };
}

const KeyCombo: React.FC<{keys: string}> = ({keys}) => {
  const parts = keys
    .split(/\s*\+\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      {parts.map((part, index) => (
        <React.Fragment key={`${part}-${index}`}>
          {index > 0 && <span className="text-xs text-ink-muted">+</span>}
          <kbd className="inline-flex min-w-6 items-center justify-center rounded border border-border bg-surface-subtle px-2 py-0.5 font-mono text-xs font-semibold leading-tight text-ink shadow-[0_1px_0_rgb(var(--color-border))]">
            {part}
          </kbd>
        </React.Fragment>
      ))}
    </span>
  );
};

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
        className="w-full max-w-lg rounded-sm border border-border bg-surface p-5 text-ink shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            {panel === "shortcuts" ? (
              <Keyboard className="h-5 w-5 text-ink-muted" aria-hidden="true" />
            ) : (
              <Info className="h-5 w-5 text-ink-muted" aria-hidden="true" />
            )}
            <h2 id="info-modal-title" className="text-xl font-bold">
              {panel === "shortcuts" ? t("shortcuts") : t("about")}
            </h2>
          </div>
          <Button
            aria-label={t("close")}
            className="flex h-8 w-8 items-center justify-center p-0 md:h-8 md:w-8 md:p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {panel === "shortcuts" ? (
          <ul className="divide-y divide-border/60">
            {SHORTCUT_ITEMS.map(({key, Icon}) => {
              const {keys, description} = splitShortcutText(t(key));
              return (
                <li key={key} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                  <span className="flex min-w-0 items-center gap-3 text-sm text-ink">
                    <Icon className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                    <span>{description}</span>
                  </span>
                  {keys ? <KeyCombo keys={keys} /> : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm leading-relaxed text-ink">
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
