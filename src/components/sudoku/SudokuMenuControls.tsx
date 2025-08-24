import * as React from "react";
import Button from "../Button";
import clsx from "clsx";
import {CellCoordinates} from "src/lib/engine/types";
import LanguageSelector from "src/components/LanguageSelector";
import { useTranslation } from "react-i18next";

export const UndoButton: React.FC<{
  canUndo: boolean;
  undo: () => void;
}> = ({canUndo, undo}) => {
  const { t } = useTranslation();
  return (
    <Button disabled={!canUndo} onClick={undo}>
      {t("undo_btn")}
    </Button>
  );
};

export const EraseButton: React.FC<{
  activeCellCoordinates: CellCoordinates | undefined;
  clearCell: (cellCoordinates: CellCoordinates) => void;
}> = ({activeCellCoordinates, clearCell}) => {
  const { t } = useTranslation();
  return (
    <Button onClick={() => activeCellCoordinates && clearCell(activeCellCoordinates)}>
      {t("erase_btn")}
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
    <Button onClick={() => (notesMode ? deactivateNotesMode() : activateNotesMode())} className={"relative"}>
      <div
        className={clsx("absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full px-2 text-sm md:text-base", {
          "bg-teal-700 text-white": !notesMode,
          "bg-sky-700 text-white": notesMode,
        })}
      >{`${notesMode ? "ON" : "OFF"}`}</div>
      <div>{t("note_btn")}</div>
    </Button>
  );
};

const HintButton: React.FC<{
  activeCellCoordinates: CellCoordinates;
  getHint: (cellCoordinates: CellCoordinates) => void;
}> = ({activeCellCoordinates, getHint}) => {
  const { t } = useTranslation();
  return (
    <Button onClick={() => activeCellCoordinates && getHint(activeCellCoordinates)}>
      {t("hint_btn")}
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
    <div className="grid w-full grid-cols-4 gap-2">
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
