import * as React from "react";
import Button from "../Button";
import clsx from "clsx";
import {CellCoordinates} from "src/lib/engine/types";
import { useTranslation } from "react-i18next";

const UndoIcon: React.FC = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 7H5v5" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 12a8 8 0 1 0 2.34-5.66L5 7"
    />
  </svg>
);

const EraseIcon: React.FC = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16 3 5 5" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5 13.5 6 18 10.5 7.5 21H3v-4.5z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 19h8" />
  </svg>
);

const NotesIcon: React.FC = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h9l5 5v13H6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 3v5h5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14h6M9 18h6" />
  </svg>
);

const HintIcon: React.FC = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 18h6m-5 3h4m-5-9a5 5 0 1 1 6 0c-.8.6-1.3 1.5-1.4 2.5h-3.2C10.3 13.5 9.8 12.6 9 12z"
    />
  </svg>
);

const ControlLabel: React.FC<{label: string}> = ({label}) => (
  <span className="text-xs font-semibold leading-none md:text-sm">{label}</span>
);

export const UndoButton: React.FC<{
  canUndo: boolean;
  undo: () => void;
}> = ({canUndo, undo}) => {
  const { t } = useTranslation();
  return (
    <Button disabled={!canUndo} onClick={undo} className="flex min-h-16 flex-col items-center justify-center gap-1">
      <UndoIcon />
      <ControlLabel label={t("undo_btn")} />
    </Button>
  );
};

export const EraseButton: React.FC<{
  activeCellCoordinates: CellCoordinates | undefined;
  clearCell: (cellCoordinates: CellCoordinates) => void;
}> = ({activeCellCoordinates, clearCell}) => {
  const { t } = useTranslation();
  return (
    <Button
      onClick={() => activeCellCoordinates && clearCell(activeCellCoordinates)}
      className="flex min-h-16 flex-col items-center justify-center gap-1"
    >
      <EraseIcon />
      <ControlLabel label={t("erase_btn")} />
    </Button>
  );
};

const NotesButton: React.FC<{
  notesMode: boolean;
  activateNotesMode: () => void;
  deactivateNotesMode: () => void;
}> = ({notesMode, activateNotesMode, deactivateNotesMode}) => {
  const { t } = useTranslation();
  return (
    <Button
      onClick={() => (notesMode ? deactivateNotesMode() : activateNotesMode())}
      className={"relative flex min-h-16 flex-col items-center justify-center gap-1"}
    >
      <div
        className={clsx("absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full px-2 text-[10px] md:text-xs", {
          "bg-teal-700 text-white": !notesMode,
          "bg-sky-700 text-white": notesMode,
        })}
      >{`${notesMode ? "ON" : "OFF"}`}</div>
      <NotesIcon />
      <ControlLabel label={t("note_btn")} />
    </Button>
  );
};

const HintButton: React.FC<{
  activeCellCoordinates: CellCoordinates;
  getHint: (cellCoordinates: CellCoordinates) => void;
}> = ({activeCellCoordinates, getHint}) => {
  const { t } = useTranslation();
  return (
    <Button
      onClick={() => activeCellCoordinates && getHint(activeCellCoordinates)}
      className="flex min-h-16 flex-col items-center justify-center gap-1"
    >
      <HintIcon />
      <ControlLabel label={t("hint_btn")} />
    </Button>
  );
};

const SudokuMenuControls: React.FC<{
  notesMode: boolean;
  activeCellCoordinates: CellCoordinates;
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
    <div className="grid w-full grid-cols-2 gap-2">
      <UndoButton canUndo={canUndo} undo={undo} />
      <EraseButton activeCellCoordinates={activeCellCoordinates} clearCell={clearCell} />
      <NotesButton
        notesMode={notesMode}
        activateNotesMode={activateNotesMode}
        deactivateNotesMode={deactivateNotesMode}
      />
      <HintButton activeCellCoordinates={activeCellCoordinates} getHint={getHint} />
    </div>
  );
};

export default SudokuMenuControls;
