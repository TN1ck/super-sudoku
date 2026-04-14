import * as React from "react";
import {Link, useNavigate} from "@tanstack/react-router";

import Button from "src/components/Button";
import {Container} from "src/components/Layout";
import {DarkModeButton} from "src/components/DarkModeButton";
import {
  createSolverDemoState,
  SolverDemoState,
  SolverDemoStrategy,
  stepSolverDemo,
} from "src/lib/engine/solverDemo";
import {SimpleSudoku} from "src/lib/engine/types";
import {parseSudoku} from "src/lib/engine/utility";
import {useTranslation} from "react-i18next";

const PUZZLES: Array<{name: string; grid: SimpleSudoku}> = [
  {
    name: "Easy",
    grid: parseSudoku("010000674089700000002063800028000760000100430006920018060235000200408106570000000"),
  },
  {
    name: "Hard",
    grid: parseSudoku("600008014004106007000050629002005061001000200540200700467030000100907400850400003"),
  },
  {
    name: "Evil",
    grid: parseSudoku("060000004050061080010090003200080007000604000900700040090070500300010008000000000"),
  },
];

type DemoAction =
  | {type: "reset"; grid: SimpleSudoku}
  | {type: "step"; strategy: SolverDemoStrategy; maxIterations: number};

const initialPuzzleGrid = PUZZLES[0].grid;

function reducer(state: SolverDemoState, action: DemoAction): SolverDemoState {
  if (action.type === "reset") {
    return createSolverDemoState(action.grid);
  }
  return stepSolverDemo(state, {
    strategy: action.strategy,
    maxIterations: action.maxIterations,
  });
}

const SudokuPreview = ({grid}: {grid: SimpleSudoku}) => {
  return (
    <div className="grid grid-cols-9 rounded border-2 border-gray-500 bg-white dark:bg-gray-800 overflow-hidden">
      {grid.map((row, y) =>
        row.map((value, x) => {
          const thickRight = (x + 1) % 3 === 0 && x !== 8;
          const thickBottom = (y + 1) % 3 === 0 && y !== 8;
          const className = [
            "flex h-9 w-9 items-center justify-center border-r border-b border-gray-300 dark:border-gray-600 text-sm font-semibold",
            thickRight ? "border-r-2 border-r-gray-600" : "",
            thickBottom ? "border-b-2 border-b-gray-600" : "",
            value === 0 ? "text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-gray-100",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div key={`${y}-${x}`} className={className}>
              {value === 0 ? "" : value}
            </div>
          );
        }),
      )}
    </div>
  );
};

