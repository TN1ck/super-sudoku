import * as React from "react";
import {ArrowCounterClockwise, Eraser, Lightbulb, NotePencil} from "@phosphor-icons/react";
import Button from "../Button";
import clsx from "clsx";
import {CellCoordinates} from "src/lib/engine/types";
import {useTranslation} from "react-i18next";

const ControlLabel: React.FC<{label: string}> = ({label}) => (
  <span className="text-xs font-semibold leading-none md:text-sm">{label}</span>
);

const controlButtonClassName = "flex min-h-14 flex-col items-center justify-center gap-1 pt-3 md:min-h-16 md:pt-2";

export const UndoButton: React.FC<{
  canUndo: boolean;
  undo: () => void;
}> = ({canUndo, undo}) => {
  const {t} = useTranslation();
  return (
    <Button disabled={!canUndo} onClick={undo} className={controlButtonClassName}>
      <ArrowCounterClockwise className="h-5 w-5" aria-hidden="true" />
      <ControlLabel label={t("undo_btn")} />
    </Button>
  );
};

export const CellActionButton: React.FC<{
  label: "erase_btn" | "hint_btn";
  cell?: CellCoordinates;
  onClick: (cell: CellCoordinates) => void;
}> = ({label, cell, onClick}) => {
  const {t} = useTranslation();
  return (
    <Button disabled={!cell} onClick={() => cell && onClick(cell)} className={controlButtonClassName}>
      {label === "erase_btn" ? (
        <Eraser className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Lightbulb className="h-5 w-5" aria-hidden="true" />
      )}
      <ControlLabel label={t(label)} />
    </Button>
  );
};

const NotesButton: React.FC<{
  notesMode: boolean;
  activateNotesMode: () => void;
  deactivateNotesMode: () => void;
}> = ({notesMode, activateNotesMode, deactivateNotesMode}) => {
  const {t} = useTranslation();
  return (
    <Button
      aria-pressed={notesMode}
      variant={notesMode ? "note" : "default"}
      onClick={() => (notesMode ? deactivateNotesMode() : activateNotesMode())}
      className={clsx("relative", controlButtonClassName)}
    >
      <span
        className={clsx(
          "absolute right-1 top-1 rounded px-1 py-0.5 text-[9px] font-semibold leading-none tracking-wide md:right-1.5 md:top-1.5 md:px-1.5 md:text-[10px]",
          notesMode ? "bg-accent-text/20 text-accent-text" : "bg-surface-subtle text-ink-muted",
        )}
      >
        {notesMode ? "ON" : "OFF"}
      </span>
      <NotePencil className="h-5 w-5" aria-hidden="true" />
      <ControlLabel label={t("note_btn")} />
    </Button>
  );
};

const SudokuMenuControls: React.FC<{
  notesMode: boolean;
  activeCellCoordinates?: CellCoordinates;
  clearCell: (cellCoordinates: CellCoordinates) => void;
  activateNotesMode: () => void;
  deactivateNotesMode: () => void;
  getHint: (cellCoordinates: CellCoordinates) => void;
  canUndo: boolean;
  undo: () => void;
}> = ({
  notesMode,
  activeCellCoordinates,
  clearCell,
  activateNotesMode,
  deactivateNotesMode,
  getHint,
  canUndo,
  undo,
}) => {
  return (
    <div className="grid w-full grid-cols-4 gap-2 md:grid-cols-2">
      <UndoButton canUndo={canUndo} undo={undo} />
      <CellActionButton label="erase_btn" cell={activeCellCoordinates} onClick={clearCell} />
      <NotesButton
        notesMode={notesMode}
        activateNotesMode={activateNotesMode}
        deactivateNotesMode={deactivateNotesMode}
      />
      <CellActionButton label="hint_btn" cell={activeCellCoordinates} onClick={getHint} />
    </div>
  );
};

export default SudokuMenuControls;
