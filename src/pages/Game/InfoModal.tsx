import * as React from "react";
import {useTranslation} from "react-i18next";
import Button from "src/components/Button";

export type InfoPanelType = "shortcuts" | "about";

interface InfoModalProps {
  panel: InfoPanelType | null;
  onClose: () => void;
}

const iconProps = {
  className: "h-4 w-4 shrink-0 text-ink-muted",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const CloseIcon: React.FC = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const KeyboardIcon: React.FC = () => (
  <svg
    className="h-5 w-5 text-ink-muted"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M8 13h.01M12 13h.01M16 13h.01M7 16h10" />
  </svg>
);

const InfoCircleIcon: React.FC = () => (
  <svg
    className="h-5 w-5 text-ink-muted"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const MoveIcon: React.FC = () => (
  <svg {...iconProps}>
    <path d="m5 9-3 3 3 3" />
    <path d="m9 5 3-3 3 3" />
    <path d="m15 19-3 3-3-3" />
    <path d="m19 9 3 3-3 3" />
    <path d="M2 12h20" />
    <path d="M12 2v20" />
  </svg>
);

const HashIcon: React.FC = () => (
  <svg {...iconProps}>
    <path d="M4 9h16" />
    <path d="M4 15h16" />
    <path d="M10 3 8 21" />
    <path d="M16 3 14 21" />
  </svg>
);

const BackspaceIcon: React.FC = () => (
  <svg {...iconProps}>
    <path d="M21 6H9l-6 6 6 6h12a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Z" />
    <path d="m12 9 6 6" />
    <path d="m18 9-6 6" />
  </svg>
);

const PauseIcon: React.FC = () => (
  <svg {...iconProps}>
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

const HintIcon: React.FC = () => (
  <svg {...iconProps}>
    <path d="M9 18h6m-5 3h4m-5-9a5 5 0 1 1 6 0c-.8.6-1.3 1.5-1.4 2.5h-3.2C10.3 13.5 9.8 12.6 9 12z" />
  </svg>
);

const NotesIcon: React.FC = () => (
  <svg {...iconProps}>
    <path d="M6 3h9l5 5v13H6z" />
    <path d="M15 3v5h5" />
    <path d="M9 14h6M9 18h6" />
  </svg>
);

const UndoIcon: React.FC = () => (
  <svg {...iconProps}>
    <path d="M10 7H5v5" />
    <path d="M5 12a8 8 0 1 0 2.34-5.66L5 7" />
  </svg>
);

const RedoIcon: React.FC = () => (
  <svg {...iconProps}>
    <path d="M14 7h5v5" />
    <path d="M19 12a8 8 0 1 1-2.34-5.66L19 7" />
  </svg>
);

const CopyIcon: React.FC = () => (
  <svg {...iconProps}>
    <rect width="12" height="12" x="9" y="9" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

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

const SHORTCUT_ITEMS: ReadonlyArray<{key: ShortcutKey; Icon: React.FC}> = [
  {key: "arrow_keys", Icon: MoveIcon},
  {key: "number_keys", Icon: HashIcon},
  {key: "backspace", Icon: BackspaceIcon},
  {key: "escape", Icon: PauseIcon},
  {key: "hint", Icon: HintIcon},
  {key: "note_mode", Icon: NotesIcon},
  {key: "undo", Icon: UndoIcon},
  {key: "redo", Icon: RedoIcon},
  {key: "copy_paste_notes", Icon: CopyIcon},
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
        className="w-full max-w-lg rounded-md border border-border bg-surface p-5 text-ink shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            {panel === "shortcuts" ? <KeyboardIcon /> : <InfoCircleIcon />}
            <h2 id="info-modal-title" className="text-xl font-bold">
              {panel === "shortcuts" ? t("shortcuts") : t("about")}
            </h2>
          </div>
          <Button
            aria-label={t("close")}
            className="flex h-8 w-8 items-center justify-center p-0 md:h-8 md:w-8 md:p-0"
            onClick={onClose}
          >
            <CloseIcon />
          </Button>
        </div>

        {panel === "shortcuts" ? (
          <ul className="divide-y divide-border/60">
            {SHORTCUT_ITEMS.map(({key, Icon}) => {
              const {keys, description} = splitShortcutText(t(key));
              return (
                <li key={key} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                  <span className="flex min-w-0 items-center gap-3 text-sm text-ink">
                    <Icon />
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