const SolverDemo: React.FC<{
  embedded?: boolean;
  hidePreview?: boolean;
  hideHeader?: boolean;
  initialGrid?: SimpleSudoku;
  onGridChange?: (grid: SimpleSudoku) => void;
}> = ({embedded = false, hidePreview = false, hideHeader = false, initialGrid, onGridChange}) => {
  const navigate = useNavigate();
  const {t} = useTranslation();

  const statusTextMap: Record<SolverDemoState["status"], string> = {
    running: t("solver_demo_status_running"),
    solved: t("solver_demo_status_solved"),
    failed: t("solver_demo_status_failed"),
    "max-iterations": t("solver_demo_status_max_iterations"),
  };

  const [strategy, setStrategy] = React.useState<SolverDemoStrategy>("mrv");
  const [intervalMs, setIntervalMs] = React.useState(80);
  const [maxIterations, setMaxIterations] = React.useState(12000);
  const [selectedPuzzle, setSelectedPuzzle] = React.useState(PUZZLES[0].name);
  const [isAutoSolving, setIsAutoSolving] = React.useState(false);
  const defaultGrid = React.useMemo(() => initialGrid ?? initialPuzzleGrid, [initialGrid]);
  const [state, dispatch] = React.useReducer(reducer, createSolverDemoState(defaultGrid));

  React.useEffect(() => {
    if (!initialGrid) {
      return;
    }
    setIsAutoSolving(false);
    dispatch({type: "reset", grid: initialGrid});
  }, [initialGrid]);

  const activeGrid = React.useMemo(() => {
    if (state.status === "solved" && state.stack.length > 0) {
      return state.stack[0];
    }
    return state.currentGrid;
  }, [state.currentGrid, state.stack, state.status]);

  React.useEffect(() => {
    if (!isAutoSolving || state.status !== "running") {
      return;
    }
    const timer = window.setInterval(() => {
      dispatch({type: "step", strategy, maxIterations});
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs, isAutoSolving, maxIterations, state.status, strategy]);

  React.useEffect(() => {
    if (state.status !== "running") {
      setIsAutoSolving(false);
    }
  }, [state.status]);

  React.useEffect(() => {
    onGridChange?.(activeGrid);
  }, [activeGrid, onGridChange]);

  const resetCurrentPuzzle = () => {
    if (initialGrid) {
      dispatch({type: "reset", grid: initialGrid});
      return;
    }

    const puzzle = PUZZLES.find((item) => item.name === selectedPuzzle);
    if (!puzzle) {
      return;
    }
    dispatch({type: "reset", grid: puzzle.grid});
  };

  const content = (
    <>
      {!hideHeader && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl text-black dark:text-white">{t("solver_demo_title")}</h1>
          {!embedded && (
            <div className="flex items-center gap-2">
              <DarkModeButton />
              <Link to="/select-game">
                <Button className="bg-teal-600 text-white">{t("solver_demo_choose_game")}</Button>
              </Link>
              <Button className="bg-teal-700 text-white" onClick={() => navigate({to: "/"})}>
                {t("solver_demo_play")}
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="mb-5 rounded bg-sky-200/70 p-3 dark:bg-slate-800/60">
        {!initialGrid && (
          <label className="mb-3 flex flex-col gap-1 text-sm text-sky-900 dark:text-gray-200">
            {t("solver_demo_puzzle")}
            <select
              className="rounded bg-sky-100 px-2 py-2 text-black dark:bg-slate-700 dark:text-white"
              value={selectedPuzzle}
              onChange={(event) => {
                const puzzleName = event.target.value;
                setSelectedPuzzle(puzzleName);
                const puzzle = PUZZLES.find((item) => item.name === puzzleName);
                if (puzzle) {
                  dispatch({type: "reset", grid: puzzle.grid});
                }
              }}
            >
              {PUZZLES.map((puzzle) => (
                <option key={puzzle.name} value={puzzle.name}>
                  {puzzle.name === "Easy"
                    ? t("difficulty_easy")
                    : puzzle.name === "Hard"
                      ? t("difficulty_hard")
                      : t("difficulty_evil")}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="grid gap-3">
          <label className="flex flex-col gap-1 text-sm text-sky-900 dark:text-gray-200">
            {t("solver_demo_strategy")}
            <select
              className="rounded bg-sky-100 px-2 py-2 text-black dark:bg-slate-700 dark:text-white"
              value={strategy}
              onChange={(event) => {
                setStrategy(event.target.value as SolverDemoStrategy);
                setIsAutoSolving(false);
              }}
            >
              <option value="brute-force">{t("solver_demo_strategy_brute_force")}</option>
              <option value="skip-invalid">{t("solver_demo_strategy_skip_invalid")}</option>
              <option value="mrv">{t("solver_demo_strategy_mrv")}</option>
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-sky-900 dark:text-gray-200">
              {t("solver_demo_interval_ms")}
              <input
                type="number"
                min={10}
                max={2000}
                className="rounded bg-sky-100 px-2 py-2 text-black dark:bg-slate-700 dark:text-white"
                value={intervalMs}
                onChange={(event) => setIntervalMs(Math.max(10, Number(event.target.value) || 10))}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-sky-900 dark:text-gray-200">
              {t("solver_demo_max_iterations")}
              <input
                type="number"
                min={100}
                className="rounded bg-sky-100 px-2 py-2 text-black dark:bg-slate-700 dark:text-white"
                value={maxIterations}
                onChange={(event) => setMaxIterations(Math.max(100, Number(event.target.value) || 100))}
              />
            </label>
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Button
          className="bg-teal-600 text-white"
          onClick={() => {
            if (state.status !== "running") {
              resetCurrentPuzzle();
            }
            setIsAutoSolving(true);
          }}
        >
          {t("solver_demo_solve")}
        </Button>
        <Button
          className="bg-slate-600 text-white"
          onClick={() => {
            setIsAutoSolving(false);
            if (state.status !== "running") {
              resetCurrentPuzzle();
              return;
            }
            dispatch({type: "step", strategy, maxIterations});
          }}
        >
          {t("solver_demo_step")}
        </Button>
        <Button
          className="bg-red-700 text-white"
          onClick={() => {
            setIsAutoSolving(false);
            resetCurrentPuzzle();
          }}
        >
          {t("solver_demo_reset")}
        </Button>
        <span className="ml-2 text-sm text-sky-900 dark:text-gray-200">
          {t("solver_demo_status")}: {statusTextMap[state.status]}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-sm text-sky-900 dark:text-gray-200">
        <div>
          {t("solver_demo_iterations")}: {state.iterations}
        </div>
        <div>
          {t("solver_demo_stack_size")}: {state.stack.length}
        </div>
      </div>

      <p className="mb-4 max-w-3xl text-sky-900 dark:text-gray-200">{t("solver_demo_description")}</p>

      {!hidePreview && <SudokuPreview grid={activeGrid} />}
    </>
  );

  if (embedded) {
    return (
      <div className="rounded-md border border-sky-400 bg-sky-200/70 p-4 dark:border-slate-700 dark:bg-slate-900/50">
        {content}
      </div>
    );
  }

  return <Container className="mt-4 mb-8">{content}</Container>;
};

export default SolverDemo;
